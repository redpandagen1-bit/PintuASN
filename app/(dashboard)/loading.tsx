import { CardSkeleton, StatsCardSkeleton } from '@/components/shared/loading-skeleton';

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        
        {/* Stats Skeleton */}
        <StatsCardSkeleton />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Attempts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
          
          {/* Attempt History Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Right Column - Quick Actions & Tips */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="h-7 w-28 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-12 w-full bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-slate-200 rounded-lg animate-pulse" />
          </div>

          {/* Study Tips */}
          <div className="h-7 w-24 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
