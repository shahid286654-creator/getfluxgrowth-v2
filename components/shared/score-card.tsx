import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScoreStatusBadge } from "@/components/shared/status-badge";
import type { ScoreStatus } from "@/types";
import { cn } from "@/lib/utils";

export function ScoreCard({
  icon: Icon,
  label,
  score,
  status,
  summary,
  className,
}: {
  icon: LucideIcon;
  label: string;
  score: number | null;
  status: ScoreStatus;
  summary?: string | null;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/60", className)}>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <p className="text-sm font-medium text-foreground">{label}</p>
          </div>
          <ScoreStatusBadge status={status} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold tabular-nums text-foreground">
              {score ?? "--"}
              {score !== null && (
                <span className="text-sm font-normal text-muted-foreground">/100</span>
              )}
            </span>
          </div>
          <Progress value={score ?? 0} />
        </div>

        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      </CardContent>
    </Card>
  );
}
