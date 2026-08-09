import type { Metadata } from "next";
import { Gauge } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { AuditOverview, type AuditOverviewRow } from "@/components/features/audit-overview";
import { LeadAuditResultsTable, type LeadAuditResultRow } from "@/components/features/lead-audit-results-table";
import { AUDIT_CATEGORY_CONFIG } from "@/lib/constants/audit-categories";
import { deleteAudit } from "@/lib/actions/audits.actions";
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

export default async function WebsiteAuditPage() {
  const supabase = await createClient();
  const [{ data: audits }, { data: seoAudits }, { data: leads }] = await Promise.all([
    supabase.from("audits").select("*, leads!inner(company_name)").order("score", { ascending: true }),
    supabase.from("seo_audits").select("*").eq("category", "technical_seo"),
    supabase.from("leads").select("id, company_name, website").order("company_name"),
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

  const seoByLead = new Map<string, SeoAudit>((seoAudits ?? []).map((a) => [a.lead_id, a]));
  const performanceByLead = new Map<string, Audit>();
  const accessibilityByLead = new Map<string, Audit>();
  const bestPracticesByLead = new Map<string, Audit>();
  for (const audit of (audits ?? []) as Audit[]) {
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

  return (
    <>
      <PageHeader
        title="Website Audit"
        description="Performance, mobile, UX, and technical scores across every lead."
        actions={<RunAuditButton leads={auditableLeads} />}
      />
      <div className="space-y-8">
        <LeadAuditResultsTable rows={resultRows} />
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
