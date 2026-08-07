import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { OutreachStatusBadge } from "@/components/shared/status-badge";
import { OUTREACH_STATUS_CONFIG } from "@/lib/constants/status";
import { OUTREACH_TYPE_CONFIG } from "@/lib/constants/outreach-types";
import { formatRelativeDate } from "@/lib/utils/format";
import { OutreachPageActions } from "./outreach-page-actions";
import { OutreachRowActions } from "./outreach-row-actions";
import type { Outreach, OutreachStatus, OutreachType } from "@/types";

const PAGE_SIZE = 20;

export const metadata: Metadata = { title: "Outreach" };

type OutreachRow = Outreach & { leads: { company_name: string } | null };

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string; page?: string }>;
}) {
  const { q, type, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase
    .from("outreach")
    .select("*, leads!inner(company_name)", { count: "exact" });
  if (q) query = query.ilike("leads.company_name", `%${q}%`);
  if (type) query = query.eq("type", type as OutreachType);
  if (status) query = query.eq("status", status as OutreachStatus);

  const { data: outreach, count } = await query
    .order("updated_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const { data: leadOptions } = await supabase
    .from("leads")
    .select("id, company_name")
    .order("company_name");

  const rows = (outreach ?? []) as OutreachRow[];

  const columns: DataTableColumn<OutreachRow>[] = [
    {
      key: "lead",
      header: "Lead",
      render: (row) => (
        <Link
          href={`/leads/${row.lead_id}`}
          className="font-medium text-foreground hover:text-primary"
        >
          {row.leads?.company_name ?? "Unknown lead"}
        </Link>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => OUTREACH_TYPE_CONFIG[row.type].label,
    },
    {
      key: "subject",
      header: "Subject",
      render: (row) => (
        <span className="line-clamp-1 max-w-xs text-muted-foreground">
          {row.subject || "--"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <OutreachStatusBadge status={row.status} />,
    },
    {
      key: "updated",
      header: "Updated",
      render: (row) => formatRelativeDate(row.updated_at),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => <OutreachRowActions outreach={row} />,
    },
  ];

  const hasFilters = Boolean(type || status);

  return (
    <>
      <PageHeader
        title="Outreach"
        description="Emails, LinkedIn messages, and proposals across every lead."
        actions={<OutreachPageActions leadOptions={leadOptions ?? []} />}
      />
      <DataTableToolbar
        searchPlaceholder="Search by company..."
        filters={[
          {
            key: "type",
            placeholder: "Type",
            options: Object.entries(OUTREACH_TYPE_CONFIG).map(([value, config]) => ({
              value,
              label: config.label,
            })),
          },
          {
            key: "status",
            placeholder: "Status",
            options: Object.entries(OUTREACH_STATUS_CONFIG).map(([value, config]) => ({
              value,
              label: config.label,
            })),
          },
        ]}
      />
      {rows.length > 0 ? (
        <div className="space-y-4">
          <DataTable columns={columns} data={rows} getRowId={(row) => row.id} />
          <DataTablePagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
        </div>
      ) : (
        <EmptyState
          icon={Send}
          title={hasFilters ? "No outreach matches your filters" : "No outreach yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Draft your first outreach message from a lead's page."
          }
        />
      )}
    </>
  );
}
