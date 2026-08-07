"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  updateOpportunityStatus,
  deleteOpportunity,
} from "@/lib/actions/ai-opportunities.actions";
import type { AiOpportunity } from "@/types";

export function OpportunityActionsMenu({ opportunity }: { opportunity: AiOpportunity }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {opportunity.status !== "proposed" && (
          <DropdownMenuItem
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await updateOpportunityStatus(opportunity.id, opportunity.lead_id, "proposed");
                router.refresh();
              })
            }
          >
            <CheckCircle2 />
            Mark proposed
          </DropdownMenuItem>
        )}
        {opportunity.status !== "dismissed" && (
          <DropdownMenuItem
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await updateOpportunityStatus(opportunity.id, opportunity.lead_id, "dismissed");
                router.refresh();
              })
            }
          >
            <XCircle />
            Dismiss
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteOpportunity(opportunity.id, opportunity.lead_id);
              router.refresh();
            })
          }
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
