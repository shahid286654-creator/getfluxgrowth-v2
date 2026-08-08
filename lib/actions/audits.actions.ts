"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { auditSchema } from "@/lib/validations/audits";
import { AUDIT_CATEGORY_CONFIG } from "@/lib/constants/audit-categories";
import type { AuditCategory, ScoreStatus } from "@/types";

export type AuditActionState = { error?: string; success?: boolean };

function deriveStatus(score: number | null): ScoreStatus {
  if (score === null) return "needs_improvement";
  if (score >= 80) return "good";
  if (score >= 50) return "needs_improvement";
  return "poor";
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

  const { error } = await supabase.from("audits").upsert(
    {
      lead_id: leadId,
      category,
      score,
      status,
      summary: parsed.data.summary || null,
      details: { issues: issuesList },
    },
    { onConflict: "lead_id,category" }
  );

  if (error) {
    return { error: error.message };
  }

  // audit_completed has no DB trigger -- log it here, mirroring status_changed in leads.actions.ts.
  await supabase.from("activities").insert({
    lead_id: leadId,
    actor_id: user?.id ?? null,
    type: "audit_completed",
    description: `Website audit updated: ${AUDIT_CATEGORY_CONFIG[category].label}`,
    metadata: { category, score },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/website-audit");
  return { success: true };
}

export async function deleteAudit(id: string, leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("audits").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/website-audit");
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteSeoAudit(id: string, leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("seo_audits").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/seo-audit");
  revalidatePath(`/leads/${leadId}`);
}
