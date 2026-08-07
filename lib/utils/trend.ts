import { format, startOfDay, addDays, subDays } from "date-fns";
import type { ChartDatum } from "@/components/shared/charts/pipeline-funnel-chart";

export function buildDailyTrend(
  rows: { created_at: string }[],
  days: number
): ChartDatum[] {
  const end = startOfDay(new Date());
  const start = subDays(end, days - 1);
  const counts = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    counts.set(format(addDays(start, i), "yyyy-MM-dd"), 0);
  }

  rows.forEach((row) => {
    const key = format(startOfDay(new Date(row.created_at)), "yyyy-MM-dd");
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([key, value]) => ({
    label: format(new Date(key), "MMM d"),
    value,
  }));
}

export function buildWeeklyTrend(
  rows: { created_at: string }[],
  days: number
): ChartDatum[] {
  const end = startOfDay(new Date());
  const start = subDays(end, days - 1);
  const weeks = Math.ceil(days / 7);
  const weekStarts = Array.from({ length: weeks }, (_, i) => addDays(start, i * 7));
  const counts = new Map<string, number>(
    weekStarts.map((d) => [format(d, "yyyy-MM-dd"), 0])
  );

  rows.forEach((row) => {
    const created = new Date(row.created_at);
    const daysFromStart = Math.floor((created.getTime() - start.getTime()) / 86_400_000);
    const weekIndex = Math.min(weeks - 1, Math.max(0, Math.floor(daysFromStart / 7)));
    const key = format(weekStarts[weekIndex], "yyyy-MM-dd");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([key, value]) => ({
    label: `Wk of ${format(new Date(key), "MMM d")}`,
    value,
  }));
}
