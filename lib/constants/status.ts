import type {
  LeadStatus,
  ScoreStatus,
  OutreachStatus,
  OpportunityStatus,
  OpportunityImpact,
  IntegrationStatus,
} from "@/types";

export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  new: { label: "New", className: "bg-info/15 text-info border-info/20" },
  qualified: {
    label: "Qualified",
    className: "bg-primary/15 text-primary border-primary/20",
  },
  unqualified: {
    label: "Unqualified",
    className: "bg-muted text-muted-foreground border-border",
  },
  contacted: {
    label: "Contacted",
    className: "bg-warning/15 text-warning border-warning/20",
  },
  converted: {
    label: "Converted",
    className: "bg-success/15 text-success border-success/20",
  },
  lost: {
    label: "Lost",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export const SCORE_STATUS_CONFIG: Record<
  ScoreStatus,
  { label: string; className: string }
> = {
  good: { label: "Good", className: "bg-success/15 text-success border-success/20" },
  needs_improvement: {
    label: "Needs improvement",
    className: "bg-warning/15 text-warning border-warning/20",
  },
  poor: {
    label: "Poor",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export const OUTREACH_STATUS_CONFIG: Record<
  OutreachStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  sent: { label: "Sent", className: "bg-success/15 text-success border-success/20" },
  scheduled: {
    label: "Scheduled",
    className: "bg-info/15 text-info border-info/20",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export const OPPORTUNITY_STATUS_CONFIG: Record<
  OpportunityStatus,
  { label: string; className: string }
> = {
  identified: { label: "Identified", className: "bg-info/15 text-info border-info/20" },
  proposed: {
    label: "Proposed",
    className: "bg-primary/15 text-primary border-primary/20",
  },
  dismissed: {
    label: "Dismissed",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export const OPPORTUNITY_IMPACT_CONFIG: Record<
  OpportunityImpact,
  { label: string; className: string }
> = {
  low: { label: "Low impact", className: "bg-muted text-muted-foreground border-border" },
  medium: {
    label: "Medium impact",
    className: "bg-warning/15 text-warning border-warning/20",
  },
  high: {
    label: "High impact",
    className: "bg-success/15 text-success border-success/20",
  },
};

export const INTEGRATION_STATUS_CONFIG: Record<
  IntegrationStatus,
  { label: string; className: string }
> = {
  coming_soon: {
    label: "Coming soon",
    className: "bg-muted text-muted-foreground border-border",
  },
  beta: { label: "Beta", className: "bg-warning/15 text-warning border-warning/20" },
  live: { label: "Live", className: "bg-success/15 text-success border-success/20" },
};
