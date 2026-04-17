'use client';

// components/mobile/MobilePaketBelajar.tsx
// Mobile-only paket belajar (pricing) — Pathfinder Navy MD3 design

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, ShoppingBag, History, PackageCheck, Star, Copy, CheckCheck, Loader2 } from 'lucide-react';
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

// ── Feature Matrix ────────────────────────────────────────────

interface MatrixRow {
  feature:  string;
  free:     boolean | string;
  premium:  boolean | string;
  platinum: boolean | string;
}

const FEATURE_MATRIX: MatrixRow[] = [
  { feature: 'Tryout Gratis',           free: true,     premium: true,    platinum: true     },
  { feature: 'Tryout Premium',          free: false,    premium: true,    platinum: true     },
  { feature: 'Tryout Platinum',         free: false,    premium: false,   platinum: true     },
  { feature: 'Materi SKD Dasar',        free: true,     premium: true,    platinum: true     },
  { feature: 'Materi SKD Lengkap',      free: false,    premium: true,    platinum: true     },
  { feature: 'Video Pembahasan',        free: false,    premium: true,    platinum: true     },
  { feature: 'Riwayat Tryout',          free: '3 terakhir', premium: true, platinum: true   },
  { feature: 'Statistik Performa',      free: false,    premium: true,    platinum: true     },
  { feature: 'Peringkat Nasional',      free: false,    premium: true,    platinum: true     },
  { feature: 'Live Class Mingguan',     free: false,    premium: false,   platinum: true     },
  { feature: 'Mentoring Privat 1-on-1', free: false,    premium: false,   platinum: true     },
  { feature: 'Modul Cetak',            free: false,    premium: false,   platinum: true     },
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

// ── History Item Type ─────────────────────────────────────────

interface HistoryItem {
  id:           string;
  orderId:      string;
  name:         string;
  method:       string;
  methodDetail: string | null;
  date:         string;
  status:       string;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  SETTLEMENT: 'bg-emerald-100 text-emerald-700',
  SUCCESS:    'bg-emerald-100 text-emerald-700',
  FAILED:     'bg-red-100 text-red-600',
  EXPIRED:    'bg-md-surface-container text-md-on-surface-variant',
  CANCEL:     'bg-md-surface-container text-md-on-surface-variant',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu', SETTLEMENT: 'Lunas', SUCCESS: 'Lunas',
  FAILED: 'Gagal', EXPIRED: 'Kadaluarsa', CANCEL: 'Dibatalkan',
};

// ── Riwayat Tab ───────────────────────────────────────────────

function RiwayatPembayaranTab() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payment/history')
      .then(r => r.json())
      .then(d => { if (d.orders) setHistory(d.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-md-primary" />
    </div>
  );

  if (history.length === 0) return (
    <div className="text-center py-16">
      <History size={40} className="mx-auto mb-3 text-md-outline-variant" />
      <p className="text-md-on-surface-variant text-sm">Belum ada riwayat transaksi.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {history.map(item => (
        <div key={item.id} className="bg-white rounded-2xl p-5 shadow-md3-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-md-on-surface text-sm truncate">{item.name}</p>
              <button
                onClick={() => handleCopy(item.orderId)}
                className="flex items-center gap-1.5 text-xs text-md-on-surface-variant mt-1 active-press"
              >
                {copied === item.orderId
                  ? <CheckCheck size={11} className="text-emerald-500" />
                  : <Copy size={11} />
                }
                #{item.orderId}
              </button>
            </div>
            <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full ml-2 flex-shrink-0', STATUS_STYLE[item.status.toUpperCase()] ?? STATUS_STYLE.PENDING)}>
              {STATUS_LABEL[item.status.toUpperCase()] ?? item.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-md-on-surface-variant">
            <span>{item.method}</span>
            <span>{new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          {(item.status.toUpperCase() === 'PENDING') && (
            <Link href={`/pembayaran/${item.orderId}`} className="block mt-3">
              <button className="w-full py-2.5 bg-md-secondary-container text-md-primary text-xs font-bold rounded-xl active-press">
                Lanjutkan Pembayaran
              </button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Paket Aktif Tab ───────────────────────────────────────────

function PaketAktifTab({ userTier }: { userTier: SubscriptionTier }) {
  const tierName  = { free: 'Gratis', premium: 'Premium', platinum: 'Platinum' }[userTier];
  const tierColor = {
    free:     'border-md-outline-variant/20 bg-md-surface-container-low',
    premium:  'border-blue-200 bg-blue-50',
    platinum: 'border-purple-200 bg-purple-50',
  }[userTier];
  const features  = {
    free:     ['Tryout paket gratis', 'Akses Roadmap pembelajaran', 'Akses materi dasar'],
    premium:  ['Tryout paket gratis & premium', 'Latihan Soal SKD / Mini Try Out', 'Review soal + pembahasan lengkap', 'Materi SKD lengkap (TWK, TIU, TKP)', 'Akses Riwayat (3 terbaru)', 'Statistik & analisis performa', 'Peringkat nasional'],
    platinum: ['Semua fitur Premium', 'Akses Riwayat tidak terbatas', 'Tryout paket platinum eksklusif', 'Materi platinum + video series SKD', 'Analisis soal dengan waktu pengerjaan terlama', 'Masa aktif 1 tahun'],
  }[userTier];

  return (
    <div className="space-y-5">
      <div className={cn('rounded-2xl p-6 border-2', tierColor)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-md-on-surface">Paket Aktif</h3>
          <span className={cn(
            'text-xs font-black px-3 py-1 rounded-full',
            userTier === 'platinum' ? 'bg-purple-100 text-purple-700' :
            userTier === 'premium'  ? 'bg-blue-100 text-blue-700'     :
            'bg-emerald-100 text-emerald-700',
          )}>
            {tierName.toUpperCase()}
          </span>
        </div>
        <ul className="space-y-2.5">
          {features.map(f => (
            <li key={f} className="flex items-start gap-2">
              <Check size={14} className="text-md-secondary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-md-on-surface-variant">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      {userTier === 'free' && (
        <Link href="/beli-paket#beli">
          <button className="w-full bg-md-primary text-white font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 active-press shadow-md3-sm">
            <Star size={16} fill="currentColor" />
            Upgrade Sekarang
          </button>
        </Link>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

type Tab = 'beli' | 'riwayat' | 'aktif';

export function MobilePaketBelajar({ userTier, onSelectPkg }: MobilePaketBelajarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('beli');

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'beli',    label: 'Beli',    icon: <ShoppingBag size={14} /> },
    { id: 'riwayat', label: 'Riwayat', icon: <History size={14} /> },
    { id: 'aktif',   label: 'Aktif',   icon: <PackageCheck size={14} /> },
  ];

  return (
    <main className="pb-32 px-6 py-6">

      {/* ── Page Headline ─────────────────────────────────────── */}
      <section className="mb-6">
        <h1 className="text-3xl font-extrabold text-md-primary mb-2 tracking-tight"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Paket Belajar
        </h1>
        <p className="text-md-on-surface-variant text-sm leading-relaxed">
          Pilih paket terbaik untuk memaksimalkan persiapan CPNS Anda.
        </p>
      </section>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="bg-md-surface-container-low rounded-2xl p-1.5 flex gap-1 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs transition-all active-press',
              activeTab === tab.id
                ? 'bg-white text-md-primary shadow-md3-sm'
                : 'text-md-on-surface-variant',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Beli Tab ──────────────────────────────────────────── */}
      {activeTab === 'beli' && (
        <>
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

          {/* Feature Matrix */}
          <section className="mt-10">
            <h4 className="text-lg font-bold text-md-primary mb-4"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              Perbandingan Fitur
            </h4>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[340px] text-left border-collapse">
                <thead>
                  <tr>
                    <th className="text-[11px] font-bold text-md-on-surface-variant pb-3 pr-3 w-[44%]">Fitur</th>
                    {(['Gratis', 'Premium', 'Platinum'] as const).map(tier => (
                      <th key={tier} className={cn(
                        'text-[11px] font-black pb-3 text-center w-[18%]',
                        tier === 'Premium'  ? 'text-md-primary' :
                        tier === 'Platinum' ? 'text-purple-600' :
                        'text-md-on-surface-variant',
                      )}>
                        {tier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-md-outline-variant/10">
                  {FEATURE_MATRIX.map(row => (
                    <tr key={row.feature} className="bg-white odd:bg-md-surface-container-low/30">
                      <td className="py-3 pr-3 text-xs text-md-on-surface leading-snug rounded-l-lg">
                        {row.feature}
                      </td>
                      {(['free', 'premium', 'platinum'] as const).map(tier => (
                        <td key={tier} className="py-3 text-center rounded-r-lg">
                          {row[tier] === true ? (
                            <Check size={15} className={cn(
                              'mx-auto',
                              tier === 'premium'  ? 'text-md-primary' :
                              tier === 'platinum' ? 'text-purple-500' :
                              'text-emerald-500',
                            )} />
                          ) : row[tier] === false ? (
                            <span className="inline-block w-3 h-0.5 bg-md-outline-variant/40 rounded-full mx-auto" />
                          ) : (
                            <span className="text-[10px] font-bold text-md-on-surface-variant leading-tight block px-1">
                              {row[tier]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Trust Section */}
          <section className="mt-10 bg-md-surface-container-low rounded-2xl p-6">
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
        </>
      )}

      {/* ── Riwayat Tab ───────────────────────────────────────── */}
      {activeTab === 'riwayat' && <RiwayatPembayaranTab />}

      {/* ── Paket Aktif Tab ───────────────────────────────────── */}
      {activeTab === 'aktif' && <PaketAktifTab userTier={userTier} />}

    </main>
  );
}
