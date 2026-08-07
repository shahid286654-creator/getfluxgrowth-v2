import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoreStatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartWrapper } from "@/components/shared/chart-wrapper";
import { ScoreDistributionChart } from "@/components/shared/charts/score-distribution-chart";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table/data-table";
import { AuditRowDeleteButton } from "@/components/shared/audit-row-delete-button";
import type { ScoreStatus } from "@/types";

export type AuditOverviewRow = {
  id: string;
  lead_id: string;
  company_name: string;
  category_label: string;
  score: number | null;
  status: ScoreStatus;
};

export function AuditOverview({
  rows,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  deleteAction,
}: {
  rows: AuditOverviewRow[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  deleteAction: (id: string, leadId: string) => Promise<void>;
}) {
  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  const leadCount = new Set(rows.map((row) => row.lead_id)).size;
  const scores = rows.map((row) => row.score).filter((s): s is number => s !== null);
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const needsImprovementCount = scores.filter((s) => s >= 50 && s < 80).length;
  const poorCount = scores.filter((s) => s < 50).length;

  const buckets = { Poor: 0, "Needs improvement": 0, Good: 0 } as Record<string, number>;
  scores.forEach((s) => {
    if (s < 50) buckets["Poor"] += 1;
    else if (s < 80) buckets["Needs improvement"] += 1;
    else buckets["Good"] += 1;
  });
  const distributionData = Object.entries(buckets).map(([label, value]) => ({ label, value }));

  const columns: DataTableColumn<AuditOverviewRow>[] = [
    {
      key: "company",
      header: "Company",
      render: (row) => (
        <Link
          href={`/leads/${row.lead_id}`}
          className="font-medium text-foreground hover:text-primary"
        >
          {row.company_name}
        </Link>
      ),
    },
    { key: "category", header: "Category", render: (row) => row.category_label },
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
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <AuditRowDeleteButton
          id={row.id}
          leadId={row.lead_id}
          label={row.category_label}
          deleteAction={deleteAction}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Leads audited" value={String(leadCount)} />
        <KpiCard label="Avg score" value={avgScore !== null ? `${avgScore}/100` : "--"} />
        <KpiCard label="Needs improvement" value={String(needsImprovementCount)} />
        <KpiCard label="Poor" value={String(poorCount)} />
      </div>
      <ChartWrapper title="Score distribution" description="Across all audited categories">
        <ScoreDistributionChart data={distributionData} />
      </ChartWrapper>
      <DataTable columns={columns} data={rows} getRowId={(row) => row.id} />
    </div>
  );
}
