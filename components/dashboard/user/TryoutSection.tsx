'use client';

// ============================================================
// components/dashboard/user/TryoutSection.tsx
//
// Menampilkan 6 tryout terbaru di dashboard.
// Paket yang tidak bisa diakses → tombol gembok + UpgradeModal.
// ============================================================

import { useState, useMemo, useRef } from 'react';
import Link                          from 'next/link';
import { Button }                    from '@/components/ui/button';
import { UpgradeModal }              from '@/components/shared/upgrade-modal';
import TryoutFilterTabs              from '@/components/dashboard/user/TryoutFilterTabs';
import {
  TrendingUp, ChevronRight, ChevronLeft,
  Clock, FileText, Users, Star, Lock,
} from 'lucide-react';

// ✅ Import dari subscription-utils — aman untuk Client Component
import { canAccess }              from '@/lib/subscription-utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';

// ─────────────────────────────────────────────────────────────
// TIPE
// ─────────────────────────────────────────────────────────────

type TierFilter = 'Semua' | 'Gratis' | 'Premium' | 'Platinum';

interface PackageItem {
  id:                  string;
  title:               string;
  description?:        string | null;
  difficulty:          string;
  tier?:               string;
  total_questions?:    number;
  duration_minutes?:   number;
  completedUsersCount: number;
  [key: string]:       unknown;
}

interface TryoutSectionProps {
  packages:               PackageItem[];
  packageIdsWithAttempts: string[];
  userTier:               SubscriptionTier;
}

// ─────────────────────────────────────────────────────────────
// KONSTANTA
// ─────────────────────────────────────────────────────────────

const TIER_MAP: Record<TierFilter, string> = {
  'Semua': '', 'Gratis': 'free', 'Premium': 'premium', 'Platinum': 'platinum',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Mudah', medium: 'Sedang', hard: 'Sulit',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard:   'bg-red-100 text-red-700 border-red-200',
};

// ─────────────────────────────────────────────────────────────
// MINI PACKAGE CARD (khusus dashboard — compact)
// ─────────────────────────────────────────────────────────────

function DashboardPackageCard({
  pkg,
  hasActiveAttempt,
  userTier,
  onLocked,
}: {
  pkg:              PackageItem;
  hasActiveAttempt: boolean;
  userTier:         SubscriptionTier;
  onLocked:         (title: string, tier: 'premium' | 'platinum') => void;
}) {
  const contentTier = (pkg.tier ?? 'free') as SubscriptionTier;
  const accessible  = canAccess(userTier, contentTier);

  const tierBadge = contentTier === 'platinum'
    ? { label: 'Platinum', className: 'bg-purple-500 text-white' }
    : contentTier === 'premium'
    ? { label: 'Premium',  className: 'bg-blue-500 text-white' }
    : { label: 'Gratis',   className: 'bg-emerald-500 text-white' };

  const truncatedTitle = pkg.title.length > 15
    ? pkg.title.slice(0, 15) + '...'
    : pkg.title;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-w-[200px]">

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800 truncate" title={pkg.title}>
          {truncatedTitle}
        </h3>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 ${tierBadge.className}`}>
          {contentTier !== 'free' && <Star size={8} fill="currentColor" />}
          {tierBadge.label}
        </span>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3 flex flex-col gap-1.5 text-xs text-slate-500">
        <div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            DIFFICULTY_COLOR[pkg.difficulty] ?? 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {DIFFICULTY_LABEL[pkg.difficulty] ?? pkg.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span>{pkg.total_questions ?? 110} Soal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{pkg.duration_minutes ?? 100} Menit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>{pkg.completedUsersCount.toLocaleString('id-ID')} Peserta</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 mt-auto">
        {accessible ? (
          <Link href={`/packages/${pkg.id}`} className="w-full">
            <Button className="w-full text-sm h-9">
              {hasActiveAttempt ? 'Lanjutkan Tryout' : 'Mulai Tryout'}
            </Button>
          </Link>
        ) : (
          <button
            onClick={() => onLocked(pkg.title, contentTier as 'premium' | 'platinum')}
            className="w-full h-9 rounded-lg bg-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <Lock size={13} />
            Buka dengan {contentTier === 'platinum' ? 'Platinum' : 'Premium'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export default function TryoutSection({
  packages,
  packageIdsWithAttempts,
  userTier,
}: TryoutSectionProps) {
  const [activeFilter, setActiveFilter] = useState<TierFilter>('Semua');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalTier,    setModalTier]    = useState<'premium' | 'platinum'>('premium');
  const [modalTitle,   setModalTitle]   = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeSet = new Set(packageIdsWithAttempts);

  const handleLocked = (title: string, tier: 'premium' | 'platinum') => {
    setModalTitle(title);
    setModalTier(tier);
    setModalOpen(true);
  };

  // Ambil 6 terbaru setelah filter
  const filtered = useMemo(() => {
    const base = activeFilter === 'Semua'
      ? packages
      : packages.filter(pkg => pkg.tier === TIER_MAP[activeFilter]);
    return base.slice(0, 6);
  }, [packages, activeFilter]);

  const hasMore = useMemo(() => {
    const base = activeFilter === 'Semua'
      ? packages
      : packages.filter(pkg => pkg.tier === TIER_MAP[activeFilter]);
    return base.length > 6;
  }, [packages, activeFilter]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 240 : -240, behavior: 'smooth' });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Daftar Tryout</h2>
          <p className="text-slate-500 text-xs mt-0.5">Pilih paket simulasi SKD sesuai kebutuhanmu.</p>
        </div>
        <TryoutFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      {/* Scroll row */}
      <div className="relative">
        {filtered.length > 0 ? (
          <>
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-1 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {filtered.map(pkg => (
                <div key={pkg.id} className="flex-shrink-0 w-[210px]">
                  <DashboardPackageCard
                    pkg={pkg}
                    hasActiveAttempt={activeSet.has(pkg.id)}
                    userTier={userTier}
                    onLocked={handleLocked}
                  />
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              {hasMore && (
                <Link href="/daftar-tryout">
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs px-4">
                    Tryout Lainnya <ChevronRight size={14} />
                  </Button>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Tidak Ada Paket {activeFilter !== 'Semua' ? activeFilter : ''}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {activeFilter === 'Semua'
                ? 'Paket tryout akan segera tersedia.'
                : `Belum ada paket tier ${activeFilter} saat ini.`}
            </p>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requiredTier={modalTier}
        contentTitle={modalTitle}
      />
    </>
  );
}