"use client";

import { useState } from "react";
import { ChartWrapper } from "@/components/shared/chart-wrapper";
import { LeadsTrendChart } from "@/components/shared/charts/leads-trend-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChartDatum } from "@/components/shared/charts/pipeline-funnel-chart";

export function LeadsTrendCard({
  data30,
  data90,
}: {
  data30: ChartDatum[];
  data90: ChartDatum[];
}) {
  const [period, setPeriod] = useState<"30" | "90">("30");

  return (
    <ChartWrapper
      title="Leads created"
      description="New leads over time"
      actions={
        <Select value={period} onValueChange={(value) => setPeriod(value as "30" | "90")}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <LeadsTrendChart data={period === "30" ? data30 : data90} />
    </ChartWrapper>
  );
}
