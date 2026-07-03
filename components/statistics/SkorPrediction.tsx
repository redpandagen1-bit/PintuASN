'use client';

// ============================================================
// components/statistics/SkorPrediction.tsx
// Kartu "Prediksi Skor Hari-H" — proyeksi skor, tren, konsistensi,
// dan ETA lolos passing grade dari riwayat tryout.
// ============================================================

import { TrendingUp, TrendingDown, Minus, Sparkles, Activity, Target } from 'lucide-react';
import { computeScoreProjection, type AttemptLike } from '@/lib/score-projection';

const TREND_CFG = {
  up:   { Icon: TrendingUp,   text: 'text-emerald-600', chip: 'bg-emerald-100 text-emerald-700', label: 'Menanjak' },
  flat: { Icon: Minus,        text: 'text-slate-500',   chip: 'bg-slate-100 text-slate-600',      label: 'Stabil'   },
  down: { Icon: TrendingDown, text: 'text-rose-600',    chip: 'bg-rose-100 text-rose-700',        label: 'Menurun'  },
} as const;

export function SkorPrediction({ attempts }: { attempts: AttemptLike[] }) {
  const p = computeScoreProjection(attempts);
  const trend = TREND_CFG[p.trend];
  const TrendIcon = trend.Icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800">Prediksi Skor Hari-H</h3>
          <p className="text-[11px] text-slate-400">Estimasi dari tren latihanmu, bukan jaminan.</p>
        </div>
      </div>

      {!p.hasEnoughData ? (
        <div className="px-5 pb-6 pt-2 text-center">
          <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{p.passing.message}</p>
        </div>
      ) : (
        <div className="px-5 pb-5">
          {/* Proyeksi utama */}
          <div className="flex items-end gap-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Proyeksi Skor</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-800 leading-none"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {p.projectedScore}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 550</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-end gap-1.5 pb-1">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${trend.chip}`}>
                <TrendIcon className="w-3 h-3" /> {trend.label}
                {p.slopePerTryout !== 0 && (
                  <span className="opacity-80">{p.slopePerTryout > 0 ? '+' : ''}{p.slopePerTryout}/tryout</span>
                )}
              </span>
              <span className="text-[11px] text-slate-400">Rata-rata terkini <b className="text-slate-600">{p.currentAvg}</b></span>
            </div>
          </div>

          {/* Konsistensi */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <Activity className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-500 flex-1">Konsistensi skor</span>
            <span className="text-xs font-bold text-slate-700">{p.consistency.label}</span>
            <span className="text-[10px] text-slate-400">±{p.consistency.stdev}</span>
          </div>

          {/* Passing grade ETA */}
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border ${
            p.passing.allPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <Target className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.passing.allPassed ? 'text-emerald-600' : 'text-amber-600'}`} />
            <p className={`text-xs leading-relaxed ${p.passing.allPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
              {p.passing.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
