import { TimerSkeleton, QuestionSkeleton } from '@/components/shared/loading-skeleton';

export default function ExamLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <TimerSkeleton />
      </div>

      {/* Exam Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border p-6">
            <QuestionSkeleton />
          </div>
        </div>

        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4">
            <div className="space-y-4">
              {/* Section Header */}
              <div className="space-y-2">
                <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-2 w-full bg-slate-200 rounded animate-pulse" />
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {[...Array(35)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-10 w-full bg-slate-200 rounded animate-pulse" 
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-6 flex justify-between">
        <div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
