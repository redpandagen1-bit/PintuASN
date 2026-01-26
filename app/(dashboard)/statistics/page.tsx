import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserAttempts } from '@/lib/db/attempts';
import { createAdminClient } from '@/lib/supabase/server';
import StatisticsView from '@/components/statistics/StatisticsView'; // ✅ HAPUS KURUNG KURAWAL

export default async function StatisticsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  const supabase = await createAdminClient();
  
  // ← ADD: Fetch ranking
  const { data: rankingData } = await supabase
    .rpc('get_user_national_rank', { p_user_id: user.id });
  
  const attempts = await getUserAttempts(user.id);
  
  // ← MODIFY: Pass ranking data
  return <StatisticsView data={attempts} ranking={rankingData?.[0] || null} />;
}