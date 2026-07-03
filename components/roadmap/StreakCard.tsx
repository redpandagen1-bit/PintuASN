'use client';

// ============================================================
// components/roadmap/StreakCard.tsx
// Streak belajar harian + tombol bagikan pencapaian tertinggi.
// ============================================================

import { useState } from 'react';
import { Flame, Share2, Check, Trophy } from 'lucide-react';
import { computeStreak, topAchievement } from '@/lib/roadmap-insights';
import type { RoadmapPageData } from '@/types/roadmap';

export function StreakCard({
  studyHistory,
  stats,
  progressPct,
  nationalPercentile,
}: {
  studyHistory: string[];
  stats: RoadmapPageData;
  progressPct: number;
  nationalPercentile?: number | null;
}) {
  const streak = computeStreak(studyHistory);
  const ach = topAchievement(stats, progressPct, nationalPercentile);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const data = { title: 'PintuASN', text: ach.shareText, url: 'https://pintuasn.com' };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(data);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(ach.shareText);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* user membatalkan share — abaikan */
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Streak */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-4">
        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          streak.current > 0 ? 'bg-gradient-to-br from-orange-400 to-rose-500' : 'bg-slate-100'
        }`}>
          <Flame className={`w-7 h-7 ${streak.current > 0 ? 'text-white' : 'text-slate-300'}`}
            fill={streak.current > 0 ? 'currentColor' : 'none'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-800 leading-none"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {streak.current}
            </span>
            <span className="text-sm font-bold text-slate-500">hari beruntun</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {streak.current === 0
              ? 'Kerjakan 1 tryout hari ini untuk memulai streak!'
              : streak.studiedToday
                ? `Mantap! Rekor terpanjangmu ${streak.longest} hari.`
                : `Latihan hari ini agar streak tak putus. Rekor: ${streak.longest} hari.`}
          </p>
        </div>
      </div>

      {/* Pencapaian + share */}
      <div className="mx-5 mb-5 rounded-xl bg-gradient-to-br from-[#1B2B5E] to-[#2d4a8e] p-4 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#F5A623]/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
            {ach.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-[#F5A623]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Pencapaian
              </span>
            </div>
            <p className="text-sm font-extrabold text-white leading-snug truncate">{ach.title}</p>
            <p className="text-[11px] text-white/60 truncate">{ach.subtitle}</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="relative mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#F5A623] text-[#1B2B5E] text-xs font-extrabold hover:bg-[#f7c05a] transition"
        >
          {shared ? <><Check className="w-3.5 h-3.5" /> Tersalin!</> : <><Share2 className="w-3.5 h-3.5" /> Bagikan Pencapaian</>}
        </button>
      </div>
    </section>
  );
}
