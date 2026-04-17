'use client';

// components/mobile/MobileStatistik.tsx
// Mobile-only statistics page — Pathfinder Navy MD3 design

import Link from 'next/link';
import { TrendingUp, ChevronRight } from 'lucide-react';
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
const MAX_TWK = 150;
const MAX_TIU = 175;
const MAX_TKP = 225;

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

  // Average per category
  const avgTwk = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score_twk ?? 0), 0) / completed.length)
    : 0;
  const avgTiu = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score_tiu ?? 0), 0) / completed.length)
    : 0;
  const avgTkp = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score_tkp ?? 0), 0) / completed.length)
    : 0;

  // Recent 5 attempts (for list + bar chart)
  const recent5 = completed.slice(0, 5).reverse();
  const maxBarScore = recent5.length ? Math.max(...recent5.map(a => a.final_score)) : 550;

  const rankDisplay = ranking ? `#${ranking.user_rank.toLocaleString('id-ID')}` : '-';
  const percentileDisplay = ranking
    ? `Top ${Math.ceil(100 - ranking.percentile)}%`
    : '-';
  const totalUsers = ranking
    ? `${ranking.total_users.toLocaleString('id-ID')}+ peserta aktif`
    : '-';

  return (
    <main className="px-6 py-4 space-y-6 pb-28 max-w-md mx-auto">

      {/* ── Page header ───────────────────────────────────────── */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-md-primary tracking-tight"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Statistik Performa
          </h1>
          <p className="text-sm text-md-on-surface-variant font-medium">
            Analisis kemajuan belajar Anda
          </p>
        </div>
        <div className="w-14 h-14 bg-md-secondary-container rounded-2xl flex items-center justify-center shadow-md3-sm flex-shrink-0">
          <TrendingUp size={28} className="text-md-primary" strokeWidth={2} />
        </div>
      </section>

      {/* ── Summary bento 2×2 ─────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3">
        {/* Total Tryout */}
        <div className="bento-card p-5 space-y-2">
          <span className="text-label-sm text-md-on-surface-variant block">Total Tryout</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {completed.length}
            </span>
            <span className="text-xs font-semibold text-md-secondary">Sesi</span>
          </div>
        </div>

        {/* Skor Tertinggi — dark navy card */}
        <div className="bg-md-primary rounded-2xl p-5 space-y-2 text-white shadow-md3-md">
          <span className="text-label-sm text-md-on-primary-container block">Skor Tertinggi</span>
          <span className="text-3xl font-extrabold block"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {bestScore}
          </span>
        </div>

        {/* Rata-rata */}
        <div className="bento-card p-5 space-y-2">
          <span className="text-label-sm text-md-on-surface-variant block">Rata-rata</span>
          <span className="text-2xl font-extrabold text-md-primary block"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {avgScore}
          </span>
        </div>

        {/* Kelulusan — gold accent */}
        <div className="bg-md-secondary-container/10 rounded-2xl p-5 space-y-2 shadow-md3-sm">
          <span className="text-label-sm text-md-secondary block">Kelulusan</span>
          <span className="text-2xl font-extrabold text-md-secondary block"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {passRate}%
          </span>
        </div>
      </section>

      {/* ── Tren Performa chart ────────────────────────────────── */}
      {recent5.length > 0 && (
        <section className="bento-card p-6 relative overflow-hidden">
          <h2 className="text-base font-bold text-md-primary mb-5"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Tren Performa Skor
          </h2>
          <div className="h-36 w-full flex items-end justify-between gap-2 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
              {[0, 1, 2].map(i => (
                <div key={i} className="border-t border-md-outline-variant/10 w-full" />
              ))}
            </div>
            {/* Bars */}
            {recent5.map((a, i) => {
              const heightPct = maxBarScore > 0 ? Math.round((a.final_score / maxBarScore) * 100) : 10;
              const isLatest  = i === recent5.length - 1;
              return (
                <div key={a.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-full rounded-t-lg',
                      isLatest ? 'bg-md-primary shadow-md3-sm' : 'bg-md-surface-container-low',
                    )}
                    style={{ height: `${heightPct}%`, minHeight: 8 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold text-md-on-surface-variant uppercase tracking-tight">
            {recent5.map((a, i) => (
              <span key={i}>T-{String(completed.length - (recent5.length - 1 - i)).padStart(2, '0')}</span>
            ))}
          </div>
        </section>
      )}

      {/* ── Peringkat Nasional ─────────────────────────────────── */}
      <section className="bg-md-tertiary rounded-3xl p-6 text-white relative overflow-hidden shadow-md3-lg">
        <div className="relative z-10">
          <h2 className="text-label-sm text-md-on-tertiary-container mb-1">Peringkat Nasional</h2>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {rankDisplay}
            </span>
            <span className="bg-md-secondary-container text-md-primary text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12} /> {percentileDisplay}
            </span>
          </div>
          <p className="text-xs text-md-on-tertiary-container mt-2">
            Dari total {totalUsers}
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-md-secondary-container/10 rounded-full blur-3xl" />
      </section>

      {/* ── Distribusi Per Kategori ───────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-md-primary px-1"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Distribusi Per Kategori
        </h2>
        <div className="bento-card p-6 space-y-5">
          {[
            { key: 'TWK', value: avgTwk, max: MAX_TWK, threshold: THRESHOLD_TWK, color: 'bg-blue-500' },
            { key: 'TIU', value: avgTiu, max: MAX_TIU, threshold: THRESHOLD_TIU, color: 'bg-emerald-500' },
            { key: 'TKP', value: avgTkp, max: MAX_TKP, threshold: THRESHOLD_TKP, color: 'bg-md-secondary-container' },
          ].map(({ key, value, max, color }) => {
            const pct = max > 0 ? Math.round((value / max) * 100) : 0;
            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-md-on-surface flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {key}
                  </span>
                  <span className="text-xs font-extrabold text-md-primary">
                    {value}/{max}
                  </span>
                </div>
                <div className="progress-md3-track">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5 Tryout Terakhir ──────────────────────────────────── */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-bold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              5 Tryout Terakhir
            </h2>
            <Link href="/history"
              className="text-xs font-bold text-md-secondary uppercase tracking-widest flex items-center gap-1">
              Lihat Semua <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {completed.slice(0, 5).map(a => (
              <Link
                key={a.id}
                href={`/exam/${a.id}/result`}
                className="block active-press"
              >
                <div className="bg-white p-4 rounded-3xl flex items-center justify-between shadow-md3-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-md-surface-container-low flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={18} className="text-md-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-md-primary">
                        {formatDate(a.completed_at)}
                      </p>
                      <p className="text-[10px] text-md-on-surface-variant font-medium">
                        Skor {a.final_score} Poin
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    a.is_passed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-600',
                  )}>
                    {a.is_passed ? 'Lulus' : 'Gagal'}
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
