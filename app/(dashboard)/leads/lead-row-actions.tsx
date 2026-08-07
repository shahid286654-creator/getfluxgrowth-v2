"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadFormDialog } from "@/components/shared/lead-form-dialog";
import { ConfirmDialog, useConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteLead } from "@/lib/actions/leads.actions";
import type { Lead } from "@/types";

export function LeadRowActions({ lead }: { lead: Lead }) {
  const [editOpen, setEditOpen] = useState(false);
  const { open: deleteOpen, setOpen: setDeleteOpen } = useConfirmDialog();
  const router = useRouter();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LeadFormDialog lead={lead} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete lead"
        description={`This will permanently delete ${lead.company_name} and all related audits, notes, and outreach.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteLead(lead.id);
          router.refresh();
        }}
      />
    </>
  );
}
