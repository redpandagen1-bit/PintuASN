import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getAttemptHistory, getUserStats, getUserTier } from '@/lib/supabase/queries';
import HistoryContent from './history-content';

async function HistoryPage({
  searchParams,
}: {
  searchParams: {
    sort?: string;
    filter?: string;
    page?: string;
  };
}) {
  const user = await currentUser();
  if (!user) {
    throw new Error('User not found');
  }

  const userId = user.id;

  const sortBy = (searchParams.sort as 'newest' | 'oldest' | 'highest_score') || 'newest';
  const filterBy = (searchParams.filter as 'all' | 'passed' | 'failed') || 'all';
  const page = parseInt(searchParams.page || '1');

  const [historyData, stats, userTier] = await Promise.all([
    getAttemptHistory(userId, sortBy, filterBy, page),
    getUserStats(userId),
    getUserTier(userId),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryContent
        initialHistory={historyData}
        initialStats={stats}
        initialSort={sortBy}
        initialFilter={filterBy}
        userTier={userTier}
      />
    </Suspense>
  );
}

export default HistoryPage;