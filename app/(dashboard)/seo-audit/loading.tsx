import { KpiGridSkeleton, TableSkeleton } from "@/components/shared/loading-skeletons";

export default function SeoAuditLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
      </div>
      <KpiGridSkeleton count={4} />
      <TableSkeleton rows={8} />
    </div>
  );
}
