"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types";

export function KanbanCard({ lead, overlay = false }: { lead: Lead; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <Card
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      className={cn(
        "cursor-grab touch-none border-border/60 py-3 active:cursor-grabbing",
        isDragging && !overlay && "opacity-40",
        overlay && "rotate-2 shadow-xl"
      )}
    >
      <CardContent className="space-y-1.5 px-3">
        <Link
          href={`/leads/${lead.id}`}
          className="block text-sm font-medium text-foreground hover:text-primary"
        >
          {lead.company_name}
        </Link>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {lead.industry ?? "—"}
          </span>
          <LeadStatusBadge status={lead.status} className="shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
