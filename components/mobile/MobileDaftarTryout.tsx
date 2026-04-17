'use client';

// components/mobile/MobileDaftarTryout.tsx
// Mobile-only daftar tryout — Pathfinder Navy MD3 design

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Clock, BookOpen, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';
import { canAccess } from '@/lib/subscription-utils';

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

const DIFFICULTY_DOTS: Record<string, number> = {
  easy: 1, medium: 2, hard: 3,
};
const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Mudah', medium: 'Sedang', hard: 'Sulit',
};
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-emerald-600', medium: 'text-md-secondary', hard: 'text-md-error',
};

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  free:     { label: 'GRATIS',   cls: 'bg-emerald-500/10 text-emerald-700' },
  premium:  { label: 'PREMIUM',  cls: 'bg-amber-500/10 text-amber-700'    },
  platinum: { label: 'PLATINUM', cls: 'bg-white/10 text-md-secondary-container backdrop-blur-md' },
};

// ── Card ──────────────────────────────────────────────────────

function TryoutCard({
  pkg,
  hasActiveAttempt,
  userTier,
}: {
  pkg:              PackageData;
  hasActiveAttempt: boolean;
  userTier:         SubscriptionTier;
}) {
  const tier       = (pkg.tier ?? 'free') as string;
  const badge      = TIER_BADGE[tier] ?? TIER_BADGE.free;
  const difficulty = pkg.difficulty ?? 'medium';
  const dotCount   = DIFFICULTY_DOTS[difficulty] ?? 2;
  const dotColor   = difficulty === 'hard' ? 'bg-md-error' : difficulty === 'easy' ? 'bg-emerald-500' : 'bg-md-secondary';
  const isPlatinum = tier === 'platinum';
  const locked     = !canAccess(tier as SubscriptionTier, userTier);

  const cardCls = cn(
    'rounded-[2rem] p-6 shadow-md3-sm relative overflow-hidden',
    isPlatinum ? 'bg-md-primary text-white' : 'bg-white',
  );

  const ctaLabel = locked
    ? 'Buka Akses Tryout'
    : hasActiveAttempt
    ? 'Lanjutkan Tryout'
    : 'Mulai Tryout';

  const ctaCls = cn(
    'w-full font-bold py-4 rounded-xl active-press flex items-center justify-center gap-2 text-sm',
    locked
      ? 'bg-md-surface-container text-md-on-surface-variant'
      : hasActiveAttempt
      ? 'bg-md-secondary-container text-md-primary shadow-md3-sm'
      : isPlatinum
      ? 'bg-md-secondary-container text-md-primary'
      : 'bg-md-surface-container-low text-md-primary',
  );

  const href = locked ? '/beli-paket' : `/exam/${pkg.id}/start`;

  return (
    <div className={cardCls}>
      {/* Decorative blur for platinum */}
      {isPlatinum && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-md-secondary-container/10 rounded-full blur-3xl" />
      )}

      {/* Tier badge */}
      <div className="absolute top-0 right-0 p-4">
        <span className={cn('text-[0.6875rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full', badge.cls)}>
          {badge.label}
        </span>
      </div>

      {/* Difficulty */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-[0.6875rem] font-bold tracking-widest uppercase', DIFFICULTY_COLOR[difficulty] ?? 'text-md-secondary')}>
            {DIFFICULTY_LABEL[difficulty] ?? difficulty}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={cn('w-1.5 h-1.5 rounded-full', i < dotCount ? dotColor : 'bg-md-outline-variant/30')} />
            ))}
          </div>
        </div>
        <h3 className={cn('text-xl font-bold leading-tight', isPlatinum ? 'text-white' : 'text-md-primary')}
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          {pkg.title}
        </h3>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className={isPlatinum ? 'text-md-on-primary-container' : 'text-md-on-surface-variant'} />
          <span className={cn('text-sm font-medium', isPlatinum ? 'text-white/80' : 'text-md-on-surface')}>
            {pkg.total_questions ?? '?'} Soal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={18} className={isPlatinum ? 'text-md-on-primary-container' : 'text-md-on-surface-variant'} />
          <span className={cn('text-sm font-medium', isPlatinum ? 'text-white/80' : 'text-md-on-surface')}>
            {pkg.duration_minutes ?? '?'} Menit
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link href={href}>
        <button className={ctaCls}>
          {locked ? <Lock size={16} /> : hasActiveAttempt ? <ArrowRight size={16} /> : null}
          {ctaLabel}
        </button>
      </Link>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

export function MobileDaftarTryout({ packages, packageIdsWithAttempts, userTier }: MobileDaftarTryoutProps) {
  const [search, setSearch]         = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('Semua');

  const filtered = useMemo(() => {
    return packages.filter(pkg => {
      const matchSearch = search === '' || pkg.title.toLowerCase().includes(search.toLowerCase());
      const matchTier   = TIER_MAP[tierFilter] === '' || pkg.tier === TIER_MAP[tierFilter];
      return matchSearch && matchTier;
    });
  }, [packages, search, tierFilter]);

  return (
    <main className="pb-32 px-6 pt-6">

      {/* ── Hero Title ────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-md-primary tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Daftar Tryout
        </h1>
        <p className="text-md-on-surface-variant text-sm leading-relaxed">
          Semua paket simulasi SKD tersedia di sini
        </p>
      </div>

      {/* ── Search Bar ────────────────────────────────────────── */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/50" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama tryout..."
          className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-none ring-1 ring-md-outline-variant/20 focus:ring-md-secondary-container focus:bg-white transition-all shadow-md3-sm placeholder:text-md-on-surface-variant/40 outline-none text-sm"
        />
      </div>

      {/* ── Category Filters ──────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 mb-6 scrollbar-hide">
        {TIER_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setTierFilter(f)}
            className={cn(
              'whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm active-press transition-colors',
              tierFilter === f
                ? 'bg-md-primary text-white shadow-md3-sm'
                : 'bg-white text-md-on-surface-variant',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Tryout List ───────────────────────────────────────── */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-md-on-surface-variant text-sm">Tidak ada tryout yang cocok.</p>
          </div>
        ) : (
          filtered.map(pkg => (
            <TryoutCard
              key={pkg.id}
              pkg={pkg}
              hasActiveAttempt={packageIdsWithAttempts.includes(pkg.id)}
              userTier={userTier}
            />
          ))
        )}
      </div>
    </main>
  );
}
