import type { Metadata } from "next";
import { Gauge } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { AuditOverview, type AuditOverviewRow } from "@/components/features/audit-overview";
import { LeadAuditResultsTable, type LeadAuditResultRow } from "@/components/features/lead-audit-results-table";
import { ManualAuditResults, type ManualAuditRow } from "@/components/features/manual-audit-results";
import { AUDIT_CATEGORY_CONFIG } from "@/lib/constants/audit-categories";
import { SEO_AUDIT_CATEGORY_CONFIG } from "@/lib/constants/seo-audit-categories";
import { deleteAudit, deleteSeoAudit } from "@/lib/actions/audits.actions";
import { RunAuditButton, type AuditableLead } from "./run-audit-button";
import type { Audit, ScoreStatus, SeoAudit } from "@/types";

export const metadata: Metadata = { title: "Website Audit" };

type AuditRow = Audit & { leads: { company_name: string } | null };

function bucketStatus(score: number | null): ScoreStatus | null {
  if (score === null) return null;
  if (score >= 80) return "good";
  if (score >= 50) return "needs_improvement";
  return "poor";
}

function getAuditedUrl(details: Audit["details"]): string | null {
  if (details && typeof details === "object" && !Array.isArray(details)) {
    const url = (details as { url?: unknown }).url;
    return typeof url === "string" ? url : null;
  }
  return null;
}

export default async function WebsiteAuditPage() {
  const supabase = await createClient();
  const [
    { data: audits },
    { data: seoAudits },
    { data: leads },
    { data: manualAudits },
    { data: manualSeoAudits },
  ] = await Promise.all([
    supabase.from("audits").select("*, leads!inner(company_name)").order("score", { ascending: true }),
    supabase.from("seo_audits").select("*").eq("category", "technical_seo").not("lead_id", "is", null),
    supabase.from("leads").select("id, company_name, website").order("company_name"),
    // Manual/URL audits -- no lead at all, scoped to the current user via
    // owner_id (RLS enforces this; the is("lead_id", null) filter here is
    // just so we don't also pull in every lead-linked row).
    supabase.from("audits").select("*").is("lead_id", null).order("updated_at", { ascending: false }),
    supabase.from("seo_audits").select("*").is("lead_id", null).order("updated_at", { ascending: false }),
  ]);

  const rows: AuditOverviewRow[] = ((audits ?? []) as AuditRow[]).map((audit) => ({
    id: audit.id,
    lead_id: audit.lead_id,
    company_name: audit.leads?.company_name ?? "Unknown lead",
    category_label: AUDIT_CATEGORY_CONFIG[audit.category].label,
    score: audit.score,
    status: audit.status,
  }));

  // One summary row per lead, combining the 4 standard Lighthouse pillars
  // -- performance/accessibility/best-practices live in `audits`, SEO lives
  // in the pre-existing `seo_audits` table -- so a score is never shown
  // without the lead/website it belongs to.
  const auditableLeads: AuditableLead[] = (leads ?? []).map((lead) => ({
    id: lead.id,
    company_name: lead.company_name,
    website: lead.website,
  }));

  const seoByLead = new Map<string, SeoAudit>(
    (seoAudits ?? []).filter((a) => a.lead_id).map((a) => [a.lead_id as string, a])
  );
  const performanceByLead = new Map<string, Audit>();
  const accessibilityByLead = new Map<string, Audit>();
  const bestPracticesByLead = new Map<string, Audit>();
  for (const audit of (audits ?? []) as Audit[]) {
    if (!audit.lead_id) continue;
    if (audit.category === "performance") performanceByLead.set(audit.lead_id, audit);
    if (audit.category === "ux") accessibilityByLead.set(audit.lead_id, audit);
    if (audit.category === "technical_issues") bestPracticesByLead.set(audit.lead_id, audit);
  }

  const resultRows: LeadAuditResultRow[] = auditableLeads
    .map((lead) => {
      const performance = performanceByLead.get(lead.id) ?? null;
      const accessibility = accessibilityByLead.get(lead.id) ?? null;
      const bestPractices = bestPracticesByLead.get(lead.id) ?? null;
      const seo = seoByLead.get(lead.id) ?? null;

      const scores = [performance?.score, accessibility?.score, bestPractices?.score, seo?.score].filter(
        (s): s is number => typeof s === "number"
      );
      const overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

      const dates = [performance, accessibility, bestPractices, seo]
        .filter((row): row is Audit | SeoAudit => row !== null)
        .map((row) => row.updated_at);
      const lastAudited =
        dates.length > 0
          ? dates.reduce((latest, d) => (new Date(d) > new Date(latest) ? d : latest))
          : null;

      return {
        leadId: lead.id,
        companyName: lead.company_name,
        website: lead.website,
        performance: performance?.score ?? null,
        accessibility: accessibility?.score ?? null,
        bestPractices: bestPractices?.score ?? null,
        seo: seo?.score ?? null,
        overall,
        overallStatus: bucketStatus(overall),
        lastAudited,
      };
    })
    .filter((row) => row.lastAudited !== null);

  const manualRows: ManualAuditRow[] = [
    ...((manualAudits ?? []) as Audit[]).map((audit) => ({
      id: audit.id,
      source: "audits" as const,
      url: getAuditedUrl(audit.details),
      categoryLabel: AUDIT_CATEGORY_CONFIG[audit.category].label,
      score: audit.score,
      status: audit.status,
      updatedAt: audit.updated_at,
    })),
    ...((manualSeoAudits ?? []) as SeoAudit[]).map((audit) => ({
      id: audit.id,
      source: "seo_audits" as const,
      url: getAuditedUrl(audit.details),
      categoryLabel: SEO_AUDIT_CATEGORY_CONFIG[audit.category].label,
      score: audit.score,
      status: audit.status,
      updatedAt: audit.updated_at,
    })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <>
      <PageHeader
        title="Website Audit"
        description="Performance, mobile, UX, and technical scores across every lead."
        actions={<RunAuditButton leads={auditableLeads} />}
      />
      <div className="space-y-8">
        <LeadAuditResultsTable rows={resultRows} />
        <ManualAuditResults
          rows={manualRows}
          deleteAudit={deleteAudit}
          deleteSeoAudit={deleteSeoAudit}
        />
        <AuditOverview
          rows={rows}
          emptyIcon={Gauge}
          emptyTitle="No website audits yet"
          emptyDescription="Website audit scores appear here once a lead has been audited."
          deleteAction={deleteAudit}
        />
      </div>
    </>
  );
}
