"use client";

import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { OutreachEditorDialog } from "@/components/shared/outreach-editor-dialog";
import { OutreachStatusBadge } from "@/components/shared/status-badge";
import { OUTREACH_TYPE_CONFIG } from "@/lib/constants/outreach-types";
import { formatRelativeDate } from "@/lib/utils/format";
import { OutreachRowActions } from "../../outreach/outreach-row-actions";
import type { Outreach } from "@/types";

export function LeadOutreachPanel({ leadId, outreach }: { leadId: string; outreach: Outreach[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus />
          New draft
        </Button>
      </div>
      {outreach.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No outreach yet"
          description="Emails, LinkedIn messages, and proposals for this lead will appear here."
        />
      ) : (
        <div className="space-y-3">
          {outreach.map((item) => {
            const config = OUTREACH_TYPE_CONFIG[item.type];
            const Icon = config.icon;
            return (
              <Card key={item.id} className="border-border/60">
                <CardContent className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {item.subject || config.label}
                      </p>
                      {item.body && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {item.sent_at
                          ? `Sent ${formatRelativeDate(item.sent_at)}`
                          : `Updated ${formatRelativeDate(item.updated_at)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <OutreachStatusBadge status={item.status} />
                    <OutreachRowActions outreach={item} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <OutreachEditorDialog leadId={leadId} open={open} onOpenChange={setOpen} />
    </div>
  );
}
