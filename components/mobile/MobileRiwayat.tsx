'use client';

// components/mobile/MobileRiwayat.tsx
// Mobile-only riwayat tryout — Pathfinder Navy MD3 design

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AttemptHistoryData, UserStats } from '@/lib/supabase/queries';
import type { SubscriptionTier } from '@/lib/subscription-utils';

// ── Types ─────────────────────────────────────────────────────

interface MobileRiwayatProps {
  initialHistory: AttemptHistoryData;
  initialStats:   UserStats;
  initialSort:    'newest' | 'oldest' | 'highest_score';
  initialFilter:  'all' | 'passed' | 'failed';
  userTier:       SubscriptionTier;
}

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatDuration(minutes: number) {
  return `${minutes} mnt`;
}

const SORT_LABELS: Record<string, string> = {
  newest:        'Terbaru',
  oldest:        'Terlama',
  highest_score: 'Skor Tertinggi',
};

// ── Constants ─────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ── Component ─────────────────────────────────────────────────

export function MobileRiwayat({
  initialHistory,
  initialStats,
  initialSort,
  initialFilter,
}: MobileRiwayatProps) {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>(initialFilter);
  const [sort, setSort]     = useState(initialSort);
  const [showSort, setShowSort] = useState(false);
  const [page, setPage]     = useState(1);

  const { attempts } = initialHistory;

  // Client-side filter/sort for already-loaded data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = attempts.filter((a: any) => {
    if (filter === 'passed') return a.is_passed;
    if (filter === 'failed') return !a.is_passed;
    return true;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sort === 'oldest') return new Date(a.completed_at ?? '').getTime() - new Date(b.completed_at ?? '').getTime();
    if (sort === 'highest_score') return (b.final_score ?? 0) - (a.final_score ?? 0);
    return new Date(b.completed_at ?? '').getTime() - new Date(a.completed_at ?? '').getTime();
  });

  const totalPages   = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated    = sorted.slice(0, page * PAGE_SIZE);
  const hasMore      = page < totalPages;

  // Reset to page 1 when filter/sort changes
  const handleFilter = (f: typeof filter) => { setFilter(f); setPage(1); };
  const handleSort   = (s: typeof sort)   => { setSort(s);   setPage(1); setShowSort(false); };

  return (
    <main className="pb-32">

      {/* ── Hero Header ──────────────────────────────────────── */}
      <section className="px-6 pt-6 pb-6 bg-md-surface-container-low">
        <h1 className="text-2xl font-bold text-md-primary mb-1 leading-tight"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Evaluasi Perjalanan<br />Belajarmu!
        </h1>
        <p className="text-md-on-surface-variant text-sm mb-5">
          Pantau progres dan terus asah kemampuanmu untuk meraih mimpi ASN.
        </p>

        {/* Quick stats 2-col bento */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Tryout — dark navy */}
          <div className="bg-md-primary p-5 rounded-xl shadow-md3-md relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-md-on-primary-container mb-1">
                Total Tryout
              </p>
              <h2 className="text-3xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {initialStats.totalAttempts}
              </h2>
            </div>
            <div className="absolute -right-2 -bottom-2 text-white/10 text-6xl select-none">
              ☑
            </div>
          </div>

          {/* Skor Tertinggi — gold */}
          <div className="bg-md-secondary-container p-5 rounded-xl shadow-md3-md relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-md-on-secondary-container mb-1">
                Skor Tertinggi
              </p>
              <h2 className="text-3xl font-extrabold text-md-on-secondary-container"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {initialStats.bestScore > 0 ? initialStats.bestScore : '-'}
              </h2>
            </div>
            <div className="absolute -right-2 -bottom-2 text-md-on-secondary-container/10 text-6xl select-none">
              ★
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters & Sort ────────────────────────────────────── */}
      <div className="sticky top-[72px] bg-md-surface/80 backdrop-blur-md px-6 py-3 z-40 flex items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'passed', 'failed'] as const).map(f => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors active-press',
                filter === f
                  ? 'bg-md-primary text-white'
                  : 'bg-md-surface-container-low text-md-on-surface-variant',
              )}
            >
              {f === 'all' ? 'Semua' : f === 'passed' ? 'Lulus' : 'Tidak Lulus'}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSort(s => !s)}
            className="flex items-center gap-1 text-xs font-bold text-md-primary uppercase tracking-wider"
          >
            <span>{SORT_LABELS[sort]}</span>
            <ChevronDown size={14} />
          </button>
          {showSort && (
            <div className="absolute right-0 top-7 bg-white rounded-xl shadow-md3-lg py-2 z-50 min-w-[140px]">
              {(['newest', 'oldest', 'highest_score'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleSort(s)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-xs font-semibold',
                    sort === s ? 'text-md-primary' : 'text-md-on-surface-variant',
                  )}
                >
                  {SORT_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── History List ──────────────────────────────────────── */}
      <section className="px-6 pt-4 space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-md-on-surface-variant text-sm">Belum ada riwayat tryout.</p>
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paginated.map((attempt: any) => {
            const isPassed = attempt.is_passed;
            const duration = attempt.packages?.duration_minutes ?? 0;
            const title    = attempt.packages?.title ?? 'Tryout';

            return (
              <div
                key={attempt.id}
                className="bg-white rounded-2xl p-5 shadow-md3-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-md-primary mb-1">{title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-md-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {attempt.completed_at ? formatDate(attempt.completed_at) : '-'}
                      </span>
                      {duration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDuration(duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    isPassed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700',
                  )}>
                    {isPassed ? 'Lulus' : 'Tidak Lulus'}
                  </span>
                </div>

                {/* Score chips */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: 'TWK', value: attempt.score_twk },
                    { label: 'TIU', value: attempt.score_tiu },
                    { label: 'TKP', value: attempt.score_tkp },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className={cn(
                        'text-center p-2 rounded-lg bg-md-surface-container-low',
                        !value && 'opacity-40',
                      )}
                    >
                      <p className="text-[9px] uppercase font-bold text-md-on-surface-variant mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-bold text-md-primary">
                        {value ?? '-'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-md-on-surface-variant">Total Skor</p>
                    <p className={cn(
                      'text-lg font-extrabold',
                      isPassed ? 'text-md-secondary' : 'text-md-primary',
                    )}>
                      {attempt.final_score ?? attempt.total_score ?? 0}
                      <span className="text-[10px] font-normal text-md-on-surface-variant"> / 550</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/exam/${attempt.id}/result`}>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-md-surface-container-low text-md-primary active-press">
                        <TrendingUp size={16} />
                        <span className="text-xs font-bold">Hasil</span>
                      </button>
                    </Link>
                    <Link href={`/exam/${attempt.id}/pembahasan`}>
                      <button className="px-4 py-2 rounded-lg bg-md-secondary-container text-md-on-secondary-container text-xs font-bold active-press">
                        Pembahasan
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* ── Pagination ────────────────────────────────────────── */}
      {sorted.length > PAGE_SIZE && (
        <div className="px-6 mt-4 flex flex-col items-center gap-2">
          <p className="text-[11px] text-md-on-surface-variant">
            Menampilkan {paginated.length} dari {sorted.length} riwayat
          </p>
          <div className="flex gap-3">
            {hasMore && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-md-primary text-white text-xs font-bold active-press shadow-md3-sm"
              >
                <ChevronDown size={14} />
                Muat Lebih Banyak
              </button>
            )}
            {page > 1 && (
              <button
                onClick={() => setPage(1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-md-surface-container text-md-on-surface-variant text-xs font-bold active-press"
              >
                <ChevronUp size={14} />
                Tampilkan Lebih Sedikit
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Premium Banner ────────────────────────────────────── */}
      <div className="mx-6 mt-8 mb-4 bg-gradient-to-br from-md-primary to-md-tertiary p-6 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 pr-16">
          <h4 className="text-white font-bold text-lg mb-2"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Akses Semua Riwayat &amp; Detail?
          </h4>
          <p className="text-white/70 text-[10px] leading-relaxed mb-4">
            Dapatkan analisis mendalam AI untuk setiap jawabanmu dengan akun Premium.
          </p>
          <Link href="/beli-paket">
            <button className="bg-md-secondary-container text-md-on-secondary-container px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-widest shadow-md3-sm active-press">
              Upgrade Sekarang
            </button>
          </Link>
        </div>
        <div className="absolute -right-6 -bottom-6 text-white/5 text-[120px] select-none">★</div>
      </div>

    </main>
  );
}
