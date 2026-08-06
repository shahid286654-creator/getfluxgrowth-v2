import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your client acquisition pipeline at a glance."
      />
      <div className="rounded-xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
        KPI cards, recent activity, and pipeline overview land here.
      </div>
    </>
  );
}
