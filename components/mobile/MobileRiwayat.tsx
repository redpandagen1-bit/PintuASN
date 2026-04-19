'use client';

// components/mobile/MobileRiwayat.tsx
// Mobile-only riwayat page — feature-parity dengan desktop HistoryContent

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  History, Trophy, ListTodo,
  Calendar, Clock, TrendingUp,
  Lock, Crown, ChevronLeft, ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { cn }                   from '@/lib/utils';
import { AttemptHistoryCard }   from '@/components/shared/attempt-history-card';
import { UpgradeModal }         from '@/components/shared/upgrade-modal';
import type { AttemptHistoryData, UserStats } from '@/lib/supabase/queries';
import type { SubscriptionTier }              from '@/lib/subscription-utils';

// ── Constants ─────────────────────────────────────────────────

const FREE_HISTORY_LIMIT = 3;

// ── Types ─────────────────────────────────────────────────────

type SortOption   = 'newest' | 'oldest' | 'highest_score';
type FilterOption = 'all' | 'passed' | 'failed';

interface MobileRiwayatProps {
  initialHistory: AttemptHistoryData;
  initialStats:   UserStats;
  initialSort:    SortOption;
  initialFilter:  FilterOption;
  userTier:       SubscriptionTier;
}

// ── Config ────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string; Icon: React.ElementType }[] = [
  { value: 'newest',        label: 'Terbaru',        Icon: Calendar   },
  { value: 'oldest',        label: 'Tertua',         Icon: Clock      },
  { value: 'highest_score', label: 'Skor Tertinggi', Icon: TrendingUp },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all',    label: 'Semua'       },
  { value: 'passed', label: 'Lulus'       },
  { value: 'failed', label: 'Tidak Lulus' },
];

// ── Component ─────────────────────────────────────────────────

export function MobileRiwayat({
  initialHistory,
  initialStats,
  initialSort,
  initialFilter,
  userTier,
}: MobileRiwayatProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [sort,             setSort]             = useState<SortOption>(initialSort);
  const [filter,           setFilter]           = useState<FilterOption>(initialFilter);
  const [showFilters,      setShowFilters]      = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────

  const isFree = userTier !== 'platinum';

  const isLocked = (globalIndex: number) =>
    isFree && globalIndex >= FREE_HISTORY_LIMIT;

  const updateURL = (newSort: SortOption, newFilter: FilterOption, newPage = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort',   newSort);
    params.set('filter', newFilter);
    params.set('page',   newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort   = (v: SortOption)   => { setSort(v);   updateURL(v, filter);     };
  const handleFilter = (v: FilterOption) => { setFilter(v); updateURL(sort, v);        };
  const handlePage   = (page: number)    => {
    updateURL(sort, filter, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { attempts, totalCount, currentPage, totalPages } = initialHistory;
  const pageOffset  = (currentPage - 1) * 20;
  const lockedCount = isFree ? Math.max(0, totalCount - FREE_HISTORY_LIMIT) : 0;

  // ── Empty state ──────────────────────────────────────────────

  if (attempts.length === 0) {
    return (
      <main className="pb-24 space-y-4">
        <HeroBanner
          totalAttempts={initialStats.totalAttempts}
          bestScore={initialStats.bestScore}
        />
        <div className="mx-4 bg-white rounded-2xl p-10 flex flex-col items-center text-center shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <History size={24} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Belum ada percobaan</h3>
          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            Mulai tryout pertama kamu untuk melihat riwayat di sini.
          </p>
          <Link
            href="/daftar-tryout"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold active:bg-slate-700 transition-colors"
          >
            Mulai Tryout
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="pb-24 space-y-4">

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <HeroBanner
          totalAttempts={initialStats.totalAttempts}
          bestScore={initialStats.bestScore}
        />

        {/* ── Locked CTA ──────────────────────────────────────── */}
        {lockedCount > 0 && (
          <div className="mx-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 shadow-md">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 px-4 py-3.5 flex items-center justify-between gap-3">
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock size={15} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <p className="text-xs font-black text-white whitespace-nowrap">
                      {lockedCount} riwayat terkunci
                    </p>
                    <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      <Crown size={8} /> Platinum
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-200 leading-tight">
                    Upgrade untuk akses semua riwayat tanpa batas
                  </p>
                </div>
              </div>
              {/* CTA */}
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-white text-purple-700 rounded-xl text-xs font-black active:bg-yellow-50 transition-colors shadow-sm whitespace-nowrap"
              >
                <Crown size={12} className="text-yellow-500" />
                Upgrade
              </button>
            </div>
          </div>
        )}

        {/* ── Filter & Sort bar ────────────────────────────────── */}
        <div className="px-4 space-y-2.5">

          {/* Row: count + toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{attempts.length}</span>
              {' '}dari{' '}
              <span className="font-semibold text-slate-800">{totalCount}</span>
              {' '}percobaan
            </p>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                showFilters
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600',
              )}
            >
              <SlidersHorizontal size={12} />
              Filter & Urutkan
            </button>
          </div>

          {/* Expandable panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              {/* Sort pills */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Urutkan
                </p>
                <div className="flex gap-2 flex-wrap">
                  {SORT_OPTIONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleSort(value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors',
                        sort === value
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      <Icon size={11} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter pills */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Filter Hasil
                </p>
                <div className="flex gap-2">
                  {FILTER_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleFilter(value)}
                      className={cn(
                        'flex-1 py-1.5 rounded-full text-xs font-bold transition-colors',
                        filter === value
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Attempt List ─────────────────────────────────────── */}
        <div className="px-4 space-y-3">
          {attempts.map((attempt, idx) => (
            <AttemptHistoryCard
              key={attempt.id}
              attempt={attempt}
              isLocked={isLocked(pageOffset + idx)}
            />
          ))}
        </div>

        {/* ── Pagination ───────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-4 flex items-center justify-between gap-3">
            <button
              onClick={() => handlePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed active:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={14} />
              Sebelumnya
            </button>

            <span className="text-xs text-slate-500 font-medium">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => handlePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed active:bg-slate-50 transition-colors"
            >
              Selanjutnya
              <ChevronRight size={14} />
            </button>
          </div>
        )}

      </main>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier="platinum"
        contentTitle="Riwayat Tryout Lengkap"
      />
    </>
  );
}

// ── Hero Banner ────────────────────────────────────────────────

function HeroBanner({
  totalAttempts,
  bestScore,
}: {
  totalAttempts: number;
  bestScore:     number;
}) {
  return (
    <div className="mx-4 relative bg-pn-navy rounded-2xl p-4 overflow-hidden shadow-lg">
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-yellow-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 text-yellow-400 text-[10px] font-bold tracking-widest uppercase">
            <History size={11} />
            Riwayat Pembelajaran
          </div>
          <h1 className="text-base font-extrabold text-white leading-tight mb-0.5"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Evaluasi Perjalanan{' '}
            <span className="text-yellow-400">Belajarmu!</span>
          </h1>
          <p className="text-slate-400 text-[10px] leading-relaxed">
            Pantau perkembangan skor dan pelajari kembali pembahasan.
          </p>
        </div>

        {/* Right stat cards */}
        <div className="flex gap-2 flex-shrink-0">
          <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-center">
            <div className="text-yellow-400 flex justify-center mb-1">
              <ListTodo size={14} />
            </div>
            <div className="text-lg font-black text-white leading-none">{totalAttempts}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Percobaan</div>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-center">
            <div className="text-yellow-400 flex justify-center mb-1">
              <Trophy size={14} />
            </div>
            <div className="text-lg font-black text-white leading-none">
              {bestScore > 0 ? bestScore : '-'}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">Terbaik</div>
          </div>
        </div>
      </div>
    </div>
  );
}
