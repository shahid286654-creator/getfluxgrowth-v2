import type { Metadata } from "next";
import { Users, Gauge, TrendingUp, Send } from "lucide-react";
import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartWrapper } from "@/components/shared/chart-wrapper";
import { PipelineFunnelChart } from "@/components/shared/charts/pipeline-funnel-chart";
import { ConversionRateChart } from "@/components/shared/charts/conversion-rate-chart";
import { ScoreDistributionChart } from "@/components/shared/charts/score-distribution-chart";
import { PIPELINE_STAGES, PIPELINE_STAGE_CONFIG } from "@/lib/constants/pipeline";
import { buildDailyTrend, buildWeeklyTrend } from "@/lib/utils/trend";
import { LeadsTrendCard } from "./leads-trend-card";
import type { PipelineStage } from "@/types";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const ninetyDaysAgo = subDays(new Date(), 89).toISOString();
  const thirtyDaysAgo = subDays(new Date(), 29);

  const [
    { count: totalLeads },
    { count: wonLeads },
    { data: leadsForFunnel },
    { data: auditScores },
    { data: seoAuditScores },
    { count: activeOutreachCount },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("pipeline_stage", "won"),
    supabase.from("leads").select("pipeline_stage"),
    supabase.from("audits").select("score"),
    supabase.from("seo_audits").select("score"),
    supabase
      .from("outreach")
      .select("*", { count: "exact", head: true })
      .neq("status", "archived"),
    supabase.from("leads").select("created_at").gte("created_at", ninetyDaysAgo),
  ]);

  const total = totalLeads ?? 0;
  const conversionRate = total > 0 ? ((wonLeads ?? 0) / total) * 100 : 0;

  const allScores = [...(auditScores ?? []), ...(seoAuditScores ?? [])]
    .map((row) => row.score)
    .filter((s): s is number => s !== null);
  const avgScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
      : null;

  const stageCounts = new Map<PipelineStage, number>(PIPELINE_STAGES.map((stage) => [stage, 0]));
  (leadsForFunnel ?? []).forEach((lead) => {
    stageCounts.set(lead.pipeline_stage, (stageCounts.get(lead.pipeline_stage) ?? 0) + 1);
  });
  const funnelData = PIPELINE_STAGES.map((stage) => ({
    label: PIPELINE_STAGE_CONFIG[stage].label,
    value: stageCounts.get(stage) ?? 0,
  }));

  const funnelOrder = PIPELINE_STAGES.filter((stage) => stage !== "lost");
  const stageCountList = funnelOrder.map((stage) => stageCounts.get(stage) ?? 0);
  const cumulative = funnelOrder.map((_, index) =>
    stageCountList.slice(index).reduce((sum, count) => sum + count, 0)
  );
  const conversionData = funnelOrder.map((stage, index) => ({
    label: PIPELINE_STAGE_CONFIG[stage].label,
    value: cumulative[0] > 0 ? Math.round((cumulative[index] / cumulative[0]) * 100) : 0,
  }));

  const scoreBuckets = { Poor: 0, "Needs improvement": 0, Good: 0 } as Record<string, number>;
  allScores.forEach((score) => {
    if (score < 50) scoreBuckets["Poor"] += 1;
    else if (score < 80) scoreBuckets["Needs improvement"] += 1;
    else scoreBuckets["Good"] += 1;
  });
  const scoreDistributionData = Object.entries(scoreBuckets).map(([label, value]) => ({
    label,
    value,
  }));

  const rows = recentLeads ?? [];
  const rowsLast30 = rows.filter((row) => new Date(row.created_at) >= thirtyDaysAgo);
  const trend30 = buildDailyTrend(rowsLast30, 30);
  const trend90 = buildWeeklyTrend(rows, 90);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Pipeline performance and lead acquisition trends."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total leads" value={String(total)} icon={Users} />
        <KpiCard label="Conversion rate" value={`${conversionRate.toFixed(1)}%`} icon={Gauge} />
        <KpiCard
          label="Avg audit score"
          value={avgScore !== null ? `${avgScore}/100` : "--"}
          icon={TrendingUp}
        />
        <KpiCard
          label="Active outreach"
          value={String(activeOutreachCount ?? 0)}
          icon={Send}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadsTrendCard data30={trend30} data90={trend90} />
        <ChartWrapper title="Pipeline funnel" description="Leads by stage">
          <PipelineFunnelChart data={funnelData} />
        </ChartWrapper>
        <ChartWrapper
          title="Stage conversion"
          description="% of leads reaching each stage"
        >
          <ConversionRateChart data={conversionData} />
        </ChartWrapper>
        <ChartWrapper title="Score distribution" description="Website + SEO audit scores">
          <ScoreDistributionChart data={scoreDistributionData} />
        </ChartWrapper>
      </div>
    </>
  );
}
