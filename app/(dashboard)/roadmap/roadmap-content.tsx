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
    <div className="min-h-screen bg-slate-50 -mt-2 pb-10">

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className="relative bg-[#1B2B5E] overflow-hidden rounded-2xl mb-6 shadow-lg shadow-[#1B2B5E]/20">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-white/[0.04]" />
          <div className="absolute top-6 right-28 w-36 h-36 rounded-full bg-[#F5A623]/10" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/[0.04]" />
          <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-[#F5A623]/5" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative px-5 pt-5 pb-5 md:px-6 md:pt-6 md:pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-5">

            {/* Left: title + progress bar */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-[#F5A623]/20 text-[#F5A623] text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
                <Map className="w-3 h-3" />
                Roadmap Belajar
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                Jalur Persiapan<br />
                <span className="text-[#F5A623]">SKD CPNS 2026</span>
              </h1>
              <p className="text-sm text-white/60 max-w-md mb-4">
                Ikuti 9 tahap terstruktur untuk memaksimalkan skor dan peluang kelulusanmu.
              </p>

              {/* Progress bar */}
              <div className="space-y-1.5 max-w-md">
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
                {progressPct === 100 && (
                  <p className="text-[10px] text-white/35">🎉 Semua tahap berhasil diselesaikan!</p>
                )}
              </div>
            </div>

            {/* Right: 3 stat cards */}
            <div className="grid grid-cols-3 gap-2 lg:w-56 flex-shrink-0">
              {[
                { Icon: Target, label: 'Tryout',  value: stats.totalCompleted, sub: 'dikerjakan' },
                { Icon: Flame,  label: 'Skor',    value: stats.bestFinalScore, sub: 'terbaik'    },
                { label: 'Tahap', value: `${progressPct}%`, sub: 'selesai', emoji: '🏅' },
              ].map(({ Icon, label, value, sub, emoji }) => (
                <div key={label} className="bg-white/8 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-1 mb-1">
                    {Icon ? (
                      <Icon className="w-3 h-3 text-[#F5A623]" />
                    ) : (
                      <span className="text-xs leading-none">{emoji}</span>
                    )}
                    <span className="text-[9px] text-white/50 uppercase tracking-wide font-semibold">{label}</span>
                  </div>
                  <p className="text-xl font-bold text-white leading-none" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {value}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">{sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── 2-COLUMN CONTENT GRID ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Kolom Kiri (7): Rekomendasi + Roadmap Steps */}
        <div className="lg:col-span-7 space-y-5">
          <RekomendasiNext
            priority={rekomendasi.priority}
            message={rekomendasi.message}
            action={rekomendasi.action}
            href={rekomendasi.href}
            totalCompleted={stats.totalCompleted}
          />
          <RoadmapPersiapan phases={phases} />
        </div>

        {/* Kolom Kanan (5): Progress + Kalender */}
        <div className="lg:col-span-5 space-y-5">
          <ProgressMilestone
            categoryScores={categoryScores}
            milestones={milestones}
            totalCompleted={stats.totalCompleted}
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