import { CardSkeleton, StatsCardSkeleton, ListItemSkeleton } from '@/components/shared/loading-skeleton';

export default function PackageDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Package Info Card */}
      <div className="mb-8">
        <CardSkeleton />
      </div>

      {/* Content Tabs Skeleton */}
      <div className="mb-6">
        <div className="flex gap-4 border-b">
          <div className="h-10 w-24 bg-slate-200 rounded-t animate-pulse" />
          <div className="h-10 w-24 bg-slate-200 rounded-t animate-pulse" />
          <div className="h-10 w-24 bg-slate-200 rounded-t animate-pulse" />
        </div>
      </div>

      {/* Package Statistics */}
      <div className="mb-8">
        <div className="h-7 w-32 bg-slate-200 rounded animate-pulse mb-4" />
        <StatsCardSkeleton />
      </div>

      {/* Recent Attempts */}
      <div>
        <div className="h-7 w-40 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <ListItemSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
