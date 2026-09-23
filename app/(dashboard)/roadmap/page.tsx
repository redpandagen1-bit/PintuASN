// ============================================================
// app/(dashboard)/roadmap/page.tsx
// ============================================================

import { auth }           from '@clerk/nextjs/server';
import { redirect }       from 'next/navigation';
import { getUserTier }    from '@/lib/supabase/queries';
import { getRoadmapProgress } from '@/lib/supabase/roadmap-progress';
import { buildPathSections }  from '@/constants/roadmap-path-data';
import { RoadmapContent } from './roadmap-content';
import { MobilePageWrapper } from '@/components/mobile/MobilePageWrapper';
import { MobileRoadmap }     from '@/components/mobile/MobileRoadmap';

export const metadata = {
  title:       'Roadmap Belajar | PintuASN',
  description: 'Pantau jalur belajarmu menuju kelulusan SKD CPNS',
};

export default async function RoadmapPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [progress, userTier] = await Promise.all([
    getRoadmapProgress(userId),
    getUserTier(userId),
  ]);
  const sections = buildPathSections(progress, userTier);

  return (
    <>
      {/* ── Mobile ── */}
      <MobilePageWrapper>
        <MobileRoadmap sections={sections} />
      </MobilePageWrapper>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <RoadmapContent sections={sections} />
      </div>
    </>
  );
}
