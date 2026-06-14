// ============================================================
// app/(dashboard)/materi/page.tsx
// ============================================================

import { Suspense }     from 'react';
import { auth } from '@clerk/nextjs/server';
import { getMaterialModules, getUserTier } from '@/lib/supabase/queries';
import MateriPageClient from './materi-client';
import type { MaterialModule } from './shared';
import { Skeleton }    from '@/components/ui/skeleton';
import { MobilePageWrapper } from '@/components/mobile/MobilePageWrapper';
import { MobileMateri }      from '@/components/mobile/MobileMateri';

// ─────────────────────────────────────────────────────────────

async function MateriContent() {
  const { userId } = await auth();
  if (!userId) throw new Error('User not found');

  const [modules, userTier] = await Promise.all([
    getMaterialModules(),
    getUserTier(userId),
  ]);

  return (
    <>
      {/* Mobile (< md) */}
      <MobilePageWrapper>
        <MobileMateri modules={modules as MaterialModule[]} userTier={userTier} />
      </MobilePageWrapper>

      {/* Desktop (≥ md) */}
      <div className="hidden md:block">
        <MateriPageClient modules={modules as MaterialModule[]} userTier={userTier} />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────

export default function MateriPage() {
  return (
    <Suspense fallback={<MateriSkeleton />}>
      <MateriContent />
    </Suspense>
  );
}

function MateriSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
