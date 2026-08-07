"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadFormDialog } from "@/components/shared/lead-form-dialog";

export function LeadsPageActions() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add lead
      </Button>
      <LeadFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
