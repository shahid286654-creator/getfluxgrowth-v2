"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { runWebsiteAudit } from "@/lib/actions/audits.actions";

export type AuditableLead = {
  id: string;
  company_name: string;
  website: string | null;
};

// Entry point for running a manual PageSpeed audit against ANY lead from
// the global Website Audit page, not just from within a lead's own detail
// page. Reuses the exact same runWebsiteAudit action/data flow as the
// per-lead "Re-run audit" button.
export function RunAuditButton({ leads }: { leads: AuditableLead[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leadId, setLeadId] = useState<string>("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedLead = useMemo(() => leads.find((l) => l.id === leadId), [leads, leadId]);

  function handleLeadChange(nextId: string) {
    const lead = leads.find((l) => l.id === nextId);
    setLeadId(nextId);
    setUrl(lead?.website ?? "");
    setError(null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!leadId) {
      setError("Select a lead first");
      return;
    }
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await runWebsiteAudit(leadId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setLeadId("");
      setUrl("");
      toast.success(`Audit complete for ${selectedLead?.company_name ?? "lead"}`);
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Gauge className="size-4" />
        Run audit
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (isPending) return;
          setError(null);
          setOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Run audit</DialogTitle>
            <DialogDescription>
              Pick a lead and run a fresh Google PageSpeed Insights check against their website.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="run-audit-lead">
                Lead
              </label>
              {/* Plain native <select> here (not the styled Select primitive used
                  elsewhere in the app) -- this dialog needs nothing beyond a basic
                  picker, and a native control gives universally reliable click/
                  keyboard/touch behavior without any custom pointer-event wiring. */}
              <select
                id="run-audit-lead"
                value={leadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                disabled={isPending}
                required
                className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              >
                <option value="" disabled>
                  Select a lead...
                </option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="run-audit-url">
                Website URL
              </label>
              <Input
                id="run-audit-url"
                name="url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isPending}
              />
              {leadId && !selectedLead?.website && (
                <p className="text-xs text-muted-foreground">
                  This lead has no website on file -- enter one to audit.
                </p>
              )}
            </div>

            {isPending && (
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 shrink-0 animate-spin" />
                Running Lighthouse checks against the site -- this can take up to a minute.
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Run audit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
