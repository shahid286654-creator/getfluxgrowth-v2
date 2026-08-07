"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadFormDialog } from "@/components/shared/lead-form-dialog";
import { ConfirmDialog, useConfirmDialog } from "@/components/shared/confirm-dialog";
import { LEAD_STATUS_CONFIG } from "@/lib/constants/status";
import { PIPELINE_STAGES, PIPELINE_STAGE_CONFIG } from "@/lib/constants/pipeline";
import { changeLeadStatus, changeLeadStage, deleteLead } from "@/lib/actions/leads.actions";
import type { Lead, LeadStatus, PipelineStage } from "@/types";

export function LeadDetailHeader({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const { open: deleteOpen, setOpen: setDeleteOpen } = useConfirmDialog();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {lead.company_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[lead.industry, lead.country].filter(Boolean).join(" · ") ||
              "No industry or country set"}
            {lead.email && ` · ${lead.email}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Select
          value={lead.status}
          disabled={isPending}
          onValueChange={(value) =>
            startTransition(async () => {
              await changeLeadStatus(lead.id, value as LeadStatus);
              router.refresh();
            })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEAD_STATUS_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={lead.pipeline_stage}
          disabled={isPending}
          onValueChange={(value) =>
            startTransition(async () => {
              await changeLeadStage(lead.id, value as PipelineStage);
              router.refresh();
            })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PIPELINE_STAGES.map((stageValue) => (
              <SelectItem key={stageValue} value={stageValue}>
                {PIPELINE_STAGE_CONFIG[stageValue].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <LeadFormDialog lead={lead} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete lead"
        description={`This will permanently delete ${lead.company_name} and all related audits, notes, and outreach.`}
        confirmLabel="Delete"
        onConfirm={() => deleteLead(lead.id)}
      />
    </div>
  );
}
