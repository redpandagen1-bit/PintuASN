export default function StatisticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-slate-200 rounded-lg"></div>
      
      {/* 4 card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="h-32 bg-slate-200 rounded-xl"></div>
      </div>
      
      {/* Chart area grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-slate-200 rounded-xl"></div>
        <div className="h-80 bg-slate-200 rounded-xl"></div>
      </div>
      
      {/* Evaluation area grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-slate-200 rounded-xl"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}
