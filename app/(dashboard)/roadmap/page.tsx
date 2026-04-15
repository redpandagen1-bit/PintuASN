// ============================================================
// app/(dashboard)/roadmap/page.tsx
// ============================================================

import { auth }           from '@clerk/nextjs/server';
import { redirect }       from 'next/navigation';
import { getRoadmapStats } from '@/lib/supabase/queries';
import { createClient }   from '@/lib/supabase/server';
import { RoadmapContent } from './roadmap-content';
import type { ReminderPreference } from '@/types/roadmap';

export const metadata = {
  title:       'Roadmap Belajar | PintuASN',
  description: 'Pantau jalur belajarmu menuju kelulusan SKD CPNS',
};

export default async function RoadmapPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await createClient();

  // Fetch stats, reminder preference, dan history secara paralel
  const [stats, { data: prefData }, { data: historyData }] = await Promise.all([
    getRoadmapStats(userId),

    supabase
      .from('user_reminder_preferences')
      .select('*')
      .eq('user_id', userId)
      .single(),

    // Ambil tanggal-tanggal di mana user mengerjakan tryout (attempt selesai)
    // Gunakan tabel attempts yang sudah ada di project
    supabase
      .from('attempts')
      .select('created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false }),
  ]);

  const savedPreference: ReminderPreference | null = prefData
    ? {
        enabled:      prefData.enabled,
        intervalDays: prefData.interval_days,
        customDays:   prefData.custom_days   ?? null,
        examDate:     prefData.exam_date     ?? null,
        lastNotifAt:  prefData.last_notif_at ?? null,
      }
    : null;

  // ISO string per tanggal attempt selesai
  const studyHistory: string[] = (historyData ?? []).map(
    (row: { created_at: string }) => row.created_at,
  );

  return (
    <RoadmapContent
      stats={stats}
      savedPreference={savedPreference}
      studyHistory={studyHistory}
    />
  );
}