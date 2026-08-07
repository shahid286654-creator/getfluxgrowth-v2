"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { OpportunityFormDialog } from "@/components/shared/opportunity-form-dialog";
import { OpportunityActionsMenu } from "@/components/shared/opportunity-actions-menu";
import {
  OpportunityImpactBadge,
  OpportunityStatusBadge,
} from "@/components/shared/status-badge";
import { OPPORTUNITY_TYPE_CONFIG } from "@/lib/constants/opportunity-types";
import type { AiOpportunity } from "@/types";

export function LeadOpportunitiesPanel({
  leadId,
  opportunities,
}: {
  leadId: string;
  opportunities: AiOpportunity[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus />
          Add opportunity
        </Button>
      </div>
      {opportunities.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No AI opportunities identified"
          description="Opportunities for automation and AI tooling will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opportunity) => {
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
                  <p className="text-sm font-medium text-foreground">{opportunity.title}</p>
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
      )}
      <OpportunityFormDialog leadId={leadId} open={open} onOpenChange={setOpen} />
    </div>
  );
}
