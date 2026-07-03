// ============================================================
// lib/score-projection.ts
//
// Proyeksi skor hari-H, ETA lolos passing grade, & skor konsistensi
// dari riwayat tryout. Murni (tanpa I/O) — dipakai desktop & mobile.
// ============================================================

import { PASSING_GRADES } from '@/constants/roadmap-data';

export interface AttemptLike {
  status: string;
  final_score: number;
  score_twk: number;
  score_tiu: number;
  score_tkp: number;
  completed_at: string;
}

export interface ScoreProjection {
  hasEnoughData: boolean;
  attemptsUsed: number;
  currentAvg: number;
  projectedScore: number;
  trend: 'up' | 'flat' | 'down';
  slopePerTryout: number;
  consistency: { stdev: number; label: string };
  passing: {
    allPassed: boolean;
    weakest: 'TWK' | 'TIU' | 'TKP' | null;
    etaTryouts: number | null;
    message: string;
  };
}

// Slope regresi linear sederhana (y terhadap indeks 0..n-1).
function linregSlope(y: number[]): number {
  const n = y.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = y.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (y[i] - meanY);
    den += (i - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

function stdev(y: number[]): number {
  const n = y.length;
  if (n < 2) return 0;
  const mean = y.reduce((s, v) => s + v, 0) / n;
  const variance = y.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  return Math.sqrt(variance);
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Berapa tryout ke depan tren diproyeksikan (asumsi latihan berlanjut).
const HORIZON = 3;

export function computeScoreProjection(attempts: AttemptLike[]): ScoreProjection {
  const completed = attempts
    .filter((a) => a.status === 'completed')
    .slice()
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());

  const empty: ScoreProjection = {
    hasEnoughData: false,
    attemptsUsed: completed.length,
    currentAvg: 0,
    projectedScore: 0,
    trend: 'flat',
    slopePerTryout: 0,
    consistency: { stdev: 0, label: '-' },
    passing: { allPassed: false, weakest: null, etaTryouts: null, message: 'Kerjakan minimal 3 tryout untuk melihat prediksi.' },
  };

  if (completed.length < 3) return empty;

  // Pakai maksimal 10 tryout terakhir untuk tren.
  const recent = completed.slice(-10);
  const finals = recent.map((a) => a.final_score ?? 0);

  const currentAvg = Math.round(
    recent.slice(-5).reduce((s, v) => s + v.final_score, 0) / Math.min(recent.length, 5),
  );

  const slope = linregSlope(finals);
  const projectedScore = clamp(Math.round(currentAvg + slope * HORIZON), 0, 550);

  const trend: ScoreProjection['trend'] = slope > 1.5 ? 'up' : slope < -1.5 ? 'down' : 'flat';

  const sd = Math.round(stdev(finals));
  const consLabel = sd <= 20 ? 'Sangat stabil' : sd <= 40 ? 'Cukup stabil' : 'Masih fluktuatif';

  // ── Passing grade per kategori ──
  const avgCat = (sel: (a: AttemptLike) => number) =>
    recent.reduce((s, a) => s + (sel(a) ?? 0), 0) / recent.length;

  const cats = [
    { key: 'TWK' as const, avg: avgCat((a) => a.score_twk), pg: PASSING_GRADES.TWK, series: recent.map((a) => a.score_twk ?? 0) },
    { key: 'TIU' as const, avg: avgCat((a) => a.score_tiu), pg: PASSING_GRADES.TIU, series: recent.map((a) => a.score_tiu ?? 0) },
    { key: 'TKP' as const, avg: avgCat((a) => a.score_tkp), pg: PASSING_GRADES.TKP, series: recent.map((a) => a.score_tkp ?? 0) },
  ];

  const failing = cats.filter((c) => c.avg < c.pg).sort((a, b) => (b.pg - b.avg) - (a.pg - a.avg));
  const allPassed = failing.length === 0;

  let passingMsg: string;
  let etaTryouts: number | null = null;
  let weakest: ScoreProjection['passing']['weakest'] = null;

  if (allPassed) {
    passingMsg = 'Rata-rata semua kategori sudah melampaui passing grade. Pertahankan konsistensi!';
  } else {
    const worst = failing[0];
    weakest = worst.key;
    const catSlope = linregSlope(worst.series);
    const gap = worst.pg - worst.avg;
    if (catSlope > 0.5) {
      etaTryouts = Math.max(1, Math.ceil(gap / catSlope));
      passingMsg = `Perkiraan ~${etaTryouts} tryout lagi untuk melampaui passing grade ${worst.key} bila tren ini dipertahankan.`;
    } else {
      passingMsg = `${worst.key} masih kurang ${Math.ceil(gap)} poin & trennya belum naik. Fokuskan latihan di sini.`;
    }
  }

  return {
    hasEnoughData: true,
    attemptsUsed: recent.length,
    currentAvg,
    projectedScore,
    trend,
    slopePerTryout: Math.round(slope * 10) / 10,
    consistency: { stdev: sd, label: consLabel },
    passing: { allPassed, weakest, etaTryouts, message: passingMsg },
  };
}
