// app/(dashboard)/roadmap/roadmap-content.tsx
'use client';

import { useMemo } from 'react';
import type { RoadmapStats } from '@/lib/supabase/queries';
import type { ReminderPreference } from '@/types/roadmap';
import {
  derivePhases,
  deriveCategoryScores,
  getMilestones,
  getRekomendasi,
} from '@/constants/roadmap-data';
import { RoadmapPersiapan }  from '@/components/roadmap/RoadmapPersiapan';
import { ProgressMilestone } from '@/components/roadmap/ProgressMilestone';
import { RekomendasiNext }   from '@/components/roadmap/RekomendasiNext';
import { StudyCalendar }     from '@/components/roadmap/StudyCalendar';
import { Map, Flame, Target } from 'lucide-react';

interface RoadmapContentProps {
  stats:             RoadmapStats;
  savedPreference?:  ReminderPreference | null;
  studyHistory?:     string[];
}

export function RoadmapContent({
  stats,
  savedPreference,
  studyHistory = [],
}: RoadmapContentProps) {
  const phases         = useMemo(() => derivePhases(stats),         [stats]);
  const categoryScores = useMemo(() => deriveCategoryScores(stats), [stats]);
  const milestones     = useMemo(() => getMilestones(stats),        [stats]);
  const rekomendasi    = useMemo(() => getRekomendasi(stats),       [stats]);

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const totalPhases    = phases.length;
  const progressPct    = Math.round((completedCount / totalPhases) * 100);

  const examTargetDate = savedPreference?.examDate
    ? new Date(savedPreference.examDate)
    : null;

  const handleSavePreference = async (pref: ReminderPreference) => {
    await fetch('/api/profile/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pref),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 -mt-2">

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className="relative bg-[#1B2B5E] overflow-hidden rounded-2xl mb-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-8 right-32 w-32 h-32 rounded-full bg-[#F5A623]/10" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/5" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative px-5 pt-6 pb-6 md:px-6 md:pt-8 md:pb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
            {/* Left: title + progress */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-[#F5A623]/20 text-[#F5A623] text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
                <Map className="w-3 h-3" />
                Roadmap Belajar
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                Jalur Persiapan<br />
                <span className="text-[#F5A623]">SKD CPNS 2026</span>
              </h1>
              <p className="text-sm text-white/60 max-w-md mb-6">
                Ikuti 9 tahap terstruktur untuk memaksimalkan skor dan peluang kelulusanmu.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70 font-medium">Progress Keseluruhan</span>
                  <span className="text-[#F5A623] font-bold">{completedCount} / {totalPhases} tahap</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F5A623] to-[#f7c05a] rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: stat cards */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 lg:w-80">
              <div className="bg-white/8 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span className="text-[10px] text-white/50 uppercase tracking-wide font-semibold">Tryout</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.totalCompleted}</p>
                <p className="text-[10px] text-white/40 mt-0.5">dikerjakan</p>
              </div>
              <div className="bg-white/8 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span className="text-[10px] text-white/50 uppercase tracking-wide font-semibold">Skor</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.bestFinalScore}</p>
                <p className="text-[10px] text-white/40 mt-0.5">terbaik</p>
              </div>
              <div className="bg-white/8 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[#F5A623] text-sm">🏅</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide font-semibold">Tahap</span>
                </div>
                <p className="text-xl font-bold text-white">{progressPct}%</p>
                <p className="text-[10px] text-white/40 mt-0.5">selesai</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN CONTENT GRID ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Kolom Kiri (lebar): Rekomendasi + Roadmap */}
        <div className="lg:col-span-7 space-y-6">
          <RekomendasiNext
            priority={rekomendasi.priority}
            message={rekomendasi.message}
            action={rekomendasi.action}
            href={rekomendasi.href}
            totalCompleted={stats.totalCompleted}
          />
          <RoadmapPersiapan phases={phases} />
        </div>

        {/* Kolom Kanan (sempit): Progress + Kalender */}
        <div className="lg:col-span-5 space-y-6">
          <ProgressMilestone
            categoryScores={categoryScores}
            milestones={milestones}
            totalCompleted={stats.totalCompleted}
            bestFinalScore={stats.bestFinalScore}
          />
          <StudyCalendar
            examTargetDate={examTargetDate}
            savedPreference={savedPreference}
            studyHistory={studyHistory}
            onSavePreference={handleSavePreference}
          />
        </div>

      </div>
    </div>
  );
}