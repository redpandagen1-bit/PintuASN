'use client';

// components/mobile/MobilePaketBelajar.tsx
// Mobile-only paket belajar — mirrors desktop feature list, simplified layout

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, ShoppingBag, History, PackageCheck, Star, Copy, CheckCheck, Loader2, Lock, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';

// ── Feature list (same as desktop) ───────────────────────────

const ALL_FEATURES: { label: string; free: boolean; premium: boolean; platinum: boolean }[] = [
  { label: 'Tryout paket gratis',                              free: true,  premium: true,  platinum: true  },
  { label: 'Akses Roadmap pembelajaran',                       free: true,  premium: true,  platinum: true  },
  { label: 'Akses materi dasar',                               free: true,  premium: true,  platinum: true  },
  { label: 'Tryout paket premium',                             free: false, premium: true,  platinum: true  },
  { label: 'Latihan Soal SKD / Mini Try Out (TWK, TIU, TKP)', free: false, premium: true,  platinum: true  },
  { label: 'Review soal + pembahasan lengkap',                 free: false, premium: true,  platinum: true  },
  { label: 'Materi SKD gratis & premium (TWK, TIU, TKP)',      free: false, premium: true,  platinum: true  },
  { label: 'Akses Riwayat (3 terbaru)',                        free: false, premium: true,  platinum: true  },
  { label: 'Statistik & analisis performa',                    free: false, premium: true,  platinum: true  },
  { label: 'Peringkat nasional',                               free: false, premium: true,  platinum: true  },
  { label: 'Leaderboard paket',                                free: false, premium: true,  platinum: true  },
  { label: 'Akses Riwayat tidak terbatas',                     free: false, premium: false, platinum: true  },
  { label: 'Tryout paket platinum eksklusif',                  free: false, premium: false, platinum: true  },
  { label: 'Materi platinum + video series SKD',               free: false, premium: false, platinum: true  },
  { label: 'Analisis soal dengan waktu pengerjaan terlama',    free: false, premium: false, platinum: true  },
  { label: 'Laporan perkembangan belajar',                     free: false, premium: false, platinum: true  },
  { label: 'Masa aktif 1 tahun',                               free: false, premium: false, platinum: true  },
];

const SECTION_LABELS: Record<number, string> = {
  0:  'Fitur Dasar',
  3:  'Fitur Premium',
  11: 'Fitur Platinum',
};

// ── Package definitions (matches desktop pricing) ─────────────

interface MobilePackage {
  id:            string;
  name:          string;
  tier:          SubscriptionTier;
  priceLabel:    string;
  originalPrice: string | null;
  period:        string;
  description:   string;
  badge:         string | null;
  isFree:        boolean;
  isPremium:     boolean;
  isPlatinum:    boolean;
  ctaDefault:    string;
}

const PACKAGES: MobilePackage[] = [
  {
    id: 'free', name: 'Gratis', tier: 'free',
    priceLabel: 'Rp 0', originalPrice: null,
    period: 'Selamanya',
    description: 'Cocok untuk mencoba fitur dasar simulasi SKD',
    badge: null,
    isFree: true, isPremium: false, isPlatinum: false,
    ctaDefault: 'Mulai Belajar',
  },
  {
    id: 'premium', name: 'Premium', tier: 'premium',
    priceLabel: 'Rp 99.000', originalPrice: 'Rp 200.000',
    period: 'Hingga November 2026',
    description: 'Akses penuh untuk persiapan SKD CPNS 2026',
    badge: 'Populer',
    isFree: false, isPremium: true, isPlatinum: false,
    ctaDefault: 'Mulai Premium',
  },
  {
    id: 'platinum', name: 'Platinum', tier: 'platinum',
    priceLabel: 'Rp 119.000', originalPrice: 'Rp 349.000',
    period: 'Masa aktif 1 tahun',
    description: 'Paket lengkap dengan fitur eksklusif & prioritas',
    badge: 'Terlengkap',
    isFree: false, isPremium: false, isPlatinum: true,
    ctaDefault: 'Mulai Platinum',
  },
];

// ── Pricing Card ──────────────────────────────────────────────

function PricingCard({
  pkg,
  isCurrent,
  onSelect,
}: {
  pkg:       MobilePackage;
  isCurrent: boolean;
  onSelect:  () => void;
}) {
  const { isFree, isPremium, isPlatinum } = pkg;
  const [open, setOpen] = useState(false);
  const accent = isPremium || isPlatinum; // teks terang di atas bg berwarna

  const cardBg = isPremium
    ? 'bg-sky-600 border-sky-500'
    : isPlatinum
    ? 'bg-gradient-to-br from-violet-900 via-purple-800 to-slate-900 border-violet-700'
    : 'bg-white border-slate-200';

  const subText = isPremium ? 'text-sky-100' : isPlatinum ? 'text-purple-300' : 'text-slate-400';
  const ctaLabel = isCurrent ? 'Paket Aktif' : pkg.ctaDefault;

  const ctaCls = cn(
    'w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active-press',
    isCurrent
      ? (accent ? 'bg-white/15 text-white/60 cursor-default' : 'bg-slate-100 text-slate-400 cursor-default')
      : isPremium
      ? 'bg-white text-sky-600 hover:bg-sky-50'
      : isPlatinum
      ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
      : 'bg-slate-900 text-white hover:bg-slate-800',
  );

  return (
    <div className={cn('relative rounded-2xl border shadow-sm overflow-hidden', cardBg)}>
      <div className="p-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={cn('font-extrabold text-sm leading-tight', accent ? 'text-white' : 'text-slate-900')}>
                {pkg.name}
              </p>
              {pkg.badge && (
                <span className={cn(
                  'text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wider',
                  isPremium ? 'bg-white text-sky-600' : 'bg-amber-400 text-slate-900',
                )}>
                  {pkg.badge.toUpperCase()}
                </span>
              )}
            </div>
            <p className={cn('text-[11px] mt-0.5', subText)}>{pkg.period}</p>
          </div>
          {isCurrent && (
            <span className={cn(
              'shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
              isPlatinum ? 'bg-amber-400 text-slate-900' : isPremium ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700',
            )}>
              <Check size={8} strokeWidth={3} /> Aktif
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-0.5">
          <p className={cn('text-xl font-extrabold leading-none', accent ? 'text-white' : 'text-slate-900')}>
            {pkg.priceLabel === 'Rp 0' ? 'Gratis' : pkg.priceLabel}
          </p>
          {pkg.originalPrice && (
            <p className={cn('text-[11px] line-through pb-0.5', subText)}>{pkg.originalPrice}</p>
          )}
        </div>
        <p className={cn('text-[11px] leading-snug mb-3', subText)}>{pkg.description}</p>

        {/* CTA */}
        <button onClick={isCurrent ? undefined : onSelect} disabled={isCurrent} className={ctaCls}>
          {isCurrent
            ? <><Lock size={12} /> {ctaLabel}</>
            : <>{ctaLabel} <ArrowRight size={12} /></>
          }
        </button>

        {/* Toggle benefit (dropdown) */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className={cn(
            'w-full mt-3 pt-3 border-t flex items-center justify-between text-[11px] font-bold active-press',
            accent ? 'text-white/90 border-white/15' : 'text-slate-600 border-slate-100',
          )}
        >
          <span>{open ? 'Sembunyikan fitur' : 'Lihat fitur & benefit'}</span>
          <ChevronDown size={15} className={cn('transition-transform duration-300', open && 'rotate-180')} />
        </button>

        {/* Feature list */}
        {open && (
          <div className="mt-1.5 space-y-0">
            {ALL_FEATURES.map((feature, i) => {
              const hasFeature = isFree ? feature.free : isPremium ? feature.premium : feature.platinum;
              const sectionLabel = SECTION_LABELS[i];
              return (
                <div key={i}>
                  {sectionLabel && (
                    <p className={cn(
                      'text-[8px] font-black uppercase tracking-widest pt-2.5 pb-1',
                      isPremium ? 'text-sky-200/60' : isPlatinum ? 'text-purple-400' : 'text-slate-400',
                    )}>
                      {sectionLabel}
                    </p>
                  )}
                  <div className={cn('flex items-start gap-2 py-0.5', !hasFeature && 'opacity-35')}>
                    <div className="mt-0.5 shrink-0">
                      {hasFeature ? (
                        <div className={cn(
                          'w-3.5 h-3.5 rounded-full flex items-center justify-center',
                          isPlatinum ? 'bg-amber-400/25' : isPremium ? 'bg-white/20' : 'bg-emerald-100',
                        )}>
                          <Check size={8} strokeWidth={3} className={isPlatinum ? 'text-amber-300' : isPremium ? 'text-white' : 'text-emerald-600'} />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-black/10">
                          <X size={7} strokeWidth={2.5} className={accent ? 'text-white/30' : 'text-slate-400'} />
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      'text-[11px] leading-snug',
                      !hasFeature
                        ? (accent ? 'text-white/40 line-through' : 'text-slate-400 line-through')
                        : (accent ? 'text-white' : 'text-slate-700'),
                    )}>
                      {feature.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
  EXPIRED:    'bg-slate-100 text-slate-500',
  CANCEL:     'bg-slate-100 text-slate-500',
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
        <div key={item.id} className="bg-white rounded-2xl p-5 shadow-md3-sm border border-slate-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
              <button
                onClick={() => handleCopy(item.orderId)}
                className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 active-press"
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
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{item.method}</span>
            <span>{new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          {item.status.toUpperCase() === 'PENDING' && (
            <Link href={`/pembayaran/${item.orderId}`} className="block mt-3">
              <button className="w-full py-2.5 bg-sky-50 text-sky-600 text-xs font-bold rounded-xl active-press border border-sky-100">
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
    free:     'border-slate-200 bg-slate-50',
    premium:  'border-sky-200 bg-sky-50',
    platinum: 'border-violet-200 bg-violet-50',
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
          <h3 className="font-bold text-slate-800">Paket Aktif</h3>
          <span className={cn(
            'text-xs font-black px-3 py-1 rounded-full',
            userTier === 'platinum' ? 'bg-violet-100 text-violet-700' :
            userTier === 'premium'  ? 'bg-sky-100 text-sky-700'       :
            'bg-emerald-100 text-emerald-700',
          )}>
            {tierName.toUpperCase()}
          </span>
        </div>
        <ul className="space-y-2.5">
          {features.map(f => (
            <li key={f} className="flex items-start gap-2">
              <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      {userTier === 'free' && (
        <button className="w-full bg-sky-600 text-white font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 active-press shadow-sm">
          <Star size={16} fill="currentColor" />
          Upgrade Sekarang
        </button>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

type Tab = 'beli' | 'riwayat' | 'aktif';

interface MobilePaketBelajarProps {
  userTier:    SubscriptionTier;
  onSelectPkg: (tier: SubscriptionTier) => void;
}

export function MobilePaketBelajar({ userTier, onSelectPkg }: MobilePaketBelajarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('beli');

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'beli',    label: 'Beli',    icon: <ShoppingBag size={14} /> },
    { id: 'riwayat', label: 'Riwayat', icon: <History size={14} /> },
    { id: 'aktif',   label: 'Paket Aktif', icon: <PackageCheck size={14} /> },
  ];

  return (
    <main className="px-4 pt-4 pb-28">

      {/* ── Page Headline ─────────────────────────────────────── */}
      <section className="mb-5">
        <div className="bg-slate-800 rounded-2xl px-5 py-4">
          <h1 className="text-xl font-extrabold mb-0.5 tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
            <span className="text-white">Paket </span><span className="text-yellow-400">Belajar</span>
          </h1>
          <p className="text-slate-300 text-sm">
            Pilih paket terbaik untuk persiapan SKD CPNS 2026.
          </p>
        </div>
      </section>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="bg-slate-100 rounded-xl p-1 flex gap-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all active-press',
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Beli Tab ──────────────────────────────────────────── */}
      {activeTab === 'beli' && (
        <div className="flex flex-col gap-6">
          {PACKAGES.map(pkg => (
            <PricingCard
              key={pkg.id}
              pkg={pkg}
              isCurrent={userTier === pkg.tier}
              onSelect={() => onSelectPkg(pkg.tier)}
            />
          ))}
        </div>
      )}

      {/* ── Riwayat Tab ───────────────────────────────────────── */}
      {activeTab === 'riwayat' && <RiwayatPembayaranTab />}

      {/* ── Paket Aktif Tab ───────────────────────────────────── */}
      {activeTab === 'aktif' && <PaketAktifTab userTier={userTier} />}

    </main>
  );
}
