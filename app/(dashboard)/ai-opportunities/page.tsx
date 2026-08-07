import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  OpportunityImpactBadge,
  OpportunityStatusBadge,
} from "@/components/shared/status-badge";
import { OpportunityActionsMenu } from "@/components/shared/opportunity-actions-menu";
import { OPPORTUNITY_TYPE_CONFIG } from "@/lib/constants/opportunity-types";
import {
  OPPORTUNITY_IMPACT_CONFIG,
  OPPORTUNITY_STATUS_CONFIG,
} from "@/lib/constants/status";
import { AiOpportunitiesPageActions } from "./ai-opportunities-page-actions";
import type { AiOpportunity, AiOpportunityType, OpportunityImpact, OpportunityStatus } from "@/types";

export const metadata: Metadata = { title: "AI Opportunities" };

type OpportunityRow = AiOpportunity & { leads: { company_name: string } | null };

export default async function AiOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; impact?: string; status?: string }>;
}) {
  const { q, type, impact, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("ai_opportunities")
    .select("*, leads!inner(company_name)")
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("leads.company_name", `%${q}%`);
  if (type) query = query.eq("type", type as AiOpportunityType);
  if (impact) query = query.eq("impact", impact as OpportunityImpact);
  if (status) query = query.eq("status", status as OpportunityStatus);

  const { data: opportunities } = await query;

  const { data: leadOptions } = await supabase
    .from("leads")
    .select("id, company_name")
    .order("company_name");

  const rows = (opportunities ?? []) as OpportunityRow[];
  const hasFilters = Boolean(q || type || impact || status);

  return (
    <>
      <PageHeader
        title="AI Opportunities"
        description="Automation and AI opportunities identified across every lead."
        actions={<AiOpportunitiesPageActions leadOptions={leadOptions ?? []} />}
      />
      <DataTableToolbar
        searchPlaceholder="Search by company..."
        filters={[
          {
            key: "type",
            placeholder: "Type",
            options: Object.entries(OPPORTUNITY_TYPE_CONFIG).map(([value, config]) => ({
              value,
              label: config.label,
            })),
          },
          {
            key: "impact",
            placeholder: "Impact",
            options: Object.entries(OPPORTUNITY_IMPACT_CONFIG).map(([value, config]) => ({
              value,
              label: config.label,
            })),
          },
          {
            key: "status",
            placeholder: "Status",
            options: Object.entries(OPPORTUNITY_STATUS_CONFIG).map(([value, config]) => ({
              value,
              label: config.label,
            })),
          },
        ]}
      />
      {rows.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((opportunity) => {
            const config = OPPORTUNITY_TYPE_CONFIG[opportunity.type];
            const Icon = config.icon;
            return (
              <Card key={opportunity.id} className="border-border/60">
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex items-center gap-1">
                      <OpportunityStatusBadge status={opportunity.status} />
                      <OpportunityActionsMenu opportunity={opportunity} />
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/leads/${opportunity.lead_id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {opportunity.leads?.company_name ?? "Unknown lead"}
                    </Link>
                    <p className="text-sm font-medium text-foreground">{opportunity.title}</p>
                  </div>
                  {opportunity.description && (
                    <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <OpportunityImpactBadge impact={opportunity.impact} />
                    {opportunity.estimated_value && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {opportunity.estimated_value}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title={hasFilters ? "No opportunities match your filters" : "No AI opportunities yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Add an automation or AI opportunity from a lead's page."
          }
        />
      )}
    </>
  );
}
