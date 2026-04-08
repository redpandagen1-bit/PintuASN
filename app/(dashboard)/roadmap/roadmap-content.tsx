// ============================================================
// app/(dashboard)/roadmap/roadmap-content.tsx  (replace file lama)
// ============================================================
'use client';

import { useMemo } from 'react';
import type { RoadmapStats } from '@/lib/supabase/queries';
import {
  derivePhases,
  deriveCategoryScores,
  getMilestones,
  getRekomendasi,
} from '@/constants/roadmap-data';
import { RoadmapPersiapan }  from '@/components/roadmap/RoadmapPersiapan';
import { ProgressMilestone } from '@/components/roadmap/ProgressMilestone';
import { RekomendasiNext }   from '@/components/roadmap/RekomendasiNext';

interface RoadmapContentProps {
  stats: RoadmapStats;
}

export function RoadmapContent({ stats }: RoadmapContentProps) {
  const phases         = useMemo(() => derivePhases(stats),         [stats]);
  const categoryScores = useMemo(() => deriveCategoryScores(stats), [stats]);
  const milestones     = useMemo(() => getMilestones(stats),        [stats]);
  const rekomendasi    = useMemo(() => getRekomendasi(stats),       [stats]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1B2B5E]">Roadmap Belajar</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pantau jalur persiapanmu menuju kelulusan SKD CPNS
        </p>
      </div>

      {/* Rekomendasi — paling atas agar langsung actionable */}
      <RekomendasiNext
        priority={rekomendasi.priority}
        message={rekomendasi.message}
        action={rekomendasi.action}
        href={rekomendasi.href}
        totalCompleted={stats.totalCompleted}
      />

      {/* 9 fase dengan accordion */}
      <RoadmapPersiapan phases={phases} />

      {/* Progress & Milestone */}
      <ProgressMilestone
        categoryScores={categoryScores}
        milestones={milestones}
        totalCompleted={stats.totalCompleted}
        bestFinalScore={stats.bestFinalScore}
      />
    </div>
  );
}