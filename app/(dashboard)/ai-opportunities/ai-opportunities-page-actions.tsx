"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityFormDialog } from "@/components/shared/opportunity-form-dialog";

export function AiOpportunitiesPageActions({
  leadOptions,
}: {
  leadOptions: { id: string; company_name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add opportunity
      </Button>
      <OpportunityFormDialog open={open} onOpenChange={setOpen} leadOptions={leadOptions} />
    </>
  );
}
