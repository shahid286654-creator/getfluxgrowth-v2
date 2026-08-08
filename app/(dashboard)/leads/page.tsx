import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { LEAD_STATUS_CONFIG } from "@/lib/constants/status";
import { PIPELINE_STAGE_CONFIG } from "@/lib/constants/pipeline";
import { formatDate } from "@/lib/utils/format";
import { LeadsPageActions } from "./leads-page-actions";
import { LeadRowActions } from "./lead-row-actions";
import { LeadStatusCell, LeadStageCell } from "./lead-inline-cell";
import type { Lead, LeadStatus, PipelineStage } from "@/types";

const PAGE_SIZE = 20;

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    stage?: string;
    industry?: string;
    page?: string;
  }>;
}) {
  const { q, status, stage, industry, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase.from("leads").select("*", { count: "exact" });
  if (q) query = query.ilike("company_name", `%${q}%`);
  if (status) query = query.eq("status", status as LeadStatus);
  if (stage) query = query.eq("pipeline_stage", stage as PipelineStage);
  if (industry) query = query.eq("industry", industry);

  const { data: leads, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const { data: industryRows } = await supabase.from("leads").select("industry");
  const industries = Array.from(
    new Set((industryRows ?? []).map((row) => row.industry).filter(Boolean))
  ) as string[];

  const columns: DataTableColumn<Lead>[] = [
    {
      key: "company",
      header: "Company",
      render: (lead) => (
        <Link
          href={`/leads/${lead.id}`}
          className="font-medium text-foreground hover:text-primary"
        >
          {lead.company_name}
        </Link>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      render: (lead) => lead.industry ?? "--",
    },
    {
      key: "status",
      header: "Status",
      render: (lead) => <LeadStatusCell lead={lead} />,
    },
    {
      key: "stage",
      header: "Stage",
      render: (lead) => <LeadStageCell lead={lead} />,
    },
    { key: "source", header: "Source", render: (lead) => lead.source },
    {
      key: "created",
      header: "Created",
      render: (lead) => formatDate(lead.created_at),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (lead) => <LeadRowActions lead={lead} />,
    },
  ];

  const hasFilters = Boolean(q || status || stage || industry);

  return (
    <>
      <PageHeader
        title="Leads"
        description="Every prospect in your client acquisition pipeline."
        actions={<LeadsPageActions />}
      />
      <DataTableToolbar
        searchPlaceholder="Search companies..."
        filters={[
          {
            key: "status",
            placeholder: "Status",
            options: Object.entries(LEAD_STATUS_CONFIG).map(([value, config]) => ({
              value,
              label: config.label,
            })),
          },
          {
            key: "stage",
            placeholder: "Stage",
            options: Object.entries(PIPELINE_STAGE_CONFIG).map(([value, config]) => ({
              value,
              label: config.label,
            })),
          },
          {
            key: "industry",
            placeholder: "Industry",
            options: industries.map((value) => ({ value, label: value })),
          },
        ]}
      />
      {leads && leads.length > 0 ? (
        <div className="space-y-4">
          <DataTable columns={columns} data={leads} getRowId={(lead) => lead.id} />
          <DataTablePagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={hasFilters ? "No leads match your filters" : "No leads yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Add your first lead to start building your pipeline."
          }
          action={!hasFilters ? <LeadsPageActions /> : undefined}
        />
      )}
    </>
  );
}
