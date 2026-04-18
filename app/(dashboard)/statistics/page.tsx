import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserAttempts } from '@/lib/db/attempts';
import { createAdminClient } from '@/lib/supabase/server';
import StatisticsView from '@/components/statistics/StatisticsView';
import { MobilePageWrapper } from '@/components/mobile/MobilePageWrapper';
import { MobileStatistik }   from '@/components/mobile/MobileStatistik';

export default async function StatisticsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const supabase = await createAdminClient();

  const { data: rankingData } = await supabase
    .rpc('get_user_national_rank', { p_user_id: user.id });

  const attempts = await getUserAttempts(user.id);
  const ranking  = rankingData?.[0] || null;

  return (
    <>
      {/* ── Mobile ── */}
      <MobilePageWrapper>
        <MobileStatistik data={attempts} ranking={ranking} />
      </MobilePageWrapper>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <StatisticsView data={attempts} ranking={ranking} />
      </div>
    </>
  );
}