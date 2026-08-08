"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, ExternalLink, Gauge, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScoreStatusBadge } from "@/components/shared/status-badge";
import { upsertAudit, runWebsiteAudit } from "@/lib/actions/audits.actions";
import { AUDIT_CATEGORY_CONFIG } from "@/lib/constants/audit-categories";
import { formatRelativeDate } from "@/lib/utils/format";
import type { Audit, AuditCategory, ScoreStatus } from "@/types";

// Every audit_category enum value gets a card, whether or not a row
// exists yet for it -- the "foundation" the audit tab presents before
// any real data has been entered.
const CATEGORY_ORDER: AuditCategory[] = [
  "performance",
  "mobile",
  "speed",
  "ux",
  "cta",
  "trust",
  "technical_issues",
];

// PageSpeed Insights has no automated signal for these -- they only ever
// get filled in by hand via the per-category edit dialog.
const MANUAL_ONLY_CATEGORIES = new Set<AuditCategory>(["cta", "trust"]);

function bucketStatus(score: number | null): ScoreStatus | null {
  if (score === null) return null;
  if (score >= 80) return "good";
  if (score >= 50) return "needs_improvement";
  return "poor";
}

function getIssues(details: Audit["details"]): string[] {
  if (details && typeof details === "object" && !Array.isArray(details)) {
    const issues = (details as { issues?: unknown }).issues;
    if (Array.isArray(issues)) {
      return issues.filter((i): i is string => typeof i === "string");
    }
  }
  return [];
}

function getAuditedUrl(details: Audit["details"]): string | null {
  if (details && typeof details === "object" && !Array.isArray(details)) {
    const url = (details as { url?: unknown }).url;
    return typeof url === "string" ? url : null;
  }
  return null;
}

export function WebsiteAuditPanel({
  leadId,
  websiteUrl,
  audits,
}: {
  leadId: string;
  websiteUrl: string | null;
  audits: Audit[];
}) {
  const byCategory = new Map(audits.map((audit) => [audit.category, audit]));
  const scored = audits.filter((audit) => audit.score !== null);
  const overallScore =
    scored.length > 0
      ? Math.round(scored.reduce((sum, audit) => sum + (audit.score ?? 0), 0) / scored.length)
      : null;
  const overallStatus = bucketStatus(overallScore);
  const lastAudited = audits.reduce<string | null>((latest, audit) => {
    if (!latest) return audit.updated_at;
    return new Date(audit.updated_at) > new Date(latest) ? audit.updated_at : latest;
  }, null);
  const lastAuditedUrl = audits.reduce<string | null>((found, audit) => {
    return found ?? getAuditedUrl(audit.details);
  }, null);
  const hasAudit = audits.length > 0;
  const [runOpen, setRunOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {hasAudit
            ? "Automated scores come from Google PageSpeed Insights; calls-to-action and trust signals are entered by hand."
            : "Run an automated audit or fill in category scores by hand."}
        </p>
        <Button onClick={() => setRunOpen(true)}>
          {hasAudit ? <RotateCw className="size-4" /> : <Gauge className="size-4" />}
          {hasAudit ? "Re-run audit" : "Run audit"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Website</p>
            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <span className="truncate">{websiteUrl.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="size-3.5 shrink-0" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No website on file</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Overall score</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {overallScore !== null ? `${overallScore}/100` : "--"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Audit status</p>
            {overallStatus ? (
              <ScoreStatusBadge status={overallStatus} />
            ) : (
              <p className="text-sm text-muted-foreground">Not audited</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Last audited</p>
            <p className="text-sm font-medium text-foreground">
              {lastAudited ? formatRelativeDate(lastAudited) : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ORDER.map((category) => (
          <AuditCategoryCard
            key={category}
            leadId={leadId}
            category={category}
            audit={byCategory.get(category) ?? null}
          />
        ))}
      </div>

      <RunAuditDialog
        leadId={leadId}
        open={runOpen}
        onOpenChange={setRunOpen}
        defaultUrl={websiteUrl ?? lastAuditedUrl ?? ""}
        hasAudit={hasAudit}
      />
    </div>
  );
}

function RunAuditDialog({
  leadId,
  open,
  onOpenChange,
  defaultUrl,
  hasAudit,
}: {
  leadId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUrl: string;
  hasAudit: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await runWebsiteAudit(leadId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      toast.success("Audit complete");
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        setError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hasAudit ? "Re-run audit" : "Run audit"}</DialogTitle>
          <DialogDescription>
            Runs a live Google PageSpeed Insights check against the URL and saves real
            performance, mobile, speed, UX, and technical scores. Calls-to-action and trust
            signals aren&apos;t available from an automated scan, so those stay manual.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="run-audit-url">
              Website URL
            </label>
            <Input
              id="run-audit-url"
              name="url"
              type="url"
              required
              defaultValue={defaultUrl}
              placeholder="https://example.com"
              disabled={isPending}
            />
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
              {hasAudit ? "Re-run audit" : "Run audit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AuditCategoryCard({
  leadId,
  category,
  audit,
}: {
  leadId: string;
  category: AuditCategory;
  audit: Audit | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { label, icon: Icon } = AUDIT_CATEGORY_CONFIG[category];
  const issues = getIssues(audit?.details ?? null);
  const isManualOnly = MANUAL_ONLY_CATEGORIES.has(category);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertAudit(leadId, category, formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Card className="border-border/60">
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <p className="text-sm font-medium text-foreground">{label}</p>
            </div>
            <div className="flex items-center gap-1">
              {isManualOnly && (
                <span className="text-xs text-muted-foreground">Manual only</span>
              )}
              {audit && <ScoreStatusBadge status={audit.status} />}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${label} audit`}
                onClick={() => setOpen(true)}
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xl font-semibold tabular-nums text-foreground">
              {audit?.score ?? "--"}
              {audit?.score !== null && audit?.score !== undefined && (
                <span className="text-sm font-normal text-muted-foreground">/100</span>
              )}
            </span>
            <Progress value={audit?.score ?? 0} />
          </div>

          {audit?.summary && <p className="text-sm text-muted-foreground">{audit.summary}</p>}

          {issues.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
              {issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Update this lead&apos;s {label.toLowerCase()} audit findings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor={`${category}-score`}>
                Score (0-100)
              </label>
              <Input
                id={`${category}-score`}
                name="score"
                type="number"
                min={0}
                max={100}
                defaultValue={audit?.score ?? ""}
                placeholder="e.g. 72"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor={`${category}-summary`}>
                Observations
              </label>
              <Textarea
                id={`${category}-summary`}
                name="summary"
                rows={3}
                defaultValue={audit?.summary ?? ""}
                placeholder={`Notes on ${label.toLowerCase()}...`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor={`${category}-issues`}>
                Key issues (one per line)
              </label>
              <Textarea
                id={`${category}-issues`}
                name="issues"
                rows={3}
                defaultValue={issues.join("\n")}
                placeholder={"Slow LCP on homepage\nMissing alt text on hero image"}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
