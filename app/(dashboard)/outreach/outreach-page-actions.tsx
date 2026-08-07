"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutreachEditorDialog } from "@/components/shared/outreach-editor-dialog";

export function OutreachPageActions({
  leadOptions,
}: {
  leadOptions: { id: string; company_name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        New draft
      </Button>
      <OutreachEditorDialog open={open} onOpenChange={setOpen} leadOptions={leadOptions} />
    </>
  );
}
