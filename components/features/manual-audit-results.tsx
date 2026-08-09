import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScoreStatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table/data-table";
import { AuditRowDeleteButton } from "@/components/shared/audit-row-delete-button";
import { formatRelativeDate } from "@/lib/utils/format";
import type { ScoreStatus } from "@/types";

export type ManualAuditRow = {
  id: string;
  source: "audits" | "seo_audits";
  url: string | null;
  categoryLabel: string;
  score: number | null;
  status: ScoreStatus;
  updatedAt: string;
};

// Standalone audits with no lead attached (lead_id null, scoped to the
// current user via owner_id) -- shown separately from the per-lead table
// so it's always obvious a row here is a Manual/URL Audit, not lead data.
export function ManualAuditResults({
  rows,
  deleteAudit,
  deleteSeoAudit,
}: {
  rows: ManualAuditRow[];
  deleteAudit: (id: string, leadId: string | null) => Promise<void>;
  deleteSeoAudit: (id: string, leadId: string | null) => Promise<void>;
}) {
  if (rows.length === 0) return null;

  const columns: DataTableColumn<ManualAuditRow>[] = [
    {
      key: "type",
      header: "",
      render: () => (
        <Badge variant="secondary" className="whitespace-nowrap">
          Manual/URL Audit
        </Badge>
      ),
    },
    {
      key: "url",
      header: "Website",
      render: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <span className="truncate">{row.url.replace(/^https?:\/\//, "")}</span>
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">--</span>
        ),
    },
    { key: "category", header: "Category", render: (row) => row.categoryLabel },
    {
      key: "score",
      header: "Score",
      render: (row) => (row.score !== null ? `${row.score}/100` : "--"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <ScoreStatusBadge status={row.status} />,
    },
    {
      key: "updatedAt",
      header: "Audited",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatRelativeDate(row.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <AuditRowDeleteButton
          id={row.id}
          leadId={null}
          label={row.categoryLabel}
          deleteAction={row.source === "audits" ? deleteAudit : deleteSeoAudit}
        />
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Manual / URL Audits</h2>
        <p className="text-sm text-muted-foreground">
          Standalone PageSpeed checks run against a URL directly, not linked to any lead.
        </p>
      </div>
      <DataTable columns={columns} data={rows} getRowId={(row) => `${row.source}-${row.id}`} />
    </div>
  );
}
