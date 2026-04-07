// ============================================================
// components/roadmap/ProgressMilestone.tsx
// ============================================================
'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { CategoryScore, Milestone } from '@/types/roadmap';
import { Trophy, TrendingUp } from 'lucide-react';

interface ProgressMilestoneProps {
  categoryScores: CategoryScore[];
  milestones: Milestone[];
  totalCompleted: number;
  bestFinalScore: number;
}

export function ProgressMilestone({
  categoryScores,
  milestones,
  totalCompleted,
  bestFinalScore,
}: ProgressMilestoneProps) {
  const achievedCount = milestones.filter((m) => m.achieved).length;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#1B2B5E]">Progress & Milestone</h2>
        <p className="text-sm text-gray-500 mt-0.5">Pencapaianmu sejauh ini</p>
      </div>

      {/* Skor per kategori */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#1B2B5E]" />
          <span className="text-sm font-medium text-[#1B2B5E]">Rata-rata Skor per Kategori</span>
        </div>

        {totalCompleted === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Belum ada data. Selesaikan tryout pertamamu.
          </p>
        ) : (
          <div className="space-y-3">
            {categoryScores.map((cs) => {
              // Progress bar: cap di 100% visual
              const progressPercent = Math.min((cs.avg / cs.passingGrade) * 100, 100);

              return (
                <div key={cs.category} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-bold px-1.5 py-0.5 rounded',
                          cs.isPassed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-50 text-red-600',
                        )}
                      >
                        {cs.category}
                      </span>
                      <span className="text-xs text-gray-500 hidden sm:inline">{cs.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={cn('font-semibold', cs.isPassed ? 'text-green-600' : 'text-red-500')}>
                        {cs.avg}
                      </span>
                      <span className="text-gray-300">/</span>
                      <span className="text-gray-400">{cs.passingGrade}</span>
                      {cs.isPassed ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-400 text-[10px]">-{Math.abs(cs.gap)}</span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress
                      value={progressPercent}
                      className="h-2 bg-gray-100"
                    />
                    {/* Passing grade marker line */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-gray-400/50"
                      style={{ left: '100%', transform: 'translateX(-1px)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1B2B5E] rounded-xl p-4 text-white">
          <p className="text-xs text-white/60 font-medium">Tryout Selesai</p>
          <p className="text-3xl font-bold mt-1">{totalCompleted}</p>
          <p className="text-xs text-white/50 mt-1">paket dikerjakan</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Skor Terbaik</p>
          <p className="text-3xl font-bold mt-1 text-[#1B2B5E]">{bestFinalScore}</p>
          <p className="text-xs text-gray-400 mt-1">poin final</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F5A623]" />
            <span className="text-sm font-medium text-[#1B2B5E]">Pencapaian</span>
          </div>
          <span className="text-xs text-gray-400">
            {achievedCount}/{milestones.length} diraih
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={cn(
                'rounded-lg p-3 border transition-all',
                m.achieved
                  ? 'bg-[#F5A623]/10 border-[#F5A623]/30'
                  : 'bg-gray-50 border-gray-100 opacity-50',
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{m.achieved ? '🏅' : '🔒'}</span>
                <p
                  className={cn(
                    'text-xs font-medium leading-tight',
                    m.achieved ? 'text-[#1B2B5E]' : 'text-gray-400',
                  )}
                >
                  {m.label}
                </p>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}