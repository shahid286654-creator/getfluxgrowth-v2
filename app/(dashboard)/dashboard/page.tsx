import type { Metadata } from "next";
import Link from "next/link";
import { Users, TrendingUp, Gauge, Send, Activity as ActivityIcon } from "lucide-react";
import { startOfMonth, subMonths } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartWrapper } from "@/components/shared/chart-wrapper";
import { PipelineFunnelChart } from "@/components/shared/charts/pipeline-funnel-chart";
import { ActivityFeedItem } from "@/components/shared/activity-feed-item";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PIPELINE_STAGES, PIPELINE_STAGE_CONFIG } from "@/lib/constants/pipeline";
import type { PipelineStage } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const startThisMonth = startOfMonth(now).toISOString();
  const startLastMonth = startOfMonth(subMonths(now, 1)).toISOString();

  const [
    { count: totalLeads },
    { count: leadsThisMonth },
    { count: leadsLastMonth },
    { count: wonLeads },
    { data: auditScores },
    { data: leadsForFunnel },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startThisMonth),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startLastMonth)
      .lt("created_at", startThisMonth),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("pipeline_stage", "won"),
    supabase.from("audits").select("score"),
    supabase.from("leads").select("pipeline_stage"),
    supabase
      .from("activities")
      .select("id, type, description, created_at, leads(company_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const total = totalLeads ?? 0;
  const thisMonth = leadsThisMonth ?? 0;
  const lastMonth = leadsLastMonth ?? 0;
  const monthDelta = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : undefined;
  const conversionRate = total > 0 ? ((wonLeads ?? 0) / total) * 100 : 0;

  const scores = (auditScores ?? [])
    .map((a) => a.score)
    .filter((s): s is number => s !== null);
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null;

  const stageCounts = new Map<PipelineStage, number>(PIPELINE_STAGES.map((stage) => [stage, 0]));
  (leadsForFunnel ?? []).forEach((lead) => {
    stageCounts.set(lead.pipeline_stage, (stageCounts.get(lead.pipeline_stage) ?? 0) + 1);
  });
  const funnelData = PIPELINE_STAGES.map((stage) => ({
    label: PIPELINE_STAGE_CONFIG[stage].label,
    value: stageCounts.get(stage) ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your client acquisition pipeline at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total leads" value={String(total)} icon={Users} />
        <KpiCard
          label="New this month"
          value={String(thisMonth)}
          icon={TrendingUp}
          delta={monthDelta}
        />
        <KpiCard label="Conversion rate" value={`${conversionRate.toFixed(1)}%`} icon={Gauge} />
        <KpiCard
          label="Avg audit score"
          value={avgScore !== null ? `${avgScore}/100` : "--"}
          icon={Send}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartWrapper
          title="Pipeline overview"
          description="Leads by stage"
          actions={
            <Button variant="ghost" size="sm" render={<Link href="/pipeline" />}>
              View pipeline
            </Button>
          }
          className="lg:col-span-2"
        >
          <PipelineFunnelChart data={funnelData} />
        </ChartWrapper>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            {recentActivities && recentActivities.length > 0 ? (
              <div>
                {recentActivities.map((activity) => (
                  <ActivityFeedItem
                    key={activity.id}
                    type={activity.type}
                    description={activity.description}
                    createdAt={activity.created_at}
                    leadName={
                      (activity.leads as unknown as { company_name: string } | null)
                        ?.company_name
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={ActivityIcon} title="No recent activity" />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
