import type { PipelineStage } from "@/types";

export const PIPELINE_STAGES: PipelineStage[] = [
  "new",
  "qualified",
  "contacted",
  "replied",
  "meeting",
  "proposal",
  "won",
  "lost",
];

export const PIPELINE_STAGE_CONFIG: Record<
  PipelineStage,
  { label: string; className: string; dotClassName: string }
> = {
  new: {
    label: "New",
    className: "bg-info/15 text-info border-info/20",
    dotClassName: "bg-info",
  },
  qualified: {
    label: "Qualified",
    className: "bg-primary/15 text-primary border-primary/20",
    dotClassName: "bg-primary",
  },
  contacted: {
    label: "Contacted",
    className: "bg-warning/15 text-warning border-warning/20",
    dotClassName: "bg-warning",
  },
  replied: {
    label: "Replied",
    className: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    dotClassName: "bg-chart-2",
  },
  meeting: {
    label: "Meeting",
    className: "bg-chart-3/15 text-chart-3 border-chart-3/20",
    dotClassName: "bg-chart-3",
  },
  proposal: {
    label: "Proposal",
    className: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    dotClassName: "bg-chart-5",
  },
  won: {
    label: "Won",
    className: "bg-success/15 text-success border-success/20",
    dotClassName: "bg-success",
  },
  lost: {
    label: "Lost",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    dotClassName: "bg-destructive",
  },
};
