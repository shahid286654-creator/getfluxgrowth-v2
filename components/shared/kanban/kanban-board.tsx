"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { changeLeadStage } from "@/lib/actions/leads.actions";
import { PIPELINE_STAGES } from "@/lib/constants/pipeline";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import type { Lead, PipelineStage } from "@/types";

function groupByStage(leads: Lead[]): Record<PipelineStage, Lead[]> {
  const grouped = Object.fromEntries(
    PIPELINE_STAGES.map((stage) => [stage, [] as Lead[]])
  ) as Record<PipelineStage, Lead[]>;
  leads.forEach((lead) => {
    grouped[lead.pipeline_stage].push(lead);
  });
  return grouped;
}

export function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [columns, setColumns] = useState<Record<PipelineStage, Lead[]>>(() =>
    groupByStage(initialLeads)
  );
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function findColumn(leadId: string): PipelineStage | undefined {
    return PIPELINE_STAGES.find((stage) => columns[stage].some((lead) => lead.id === leadId));
  }

  function handleDragStart(event: DragStartEvent) {
    const leadId = String(event.active.id);
    const stage = findColumn(leadId);
    if (!stage) return;
    setActiveLead(columns[stage].find((lead) => lead.id === leadId) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveLead(null);
    if (!over) return;

    const leadId = String(active.id);
    const sourceStage = findColumn(leadId);
    if (!sourceStage) return;

    const overId = String(over.id);
    const targetStage = (PIPELINE_STAGES as string[]).includes(overId)
      ? (overId as PipelineStage)
      : findColumn(overId);

    if (!targetStage || targetStage === sourceStage) return;

    const lead = columns[sourceStage].find((l) => l.id === leadId);
    if (!lead) return;

    setColumns((prev) => ({
      ...prev,
      [sourceStage]: prev[sourceStage].filter((l) => l.id !== leadId),
      [targetStage]: [{ ...lead, pipeline_stage: targetStage }, ...prev[targetStage]],
    }));

    changeLeadStage(lead.id, targetStage).catch(() => {
      setColumns((prev) => ({
        ...prev,
        [targetStage]: prev[targetStage].filter((l) => l.id !== leadId),
        [sourceStage]: [lead, ...prev[sourceStage]],
      }));
      toast.error(`Couldn't move ${lead.company_name} — please try again.`);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn key={stage} stage={stage} leads={columns[stage]} />
        ))}
      </div>
      <DragOverlay>{activeLead && <KanbanCard lead={activeLead} overlay />}</DragOverlay>
    </DndContext>
  );
}
