import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getRoadmapStats } from '@/lib/supabase/queries';
import { RoadmapContent } from './roadmap-content';

export const metadata = {
  title: 'Roadmap Belajar | PintuASN',
  description: 'Pantau jalur belajarmu menuju kelulusan SKD CPNS',
};

export default async function RoadmapPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const stats = await getRoadmapStats(userId);

  return <RoadmapContent stats={stats} />;
}