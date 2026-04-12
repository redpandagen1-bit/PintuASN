'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { CategoryScore, Milestone } from '@/types/roadmap';
import { Trophy, TrendingUp, Star } from 'lucide-react';

interface ProgressMilestoneProps {
  categoryScores: CategoryScore[];
  milestones:     Milestone[];
  totalCompleted: number;
  bestFinalScore: number;
}

export function ProgressMilestone({
  categoryScores,
  milestones,
  totalCompleted,
  bestFinalScore,
}: ProgressMilestoneProps) {
  const achievedCount = milestones.filter(m => m.achieved).length;

  const catColor: Record<string, { bar: string; badge: string; text: string }> = {
    TWK: {
      bar:   'bg-blue-500',
      badge: 'bg-blue-100 text-blue-700',
      text:  'text-blue-600',
    },
    TIU: {
      bar:   'bg-violet-500',
      badge: 'bg-violet-100 text-violet-700',
      text:  'text-violet-600',
    },
    TKP: {
      bar:   'bg-amber-500',
      badge: 'bg-amber-100 text-amber-700',
      text:  'text-amber-600',
    },
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#1B2B5E]">Progress & Pencapaian</h2>
        <p className="text-xs text-gray-500 mt-0.5">Skor per kategori dan milestone yang diraih</p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-[#1B2B5E] p-4 text-white">
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
          <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide">Tryout Selesai</p>
          <p className="text-4xl font-extrabold mt-1 leading-none">{totalCompleted}</p>
          <p className="text-xs text-white/40 mt-1.5">paket dikerjakan</p>
          <TrendingUp className="absolute bottom-3 right-3 w-8 h-8 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#f7c05a] p-4 text-white">
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wide">Skor Terbaik</p>
          <p className="text-4xl font-extrabold mt-1 leading-none">{bestFinalScore}</p>
          <p className="text-xs text-white/60 mt-1.5">poin final</p>
          <Star className="absolute bottom-3 right-3 w-8 h-8 text-white/20" />
        </div>
      </div>

      {/* ── SKOR PER KATEGORI ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
          <TrendingUp className="w-4 h-4 text-[#1B2B5E]" />
          <span className="text-sm font-bold text-[#1B2B5E]">Skor per Kategori</span>
        </div>

        {totalCompleted === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">Belum ada data</p>
            <p className="text-xs text-gray-300 mt-0.5">Selesaikan tryout pertamamu untuk melihat skor.</p>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {categoryScores.map(cs => {
              const pct   = Math.min((cs.avg / cs.passingGrade) * 100, 100);
              const color = catColor[cs.category] ?? catColor.TWK;

              return (
                <div key={cs.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-extrabold px-2 py-0.5 rounded-lg', color.badge)}>
                        {cs.category}
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:inline">{cs.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={cn('text-base font-extrabold', cs.isPassed ? 'text-emerald-600' : color.text)}>
                        {cs.avg}
                      </span>
                      <span className="text-gray-200">/</span>
                      <span className="text-gray-400 font-medium">{cs.passingGrade}</span>
                      {cs.isPassed ? (
                        <span className="text-emerald-500 font-bold">✓</span>
                      ) : (
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50', color.text)}>
                          -{Math.abs(cs.gap)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Custom progress bar */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', color.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {!cs.isPassed && (
                    <p className="text-[10px] text-gray-400">
                      Butuh <span className={cn('font-bold', color.text)}>{Math.abs(cs.gap)} poin</span> lagi untuk lulus passing grade
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MILESTONES ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F5A623]" />
            <span className="text-sm font-bold text-[#1B2B5E]">Pencapaian</span>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {achievedCount}<span className="text-gray-200">/{milestones.length}</span> diraih
          </span>
        </div>

        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {milestones.map(m => (
            <div
              key={m.id}
              className={cn(
                'relative rounded-xl p-3 border transition-all duration-300',
                m.achieved
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-[#F5A623]/30 shadow-sm'
                  : 'bg-gray-50 border-gray-100 opacity-40 grayscale',
              )}
            >
              {m.achieved && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
              )}
              <div className="text-xl mb-1.5">{m.achieved ? '🏅' : '🔒'}</div>
              <p className={cn(
                'text-xs font-bold leading-tight',
                m.achieved ? 'text-[#1B2B5E]' : 'text-gray-400',
              )}>
                {m.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}