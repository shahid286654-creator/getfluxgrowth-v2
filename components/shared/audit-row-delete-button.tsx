"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, useConfirmDialog } from "@/components/shared/confirm-dialog";

export function AuditRowDeleteButton({
  id,
  leadId,
  label,
  deleteAction,
}: {
  id: string;
  leadId: string;
  label: string;
  deleteAction: (id: string, leadId: string) => Promise<void>;
}) {
  const router = useRouter();
  const { open, setOpen } = useConfirmDialog();

  return (
    <>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Trash2 className="text-muted-foreground" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete audit entry"
        description={`Remove the ${label} score entry.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteAction(id, leadId);
          router.refresh();
        }}
      />
    </>
  );
}
