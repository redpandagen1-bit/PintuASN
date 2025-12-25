import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getAttemptHistory, getUserStats } from '@/lib/supabase/queries';
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

  // Parse search params
  const sortBy = (searchParams.sort as 'newest' | 'oldest' | 'highest_score') || 'newest';
  const filterBy = (searchParams.filter as 'all' | 'passed' | 'failed') || 'all';
  const page = parseInt(searchParams.page || '1');

  // Fetch attempt history
  const historyData = await getAttemptHistory(userId, sortBy, filterBy, page);
  
  // Fetch overall stats
  const stats = await getUserStats(userId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryContent 
        initialHistory={historyData}
        initialStats={stats}
        initialSort={sortBy}
        initialFilter={filterBy}
      />
    </Suspense>
  );
}

export default HistoryPage;
