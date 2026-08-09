import Link from "next/link";
import { ExternalLink, Gauge } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoreStatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table/data-table";
import { formatRelativeDate } from "@/lib/utils/format";
import type { ScoreStatus } from "@/types";

export type LeadAuditResultRow = {
  leadId: string;
  companyName: string;
  website: string | null;
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  overall: number | null;
  overallStatus: ScoreStatus | null;
  lastAudited: string | null;
};

function ScoreCell({ score }: { score: number | null }) {
  return <span className="tabular-nums">{score !== null ? `${score}/100` : "--"}</span>;
}

// One row per lead with the 4 standard Lighthouse pillars + overall score,
// so a score can never be shown without its company/website attached.
export function LeadAuditResultsTable({ rows }: { rows: LeadAuditResultRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Gauge}
        title="No audit results yet"
        description="Run an audit for a lead to see Performance, Accessibility, Best Practices, and SEO scores here."
      />
    );
  }

  const columns: DataTableColumn<LeadAuditResultRow>[] = [
    {
      key: "company",
      header: "Lead",
      render: (row) => (
        <Link
          href={`/leads/${row.leadId}`}
          className="font-medium text-foreground hover:text-primary"
        >
          {row.companyName}
        </Link>
      ),
    },
    {
      key: "website",
      header: "Website",
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <span className="truncate">{row.website.replace(/^https?:\/\//, "")}</span>
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">No website on file</span>
        ),
    },
    {
      key: "performance",
      header: "Performance",
      render: (row) => <ScoreCell score={row.performance} />,
    },
    {
      key: "accessibility",
      header: "Accessibility",
      render: (row) => <ScoreCell score={row.accessibility} />,
    },
    {
      key: "bestPractices",
      header: "Best Practices",
      render: (row) => <ScoreCell score={row.bestPractices} />,
    },
    {
      key: "seo",
      header: "SEO",
      render: (row) => <ScoreCell score={row.seo} />,
    },
    {
      key: "overall",
      header: "Overall",
      render: (row) => (
        <div className="flex items-center gap-2">
          <ScoreCell score={row.overall} />
          {row.overallStatus && <ScoreStatusBadge status={row.overallStatus} />}
        </div>
      ),
    },
    {
      key: "lastAudited",
      header: "Last audited",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.lastAudited ? formatRelativeDate(row.lastAudited) : "Never"}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={rows} getRowId={(row) => row.leadId} />;
}
