import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Percentage change vs. the prior period, e.g. 12.4 or -3.2. */
  delta?: number;
  className?: string;
}) {
  const isPositive = typeof delta === "number" && delta >= 0;

  return (
    <Card className={cn("border-border/60", className)}>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {typeof delta === "number" && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              <span>{Math.abs(delta).toFixed(1)}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
