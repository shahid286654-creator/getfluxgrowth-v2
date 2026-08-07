import { CardGridSkeleton } from "@/components/shared/loading-skeletons";

export default function AiOpportunitiesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
