import type { Metadata } from "next";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { AuditOverview, type AuditOverviewRow } from "@/components/features/audit-overview";
import { SEO_AUDIT_CATEGORY_CONFIG } from "@/lib/constants/seo-audit-categories";
import { deleteSeoAudit } from "@/lib/actions/audits.actions";
import type { SeoAudit } from "@/types";

export const metadata: Metadata = { title: "SEO Audit" };

type SeoAuditRow = SeoAudit & { leads: { company_name: string } | null };

export default async function SeoAuditPage() {
  const supabase = await createClient();
  const { data: seoAudits } = await supabase
    .from("seo_audits")
    .select("*, leads!inner(company_name)")
    .order("score", { ascending: true });

  const rows: AuditOverviewRow[] = ((seoAudits ?? []) as SeoAuditRow[]).map((audit) => ({
    id: audit.id,
    lead_id: audit.lead_id,
    company_name: audit.leads?.company_name ?? "Unknown lead",
    category_label: SEO_AUDIT_CATEGORY_CONFIG[audit.category].label,
    score: audit.score,
    status: audit.status,
  }));

  return (
    <>
      <PageHeader
        title="SEO Audit"
        description="Metadata, schema, and technical SEO scores across every lead."
      />
      <AuditOverview
        rows={rows}
        emptyIcon={Search}
        emptyTitle="No SEO audits yet"
        emptyDescription="SEO audit scores appear here once a lead has been audited."
        deleteAction={deleteSeoAudit}
      />
    </>
  );
}
