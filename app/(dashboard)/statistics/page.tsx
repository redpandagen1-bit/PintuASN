import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserAttempts } from '@/lib/db/attempts';
import { createAdminClient } from '@/lib/supabase/server';
import { getTopicMastery } from '@/lib/supabase/drilling';
import { getPeluangFormasi, type PeluangFormasi } from '@/lib/supabase/peluang-formasi';
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

  const [attempts, mastery, peluang] = await Promise.all([
    getUserAttempts(userId),
    getTopicMastery(userId),
    getPeluangFormasi(userId).catch(() => null as PeluangFormasi | null),
  ]);
  const ranking      = rankingData?.[0] || null;
  const distribution = distributionData || [];

  return (
    <>
      {/* ── Mobile ── */}
      <MobilePageWrapper>
        <MobileStatistik data={attempts} ranking={ranking} distribution={distribution} mastery={mastery} peluang={peluang} />
      </MobilePageWrapper>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <StatisticsView data={attempts} ranking={ranking} distribution={distribution} mastery={mastery} peluang={peluang} />
      </div>
    </>
  );
}