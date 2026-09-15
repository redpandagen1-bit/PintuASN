'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { MobilePaketBelajar } from '@/components/mobile/MobilePaketBelajar';
import type { SubscriptionTier } from '@/lib/subscription-utils';
import {
  Check, Zap, Shield, Crown, ArrowRight, Loader2,
  ShoppingBag, History, PackageCheck,
  X, Lock,
} from 'lucide-react';
import {
  OrderDetailPopup,
  STATUS_STYLE, STATUS_LABEL,
  formatRupiah,
} from '@/components/payment/OrderDetailPopup';

// ─── Master feature list ──────────────────────────────────────────────────────

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
  { label: 'Materi Platinum',               free: false, premium: false, platinum: true  },
  { label: 'Analisis soal dengan waktu pengerjaan terlama',    free: false, premium: false, platinum: true  },
  { label: 'Laporan perkembangan belajar',                     free: false, premium: false, platinum: true  },
  { label: 'Masa aktif 1 tahun',                               free: false, premium: false, platinum: true  },
];

const SECTION_LABELS: Record<number, string> = {
  0:  'Fitur Dasar',
  3:  'Fitur Premium',
  11: 'Fitur Platinum',
};

// ─── Package definitions ──────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    originalPrice: null as number | null,
    priceLabel: 'Rp 0',
    // Harga upgrade: harga asli premium - harga premium yang sudah dibayar
    upgradePrice: null as number | null,
    upgradePriceLabel: null as string | null,
    period: 'Selamanya',
    description: 'Cocok untuk mencoba fitur dasar simulasi SKD',
    icon: Shield,
    badge: null as string | null,
    ctaDefault: 'Pakai Gratis',
    isFree: true, isPremium: false, isPlatinum: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99000,
    originalPrice: 200000 as number | null,
    priceLabel: 'Rp 99.000',
    upgradePrice: null as number | null,
    upgradePriceLabel: null as string | null,
    period: 'Masa aktif 6 bulan',
    description: 'Akses penuh untuk persiapan SKD CPNS 2026',
    icon: Zap,
    badge: 'Populer' as string | null,
    ctaDefault: 'Mulai Premium',
    isFree: false, isPremium: true, isPlatinum: false,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 119000,
    originalPrice: 349000 as number | null,
    priceLabel: 'Rp 119.000',
    // Harga upgrade dari premium ke platinum
    upgradePrice: 29000,
    upgradePriceLabel: 'Rp 29.000',
    period: 'Masa aktif 1 tahun',
    description: 'Paket lengkap dengan fitur eksklusif & prioritas',
    icon: Crown,
    badge: 'Terlengkap' as string | null,
    ctaDefault: 'Mulai Platinum',
    isFree: false, isPremium: false, isPlatinum: true,
  },
];

const PACKAGE_FEATURES: Record<string, string[]> = {
  free:     ['Tryout paket gratis', 'Akses Roadmap pembelajaran', 'Akses materi dasar'],
  premium:  ['Tryout paket gratis & premium', 'Latihan Soal SKD / Mini Try Out', 'Review soal + pembahasan lengkap', 'Materi SKD lengkap (TWK, TIU, TKP)', 'Akses Riwayat (3 terbaru)', 'Statistik & analisis performa', 'Peringkat nasional', 'Leaderboard paket'],
  platinum: ['Semua fitur Premium', 'Akses Riwayat tidak terbatas', 'Tryout paket platinum eksklusif', 'Materi Platinum', 'Analisis soal dengan waktu pengerjaan terlama', 'Laporan perkembangan belajar', 'Masa aktif 1 tahun'],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = 'free' | 'premium' | 'platinum';

interface HistoryItem {
  id: string; orderId: string; name: string;
  method: string; methodDetail: string | null; date: string; status: string;
}

// ─── Order Detail Popup dipindah ke components/payment/OrderDetailPopup.tsx ──
// ─── Feature Icon ─────────────────────────────────────────────────────────────

function FeatureIcon({ has, isPremium, isPlatinum }: { has: boolean; isPremium: boolean; isPlatinum: boolean }) {
  if (has) return (
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
      ${isPlatinum ? 'bg-amber-400/25' : isPremium ? 'bg-yellow-400/20' : 'bg-emerald-100'}`}>
      <Check size={11} className={isPlatinum ? 'text-amber-300' : isPremium ? 'text-yellow-400' : 'text-emerald-600'} strokeWidth={3} />
    </div>
  );
  return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-black/10">
      <X size={10} className={isPremium || isPlatinum ? 'text-white/30' : 'text-slate-400'} strokeWidth={2.5} />
    </div>
  );
}

// ─── Tab: Beli Paket ──────────────────────────────────────────────────────────

function BeliPaketTab({ onError, userTier }: { onError: (msg: string | null) => void; userTier: Tier }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [subInfo, setSubInfo] = useState<string | null>(null);

  const isPremiumUser  = userTier === 'premium';
  const isPlatinumUser = userTier === 'platinum';
  const currentTierName = userTier === 'platinum' ? 'Platinum' : userTier === 'premium' ? 'Premium' : 'Gratis';

  const handleBuy = async (pkg: typeof PACKAGES[0]) => {
    if (pkg.isFree) { router.push('/dashboard'); return; }
    setLoadingId(pkg.id);
    onError(null);
    try {
      const res  = await fetch('/api/payment/charge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ package_id: pkg.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi');
      if (data.redirectUrl) router.push(data.redirectUrl);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setLoadingId(null);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {PACKAGES.map((pkg) => {
        const Icon = pkg.icon;

        // ── Derive per-card state based on userTier ──────────────────────────
        // Is this card's tier already owned by the user?
        const isOwned =
          (pkg.isFree && (isPremiumUser || isPlatinumUser)) ||
          (pkg.isPremium && isPremiumUser) ||
          isPlatinumUser;

        // For platinum card when user is premium: show upgrade pricing
        const showUpgradePrice = pkg.isPlatinum && isPremiumUser;

        // CTA label
        const ctaLabel = (() => {
          if (pkg.isFree     && (isPremiumUser || isPlatinumUser)) return 'Paket Aktif';
          if (pkg.isPremium  && isPremiumUser)                      return 'Paket Aktif';
          if (pkg.isPlatinum && isPlatinumUser)                     return 'Paket Aktif';
          if (pkg.isPlatinum && isPremiumUser)                      return 'Upgrade Platinum';
          return pkg.ctaDefault;
        })();

        // Displayed price (upgrade vs original)
        const displayPrice     = showUpgradePrice ? pkg.upgradePrice!  : pkg.price;
        const displayPriceLabel = showUpgradePrice ? pkg.upgradePriceLabel! : pkg.priceLabel;
        const displayOriginal  = showUpgradePrice ? pkg.priceLabel     : pkg.originalPrice ? formatRupiah(pkg.originalPrice) : null;

        // Button disabled? Only if card is already the user's exact tier OR user is platinum
        const isDisabled =
          loadingId === pkg.id ||
          isOwned ||
          (isPlatinumUser && !pkg.isPlatinum); // disable free & premium for platinum users

        return (
          <div key={pkg.id} className={`relative rounded-2xl flex flex-col border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
            ${pkg.isPremium  ? 'bg-blue-600 border-blue-500 shadow-blue-200 shadow-lg' : ''}
            ${pkg.isPlatinum ? 'bg-gradient-to-br from-violet-900 via-purple-800 to-slate-900 border-violet-700' : ''}
            ${pkg.isFree     ? 'bg-white border-slate-200' : ''}
          `}>

            {/* Badge */}
            {pkg.badge && (
              <div className={`absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap z-10 tracking-wide shadow-sm
                ${pkg.isPremium ? 'bg-yellow-400 text-slate-900' : 'bg-amber-400 text-slate-900'}`}>
                {pkg.badge}
              </div>
            )}

            {/* "Sudah Aktif" ribbon for owned tiers */}
            {isOwned && !showUpgradePrice && (
              <div className={`absolute top-3 right-3 z-10 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full
                ${pkg.isPlatinum ? 'bg-amber-400 text-slate-900' : pkg.isPremium ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                <Check size={10} strokeWidth={3} /> Aktif
              </div>
            )}

            {/* Card header */}
            <div className={`p-5 pb-3 ${pkg.badge ? 'mt-6' : 'mt-1'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-amber-400' : 'bg-slate-100'}`}>
                  <Icon size={18} className={pkg.isPlatinum ? 'text-slate-900' : pkg.isPremium ? 'text-white' : 'text-slate-600'} />
                </div>
                <div>
                  <p className={`font-bold text-base leading-tight ${pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-900'}`}>{pkg.name}</p>
                  <p className={`text-xs ${pkg.isPremium ? 'text-blue-100' : pkg.isPlatinum ? 'text-slate-400' : 'text-slate-400'}`}>{pkg.period}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                {/* Strikethrough: show original full price when showing upgrade price */}
                {displayOriginal && (
                  <p className={`text-sm line-through mb-0.5 ${pkg.isPremium ? 'text-blue-200' : pkg.isPlatinum ? 'text-slate-500' : 'text-slate-400'}`}>
                    {displayOriginal}
                  </p>
                )}
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-900'}`}>
                    {displayPrice === 0 ? 'Gratis' : displayPriceLabel}
                  </p>
                  {/* "upgrade price" badge */}
                  {showUpgradePrice && (
                    <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Harga Upgrade
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${pkg.isPremium ? 'text-blue-100' : pkg.isPlatinum ? 'text-slate-400' : 'text-slate-400'}`}>
                  {showUpgradePrice ? 'Upgrade dari paket Premium' : pkg.description}
                </p>
              </div>

              <div className={`h-px ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-violet-700' : 'bg-slate-100'}`} />
            </div>

            {/* Feature list */}
            <div className="flex-1 px-5 pb-2 space-y-0">
              {ALL_FEATURES.map((feature, i) => {
                const hasFeature = pkg.isFree ? feature.free : pkg.isPremium ? feature.premium : feature.platinum;
                const sectionLabel = SECTION_LABELS[i];
                return (
                  <div key={i}>
                    {sectionLabel && (
                      <p className={`text-[9px] font-black uppercase tracking-widest pt-3 pb-1.5
                        ${pkg.isPremium ? 'text-blue-200/60' : pkg.isPlatinum ? 'text-purple-400' : 'text-slate-400'}`}>
                        {sectionLabel}
                      </p>
                    )}
                    <div className={`flex items-start gap-2.5 py-1 ${!hasFeature ? 'opacity-35' : ''}`}>
                      <div className="mt-0.5">
                        <FeatureIcon has={hasFeature} isPremium={pkg.isPremium} isPlatinum={pkg.isPlatinum} />
                      </div>
                      <span className={`text-xs leading-snug
                        ${!hasFeature
                          ? (pkg.isPremium || pkg.isPlatinum ? 'text-white/40 line-through' : 'text-slate-400 line-through')
                          : (pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-700')
                        }`}>
                        {feature.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="p-5 pt-3">
              <div className={`h-px mb-3 ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-violet-700' : 'bg-slate-100'}`} />
              <button
                onClick={() => {
                  if (loadingId === pkg.id) return;
                  if (isOwned) { setSubInfo(`Anda telah berlangganan paket ${currentTierName}.`); return; }
                  handleBuy(pkg);
                }}
                disabled={loadingId === pkg.id}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                  ${pkg.isPremium  ? 'bg-white text-blue-600 hover:bg-blue-50' : ''}
                  ${pkg.isPlatinum ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' : ''}
                  ${pkg.isFree     ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : ''}
                  ${isOwned && !showUpgradePrice ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {loadingId === pkg.id
                  ? <Loader2 size={15} className="animate-spin" />
                  : isOwned && !showUpgradePrice
                  ? <><Lock size={13} /> {ctaLabel}</>
                  : <>{ctaLabel} <ArrowRight size={14} /></>
                }
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Popup: sudah berlangganan */}
    {subInfo && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={() => setSubInfo(null)}
      >
        <div
          className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <Crown size={24} className="text-blue-600" />
          </div>
          <p className="font-bold text-slate-800 mb-1">Sudah Berlangganan</p>
          <p className="text-sm text-slate-500 mb-4">{subInfo}</p>
          <button
            onClick={() => setSubInfo(null)}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition"
          >
            Mengerti
          </button>
        </div>
      </div>
    )}
    </>
  );
}

// ─── Tab: Riwayat ─────────────────────────────────────────────────────────────

function RiwayatTab() {
  const [history, setHistory]          = useState<HistoryItem[]>([]);
  const [loading, setLoading]          = useState(true);
  const [selectedOrderId, setSelected] = useState<string | null>(null);

  const fetchHistory = useCallback(() => {
    return fetch('/api/payment/history').then(r => r.json()).then(d => { if (d.orders) setHistory(d.orders); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchHistory().finally(() => setLoading(false));
  }, [fetchHistory]);

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;
  if (!history.length) return <div className="text-center py-16 text-slate-400"><History size={36} className="mx-auto mb-3 opacity-30" /><p className="text-sm">Belum ada riwayat pembelian.</p></div>;

  return (
    <>
      {selectedOrderId && (
        <OrderDetailPopup orderId={selectedOrderId} onClose={() => setSelected(null)} onChanged={fetchHistory} />
      )}
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} onClick={() => setSelected(item.orderId)}
            className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
            <p className="font-bold text-slate-900 text-sm mb-3">{item.name}</p>
            <div className="h-px bg-slate-100 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div><p className="text-xs text-slate-400 mb-1">Metode Pembayaran</p><p className="font-semibold text-slate-800">{item.method || '-'}</p>{item.methodDetail && <p className="text-slate-500 text-xs mt-0.5 font-mono truncate">{item.methodDetail}</p>}</div>
              <div><p className="text-xs text-slate-400 mb-1">Waktu Transaksi</p><p className="font-semibold text-slate-800">{item.date}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Status</p><span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLE[item.status] ?? 'bg-slate-100 text-slate-500'}`}>{STATUS_LABEL[item.status] ?? item.status}</span></div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                Lihat Detail
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Tab: Paket Aktif ─────────────────────────────────────────────────────────

function PaketAktifTab({ userTier }: { userTier: Tier }) {
  const tierName: Record<Tier, string> = { free: 'Gratis', premium: 'Premium', platinum: 'Platinum' };
  const tierColor = { free: 'text-slate-600 bg-slate-100', premium: 'text-blue-600 bg-blue-50', platinum: 'text-amber-700 bg-amber-50' }[userTier];
  const Icon      = { free: Shield, premium: Zap, platinum: Crown }[userTier];
  const features  = PACKAGE_FEATURES[userTier] ?? PACKAGE_FEATURES.free;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tierColor}`}><Icon size={20} /></div>
          <div>
            <p className="font-bold text-slate-900">Paket {tierName[userTier]}</p>
            <p className="text-xs text-slate-400">Aktif selamanya</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${tierColor}`}>AKTIF</span>
        </div>
        <div className="h-px bg-slate-100 mb-4" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Fitur yang tersedia</p>
        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><Check size={14} className="text-green-500 flex-shrink-0" />{f}</li>
          ))}
        </ul>
        {userTier === 'free' && (
          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Upgrade ke <span className="font-bold">Premium</span> atau <span className="font-bold">Platinum</span> untuk akses fitur lengkap SKD CPNS 2026.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'beli' | 'riwayat' | 'aktif';
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'beli',    label: 'Beli Paket',  icon: ShoppingBag  },
  { id: 'riwayat', label: 'Riwayat',     icon: History      },
  { id: 'aktif',   label: 'Paket Aktif', icon: PackageCheck },
];

export default function BeliPaketPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('beli');
  const [error, setError]         = useState<string | null>(null);

  // Dukung deep-link ?tab=riwayat (dipakai redirect setelah popup Snap
  // ditutup/selesai) — baca langsung dari URL, tanpa useSearchParams supaya
  // tidak perlu bungkus <Suspense> di halaman client ini.
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'riwayat' || tab === 'beli' || tab === 'aktif') setActiveTab(tab);
  }, []);
  // Fetch user tier once at page level — passed down as prop, no extra requests
  const [userTier, setUserTier]   = useState<Tier>('free');
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        const tier: Tier = data?.profile?.subscription_tier ?? data?.subscription_tier ?? 'free';
        setUserTier(tier);
      })
      .catch(() => setUserTier('free'))
      .finally(() => setTierLoading(false));
  }, []);

  const handleMobileSelectPkg = useCallback(async (tier: SubscriptionTier) => {
    const pkg = PACKAGES.find(p => p.id === tier);
    if (!pkg || pkg.isFree) { router.push('/dashboard'); return; }
    try {
      const res  = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: pkg.id }),
      });
      const data = await res.json();
      if (data.redirectUrl) router.push(data.redirectUrl);
    } catch { /* handled by charge API */ }
  }, [router]);

  return (
    <>
      {/* ── Mobile ─────────────────────────────────────────────── */}
      <div className="md:hidden">
        {tierLoading
          ? <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-md-primary" /></div>
          : <MobilePaketBelajar userTier={userTier} onSelectPkg={handleMobileSelectPkg} />
        }
      </div>

      {/* ── Desktop ────────────────────────────────────────────── */}
      <div className="hidden md:block min-h-screen bg-slate-50 pt-10 pb-10 px-4">
      <div className="max-w-5xl mx-auto mb-7">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-2xl px-6 py-5 text-center">
          <div className="pointer-events-none absolute -top-10 -right-8 w-28 h-28 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 w-28 h-28 rounded-full bg-amber-400/15 blur-3xl" />
          <h1 className="relative text-xl font-extrabold mb-1" style={{ fontFamily: 'var(--font-jakarta)' }}>
            <span className="text-white">Paket </span><span className="text-yellow-400">Belajar</span>
          </h1>
          <p className="relative text-slate-300 text-sm max-w-md mx-auto">Pilih paket terbaik untuk persiapan SKD CPNS 2026.</p>
        </div>
        {error && <div className="mt-3 text-center"><span className="inline-block bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-lg">{error}</span></div>}
      </div>

      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex w-full sm:w-auto sm:inline-flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setError(null); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden text-xs">{id === 'beli' ? 'Beli' : id === 'riwayat' ? 'Riwayat' : 'Aktif'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Show skeleton while fetching tier to avoid button flicker */}
        {tierLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {activeTab === 'beli'    && <BeliPaketTab onError={setError} userTier={userTier} />}
            {activeTab === 'riwayat' && <RiwayatTab />}
            {activeTab === 'aktif'   && <PaketAktifTab userTier={userTier} />}
          </>
        )}
      </div>
    </div>
    </>
  );
}
