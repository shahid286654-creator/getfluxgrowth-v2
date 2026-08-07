import { TableSkeleton } from "@/components/shared/loading-skeletons";

export default function OutreachLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <TableSkeleton rows={10} />
    </div>
  );
}
