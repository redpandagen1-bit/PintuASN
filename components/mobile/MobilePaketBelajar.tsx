'use client';

// components/mobile/MobilePaketBelajar.tsx
// Mobile-only paket belajar (pricing) — Pathfinder Navy MD3 design

import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';

// ── Types ─────────────────────────────────────────────────────

interface PricingPackage {
  id:         string;
  name:       string;
  priceLabel: string;
  period:     string;
  description: string;
  badge:      string | null;
  features:   string[];
  unavailable: string[];
  isCurrent:  boolean;
  tier:       SubscriptionTier;
}

interface MobilePaketBelajarProps {
  userTier:    SubscriptionTier;
  onSelectPkg: (tier: SubscriptionTier) => void;
}

// ── Package definitions (static pricing copy) ────────────────

const PACKAGES: PricingPackage[] = [
  {
    id:          'free',
    name:        'Gratis',
    priceLabel:  'Rp 0',
    period:      'Selamanya',
    description: 'Cocok untuk mencoba fitur dasar simulasi SKD',
    badge:       null,
    tier:        'free',
    isCurrent:   false,
    features: [
      'Akses 1 Tryout Gratis',
      'Materi Dasar TIU, TWK, TKP',
      'Akses Roadmap pembelajaran',
    ],
    unavailable: [
      'Analisis Ranking Nasional',
      'Review soal + pembahasan',
      'Statistik & analisis performa',
    ],
  },
  {
    id:          'premium',
    name:        'Premium',
    priceLabel:  'Rp 149rb',
    period:      '6 Bulan',
    description: 'Akses penuh untuk persiapan intensif CPNS 2026',
    badge:       'POPULER',
    tier:        'premium',
    isCurrent:   false,
    features: [
      'Akses 15+ Tryout Premium',
      'Pembahasan Video Lengkap',
      'Analisis Ranking Nasional',
      'Grup Belajar Eksklusif',
    ],
    unavailable: [],
  },
  {
    id:          'platinum',
    name:        'Platinum',
    priceLabel:  'Rp 299rb',
    period:      '12 Bulan',
    description: 'Semua fitur premium + live class & mentoring privat',
    badge:       null,
    tier:        'platinum',
    isCurrent:   false,
    features: [
      'Semua Fitur Premium',
      'Live Class Setiap Minggu',
      'Mentoring Privat 1-on-1',
      'Modul Cetak Dikirim ke Rumah',
    ],
    unavailable: [],
  },
];

// ── Card ──────────────────────────────────────────────────────

function PricingCard({
  pkg,
  isCurrent,
  onSelect,
}: {
  pkg:       PricingPackage;
  isCurrent: boolean;
  onSelect:  () => void;
}) {
  const isPremium  = pkg.tier === 'premium';
  const isPlatinum = pkg.tier === 'platinum';

  const cardCls = cn(
    'rounded-2xl p-6 relative overflow-hidden shadow-md3-sm',
    isPremium
      ? 'bg-md-primary text-white shadow-md3-lg border-2 border-md-secondary-container'
      : 'bg-white',
  );

  const ctaLabel = isCurrent ? 'Paket Aktif' : isPremium ? 'Beli Paket Premium' : isPlatinum ? 'Pilih Platinum' : 'Mulai Belajar';

  const ctaCls = cn(
    'w-full py-4 rounded-xl font-bold text-sm active-press transition-all',
    isCurrent
      ? 'bg-md-surface-container text-md-on-surface-variant cursor-default'
      : isPremium
      ? 'bg-md-secondary-container text-md-primary'
      : isPlatinum
      ? 'bg-md-primary text-white'
      : 'bg-md-surface-container-low text-md-primary',
  );

  return (
    <div className={cardCls}>
      {/* Popular badge */}
      {pkg.badge && (
        <div className="absolute top-4 right-[-35px] bg-md-secondary-container text-md-on-secondary-container text-[10px] font-bold py-1 px-10 rotate-45">
          {pkg.badge}
        </div>
      )}

      {/* Tier label */}
      <div className="mb-6">
        <span className={cn(
          'inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full mb-3',
          isPremium
            ? 'bg-md-secondary/20 text-md-secondary-container'
            : isPlatinum
            ? 'bg-md-secondary/10 text-md-secondary'
            : 'bg-md-surface-container-low text-md-primary',
        )}>
          {pkg.name.toUpperCase()}
        </span>
        <h3 className={cn('text-2xl font-bold', isPremium ? 'text-white' : 'text-md-primary')}
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          {pkg.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className={cn('text-3xl font-extrabold', isPremium ? 'text-md-secondary-container' : 'text-md-primary')}
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {pkg.priceLabel}
          </span>
          <span className={cn('text-xs', isPremium ? 'text-white/60' : 'text-md-on-surface-variant')}>
            /{pkg.period}
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {pkg.features.map(f => (
          <li key={f} className="flex items-start gap-3">
            <Check size={16} className={cn('mt-0.5 flex-shrink-0', isPremium ? 'text-md-secondary-container' : 'text-md-secondary')} />
            <span className={cn('text-sm', isPremium ? 'text-white/90' : 'text-md-on-surface-variant')}>
              {f}
            </span>
          </li>
        ))}
        {pkg.unavailable.map(f => (
          <li key={f} className="flex items-start gap-3 opacity-40">
            <X size={16} className="mt-0.5 flex-shrink-0 text-md-outline" />
            <span className="text-sm text-md-on-surface-variant line-through">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={isCurrent ? undefined : onSelect}
        className={ctaCls}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

export function MobilePaketBelajar({ userTier, onSelectPkg }: MobilePaketBelajarProps) {
  return (
    <main className="pb-32 px-6 py-8">

      {/* ── Page Headline ─────────────────────────────────────── */}
      <section className="mb-10">
        <h1 className="text-3xl font-extrabold text-md-primary mb-2 tracking-tight"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Paket Belajar
        </h1>
        <p className="text-md-on-surface-variant text-sm leading-relaxed">
          Pilih paket terbaik untuk memaksimalkan persiapan CPNS Anda bersama mentor ahli.
        </p>
      </section>

      {/* ── Pricing Cards ─────────────────────────────────────── */}
      <div className="flex flex-col gap-8">
        {PACKAGES.map(pkg => (
          <PricingCard
            key={pkg.id}
            pkg={pkg}
            isCurrent={userTier === pkg.tier}
            onSelect={() => onSelectPkg(pkg.tier)}
          />
        ))}
      </div>

      {/* ── Trust Section ─────────────────────────────────────── */}
      <section className="mt-12 bg-md-surface-container-low rounded-2xl p-6">
        <h4 className="text-lg font-bold text-md-primary mb-4"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Kenapa Upgrade?
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '🛡️', label: 'Materi Terupdate 2026' },
            { icon: '⚡', label: 'Simulasi CAT Real-time' },
            { icon: '📊', label: 'Analisis Performa AI' },
            { icon: '👥', label: 'Komunitas 10.000+ Peserta' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col gap-2">
              <span className="text-2xl">{icon}</span>
              <p className="text-xs font-semibold text-md-on-surface">{label}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
