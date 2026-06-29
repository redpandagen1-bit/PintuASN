import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getDrillingTopicStats, getInProgressDrilling } from '@/lib/supabase/drilling';
import { DrillingClient } from './drilling-client';
import { Skeleton } from '@/components/ui/skeleton';

async function DrillingContent() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Catatan: fitur drilling untuk sementara terbuka untuk semua user.
  // Rencana ke depan akan dibatasi tier premium (gating menyusul).
  const [stats, inProgress] = await Promise.all([
    getDrillingTopicStats(userId),
    getInProgressDrilling(userId),
  ]);
  return <DrillingClient stats={stats} inProgress={inProgress} />;
}

export default function DrillingPage() {
  return (
    <Suspense fallback={<DrillingSkeleton />}>
      <DrillingContent />
    </Suspense>
  );
}

function DrillingSkeleton() {
  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto px-4 sm:px-0">
      <Skeleton className="h-32 w-full rounded-2xl mt-4 md:mt-0" />
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <Skeleton className="h-28 w-full" />
    </div>
  );
}
