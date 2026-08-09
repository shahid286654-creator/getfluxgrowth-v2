"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { auditSchema, runAuditSchema } from "@/lib/validations/audits";
import { AUDIT_CATEGORY_CONFIG } from "@/lib/constants/audit-categories";
import { runPageSpeedAudit } from "@/lib/audit/pagespeed";
import type { AuditCategory, Json, ScoreStatus } from "@/types";

export type AuditActionState = { error?: string; success?: boolean };

function deriveStatus(score: number | null): ScoreStatus {
  if (score === null) return "needs_improvement";
  if (score >= 80) return "good";
  if (score >= 50) return "needs_improvement";
  return "poor";
}

function getDetailsUrl(details: unknown): string | null {
  if (details && typeof details === "object" && !Array.isArray(details)) {
    const url = (details as { url?: unknown }).url;
    return typeof url === "string" ? url : null;
  }
  return null;
}

async function logAuditActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  leadId: string,
  actorId: string | null,
  description: string,
  metadata: Json
) {
  // audit_completed has no DB trigger -- log it here, mirroring status_changed in leads.actions.ts.
  await supabase.from("activities").insert({
    lead_id: leadId,
    actor_id: actorId,
    type: "audit_completed",
    description,
    metadata,
  });
}

export async function upsertAudit(
  leadId: string,
  category: AuditCategory,
  formData: FormData
): Promise<AuditActionState> {
  const parsed = auditSchema.safeParse({
    score: formData.get("score") ?? "",
    summary: formData.get("summary") ?? "",
    issues: formData.get("issues") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const score = parsed.data.score === "" ? null : Number(parsed.data.score);
  const status = deriveStatus(score);
  const issuesList = parsed.data.issues
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Preserve the audited URL recorded by a previous automated run (if any)
  // instead of dropping it when a human edits the score/summary by hand.
  const { data: existing } = await supabase
    .from("audits")
    .select("details")
    .eq("lead_id", leadId)
    .eq("category", category)
    .maybeSingle();
  const existingUrl = getDetailsUrl(existing?.details);

  const { error } = await supabase.from("audits").upsert(
    {
      lead_id: leadId,
      category,
      score,
      status,
      summary: parsed.data.summary || null,
      details: { issues: issuesList, ...(existingUrl ? { url: existingUrl } : {}) },
    },
    { onConflict: "lead_id,category" }
  );

  if (error) {
    return { error: error.message };
  }

  await logAuditActivity(
    supabase,
    leadId,
    user?.id ?? null,
    `Website audit updated: ${AUDIT_CATEGORY_CONFIG[category].label}`,
    { category, score }
  );

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/website-audit");
  return { success: true };
}

// Categories PageSpeed Insights can genuinely measure. "cta" and "trust"
// have no automated equivalent and are intentionally left out -- they
// stay manual-entry-only via upsertAudit so nothing gets a fabricated score.
//
// leadId is optional: pass a lead's id to attach the run to that lead (the
// existing behavior, unchanged), or null to run a standalone "Manual/URL
// Audit" that isn't tied to any lead. Lead-less rows are scoped to the
// current user via owner_id instead of via a lead, so they still can't be
// seen by anyone else.
export async function runWebsiteAudit(
  leadId: string | null,
  formData: FormData
): Promise<AuditActionState> {
  const parsed = runAuditSchema.safeParse({ url: formData.get("url") ?? "" });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid URL" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!leadId && !user) {
    return { error: "You must be signed in to run a manual audit." };
  }
  const ownerFields = leadId
    ? { lead_id: leadId, owner_id: null as string | null }
    : { lead_id: null as string | null, owner_id: user!.id };

  let result;
  try {
    result = await runPageSpeedAudit(parsed.data.url);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to run the audit" };
  }

  const rows: {
    category: AuditCategory;
    score: number | null;
    issues: string[];
    summaryLabel: string;
  }[] = [
    {
      category: "performance",
      score: result.desktop.performanceScore,
      issues: result.desktop.performanceIssues,
      summaryLabel: "Desktop Lighthouse performance score",
    },
    {
      category: "mobile",
      score: result.mobile.performanceScore,
      issues: result.mobile.performanceIssues,
      summaryLabel: "Mobile Lighthouse performance score",
    },
    {
      category: "speed",
      score: result.mobile.speedIndexScore,
      issues: [],
      summaryLabel: "Mobile Speed Index score",
    },
    {
      category: "ux",
      score: result.mobile.accessibilityScore,
      issues: result.mobile.accessibilityIssues,
      summaryLabel: "Mobile Lighthouse accessibility score (used as an automated UX proxy)",
    },
    {
      category: "technical_issues",
      score: result.mobile.bestPracticesScore,
      issues: result.mobile.bestPracticesIssues,
      summaryLabel: "Mobile Lighthouse best-practices score",
    },
  ];

  const errors: string[] = [];
  for (const row of rows) {
    const status = deriveStatus(row.score);
    const { error } = await supabase.from("audits").upsert(
      {
        ...ownerFields,
        category: row.category,
        score: row.score,
        status,
        summary: `${row.summaryLabel} for ${parsed.data.url}, via Google PageSpeed Insights.`,
        details: { url: parsed.data.url, issues: row.issues },
      },
      { onConflict: "lead_id,category" }
    );
    if (error) errors.push(error.message);
  }

  // SEO score has its own existing table (seo_audits) rather than the
  // website audits table -- "technical_seo" is the closest fit for what
  // Lighthouse's SEO category actually checks (crawlability, indexability,
  // mobile-friendliness, structured data).
  {
    const seoStatus = deriveStatus(result.desktop.seoScore);
    const { error } = await supabase.from("seo_audits").upsert(
      {
        ...ownerFields,
        category: "technical_seo",
        score: result.desktop.seoScore,
        status: seoStatus,
        summary: `Desktop Lighthouse SEO score for ${parsed.data.url}, via Google PageSpeed Insights.`,
        details: { url: parsed.data.url, issues: result.desktop.seoIssues },
      },
      { onConflict: "lead_id,category" }
    );
    if (error) errors.push(error.message);
  }

  if (errors.length > 0) {
    return { error: errors[0] };
  }

  // The Activity feed is per-lead, so there's nothing meaningful to log
  // for a lead-less manual/URL audit.
  if (leadId) {
    await logAuditActivity(
      supabase,
      leadId,
      user?.id ?? null,
      `Website audit run via PageSpeed Insights (${parsed.data.url})`,
      { url: parsed.data.url }
    );
    revalidatePath(`/leads/${leadId}`);
  }

  revalidatePath("/website-audit");
  revalidatePath("/seo-audit");
  return { success: true };
}

export async function deleteAudit(id: string, leadId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("audits").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/website-audit");
  if (leadId) revalidatePath(`/leads/${leadId}`);
}

export async function deleteSeoAudit(id: string, leadId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("seo_audits").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/seo-audit");
  if (leadId) revalidatePath(`/leads/${leadId}`);
}
