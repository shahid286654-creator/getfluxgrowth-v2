"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { changeLeadStatus, changeLeadStage } from "@/lib/actions/leads.actions";
import { LEAD_STATUS_CONFIG } from "@/lib/constants/status";
import { PIPELINE_STAGES, PIPELINE_STAGE_CONFIG } from "@/lib/constants/pipeline";
import type { Lead, LeadStatus, PipelineStage } from "@/types";

// Row-level inline editors for a lead's status/stage badges. Visually
// distinct (dashed, clickable pill) from the top-of-page filter Selects
// in data-table-toolbar.tsx, which those must remain untouched.
function EditableBadge({
  label,
  badgeClassName,
  isPending,
  children,
}: {
  label: string;
  badgeClassName: string;
  isPending: boolean;
  children: ReactNode;
}) {
  if (isPending) {
    return (
      <Badge variant="outline" className={cn("gap-1", badgeClassName)}>
        <Loader2 className="size-3 animate-spin" />
        {label}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Badge
            variant="outline"
            render={<button type="button" />}
            className={cn(
              "cursor-pointer border-dashed outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-ring",
              badgeClassName
            )}
          />
        }
      >
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LeadStatusCell({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [isPending, startTransition] = useTransition();
  const config = LEAD_STATUS_CONFIG[status];

  function handleChange(value: string) {
    const next = value as LeadStatus;
    if (next === status) return;
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      try {
        await changeLeadStatus(lead.id, next);
      } catch (error) {
        setStatus(previous);
        toast.error(
          error instanceof Error
            ? error.message
            : `Couldn't update status for ${lead.company_name}.`
        );
      }
    });
  }

  return (
    <EditableBadge label={config.label} badgeClassName={config.className} isPending={isPending}>
      <DropdownMenuRadioGroup value={status} onValueChange={handleChange}>
        {Object.entries(LEAD_STATUS_CONFIG).map(([value, cfg]) => (
          <DropdownMenuRadioItem key={value} value={value}>
            {cfg.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </EditableBadge>
  );
}

export function LeadStageCell({ lead }: { lead: Lead }) {
  const [stage, setStage] = useState<PipelineStage>(lead.pipeline_stage);
  const [isPending, startTransition] = useTransition();
  const config = PIPELINE_STAGE_CONFIG[stage];

  function handleChange(value: string) {
    const next = value as PipelineStage;
    if (next === stage) return;
    const previous = stage;
    setStage(next);
    startTransition(async () => {
      try {
        await changeLeadStage(lead.id, next);
      } catch (error) {
        setStage(previous);
        toast.error(
          error instanceof Error
            ? error.message
            : `Couldn't update stage for ${lead.company_name}.`
        );
      }
    });
  }

  return (
    <EditableBadge label={config.label} badgeClassName={config.className} isPending={isPending}>
      <DropdownMenuRadioGroup value={stage} onValueChange={handleChange}>
        {PIPELINE_STAGES.map((stageValue) => (
          <DropdownMenuRadioItem key={stageValue} value={stageValue}>
            {PIPELINE_STAGE_CONFIG[stageValue].label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </EditableBadge>
  );
}
