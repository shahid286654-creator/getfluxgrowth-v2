"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Send, Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OutreachEditorDialog } from "@/components/shared/outreach-editor-dialog";
import { ConfirmDialog, useConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  markOutreachSent,
  updateOutreachStatus,
  deleteOutreach,
} from "@/lib/actions/outreach.actions";
import type { Outreach } from "@/types";

export function OutreachRowActions({ outreach }: { outreach: Outreach }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const { open: deleteOpen, setOpen: setDeleteOpen } = useConfirmDialog();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {outreach.status === "draft" && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
          )}
          {outreach.status !== "sent" && outreach.status !== "archived" && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await markOutreachSent(outreach.id, outreach.lead_id);
                  router.refresh();
                })
              }
            >
              <Send />
              Mark sent
            </DropdownMenuItem>
          )}
          {outreach.status !== "archived" && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await updateOutreachStatus(outreach.id, outreach.lead_id, "archived");
                  router.refresh();
                })
              }
            >
              <Archive />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <OutreachEditorDialog
        outreach={outreach}
        leadId={outreach.lead_id}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete outreach"
        description="This will permanently delete this outreach message."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteOutreach(outreach.id, outreach.lead_id);
          router.refresh();
        }}
      />
    </>
  );
}
