'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  History,
  TrendingUp,
  Calendar,
  Clock,
  ListTodo,
  Trophy,
  Crown,
  ArrowRight,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { AttemptHistoryCard } from '@/components/shared/attempt-history-card';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import type { AttemptHistoryData, UserStats } from '@/lib/supabase/queries';
import type { SubscriptionTier } from '@/lib/subscription-utils';

const FREE_HISTORY_LIMIT = 3;

interface HistoryContentProps {
  initialHistory: AttemptHistoryData;
  initialStats: UserStats;
  initialSort: 'newest' | 'oldest' | 'highest_score';
  initialFilter: 'all' | 'passed' | 'failed';
  userTier: SubscriptionTier;
}

export default function HistoryContent({
  initialHistory,
  initialStats,
  initialSort,
  initialFilter,
  userTier,
}: HistoryContentProps) {
  const [sort, setSort] = useState(initialSort);
  const [filter, setFilter] = useState(initialFilter);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isLocked = (globalIndex: number) => globalIndex >= FREE_HISTORY_LIMIT;

  const updateURL = (newSort: string, newFilter: string, newPage: number = 1) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('filter', newFilter);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const newSort = value as 'newest' | 'oldest' | 'highest_score';
    setSort(newSort);
    updateURL(newSort, filter);
  };

  const handleFilterChange = (value: string) => {
    const newFilter = value as 'all' | 'passed' | 'failed';
    setFilter(newFilter);
    updateURL(sort, newFilter);
  };

  const handlePageChange = (page: number) => {
    updateURL(sort, filter, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = [
    { value: 'newest', label: 'Terbaru', icon: Calendar },
    { value: 'oldest', label: 'Tertua', icon: Clock },
    { value: 'highest_score', label: 'Skor Tertinggi', icon: TrendingUp },
  ];

  const filterOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'passed', label: 'Lulus' },
    { value: 'failed', label: 'Tidak Lulus' },
  ];

  const getPaginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = initialHistory;

    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => handlePageChange(currentPage - 1)}
          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    );

    if (currentPage > 3) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">1</PaginationLink>
        </PaginationItem>
      );
    }
    if (currentPage > 4) {
      items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
    }

    const startPage = Math.max(1, Math.min(totalPages - 4, currentPage - 2));
    const endPage = Math.min(totalPages, Math.max(5, currentPage + 2));
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => handlePageChange(i)} isActive={i === currentPage} className="cursor-pointer">
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (currentPage < totalPages - 3) {
      items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
    }
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(totalPages)} className="cursor-pointer">{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => handlePageChange(currentPage + 1)}
          className={currentPage === initialHistory.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    );

    return items;
  };

  const lockedCount = Math.max(0, initialHistory.totalCount - FREE_HISTORY_LIMIT);
  const pageOffset = (initialHistory.currentPage - 1) * 20;

  // ── EMPTY STATE ──────────────────────────────────────────────────────────
  if (initialHistory.attempts.length === 0) {
    return (
      <div className="space-y-6 pb-10">
        <HeroBanner totalAttempts={initialStats.totalAttempts} bestScore={initialStats.bestScore} />
        <div className="bg-white rounded-2xl shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Belum ada percobaan</h3>
          <p className="text-slate-500 text-sm mb-6">Mulai tryout pertama Anda untuk melihat riwayat di sini</p>
          <Link
            href="/daftar-tryout"
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Mulai Tryout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 pb-10">

        {/* ── HERO BANNER ────────────────────────────────────────────────── */}
        <HeroBanner totalAttempts={initialStats.totalAttempts} bestScore={initialStats.bestScore} />

        {/* ── PLATINUM UPGRADE CTA (tampil jika ada riwayat terkunci) ───── */}
        {lockedCount > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
            {/* Decorative blobs */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-20 bottom-0 w-24 h-24 bg-purple-400/30 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4">
              {/* Left */}
              <div className="flex items-center gap-3.5">
                <div className="flex-shrink-0 w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
                  <Lock className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black text-white">
                      {lockedCount} riwayat terkunci
                    </p>
                    <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                      <Crown size={9} /> Platinum
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 leading-relaxed">
                    Upgrade ke <span className="font-bold text-white">Platinum</span> untuk akses semua riwayat tryout tanpa batas
                  </p>
                </div>
              </div>

              {/* Right: CTA */}
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white hover:bg-yellow-50 text-purple-700 rounded-xl text-sm font-black transition-colors shadow-sm whitespace-nowrap"
              >
                <Crown size={14} className="text-yellow-500" />
                Upgrade Sekarang
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── FILTER + SORT BAR ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Urutkan:</span>
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40 h-9 text-sm border-slate-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-3.5 w-3.5" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Filter:</span>
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-36 h-9 text-sm border-slate-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <span className="text-sm text-slate-500">
            Menampilkan{' '}
            <span className="font-semibold text-slate-800">{initialHistory.attempts.length}</span>
            {' '}dari{' '}
            <span className="font-semibold text-slate-800">{initialHistory.totalCount}</span>
            {' '}percobaan
          </span>
        </div>

        {/* ── ATTEMPTS LIST ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          {initialHistory.attempts.map((attempt, idx) => {
            const globalIndex = pageOffset + idx;
            const locked = isLocked(globalIndex);
            return (
              <AttemptHistoryCard
                key={attempt.id}
                attempt={attempt}
                isLocked={locked}
              />
            );
          })}
        </div>

        {/* ── PAGINATION ────────────────────────────────────────────────── */}
        {initialHistory.totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination>
              <PaginationContent>{getPaginationItems()}</PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Global upgrade modal (dipanggil dari CTA banner) */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier="platinum"
        contentTitle="Riwayat Tryout Lengkap"
      />
    </>
  );
}

// ── HERO BANNER ──────────────────────────────────────────────────────────────
function HeroBanner({ totalAttempts, bestScore }: { totalAttempts: number; bestScore: number }) {
  return (
    <div className="relative bg-pn-navy rounded-2xl p-5 md:p-8 overflow-hidden shadow-xl">
      {/* Decorative blobs */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-400 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute right-10 bottom-0 w-32 h-32 bg-yellow-500 rounded-full opacity-10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        {/* Left text */}
        <div className="text-white max-w-xl">
          <div className="flex items-center gap-2 mb-1.5 text-yellow-400 font-semibold text-xs tracking-widest uppercase">
            <History size={13} />
            Riwayat Pembelajaran
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold mb-1.5 md:mb-2 tracking-tight">
            Evaluasi Perjalanan <span className="text-yellow-400">Belajarmu!</span>
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Pantau perkembangan skor dan pelajari kembali pembahasan untuk hasil maksimal.
          </p>
        </div>

        {/* Right stat cards */}
        <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 md:p-4 flex-1 md:w-32 text-center">
            <div className="text-yellow-400 mb-1 flex justify-center">
              <ListTodo size={18} />
            </div>
            <div className="text-xl md:text-2xl font-black text-white mb-0.5">{totalAttempts}</div>
            <div className="text-[10px] md:text-[11px] text-slate-300 font-medium">Total Percobaan</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 md:p-4 flex-1 md:w-32 text-center">
            <div className="text-yellow-400 mb-1 flex justify-center">
              <Trophy size={18} />
            </div>
            <div className="text-xl md:text-2xl font-black text-white mb-0.5">{bestScore}</div>
            <div className="text-[10px] md:text-[11px] text-slate-300 font-medium">Skor Terbaik</div>
          </div>
        </div>
      </div>
    </div>
  );
}