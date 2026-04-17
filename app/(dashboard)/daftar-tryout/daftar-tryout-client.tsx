'use client';

// ============================================================
// app/(dashboard)/daftar-tryout/daftar-tryout-client.tsx
// ============================================================

import { useState, useMemo }        from 'react';
import Link                         from 'next/link';
import { Lock, TrendingUp, Search, X,
         BookOpen, Clock, Users, ChevronRight } from 'lucide-react';
import { UpgradeModal }             from '@/components/shared/upgrade-modal';
import TryoutFilterTabs             from '@/components/dashboard/user/TryoutFilterTabs';

// ✅ Import dari subscription-utils — AMAN untuk Client Component
import { canAccess }                from '@/lib/subscription-utils';
import type { SubscriptionTier }    from '@/lib/subscription-utils';

// ─────────────────────────────────────────────────────────────
// TIPE
// ─────────────────────────────────────────────────────────────

type TierFilter = 'Semua' | 'Gratis' | 'Premium' | 'Platinum';

interface PackageData {
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

interface DaftarTryoutClientProps {
  packages:               PackageData[];
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
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-yellow-100  text-yellow-700',
  hard:   'bg-red-100     text-red-700',
};

const TIER_BADGE: Record<string, { label: string; className: string }> = {
  free:     { label: 'Gratis',   className: 'bg-emerald-500 text-white' },
  premium:  { label: 'Premium',  className: 'bg-blue-500 text-white' },
  platinum: { label: 'Platinum', className: 'bg-purple-500 text-white' },
};

// ─────────────────────────────────────────────────────────────
// PACKAGE CARD
// ─────────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  hasActiveAttempt,
  userTier,
  onLocked,
}: {
  pkg:              PackageData;
  hasActiveAttempt: boolean;
  userTier:         SubscriptionTier;
  onLocked:         (title: string, tier: 'premium' | 'platinum') => void;
}) {
  const contentTier = (pkg.tier ?? 'free') as SubscriptionTier;
  const accessible  = canAccess(userTier, contentTier);
  const tierBadge   = TIER_BADGE[contentTier] ?? TIER_BADGE.free;
  const diffLabel   = DIFFICULTY_LABEL[pkg.difficulty] ?? pkg.difficulty;
  const diffColor   = DIFFICULTY_COLOR[pkg.difficulty] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">

      {/* Badge tier */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tierBadge.className}`}>
          {tierBadge.label}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Judul */}
        <h3 className={`font-bold text-sm leading-snug mb-3 pr-16 ${accessible ? 'text-slate-800' : 'text-slate-500'}`}>
          {pkg.title}
        </h3>

        {/* Difficulty */}
        <div className="mb-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${diffColor}`}>
            {diffLabel}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1.5 mb-4 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <BookOpen size={13} className="text-slate-400" />
            <span>{pkg.total_questions ?? 110} Soal</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={13} className="text-slate-400" />
            <span>{pkg.duration_minutes ?? 100} Menit</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users size={13} className="text-slate-400" />
            <span>{pkg.completedUsersCount} Peserta</span>
          </div>
        </div>

        {/* CTA */}
        {accessible ? (
          <Link href={`/packages/${pkg.id}`}>
            <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5">
              {hasActiveAttempt ? 'Lanjutkan Tryout' : 'Mulai Tryout'}
              <ChevronRight size={13} />
            </button>
          </Link>
        ) : (
          <button
            onClick={() => onLocked(pkg.title, contentTier as 'premium' | 'platinum')}
            className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-1.5"
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

export function DaftarTryoutClient({ packages, packageIdsWithAttempts, userTier }: DaftarTryoutClientProps) {
  const [activeFilter, setActiveFilter] = useState<TierFilter>('Semua');
  const [search,       setSearch]       = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalTier,    setModalTier]    = useState<'premium' | 'platinum'>('premium');
  const [modalTitle,   setModalTitle]   = useState('');

  const activeSet = new Set(packageIdsWithAttempts);

  const handleLocked = (title: string, tier: 'premium' | 'platinum') => {
    setModalTitle(title);
    setModalTier(tier);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    let result = activeFilter === 'Semua'
      ? packages
      : packages.filter(pkg => pkg.tier === TIER_MAP[activeFilter]);

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      result = result.filter(pkg => pkg.title.toLowerCase().includes(keyword));
    }
    return result;
  }, [packages, activeFilter, search]);

  return (
    <>
      <div className="space-y-4 pb-10">

        {/* HEADER */}
        <div className="pt-1 pb-0.5">
          <h1 className="text-2xl font-extrabold text-pn-navy mb-1">
            Daftar <span className="text-pn-gold">Tryout</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Semua paket simulasi SKD tersedia di sini.{' '}
            <span className="font-semibold text-slate-700">{packages.length} paket</span> tersedia.
          </p>
        </div>

        {/* FILTER + SEARCH */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama tryout..."
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pn-navy/20 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <TryoutFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <p className="text-slate-400 text-xs shrink-0">
              {filtered.length}/{packages.length}
            </p>
          </div>
        </div>

        {/* GRID */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                hasActiveAttempt={activeSet.has(pkg.id)}
                userTier={userTier}
                onLocked={handleLocked}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 shadow-sm flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              {search ? <Search className="h-7 w-7 text-slate-400" /> : <TrendingUp className="h-7 w-7 text-slate-400" />}
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {search ? `Tidak ditemukan "${search}"` : `Tidak Ada Paket ${activeFilter !== 'Semua' ? activeFilter : ''}`}
            </h3>
            <p className="text-slate-500 text-sm">
              {search ? 'Coba kata kunci lain atau hapus pencarian.'
                : activeFilter === 'Semua' ? 'Paket tryout akan segera tersedia.'
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