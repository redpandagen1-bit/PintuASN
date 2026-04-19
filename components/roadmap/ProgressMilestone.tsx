'use client';

import { cn } from '@/lib/utils';
import type { CategoryScore, Milestone } from '@/types/roadmap';
import { Trophy, CheckCircle2, BarChart3 } from 'lucide-react';

interface ProgressMilestoneProps {
  categoryScores: CategoryScore[];
  milestones:     Milestone[];
  totalCompleted: number;
}

const catColor: Record<string, {
  bar: string; barGlow: string; badge: string; text: string; iconBg: string; border: string;
}> = {
  TWK: {
    bar:     'bg-blue-500',
    barGlow: 'shadow-blue-300',
    badge:   'bg-blue-100 text-blue-700',
    text:    'text-blue-600',
    iconBg:  'bg-blue-50 border-blue-100',
    border:  'border-blue-200',
  },
  TIU: {
    bar:     'bg-violet-500',
    barGlow: 'shadow-violet-300',
    badge:   'bg-violet-100 text-violet-700',
    text:    'text-violet-600',
    iconBg:  'bg-violet-50 border-violet-100',
    border:  'border-violet-200',
  },
  TKP: {
    bar:     'bg-amber-500',
    barGlow: 'shadow-amber-300',
    badge:   'bg-amber-100 text-amber-700',
    text:    'text-amber-600',
    iconBg:  'bg-amber-50 border-amber-100',
    border:  'border-amber-200',
  },
};

export function ProgressMilestone({
  categoryScores,
  milestones,
  totalCompleted,
}: ProgressMilestoneProps) {
  const achievedCount = milestones.filter(m => m.achieved).length;

  return (
    <section className="space-y-4">

      {/* ── Section title ─────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1B2B5E]/8 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-4.5 h-4.5 text-[#1B2B5E]" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-[#1B2B5E]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Progress &amp; Pencapaian
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Skor per kategori dan milestone yang diraih</p>
        </div>
      </div>

      {/* ── SKOR PER KATEGORI ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-50">
          <BarChart3 className="w-4 h-4 text-[#1B2B5E]" />
          <span className="text-sm font-extrabold text-[#1B2B5E]">Skor per Kategori</span>
          {totalCompleted > 0 && (
            <span className="ml-auto text-[10px] text-slate-400 font-medium">
              vs. passing grade
            </span>
          )}
        </div>

        {totalCompleted === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Belum ada data skor</p>
            <p className="text-xs text-slate-300 mt-0.5">Selesaikan tryout pertamamu untuk melihat skor per kategori.</p>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {categoryScores.map(cs => {
              const pct   = Math.min((cs.avg / cs.passingGrade) * 100, 100);
              const color = catColor[cs.category] ?? catColor.TWK;

              return (
                <div key={cs.category} className="space-y-2">
                  {/* Label row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-[11px] font-extrabold px-2 py-0.5 rounded-lg',
                        color.badge,
                      )}>
                        {cs.category}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline">{cs.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className={cn(
                        'text-base font-extrabold leading-none',
                        cs.isPassed ? 'text-emerald-600' : color.text,
                      )}>
                        {cs.avg}
                      </span>
                      <span className="text-slate-200 text-sm">/</span>
                      <span className="text-slate-400 font-semibold">{cs.passingGrade}</span>
                      {cs.isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                      ) : (
                        <span className={cn(
                          'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 ml-0.5',
                        )}>
                          −{Math.abs(cs.gap)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        cs.isPassed ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : color.bar,
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Gap hint */}
                  {!cs.isPassed && (
                    <p className="text-[10px] text-slate-400">
                      Butuh{' '}
                      <span className={cn('font-extrabold', color.text)}>
                        {Math.abs(cs.gap)} poin
                      </span>{' '}
                      lagi untuk mencapai passing grade
                    </p>
                  )}
                  {cs.isPassed && (
                    <p className="text-[10px] text-emerald-600 font-semibold">
                      ✓ Sudah melewati passing grade
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MILESTONES ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F5A623]" />
            <span className="text-sm font-extrabold text-[#1B2B5E]">Pencapaian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {[...Array(Math.min(achievedCount, 3))].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-[#F5A623] border-2 border-white" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500">
              {achievedCount}
              <span className="text-slate-300 font-normal">/{milestones.length}</span>
            </span>
          </div>
        </div>

        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {milestones.map(m => (
            <div
              key={m.id}
              className={cn(
                'relative rounded-xl p-3 border transition-all duration-300',
                m.achieved
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-[#F5A623]/30 shadow-sm'
                  : 'bg-slate-50/50 border-slate-100 opacity-50 grayscale',
              )}
            >
              {m.achieved && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F5A623] shadow-sm" />
              )}
              <div className="text-xl mb-2 leading-none">{m.achieved ? '🏅' : '🔒'}</div>
              <p className={cn(
                'text-xs font-extrabold leading-snug',
                m.achieved ? 'text-[#1B2B5E]' : 'text-slate-400',
              )}>
                {m.label}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}