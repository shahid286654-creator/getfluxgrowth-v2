import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LEAD_STATUS_CONFIG,
  SCORE_STATUS_CONFIG,
  OUTREACH_STATUS_CONFIG,
  OPPORTUNITY_STATUS_CONFIG,
  OPPORTUNITY_IMPACT_CONFIG,
  INTEGRATION_STATUS_CONFIG,
} from "@/lib/constants/status";
import { PIPELINE_STAGE_CONFIG } from "@/lib/constants/pipeline";
import type {
  LeadStatus,
  ScoreStatus,
  OutreachStatus,
  OpportunityStatus,
  OpportunityImpact,
  IntegrationStatus,
  PipelineStage,
} from "@/types";

export function LeadStatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  const config = LEAD_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function ScoreStatusBadge({
  status,
  className,
}: {
  status: ScoreStatus;
  className?: string;
}) {
  const config = SCORE_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function OutreachStatusBadge({
  status,
  className,
}: {
  status: OutreachStatus;
  className?: string;
}) {
  const config = OUTREACH_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function OpportunityStatusBadge({
  status,
  className,
}: {
  status: OpportunityStatus;
  className?: string;
}) {
  const config = OPPORTUNITY_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function OpportunityImpactBadge({
  impact,
  className,
}: {
  impact: OpportunityImpact;
  className?: string;
}) {
  const config = OPPORTUNITY_IMPACT_CONFIG[impact];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function IntegrationStatusBadge({
  status,
  className,
}: {
  status: IntegrationStatus;
  className?: string;
}) {
  const config = INTEGRATION_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function PipelineStageBadge({
  stage,
  className,
}: {
  stage: PipelineStage;
  className?: string;
}) {
  const config = PIPELINE_STAGE_CONFIG[stage];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <span className={cn("size-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </Badge>
  );
}
