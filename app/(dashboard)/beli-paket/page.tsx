'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, Zap, Shield, Crown, ArrowRight, Loader2,
  ShoppingBag, History, PackageCheck, Copy, CheckCheck, ExternalLink,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    priceLabel: 'Rp 0',
    period: 'Selamanya',
    description: 'Cocok untuk mencoba fitur dasar simulasi SKD',
    icon: Shield,
    badge: null,
    features: [
      '10 soal latihan per hari',
      'Akses materi dasar',
      'Statistik terbatas',
      'Tidak ada simulasi penuh',
      'Tidak ada pembahasan lengkap',
    ],
    disabledFeatures: [2, 3, 4],
    cta: 'Pakai Gratis',
    isFree: true, isPremium: false, isPlatinum: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 149000,
    priceLabel: 'Rp 149.000',
    period: 'Hingga November 2026',
    description: 'Akses penuh untuk persiapan SKD CPNS 2026',
    icon: Zap,
    badge: 'Populer',
    features: [
      'Soal latihan tidak terbatas',
      'Akses semua materi lengkap',
      'Statistik & analisis performa',
      'Simulasi ujian penuh SKD',
      'Pembahasan setiap soal',
      'Leaderboard & ranking',
    ],
    disabledFeatures: [],
    cta: 'Mulai Premium',
    isFree: false, isPremium: true, isPlatinum: false,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 249000,
    priceLabel: 'Rp 249.000',
    period: 'Hingga November 2026',
    description: 'Paket lengkap dengan fitur eksklusif & prioritas',
    icon: Crown,
    badge: 'Terlengkap',
    features: [
      'Semua fitur Premium',
      'Live class & webinar eksklusif',
      'Konsultasi dengan mentor',
      'Grup belajar khusus Platinum',
      'Roadmap belajar personal',
      'Garansi uang kembali 7 hari',
    ],
    disabledFeatures: [],
    cta: 'Mulai Platinum',
    isFree: false, isPremium: false, isPlatinum: true,
  },
];

const PACKAGE_FEATURES: Record<string, string[]> = {
  free: [
    '10 soal latihan per hari',
    'Akses materi dasar',
    'Statistik terbatas',
  ],
  premium: [
    'Soal latihan tidak terbatas',
    'Akses semua materi lengkap',
    'Statistik & analisis performa',
    'Simulasi ujian penuh SKD',
    'Pembahasan setiap soal',
    'Leaderboard & ranking',
  ],
  platinum: [
    'Semua fitur Premium',
    'Live class & webinar eksklusif',
    'Konsultasi dengan mentor',
    'Grup belajar khusus Platinum',
    'Roadmap belajar personal',
    'Garansi uang kembali 7 hari',
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = 'free' | 'premium' | 'platinum';

interface HistoryItem {
  id: string;
  orderId: string;
  name: string;
  method: string;
  methodDetail: string | null;
  date: string;
  status: string;
}

interface ActivePackage {
  tier: Tier;
  name: string;
  expiry: string | null;
  features: string[];
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  SETTLEMENT: 'bg-green-100 text-green-700',
  SUCCESS:    'bg-green-100 text-green-700',
  FAILED:     'bg-red-100 text-red-700',
  EXPIRED:    'bg-slate-100 text-slate-500',
  CANCEL:     'bg-slate-100 text-slate-500',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:    'Menunggu Pembayaran',
  SETTLEMENT: 'Lunas',
  SUCCESS:    'Lunas',
  FAILED:     'Gagal',
  EXPIRED:    'Kadaluarsa',
  CANCEL:     'Dibatalkan',
};

// ─── Sub-views ────────────────────────────────────────────────────────────────

function BeliPaketTab({ onError }: { onError: (msg: string | null) => void }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuy = async (pkg: typeof PACKAGES[0]) => {
    if (pkg.isFree) { router.push('/dashboard'); return; }
    setLoadingId(pkg.id);
    onError(null);
    try {
      const res = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: pkg.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi');
      if (data.redirectUrl) router.push(data.redirectUrl);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {PACKAGES.map((pkg) => {
        const Icon = pkg.icon;
        return (
          <div
            key={pkg.id}
            className={`relative rounded-2xl p-5 flex flex-col border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
              ${pkg.isPremium  ? 'bg-blue-600 border-blue-500 shadow-blue-200 shadow-lg' : ''}
              ${pkg.isPlatinum ? 'bg-slate-900 border-slate-700' : ''}
              ${pkg.isFree     ? 'bg-white border-slate-200' : ''}
            `}
          >
            {pkg.badge && (
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap
                  ${pkg.isPremium ? 'bg-white text-blue-600' : 'bg-amber-400 text-slate-900'}
                `}
              >
                {pkg.badge}
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center
                  ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-amber-400' : 'bg-slate-100'}
                `}
              >
                <Icon
                  size={18}
                  className={pkg.isPlatinum ? 'text-slate-900' : pkg.isPremium ? 'text-white' : 'text-slate-600'}
                />
              </div>
              <div>
                <p className={`font-bold text-base leading-tight ${pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-900'}`}>
                  {pkg.name}
                </p>
                <p className={`text-xs ${pkg.isPremium ? 'text-blue-100' : pkg.isPlatinum ? 'text-slate-400' : 'text-slate-400'}`}>
                  {pkg.period}
                </p>
              </div>
            </div>

            <div className="mb-3">
              <span className={`text-2xl font-bold ${pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-900'}`}>
                {pkg.price === 0 ? 'Gratis' : pkg.priceLabel}
              </span>
              <p className={`text-xs mt-0.5 ${pkg.isPremium ? 'text-blue-100' : pkg.isPlatinum ? 'text-slate-400' : 'text-slate-400'}`}>
                {pkg.description}
              </p>
            </div>

            <div className={`h-px mb-3 ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-slate-700' : 'bg-slate-100'}`} />

            <ul className="space-y-2 mb-5 flex-1">
              {pkg.features.map((feature, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 text-sm
                    ${pkg.disabledFeatures.includes(i)
                      ? 'opacity-40 line-through'
                      : pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-700'}
                  `}
                >
                  <Check
                    size={14}
                    className={`mt-0.5 flex-shrink-0 ${pkg.isPremium ? 'text-blue-200' : pkg.isPlatinum ? 'text-amber-400' : 'text-green-500'}`}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleBuy(pkg)}
              disabled={loadingId === pkg.id}
              className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                ${pkg.isPremium  ? 'bg-white text-blue-600 hover:bg-blue-50' : ''}
                ${pkg.isPlatinum ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' : ''}
                ${pkg.isFree     ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : ''}
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            >
              {loadingId === pkg.id
                ? <Loader2 size={15} className="animate-spin" />
                : <>{pkg.cta}<ArrowRight size={14} /></>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RiwayatTab() {
  const router = useRouter();
  const [history, setHistory]     = useState<HistoryItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res  = await fetch('/api/payment/history');
        const data = await res.json();
        if (data.orders) setHistory(data.orders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClick = (orderId: string) => {
    router.push(`/pembayaran/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <History size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Belum ada riwayat pembelian.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => handleClick(item.orderId)}
          className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">{item.name}</p>
              <button
                onClick={(e) => handleCopy(item.orderId, e)}
                className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 hover:text-blue-600 transition-colors"
              >
                {copied === item.orderId
                  ? <CheckCheck size={12} className="text-green-500" />
                  : <Copy size={12} />}
                #{item.orderId}
              </button>
            </div>
            {/* Tampilkan link hanya untuk yang pending */}
            {item.status === 'PENDING' && (
              <span className="flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <ExternalLink size={13} /> Lanjut bayar
              </span>
            )}
          </div>

          <div className="h-px bg-slate-100 mb-4" />

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-1">Metode Pembayaran</p>
              <p className="font-semibold text-slate-800">{item.method}</p>
              {item.methodDetail && (
                <p className="text-slate-500 text-xs mt-0.5 font-mono truncate">{item.methodDetail}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Waktu Transaksi</p>
              <p className="font-semibold text-slate-800">{item.date}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Status</p>
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLE[item.status] ?? 'bg-slate-100 text-slate-500'}`}
              >
                {STATUS_LABEL[item.status] ?? item.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaketAktifTab() {
  const [pkg, setPkg]       = useState<ActivePackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res  = await fetch('/api/profile');
        const data = await res.json();

        const tier: Tier = data?.profile?.subscription_tier ?? data?.subscription_tier ?? 'free';
        const expiry: string | null =
          data?.profile?.subscription_expires_at ?? data?.subscription_expires_at ?? null;

        const TIER_NAME: Record<Tier, string> = {
          free:     'Gratis',
          premium:  'Premium',
          platinum: 'Platinum',
        };

        setPkg({
          tier,
          name:     TIER_NAME[tier],
          expiry:   expiry
            ? new Date(expiry).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
            : null,
          features: PACKAGE_FEATURES[tier] ?? PACKAGE_FEATURES.free,
        });
      } catch (e) {
        console.error(e);
        // Fallback ke free jika gagal
        setPkg({
          tier: 'free',
          name: 'Gratis',
          expiry: null,
          features: PACKAGE_FEATURES.free,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!pkg) return null;

  const tierColor = {
    free:     'text-slate-600 bg-slate-100',
    premium:  'text-blue-600 bg-blue-50',
    platinum: 'text-amber-700 bg-amber-50',
  }[pkg.tier];

  const IconMap = { free: Shield, premium: Zap, platinum: Crown };
  const Icon = IconMap[pkg.tier];

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tierColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-900">Paket {pkg.name}</p>
            <p className="text-xs text-slate-400">
              {pkg.expiry ? `Aktif hingga ${pkg.expiry}` : 'Aktif selamanya'}
            </p>
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${tierColor}`}>
            AKTIF
          </span>
        </div>

        <div className="h-px bg-slate-100 mb-4" />

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Fitur yang tersedia
        </p>
        <ul className="space-y-2">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <Check size={14} className="text-green-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {pkg.tier === 'free' && (
          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Upgrade ke <span className="font-bold">Premium</span> atau{' '}
            <span className="font-bold">Platinum</span> untuk akses fitur lengkap SKD CPNS 2026.
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
  const [activeTab, setActiveTab] = useState<Tab>('beli');
  const [error, setError]         = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Paket Belajar</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Pilih paket terbaik untuk persiapan SKD CPNS 2026.
        </p>
        {error && (
          <div className="mt-3 inline-block bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setError(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
              `}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto">
        {activeTab === 'beli'    && <BeliPaketTab onError={setError} />}
        {activeTab === 'riwayat' && <RiwayatTab />}
        {activeTab === 'aktif'   && <PaketAktifTab />}
      </div>
    </div>
  );
}