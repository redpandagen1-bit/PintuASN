import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { getAttemptHistory, getUserStats, getUserTier } from '@/lib/supabase/queries';
import HistoryContent from './history-content';
import { MobilePageWrapper } from '@/components/mobile/MobilePageWrapper';
import { MobileRiwayat }     from '@/components/mobile/MobileRiwayat';

async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    filter?: string;
    page?: string;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not found');
  }

  const params = await searchParams;

  const sortBy   = (params.sort   as 'newest' | 'oldest' | 'highest_score') || 'newest';
  const filterBy = (params.filter as 'all' | 'passed' | 'failed')           || 'all';
  const page     = parseInt(params.page || '1');

  const [historyData, stats, userTier] = await Promise.all([
    getAttemptHistory(userId, sortBy, filterBy, page),
    getUserStats(userId),
    getUserTier(userId),
  ]);

  return (
    <>
      {/* ── Mobile ── */}
      <MobilePageWrapper>
        <MobileRiwayat
          initialHistory={historyData}
          initialStats={stats}
          initialSort={sortBy}
          initialFilter={filterBy}
          userTier={userTier}
        />
      </MobilePageWrapper>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <Suspense fallback={<div>Loading...</div>}>
          <HistoryContent
            initialHistory={historyData}
            initialStats={stats}
            initialSort={sortBy}
            initialFilter={filterBy}
            userTier={userTier}
          />
        </Suspense>
      </div>
    </>
  );
}

export default HistoryPage;
