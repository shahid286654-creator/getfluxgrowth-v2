"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PIPELINE_STAGE_CONFIG } from "@/lib/constants/pipeline";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import type { Lead, PipelineStage } from "@/types";

export function KanbanColumn({ stage, leads }: { stage: PipelineStage; leads: Lead[] }) {
  const config = PIPELINE_STAGE_CONFIG[stage];
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", config.dotClassName)} />
          <span className="text-sm font-medium text-foreground">{config.label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-lg px-2 pb-2 transition-colors",
          isOver && "bg-primary/5"
        )}
      >
        <SortableContext items={leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
