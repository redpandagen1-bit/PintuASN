'use client';

// components/mobile/MobileDaftarTryout.tsx
// Mobile-only daftar tryout — compact list, feature-parity with desktop

import { useState, useMemo }     from 'react';
import Link                      from 'next/link';
import {
  Search, X, BookOpen, Clock, Users,
  ChevronRight, ArrowRight, Zap, Crown,
} from 'lucide-react';
import { cn }                    from '@/lib/utils';
import { canAccess }             from '@/lib/subscription-utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';
import { UpgradeModal }          from '@/components/shared/upgrade-modal';

// ── Types ─────────────────────────────────────────────────────

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

interface MobileDaftarTryoutProps {
  packages:               PackageData[];
  packageIdsWithAttempts: string[];
  userTier:               SubscriptionTier;
}

// ── Constants ─────────────────────────────────────────────────

const TIER_FILTERS: TierFilter[] = ['Semua', 'Gratis', 'Premium', 'Platinum'];

const TIER_MAP: Record<TierFilter, string> = {
  Semua: '', Gratis: 'free', Premium: 'premium', Platinum: 'platinum',
};

const DIFFICULTY_BADGE: Record<string, string> = {
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard:   'bg-red-100 text-red-700',
};
const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Mudah', medium: 'Sedang', hard: 'Sulit',
};

const TIER_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  free:     { label: 'Gratis',   cls: 'bg-emerald-500 text-white',   dot: 'bg-emerald-500'  },
  premium:  { label: 'Premium',  cls: 'bg-blue-500 text-white',      dot: 'bg-blue-500'     },
  platinum: { label: 'Platinum', cls: 'bg-purple-500 text-white',    dot: 'bg-purple-500'   },
};

function fmtCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Compact Card ──────────────────────────────────────────────

function TryoutCard({
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
  const accessible  = canAccess(userTier, contentTier);   // ✅ correct order
  const badge       = TIER_BADGE[contentTier] ?? TIER_BADGE.free;
  const diffBadge   = DIFFICULTY_BADGE[pkg.difficulty] ?? 'bg-slate-100 text-slate-600';
  const diffLabel   = DIFFICULTY_LABEL[pkg.difficulty] ?? pkg.difficulty;

  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden',
      !accessible && 'opacity-90',
    )}>
      {/* Top row: tier badge + difficulty */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <span className={cn('text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full', badge.cls)}>
            {badge.label}
          </span>
          {hasActiveAttempt && (
            <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Lanjutkan
            </span>
          )}
        </div>
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg', diffBadge)}>
          {diffLabel}
        </span>
      </div>

      {/* Title */}
      <div className="px-3 pb-2">
        <h3 className={cn(
          'text-sm font-bold leading-snug',
          accessible ? 'text-slate-800' : 'text-slate-500',
        )}>
          {pkg.title}
        </h3>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 px-3 pb-2.5 text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <BookOpen size={11} />
          {pkg.total_questions ?? 110}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {pkg.duration_minutes ?? 100} mnt
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} />
          {fmtCount(pkg.completedUsersCount)} peserta
        </span>
      </div>

      {/* CTA */}
      <div className="px-3 pb-3">
        {accessible ? (
          <Link href={`/packages/${pkg.id}`}>
            <button className={cn(
              'w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors',
              hasActiveAttempt
                ? 'bg-amber-400 text-slate-900 hover:bg-amber-500'
                : 'bg-slate-900 text-white hover:bg-slate-700',
            )}>
              {hasActiveAttempt
                ? <><ArrowRight size={12} />Lanjutkan Tryout</>
                : <><ChevronRight size={12} />Mulai Tryout</>
              }
            </button>
          </Link>
        ) : (
          <button
            onClick={() => onLocked(pkg.title, contentTier as 'premium' | 'platinum')}
            className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            {contentTier === 'platinum'
              ? <><Crown size={11} />Buka dengan Platinum</>
              : <><Zap size={11} />Buka dengan Premium</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

export function MobileDaftarTryout({ packages, packageIdsWithAttempts, userTier }: MobileDaftarTryoutProps) {
  const [search,      setSearch]      = useState('');
  const [tierFilter,  setTierFilter]  = useState<TierFilter>('Semua');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalTier,   setModalTier]   = useState<'premium' | 'platinum'>('premium');
  const [modalTitle,  setModalTitle]  = useState('');

  const activeSet = new Set(packageIdsWithAttempts);

  const handleLocked = (title: string, tier: 'premium' | 'platinum') => {
    setModalTitle(title);
    setModalTier(tier);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    let result = tierFilter === 'Semua'
      ? packages
      : packages.filter(pkg => pkg.tier === TIER_MAP[tierFilter]);

    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      result = result.filter(pkg => pkg.title.toLowerCase().includes(kw));
    }
    return result;
  }, [packages, search, tierFilter]);

  return (
    <>
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requiredTier={modalTier}
        contentTitle={modalTitle}
      />

      <main>

        {/* ── Header + Search (dark bg) ────────────────────────── */}
        <div className="bg-slate-800 px-4 pt-4 pb-4">
          {/* Title */}
          <div className="mb-3">
            <h1 className="text-xl font-extrabold text-white leading-tight">
              Daftar <span className="text-yellow-400">Tryout</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {packages.length} paket tersedia · Tier kamu:{' '}
              <span className={cn(
                'font-bold',
                userTier === 'platinum' ? 'text-purple-300'
                : userTier === 'premium'  ? 'text-blue-300'
                : 'text-emerald-400',
              )}>
                {userTier === 'platinum' ? 'Platinum' : userTier === 'premium' ? 'Premium' : 'Gratis'}
              </span>
            </p>
          </div>

          {/* Search — compact */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari tryout..."
              className="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-slate-400 placeholder:text-slate-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Pills ────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto py-2.5 px-4 scrollbar-hide bg-white border-b border-slate-100">
          {TIER_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTierFilter(f)}
              className={cn(
                'whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-bold transition-colors flex-shrink-0',
                tierFilter === f
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500',
              )}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto flex-shrink-0 text-[10px] text-slate-400 font-medium self-center">
            {filtered.length}/{packages.length}
          </span>
        </div>

        <div className="px-4 pt-3">

        {/* ── Cards ───────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              {search
                ? <Search size={20} className="text-slate-400" />
                : <BookOpen size={20} className="text-slate-400" />
              }
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {search ? `Tidak ditemukan "${search}"` : `Tidak ada paket ${tierFilter !== 'Semua' ? tierFilter : ''}`}
            </p>
            <p className="text-xs text-slate-400">
              {search ? 'Coba kata kunci lain.' : 'Coba filter lain.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(pkg => (
              <TryoutCard
                key={pkg.id}
                pkg={pkg}
                hasActiveAttempt={activeSet.has(pkg.id)}
                userTier={userTier}
                onLocked={handleLocked}
              />
            ))}
          </div>
        )}
        </div>{/* /px-4 pt-3 */}
      </main>
    </>
  );
}
