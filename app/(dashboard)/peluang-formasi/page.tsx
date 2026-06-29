import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getPeluangFormasi } from '@/lib/supabase/peluang-formasi';
import { PeluangFormasiClient } from './peluang-client';
import { Skeleton } from '@/components/ui/skeleton';

async function PeluangContent() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const data = await getPeluangFormasi(userId);
  return <PeluangFormasiClient data={data} />;
}

export default function PeluangFormasiPage() {
  return (
    <Suspense fallback={<PeluangSkeleton />}>
      <PeluangContent />
    </Suspense>
  );
}

function PeluangSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-4 pb-10">
      <Skeleton className="h-28 w-full rounded-2xl mt-4 md:mt-0" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-44 w-full rounded-2xl" />
    </div>
  );
}
