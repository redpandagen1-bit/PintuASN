'use client';

// components/mobile/MobileStatistik.tsx
// Mobile-only statistics page — Pathfinder Navy MD3 design

import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, ChevronRight, Trophy, Target, AlertTriangle, CheckCircle2, XCircle, BarChart2 } from 'lucide-react';
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
// Minimum combined passing total (65+80+166)
const PASSING_TOTAL = THRESHOLD_TWK + THRESHOLD_TIU + THRESHOLD_TKP; // 311

// ── Helpers ───────────────────────────────────────────────────

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Custom tooltip for Tren chart
function TrenTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-md3-lg px-3 py-2 text-xs border border-md-outline-variant/10">
      <p className="font-bold text-md-primary mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// Custom tooltip for Distribusi chart
function DistribusiTooltip({ active, payload }: {
  active?: boolean;
  payload?: { payload: { date: string; twk: number; tiu: number; tkp: number; skor: number; lulus: boolean } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-md3-lg px-3 py-2 text-[11px] border border-md-outline-variant/10 min-w-[110px]">
      <p className="font-bold text-md-primary mb-1.5">{d.date}</p>
      <div className="space-y-0.5">
        <p className="text-md-on-surface-variant">TWK: <span className="font-bold text-md-on-surface">{d.twk}</span></p>
        <p className="text-md-on-surface-variant">TIU: <span className="font-bold text-md-on-surface">{d.tiu}</span></p>
        <p className="text-md-on-surface-variant">TKP: <span className="font-bold text-md-on-surface">{d.tkp}</span></p>
        <p className="border-t border-md-outline-variant/10 pt-1 mt-1 font-extrabold text-md-primary">
          Total: {d.skor}
        </p>
      </div>
    </div>
  );
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

  // Recent 5 (newest first for list)
  const recent5 = completed.slice(0, 5);

  // Tren chart data — last 10 in chronological order
  const trendRaw = completed.slice().reverse().slice(0, 10).reverse();
  const trendData = trendRaw.map((a, i) => ({
    name:  `T-${String(i + 1).padStart(2, '0')}`,
    skor:  a.final_score,
    avg:   avgScore,
    twk:   a.score_twk,
    tiu:   a.score_tiu,
    tkp:   a.score_tkp,
    lulus: a.is_passed,
    date:  formatDateShort(a.completed_at),
  }));

  // Distribusi chart — all completed in chronological order
  const distribusiData = completed.slice().reverse().map((a, i) => ({
    name:  `T-${String(i + 1).padStart(2, '0')}`,
    skor:  a.final_score,
    twk:   a.score_twk,
    tiu:   a.score_tiu,
    tkp:   a.score_tkp,
    lulus: a.is_passed,
    date:  formatDateShort(a.completed_at),
    fill:  a.is_passed ? '#10b981' : '#1e3a5f',
  }));

  // Ranking display
  const rankDisplay      = ranking ? `#${ranking.user_rank.toLocaleString('id-ID')}` : '-';
  const percentileTop    = ranking ? Math.ceil(100 - ranking.percentile) : null;
  const totalUsers       = ranking ? `${ranking.total_users.toLocaleString('id-ID')}+` : '-';
  const percentileBarPct = ranking
    ? Math.min(Math.round((1 - ranking.user_rank / ranking.total_users) * 100), 100)
    : 0;

  // Gap analysis data
  const gapItems = [
    { key: 'TWK', avg: avgTwk, threshold: THRESHOLD_TWK, max: MAX_TWK, color: 'bg-blue-500'    },
    { key: 'TIU', avg: avgTiu, threshold: THRESHOLD_TIU, max: MAX_TIU, color: 'bg-emerald-500' },
    { key: 'TKP', avg: avgTkp, threshold: THRESHOLD_TKP, max: MAX_TKP, color: 'bg-amber-500'   },
  ];

  return (
    <main className="">

      {/* ── Page header — matches desktop hero ────────────────── */}
      <section className="mx-4 mt-4 mb-4 bg-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl border border-slate-700 flex items-center justify-between gap-4">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 mb-3">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Overview Performa</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Statistik <span className="text-yellow-400">Performa</span>
          </h1>
          <p className="text-xs font-medium text-slate-300 leading-relaxed">
            Analisis kemajuan belajar Anda
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-center w-14 h-14 bg-slate-700/40 rounded-2xl border border-slate-600 shadow-inner rotate-3 flex-shrink-0">
          <BarChart2 size={28} className="text-yellow-400" />
        </div>
      </section>

      {/* ── Summary 4-in-1 row ─────────────────────────────────── */}
      <section className="mx-4 mb-4">
        <div className="bg-white rounded-2xl shadow-md3-sm overflow-hidden">
          <div className="grid grid-cols-4 divide-x divide-md-outline-variant/10">
            {[
              { label: 'Tryout',    value: completed.length, unit: 'sesi',  dark: false },
              { label: 'Tertinggi', value: bestScore,         unit: 'poin', dark: true  },
              { label: 'Rata-rata', value: avgScore,          unit: 'poin', dark: false },
              { label: 'Kelulusan', value: `${passRate}%`,    unit: '',     dark: false, gold: true },
            ].map(({ label, value, unit, dark, gold }) => (
              <div
                key={label}
                className={cn(
                  'flex flex-col items-center py-3 px-1',
                  dark ? 'bg-md-primary' : '',
                )}
              >
                <span className={cn(
                  'text-[9px] font-bold uppercase tracking-wider mb-1 leading-tight text-center',
                  dark ? 'text-white/60' : gold ? 'text-md-secondary' : 'text-md-on-surface-variant',
                )}>
                  {label}
                </span>
                <span className={cn(
                  'text-lg font-extrabold leading-none',
                  dark ? 'text-white' : gold ? 'text-md-secondary' : 'text-md-primary',
                )}
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {value}
                </span>
                {unit && (
                  <span className={cn(
                    'text-[9px] font-semibold mt-0.5',
                    dark ? 'text-white/50' : 'text-md-on-surface-variant',
                  )}>
                    {unit}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tren Performa — AreaChart (like desktop) ───────────── */}
      {trendData.length > 0 && (
        <section className="mx-4 mb-4 bg-white rounded-2xl p-4 shadow-md3-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              Tren Performa Skor
            </h2>
          </div>
          <p className="text-[10px] text-md-on-surface-variant mb-3">
            Perbandingan skor vs rata-rata kamu
          </p>
          {/* Legend */}
          <div className="flex gap-3 mb-3">
            <span className="flex items-center gap-1 text-[10px] text-md-on-surface-variant">
              <span className="w-3 h-0.5 bg-md-primary rounded-full inline-block" />
              Skor Kamu
            </span>
            <span className="flex items-center gap-1 text-[10px] text-md-on-surface-variant">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-md-outline-variant inline-block" />
              Rata-rata
            </span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="mobileGradSkor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1e3a5f" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 9 }}
                  domain={[0, 550]}
                  ticks={[0, 200, 400, 550]}
                />
                <RechartsTooltip content={<TrenTooltip />} />
                <Area
                  type="monotone"
                  dataKey="skor"
                  name="Skor Kamu"
                  stroke="#1e3a5f"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mobileGradSkor)"
                  dot={{ r: 3, fill: '#1e3a5f', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#1e3a5f' }}
                />
                <Area
                  type="monotone"
                  dataKey="avg"
                  name="Rata-rata"
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  fill="transparent"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── Peringkat Nasional ──────────────────────────────────── */}
      <section className="mx-4 mb-4 bg-md-primary rounded-2xl p-5 text-white relative overflow-hidden shadow-md3-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Peringkat Nasional
            </p>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Trophy size={15} className="text-yellow-300" />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl font-extrabold" style={{ fontFamily: 'var(--font-jakarta)' }}>
              {rankDisplay}
            </span>
            {percentileTop !== null && (
              <span className="bg-yellow-300 text-md-primary text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={11} />
                Top {percentileTop}%
              </span>
            )}
          </div>

          <p className="text-xs text-white/60 mb-4">
            Dari total {totalUsers} peserta aktif
          </p>

          {ranking && (
            <>
              <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                <span>Posisi Kamu</span>
                <span>Rata-rata: {ranking.user_average_score > 0 ? ranking.user_average_score : avgScore}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-yellow-300 transition-all duration-700"
                  style={{ width: `${percentileBarPct}%` }}
                />
              </div>
              <p className="text-[10px] text-white/40">
                Anda lebih unggul dari {percentileBarPct}% peserta lain
              </p>
            </>
          )}
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* ── Gap Nilai Minimum ───────────────────────────────────── */}
      <section className="mx-4 mb-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Target size={14} className="text-md-primary" />
          <h2 className="text-sm font-bold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Gap Nilai Minimum
          </h2>
          <span className="text-[10px] text-md-on-surface-variant">(Passing Grade)</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md3-sm space-y-4">
          {gapItems.map(({ key, avg, threshold, max, color }) => {
            const isPassed    = avg >= threshold;
            const gap         = Math.max(threshold - avg, 0);
            const pctOfMax    = Math.min(Math.round((avg / max) * 100), 100);
            const pctThresh   = Math.min(Math.round((threshold / max) * 100), 100);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-md-on-surface">{key}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-xs font-extrabold', isPassed ? 'text-emerald-600' : 'text-rose-500')}>
                      {avg} / {threshold}
                    </span>
                    {!isPassed ? (
                      <span className="text-[9px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <AlertTriangle size={8} />-{gap}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 size={8} />Lulus
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative w-full h-2.5 rounded-full bg-md-surface-container-low overflow-visible">
                  {/* Track */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', isPassed ? color : 'bg-rose-400')}
                      style={{ width: `${pctOfMax}%` }}
                    />
                  </div>
                  {/* Threshold pin */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-md-outline rounded-full z-10"
                    style={{ left: `${pctThresh}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-md-on-surface-variant">0</span>
                  <span className="text-[9px] text-md-on-surface-variant" style={{ marginLeft: `${pctThresh - 10}%` }}>
                    ↑{threshold}
                  </span>
                  <span className="text-[9px] text-md-on-surface-variant">{max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Distribusi Skor Peserta ─────────────────────────────── */}
      {completed.length > 0 && (
        <section className="mx-4 mb-4">
          <h2 className="text-sm font-bold text-md-primary mb-2 px-1"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Distribusi Skor Peserta
          </h2>
          <div className="bg-white rounded-2xl p-4 shadow-md3-sm">
            {/* Keterangan */}
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-[10px] text-md-on-surface-variant">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                Lulus
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-md-on-surface-variant">
                <span className="w-3 h-3 rounded-sm bg-md-primary inline-block" />
                Tidak Lulus
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-md-on-surface-variant">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-400 inline-block" />
                Min. Lulus ({PASSING_TOTAL})
              </span>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distribusiData}
                  margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
                    dy={4}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    domain={[0, 550]}
                    ticks={[0, 150, 311, 450, 550]}
                  />
                  <RechartsTooltip content={<DistribusiTooltip />} />
                  {/* Passing grade reference line */}
                  <ReferenceLine
                    y={PASSING_TOTAL}
                    stroke="#f87171"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      position: 'insideTopRight',
                      value: `Minimum ${PASSING_TOTAL}`,
                      fill: '#f87171',
                      fontSize: 9,
                      fontWeight: 700,
                      offset: 4,
                    }}
                  />
                  <Bar dataKey="skor" name="Skor Total" radius={[4, 4, 0, 0]}>
                    {distribusiData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Insight card */}
            <div className={cn(
              'mt-3 rounded-xl p-3 flex items-start gap-2',
              avgScore >= PASSING_TOTAL
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-rose-50 border border-rose-200',
            )}>
              {avgScore >= PASSING_TOTAL
                ? <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                : <AlertTriangle size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
              }
              <p className={cn(
                'text-[10px] leading-relaxed',
                avgScore >= PASSING_TOTAL ? 'text-emerald-700' : 'text-rose-600',
              )}>
                {avgScore >= PASSING_TOTAL
                  ? `Rata-rata skor kamu ${avgScore} sudah di atas batas minimum (${PASSING_TOTAL}). Pertahankan!`
                  : `Rata-rata skor kamu ${avgScore} masih ${PASSING_TOTAL - avgScore} poin di bawah minimum. Terus tingkatkan!`
                }
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Distribusi Per Kategori ─────────────────────────────── */}
      <section className="mx-4 mb-4">
        <h2 className="text-sm font-bold text-md-primary mb-2 px-1"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Distribusi Per Kategori
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-md3-sm space-y-4">
          {[
            { key: 'TWK', value: avgTwk, max: MAX_TWK, threshold: THRESHOLD_TWK, color: 'bg-blue-500'    },
            { key: 'TIU', value: avgTiu, max: MAX_TIU, threshold: THRESHOLD_TIU, color: 'bg-emerald-500' },
            { key: 'TKP', value: avgTkp, max: MAX_TKP, threshold: THRESHOLD_TKP, color: 'bg-amber-500'   },
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
        <section className="mx-4 mb-4">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-sm font-bold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
              5 Tryout Terakhir
            </h2>
            <Link href="/history"
              className="text-[10px] font-black text-md-secondary uppercase tracking-widest flex items-center gap-0.5 active-press">
              Lihat Semua <ChevronRight size={11} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recent5.map(a => (
              <Link key={a.id} href={`/exam/${a.id}/result`} className="block active-press">
                <div className="bg-white rounded-2xl p-4 shadow-md3-sm">
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
                      'px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0',
                      a.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600',
                    )}>
                      {a.is_passed ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {a.is_passed ? 'Lulus' : 'Gagal'}
                    </span>
                  </div>

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
