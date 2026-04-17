'use client';

// components/mobile/MobileStatistik.tsx
// Mobile-only statistics page — Pathfinder Navy MD3 design

import Link from 'next/link';
import { TrendingUp, ChevronRight, Trophy, Target, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────

interface Attempt {
  id:           string;
  status:       string;
  is_passed:    boolean;
  score_twk:    number;
  score_tiu:    number;
  score_tkp:    number;
  final_score:  number;
  completed_at: string;
  packages?:    { title?: string } | null;
}

interface RankingData {
  user_rank:          number;
  total_users:        number;
  user_average_score: number;
  percentile:         number;
}

interface MobileStatistikProps {
  data:     Attempt[];
  ranking?: RankingData | null;
}

// ── Constants ─────────────────────────────────────────────────

const THRESHOLD_TWK = 65;
const THRESHOLD_TIU = 80;
const THRESHOLD_TKP = 166;
const MAX_TWK       = 150;
const MAX_TIU       = 175;
const MAX_TKP       = 225;

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────

export function MobileStatistik({ data, ranking }: MobileStatistikProps) {
  const completed = data.filter(a => a.status === 'completed');
  const passed    = completed.filter(a => a.is_passed);
  const scores    = completed.map(a => a.final_score).filter(Boolean);
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const avgScore  = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
  const passRate  = completed.length ? Math.round((passed.length / completed.length) * 100) : 0;

  // Category averages
  const avgTwk = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score_twk ?? 0), 0) / completed.length)
    : 0;
  const avgTiu = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score_tiu ?? 0), 0) / completed.length)
    : 0;
  const avgTkp = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score_tkp ?? 0), 0) / completed.length)
    : 0;

  // Recent 5 (newest first)
  const recent5 = completed.slice(0, 5);

  // Tren chart: last 5 in chronological order
  const chartData = completed.slice(0, 5).reverse();
  const maxBarScore = chartData.length ? Math.max(...chartData.map(a => a.final_score), 1) : 550;

  // Score distribution buckets (user's own attempts)
  const buckets = [
    { label: '0–200',   min: 0,   max: 200  },
    { label: '201–300', min: 201, max: 300  },
    { label: '301–400', min: 301, max: 400  },
    { label: '401–450', min: 401, max: 450  },
    { label: '451–500', min: 451, max: 500  },
    { label: '501–550', min: 501, max: 550  },
  ].map(b => ({
    ...b,
    count: completed.filter(a => a.final_score >= b.min && a.final_score <= b.max).length,
  })).filter(b => b.count > 0 || completed.length === 0);
  const maxBucketCount = Math.max(...buckets.map(b => b.count), 1);

  // Ranking display
  const rankDisplay      = ranking ? `#${ranking.user_rank.toLocaleString('id-ID')}` : '-';
  const percentileTop    = ranking ? Math.ceil(100 - ranking.percentile) : null;
  const totalUsers       = ranking ? `${ranking.total_users.toLocaleString('id-ID')}+` : '-';
  const percentileBarPct = ranking
    ? Math.min(Math.round((1 - ranking.user_rank / ranking.total_users) * 100), 100)
    : 0;

  // Gap analysis data
  const gapItems = [
    {
      key: 'TWK', avg: avgTwk, threshold: THRESHOLD_TWK, max: MAX_TWK,
      color: 'bg-blue-500', dot: 'bg-blue-500',
    },
    {
      key: 'TIU', avg: avgTiu, threshold: THRESHOLD_TIU, max: MAX_TIU,
      color: 'bg-emerald-500', dot: 'bg-emerald-500',
    },
    {
      key: 'TKP', avg: avgTkp, threshold: THRESHOLD_TKP, max: MAX_TKP,
      color: 'bg-amber-500', dot: 'bg-amber-500',
    },
  ];

  return (
    <main className="pb-28">

      {/* ── Page header ────────────────────────────────────────── */}
      <section className="px-6 pt-6 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-md-primary tracking-tight"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Statistik Performa
          </h1>
          <p className="text-sm text-md-on-surface-variant font-medium mt-0.5">
            Analisis kemajuan belajar Anda
          </p>
        </div>
        <div className="w-12 h-12 bg-md-secondary-container rounded-2xl flex items-center justify-center shadow-md3-sm flex-shrink-0">
          <TrendingUp size={24} className="text-md-primary" strokeWidth={2.5} />
        </div>
      </section>

      {/* ── Summary bento 2×2 ──────────────────────────────────── */}
      <section className="px-4 grid grid-cols-2 gap-3 mb-5">
        {/* Total Tryout */}
        <div className="bg-white rounded-2xl p-4 shadow-md3-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant mb-2">
            Total Tryout
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {completed.length}
            </span>
            <span className="text-xs font-semibold text-md-secondary">Sesi</span>
          </div>
        </div>

        {/* Skor Tertinggi — dark navy */}
        <div className="bg-md-primary rounded-2xl p-4 shadow-md3-md">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">
            Skor Tertinggi
          </p>
          <span className="text-3xl font-extrabold text-white block"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {bestScore}
          </span>
        </div>

        {/* Rata-rata */}
        <div className="bg-white rounded-2xl p-4 shadow-md3-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant mb-2">
            Rata-rata
          </p>
          <span className="text-2xl font-extrabold text-md-primary block"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {avgScore}
          </span>
        </div>

        {/* Kelulusan — gold */}
        <div className="bg-md-secondary-container/20 rounded-2xl p-4 shadow-md3-sm border border-md-secondary-container/30">
          <p className="text-[10px] font-bold uppercase tracking-widest text-md-secondary mb-2">
            Kelulusan
          </p>
          <span className="text-2xl font-extrabold text-md-secondary block"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {passRate}%
          </span>
        </div>
      </section>

      {/* ── Tren Performa chart ─────────────────────────────────── */}
      {chartData.length > 0 && (
        <section className="mx-4 mb-5 bg-white rounded-2xl p-5 shadow-md3-sm">
          <h2 className="text-sm font-bold text-md-primary mb-4"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Tren Performa Skor
          </h2>
          <div className="h-28 w-full flex items-end gap-2 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="border-t border-md-outline-variant/10 w-full" />
              ))}
            </div>
            {chartData.map((a, i) => {
              const heightPct = Math.round((a.final_score / maxBarScore) * 100);
              const isLatest  = i === chartData.length - 1;
              return (
                <div key={a.id} className="flex-1 flex flex-col items-center gap-1.5 relative z-10">
                  {isLatest && (
                    <span className="text-[8px] font-black text-md-primary absolute -top-4">
                      {a.final_score}
                    </span>
                  )}
                  <div
                    className={cn(
                      'w-full rounded-t-lg transition-all',
                      isLatest
                        ? 'bg-md-primary shadow-md3-sm'
                        : a.is_passed
                        ? 'bg-md-secondary/40'
                        : 'bg-md-surface-container-low',
                    )}
                    style={{ height: `${heightPct}%`, minHeight: 6 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {chartData.map((_, i) => (
              <span key={i} className="flex-1 text-center text-[9px] font-bold text-md-on-surface-variant uppercase tracking-tight">
                T-{String(i + 1).padStart(2, '0')}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Peringkat Nasional ──────────────────────────────────── */}
      <section className="mx-4 mb-5 bg-md-primary rounded-2xl p-5 text-white relative overflow-hidden shadow-md3-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Peringkat Nasional
            </p>
            <div className="w-8 h-8 rounded-xl bg-md-secondary-container/20 flex items-center justify-center">
              <Trophy size={16} className="text-md-secondary-container" />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl font-extrabold"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {rankDisplay}
            </span>
            {percentileTop !== null && (
              <span className="bg-md-secondary-container text-md-primary text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={11} />
                Top {percentileTop}%
              </span>
            )}
          </div>

          <p className="text-xs text-white/70 mb-4">
            Dari total {totalUsers} peserta aktif
          </p>

          {/* Percentile bar */}
          {ranking && (
            <>
              <div className="flex justify-between text-[10px] text-white/60 mb-1.5">
                <span>Posisi Kamu</span>
                <span>{ranking.user_average_score > 0 ? `Rata-rata: ${ranking.user_average_score}` : `Rata-rata: ${avgScore}`}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-md-secondary-container transition-all duration-700"
                  style={{ width: `${percentileBarPct}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50">
                Anda lebih unggul dari {percentileBarPct}% peserta lain
              </p>
            </>
          )}
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* ── Gap Nilai Minimum ───────────────────────────────────── */}
      <section className="mx-4 mb-5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Target size={16} className="text-md-primary" />
          <h2 className="text-sm font-bold text-md-primary"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Gap Nilai Minimum
          </h2>
          <span className="text-[10px] text-md-on-surface-variant font-medium">(Passing Grade)</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md3-sm space-y-5">
          {gapItems.map(({ key, avg, threshold, max, color, dot }) => {
            const isPassed    = avg >= threshold;
            const gap         = Math.max(threshold - avg, 0);
            const pctOfMax    = Math.min(Math.round((avg / max) * 100), 100);
            const pctOfThresh = Math.min(Math.round((threshold / max) * 100), 100);
            return (
              <div key={key}>
                {/* Label row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-md-on-surface">
                    <span className={cn('w-2 h-2 rounded-full', dot)} />
                    {key}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-extrabold',
                      isPassed ? 'text-emerald-600' : 'text-rose-500',
                    )}>
                      {avg} / {threshold}
                    </span>
                    {!isPassed && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle size={9} />
                        -{gap}
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={9} />
                        Lulus
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual track bar: threshold position shown, user fill overlaid */}
                <div className="relative w-full h-2.5 rounded-full bg-md-surface-container-low overflow-hidden">
                  {/* Threshold marker line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-md-outline-variant/60 z-10"
                    style={{ left: `${pctOfThresh}%` }}
                  />
                  {/* User score fill */}
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      isPassed ? color : 'bg-rose-400',
                    )}
                    style={{ width: `${pctOfMax}%` }}
                  />
                </div>

                {/* Sub-labels */}
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-md-on-surface-variant">0</span>
                  <span className="text-[9px] text-md-on-surface-variant">
                    Ambang: {threshold}
                  </span>
                  <span className="text-[9px] text-md-on-surface-variant">Max: {max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Distribusi Skor Peserta ─────────────────────────────── */}
      {completed.length > 0 && (
        <section className="mx-4 mb-5">
          <h2 className="text-sm font-bold text-md-primary mb-3 px-1"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Distribusi Skor Peserta
          </h2>
          <div className="bg-white rounded-2xl p-5 shadow-md3-sm">
            <p className="text-[10px] text-md-on-surface-variant mb-4">
              Sebaran skor kamu dari {completed.length} sesi tryout
            </p>

            {/* Horizontal bars by bucket */}
            <div className="space-y-3">
              {buckets.map(b => {
                const widthPct = Math.round((b.count / maxBucketCount) * 100);
                const isActive = avgScore >= b.min && avgScore <= b.max;
                return (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-md-on-surface-variant w-16 flex-shrink-0 text-right">
                      {b.label}
                    </span>
                    <div className="flex-1 h-5 bg-md-surface-container-low rounded-full overflow-hidden relative">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          isActive ? 'bg-md-primary' : 'bg-md-surface-container-high',
                        )}
                        style={{ width: b.count > 0 ? `${widthPct}%` : '0%', minWidth: b.count > 0 ? 8 : 0 }}
                      />
                      {isActive && (
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                          Rata-ratamu
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      'text-[10px] font-extrabold w-5 text-right flex-shrink-0',
                      isActive ? 'text-md-primary' : 'text-md-on-surface-variant',
                    )}>
                      {b.count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Average marker note */}
            <div className="mt-4 pt-4 border-t border-md-outline-variant/10 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-md-primary flex-shrink-0" />
              <p className="text-[10px] text-md-on-surface-variant">
                Rata-rata skor kamu: <span className="font-bold text-md-primary">{avgScore}</span>
                {ranking && (
                  <span className="ml-1">
                    — lebih baik dari <span className="font-bold text-md-secondary">{percentileBarPct}%</span> peserta
                  </span>
                )}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Distribusi Per Kategori ─────────────────────────────── */}
      <section className="mx-4 mb-5">
        <h2 className="text-sm font-bold text-md-primary mb-3 px-1"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Distribusi Per Kategori
        </h2>
        <div className="bg-white rounded-2xl p-5 shadow-md3-sm space-y-4">
          {[
            { key: 'TWK', value: avgTwk, max: MAX_TWK, threshold: THRESHOLD_TWK, color: 'bg-blue-500' },
            { key: 'TIU', value: avgTiu, max: MAX_TIU, threshold: THRESHOLD_TIU, color: 'bg-emerald-500' },
            { key: 'TKP', value: avgTkp, max: MAX_TKP, threshold: THRESHOLD_TKP, color: 'bg-amber-500' },
          ].map(({ key, value, max, color }) => {
            const pct = max > 0 ? Math.round((value / max) * 100) : 0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-md-on-surface flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', color)} />
                    {key}
                  </span>
                  <span className="text-xs font-extrabold text-md-primary">
                    {value}/{max}
                  </span>
                </div>
                <div className="h-2 w-full bg-md-surface-container-low rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5 Tryout Terakhir ───────────────────────────────────── */}
      {completed.length > 0 && (
        <section className="mx-4 mb-5">
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-sm font-bold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              5 Tryout Terakhir
            </h2>
            <Link href="/history"
              className="text-[10px] font-black text-md-secondary uppercase tracking-widest flex items-center gap-0.5 active-press">
              Lihat Semua <ChevronRight size={11} />
            </Link>
          </div>

          <div className="space-y-3">
            {recent5.map(a => (
              <Link key={a.id} href={`/exam/${a.id}/result`} className="block active-press">
                <div className="bg-white rounded-2xl p-4 shadow-md3-sm">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-md-surface-container-low flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={16} className="text-md-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-md-primary leading-tight">
                          {formatDate(a.completed_at)}
                        </p>
                        <p className="text-[10px] text-md-on-surface-variant mt-0.5">
                          Skor {a.final_score ?? 0} Poin
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0',
                      a.is_passed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-600',
                    )}>
                      {a.is_passed
                        ? <CheckCircle2 size={10} />
                        : <XCircle size={10} />
                      }
                      {a.is_passed ? 'Lulus' : 'Gagal'}
                    </span>
                  </div>

                  {/* Category chips */}
                  <div className="flex gap-1.5">
                    {[
                      { label: 'TWK', val: a.score_twk, pass: a.score_twk >= THRESHOLD_TWK },
                      { label: 'TIU', val: a.score_tiu, pass: a.score_tiu >= THRESHOLD_TIU },
                      { label: 'TKP', val: a.score_tkp, pass: a.score_tkp >= THRESHOLD_TKP },
                    ].map(({ label, val, pass }) => (
                      <span
                        key={label}
                        className={cn(
                          'flex-1 text-center py-1.5 rounded-lg text-[10px] font-bold border',
                          pass
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200',
                        )}
                      >
                        {label} {val ?? 0}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
