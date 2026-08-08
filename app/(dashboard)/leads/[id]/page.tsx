import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Search as SearchIcon, Activity as ActivityIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TabShell, type TabShellItem } from "@/components/shared/tab-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoreCard } from "@/components/shared/score-card";
import { ActivityFeedItem } from "@/components/shared/activity-feed-item";
import { Card, CardContent } from "@/components/ui/card";
import { SEO_AUDIT_CATEGORY_CONFIG } from "@/lib/constants/seo-audit-categories";
import { LeadDetailHeader } from "./lead-detail-header";
import { LeadNotesPanel } from "./lead-notes-panel";
import { LeadOutreachPanel } from "./lead-outreach-panel";
import { LeadOpportunitiesPanel } from "./lead-opportunities-panel";
import { WebsiteAuditPanel } from "./website-audit-panel";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: lead },
    { data: audits },
    { data: seoAudits },
    { data: opportunities },
    { data: outreach },
    { data: notes },
    { data: activities },
  ] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase.from("audits").select("*").eq("lead_id", id),
    supabase.from("seo_audits").select("*").eq("lead_id", id),
    supabase
      .from("ai_opportunities")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("outreach")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!lead) notFound();

  const avgAuditScore =
    audits && audits.length > 0
      ? Math.round(audits.reduce((sum, a) => sum + (a.score ?? 0), 0) / audits.length)
      : null;
  const avgSeoScore =
    seoAudits && seoAudits.length > 0
      ? Math.round(seoAudits.reduce((sum, a) => sum + (a.score ?? 0), 0) / seoAudits.length)
      : null;
  const outreachSentCount = (outreach ?? []).filter((o) => o.status === "sent").length;

  const tabs: TabShellItem[] = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Website audit avg"
            value={avgAuditScore !== null ? `${avgAuditScore}/100` : "--"}
          />
          <StatCard
            label="SEO audit avg"
            value={avgSeoScore !== null ? `${avgSeoScore}/100` : "--"}
          />
          <StatCard label="AI opportunities" value={String(opportunities?.length ?? 0)} />
          <StatCard label="Outreach sent" value={String(outreachSentCount)} />
          {lead.notes_summary && (
            <Card className="border-border/60 sm:col-span-2 lg:col-span-4">
              <CardContent>
                <p className="text-sm font-medium text-foreground">Summary</p>
                <p className="mt-1 text-sm text-muted-foreground">{lead.notes_summary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      value: "website-audit",
      label: "Website Audit",
      content: (
        <WebsiteAuditPanel leadId={lead.id} websiteUrl={lead.website} audits={audits ?? []} />
      ),
    },
    {
      value: "seo-audit",
      label: "SEO Audit",
      content:
        seoAudits && seoAudits.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seoAudits.map((audit) => {
              const config = SEO_AUDIT_CATEGORY_CONFIG[audit.category];
              return (
                <ScoreCard
                  key={audit.id}
                  icon={config.icon}
                  label={config.label}
                  score={audit.score}
                  status={audit.status}
                  summary={audit.summary}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={SearchIcon}
            title="No SEO audit yet"
            description="SEO audit scores for this lead will appear here once generated."
          />
        ),
    },
    {
      value: "ai-opportunities",
      label: "AI Opportunities",
      content: <LeadOpportunitiesPanel leadId={lead.id} opportunities={opportunities ?? []} />,
    },
    {
      value: "outreach",
      label: "Outreach",
      content: <LeadOutreachPanel leadId={lead.id} outreach={outreach ?? []} />,
    },
    {
      value: "notes",
      label: "Notes",
      content: <LeadNotesPanel leadId={lead.id} notes={notes ?? []} />,
    },
    {
      value: "activity",
      label: "Activity",
      content:
        activities && activities.length > 0 ? (
          <div>
            {activities.map((activity) => (
              <ActivityFeedItem
                key={activity.id}
                type={activity.type}
                description={activity.description}
                createdAt={activity.created_at}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={ActivityIcon} title="No activity yet" />
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <LeadDetailHeader lead={lead} />
      <TabShell items={tabs} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-1.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
