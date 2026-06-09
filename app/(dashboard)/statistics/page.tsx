import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserAttempts } from '@/lib/db/attempts';
import { createAdminClient } from '@/lib/supabase/server';
import StatisticsView from '@/components/statistics/StatisticsView';
import { MobilePageWrapper } from '@/components/mobile/MobilePageWrapper';
import { MobileStatistik }   from '@/components/mobile/MobileStatistik';

export default async function StatisticsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const supabase = await createAdminClient();

  const [{ data: rankingData }, { data: distributionData }] = await Promise.all([
    supabase.rpc('get_user_national_rank', { p_user_id: userId }),
    supabase.rpc('get_score_distribution'),
  ]);

  const attempts     = await getUserAttempts(userId);
  const ranking      = rankingData?.[0] || null;
  const distribution = distributionData || [];

  return (
    <>
      {/* ── Mobile ── */}
      <MobilePageWrapper>
        <MobileStatistik data={attempts} ranking={ranking} distribution={distribution} />
      </MobilePageWrapper>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <StatisticsView data={attempts} ranking={ranking} distribution={distribution} />
      </div>
    </>
  );
}