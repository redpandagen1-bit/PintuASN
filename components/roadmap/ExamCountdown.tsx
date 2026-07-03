'use client';

// ============================================================
// components/roadmap/ExamCountdown.tsx
// Countdown H-XX ke hari ujian + target belajar minggu ini.
// ============================================================

import { CalendarClock, Target, ArrowRight } from 'lucide-react';
import { computeExamPlan } from '@/lib/roadmap-insights';
import type { RoadmapPageData } from '@/types/roadmap';

const CAT_LABEL: Record<string, string> = {
  TWK: 'TWK', TIU: 'TIU', TKP: 'TKP',
};

export function ExamCountdown({
  examDate,
  stats,
  onSetDate,
}: {
  examDate: Date | null;
  stats: RoadmapPageData;
  /** Dipanggil saat user klik "Atur tanggal" (mis. scroll ke kalender). */
  onSetDate?: () => void;
}) {
  const plan = computeExamPlan(examDate, stats);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B2B5E] to-[#2d4a8e] p-4 md:p-5 shadow-lg shadow-[#1B2B5E]/20">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#F5A623]/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center gap-4">
        {/* Angka countdown */}
        <div className="flex-shrink-0 text-center">
          {plan.daysLeft != null ? (
            <>
              <div className="flex items-baseline gap-1 justify-center">
                <span className="text-4xl md:text-5xl font-extrabold text-[#F5A623] leading-none"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {plan.daysLeft}
                </span>
                <span className="text-sm font-bold text-white/70">hari</span>
              </div>
              <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wide">menuju ujian</p>
            </>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <CalendarClock className="w-7 h-7 text-[#F5A623]" />
            </div>
          )}
        </div>

        <div className="h-14 w-px bg-white/10 flex-shrink-0" />

        {/* Target minggu ini */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Target Minggu Ini
            </span>
            {plan.focus && (
              <span className="text-[9px] font-black bg-[#F5A623] text-[#1B2B5E] px-1.5 py-0.5 rounded-full">
                Fokus {CAT_LABEL[plan.focus]}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white leading-snug">{plan.weeklyTarget}</p>

          {plan.daysLeft == null && onSetDate && (
            <button
              onClick={onSetDate}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#F5A623] hover:gap-1.5 transition-all"
            >
              Atur tanggal ujian <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
