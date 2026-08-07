import type { Metadata } from "next";
import { Gauge } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { AuditOverview, type AuditOverviewRow } from "@/components/features/audit-overview";
import { AUDIT_CATEGORY_CONFIG } from "@/lib/constants/audit-categories";
import { deleteAudit } from "@/lib/actions/audits.actions";
import type { Audit } from "@/types";

export const metadata: Metadata = { title: "Website Audit" };

type AuditRow = Audit & { leads: { company_name: string } | null };

export default async function WebsiteAuditPage() {
  const supabase = await createClient();
  const { data: audits } = await supabase
    .from("audits")
    .select("*, leads!inner(company_name)")
    .order("score", { ascending: true });

  const rows: AuditOverviewRow[] = ((audits ?? []) as AuditRow[]).map((audit) => ({
    id: audit.id,
    lead_id: audit.lead_id,
    company_name: audit.leads?.company_name ?? "Unknown lead",
    category_label: AUDIT_CATEGORY_CONFIG[audit.category].label,
    score: audit.score,
    status: audit.status,
  }));

  return (
    <>
      <PageHeader
        title="Website Audit"
        description="Performance, mobile, UX, and technical scores across every lead."
      />
      <AuditOverview
        rows={rows}
        emptyIcon={Gauge}
        emptyTitle="No website audits yet"
        emptyDescription="Website audit scores appear here once a lead has been audited."
        deleteAction={deleteAudit}
      />
    </>
  );
}
