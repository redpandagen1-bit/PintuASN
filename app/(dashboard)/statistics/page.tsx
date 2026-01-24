import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserAttempts } from '@/lib/db/attempts';
import StatisticsView from '@/components/statistics/StatisticsView'; // ✅ HAPUS KURUNG KURAWAL

export default async function StatisticsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  const attempts = await getUserAttempts(user.id);
  
  return <StatisticsView data={attempts} />;
}