'use client';

// components/mobile/MobileRoadmap.tsx
// Mobile-only roadmap — Pathfinder Navy MD3 design
// Vertical timeline + progress hero + milestone bento

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Clock } from 'lucide-react';
import {
  derivePhases,
  deriveCategoryScores,
  getMilestones,
  getRekomendasi,
} from '@/constants/roadmap-data';
import type { RoadmapStats } from '@/lib/supabase/queries';
import { cn } from '@/lib/utils';

interface MobileRoadmapProps {
  stats: RoadmapStats;
}

export function MobileRoadmap({ stats }: MobileRoadmapProps) {
  const phases         = useMemo(() => derivePhases(stats),         [stats]);
  const categoryScores = useMemo(() => deriveCategoryScores(stats), [stats]);
  const milestones     = useMemo(() => getMilestones(stats),        [stats]);
  const rekomendasi    = useMemo(() => getRekomendasi(stats),       [stats]);

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const progressPct    = Math.round((completedCount / phases.length) * 100);

  // Show first 4 phases for timeline (mockup shows 4)
  const timelinePhases = phases.slice(0, 4);

  return (
    <main className="pb-32">

      {/* ── Hero Section & Overall Progress ──────────────────── */}
      <section className="px-6 pt-6 pb-8 bg-gradient-to-b from-md-surface to-md-surface-container-low">
        <h1 className="text-2xl font-bold text-md-primary mb-2"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Roadmap Belajar
        </h1>
        <p className="text-md-on-surface-variant text-sm mb-6 leading-relaxed">
          Ikuti langkah-langkah strategis untuk menaklukkan ujian CPNS 2026.
        </p>

        {/* Progress summary card */}
        <div className="bento-card p-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-label-sm text-md-on-secondary-fixed-variant font-semibold block mb-1">
                Total Progress
              </span>
              <div className="text-3xl font-extrabold text-md-primary"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {progressPct}%
              </div>
            </div>
            <span className="text-sm font-medium text-md-secondary">
              {completedCount}/{phases.length} Tahap
            </span>
          </div>

          {/* Overall progress bar */}
          <div className="progress-md3-track mb-5">
            <div className="progress-md3" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Category bars */}
          <div className="space-y-3">
            {categoryScores.map(cat => {
              const pct = cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0;
              return (
                <div key={cat.label} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-md-on-surface-variant">
                    <span>{cat.label}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="progress-md3-track">
                    <div className="h-full bg-md-secondary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Vertical Timeline ─────────────────────────────────── */}
      <section className="px-6 space-y-0 relative">
        {timelinePhases.map((phase, idx) => {
          const isLast       = idx === timelinePhases.length - 1;
          const isCompleted  = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';
          const isLocked     = phase.status === 'locked' || phase.status === 'pending';

          return (
            <div key={phase.id} className="relative flex gap-5">
              {/* Vertical connector line */}
              {!isLast && (
                <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-md-surface-container-high z-0" />
              )}

              {/* Step icon */}
              <div className="relative z-10 flex-shrink-0 mt-1">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shadow-md3-sm',
                  isCompleted  ? 'bg-md-secondary text-white' :
                  isInProgress ? 'bg-md-secondary-container text-md-on-secondary-container ring-4 ring-white' :
                  'bg-md-surface-container text-md-on-surface-variant opacity-60',
                )}>
                  <span className="text-lg">{phase.icon}</span>
                </div>
              </div>

              {/* Step content */}
              <div className={cn('flex-grow pb-6', isLast && 'pb-2')}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className={cn(
                    'font-bold text-md-primary',
                    isLocked && 'opacity-40',
                    { fontFamily: 'var(--font-jakarta)' },
                  )} style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {phase.title}
                  </h3>

                  {/* Status badge */}
                  <span className={cn(
                    'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full',
                    isCompleted  ? 'text-md-secondary-fixed-dim bg-md-secondary/10' :
                    isInProgress ? 'text-md-secondary-container bg-md-secondary-container/10' :
                    'text-md-on-surface-variant/40 bg-md-surface-container/40',
                  )}>
                    {isCompleted ? 'Selesai' : isInProgress ? 'Sedang' : 'Belum'}
                  </span>
                </div>

                <p className={cn(
                  'text-sm text-md-on-surface-variant mb-3 leading-relaxed',
                  isLocked && 'opacity-50',
                )}>
                  {phase.description}
                </p>

                {/* CTA button — only for in-progress */}
                {isInProgress && (
                  <Link href={rekomendasi.href ?? '/daftar-tryout'}>
                    <button className="w-full py-3 px-4 bg-md-secondary-container text-md-on-secondary-container font-bold rounded-xl text-sm active-press flex items-center justify-center gap-2">
                      Lanjutkan Belajar
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Milestone Bento ───────────────────────────────────── */}
      <section className="px-6 mt-4 pb-4">
        <h2 className="font-bold text-lg text-md-primary mb-4"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Milestone Pencapaian
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Primary milestone — tall card */}
          <div className="bg-md-primary text-white p-4 rounded-2xl flex flex-col justify-between h-40 relative overflow-hidden">
            <div className="relative z-10">
              <Trophy size={28} className="text-md-secondary-container mb-2" />
              <div className="text-xs font-medium opacity-70">Pencapaian</div>
              <div className="text-sm font-bold">
                {milestones.find(m => m.achieved)?.label ?? 'Mulai Belajar'}
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Trophy size={80} />
            </div>
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest bg-white/10 w-fit px-2 py-1 rounded">
              {stats.totalCompleted > 0 ? 'Aktif' : 'Mulai'}
            </span>
          </div>

          {/* Two small milestone cards */}
          <div className="space-y-4">
            <div className="bento-card p-4 h-[calc(5rem-0.5rem)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-md-surface-container flex items-center justify-center flex-shrink-0">
                <Trophy size={18} className="text-md-secondary" />
              </div>
              <div>
                <div className="text-label-sm text-md-on-surface-variant">Top Rank</div>
                <div className="text-sm font-bold text-md-primary">
                  {stats.totalCompleted > 0 ? `${stats.totalCompleted} Tryout` : '-'}
                </div>
              </div>
            </div>
            <div className="bento-card p-4 h-[calc(5rem-0.5rem)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-md-surface-container flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-md-secondary" />
              </div>
              <div>
                <div className="text-label-sm text-md-on-surface-variant">Skor Terbaik</div>
                <div className="text-sm font-bold text-md-primary">
                  {stats.bestFinalScore > 0 ? stats.bestFinalScore : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
