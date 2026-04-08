'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Check, Zap, Shield, Crown, ArrowRight, Loader2,
  ShoppingBag, History, PackageCheck, Copy, CheckCheck, ExternalLink,
  Clock, XCircle, CheckCircle2,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

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

// ─── Logo maps (sama dengan halaman pembayaran) ───────────────────────────────

const BANK_LOGOS: Record<string, string> = {
  bri:     'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg',
  bca:     'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
  mandiri: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
  permata: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Logo_Permata_Bank.svg',
};

const EWALLET_LOGOS: Record<string, string> = {
  gopay:     'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
  dana:      'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg',
  shopeepay: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/ShopeePay_Logo.svg',
};

const QRIS_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg';

function getLogoUrl(bankKey: string | null, ewalletKey: string | null, methodId: string): string | null {
  if (bankKey && BANK_LOGOS[bankKey])       return BANK_LOGOS[bankKey];
  if (ewalletKey && EWALLET_LOGOS[ewalletKey]) return EWALLET_LOGOS[ewalletKey];
  if (methodId === 'qris')                  return QRIS_LOGO;
  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = 'free' | 'premium' | 'platinum';

interface HistoryItem {
  id: string;
  orderId: string;
  name: string;
  method: string;
  methodId: string;
  bankKey: string | null;
  ewalletKey: string | null;
  methodDetail: string | null;
  createdAt: string;
  expiredAt: string;
  date: string;
  status: string;
  total: number;
}

interface ActivePackage {
  tier: Tier;
  name: string;
  expiry: string | null;
  features: string[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Menunggu Pembayaran',
    className: 'bg-amber-400 text-white',
    icon: <Clock size={11} />,
  },
  SETTLEMENT: {
    label: 'Berhasil',
    className: 'bg-emerald-500 text-white',
    icon: <CheckCircle2 size={11} />,
  },
  SUCCESS: {
    label: 'Berhasil',
    className: 'bg-emerald-500 text-white',
    icon: <CheckCircle2 size={11} />,
  },
  EXPIRED: {
    label: 'Dibatalkan',
    className: 'bg-slate-400 text-white',
    icon: <XCircle size={11} />,
  },
  CANCEL: {
    label: 'Dibatalkan',
    className: 'bg-slate-400 text-white',
    icon: <XCircle size={11} />,
  },
  FAILED: {
    label: 'Gagal',
    className: 'bg-red-500 text-white',
    icon: <XCircle size={11} />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-slate-200 text-slate-600',
    icon: null,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// ─── Countdown mini (untuk item pending di riwayat) ───────────────────────────

function CountdownMini({ expiredAt }: { expiredAt: string }) {
  const calc = useCallback(() => {
    const diff = new Date(expiredAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, [expiredAt]);

  const [display, setDisplay] = useState<string | null>(calc);

  useEffect(() => {
    setDisplay(calc());
    const t = setInterval(() => setDisplay(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);

  if (!display) return null;

  return (
    <span className="text-xs font-mono text-red-500 font-semibold">
      ⏱ {display}
    </span>
  );
}

// ─── BeliPaketTab ─────────────────────────────────────────────────────────────

function BeliPaketTab({ onError }: { onError: (msg: string | null) => void }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuy = async (pkg: typeof PACKAGES[0]) => {
    if (pkg.isFree) { router.push('/dashboard'); return; }
    setLoadingId(pkg.id);
    onError(null);
    try {
      const res  = await fetch('/api/payment/charge', {
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
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap
                ${pkg.isPremium ? 'bg-white text-blue-600' : 'bg-amber-400 text-slate-900'}`}>
                {pkg.badge}
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-amber-400' : 'bg-slate-100'}`}>
                <Icon size={18} className={pkg.isPlatinum ? 'text-slate-900' : pkg.isPremium ? 'text-white' : 'text-slate-600'} />
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
                <li key={i} className={`flex items-start gap-2 text-sm
                  ${pkg.disabledFeatures.includes(i)
                    ? 'opacity-40 line-through'
                    : pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-700'}`}>
                  <Check size={14} className={`mt-0.5 flex-shrink-0
                    ${pkg.isPremium ? 'text-blue-200' : pkg.isPlatinum ? 'text-amber-400' : 'text-green-500'}`} />
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
                disabled:opacity-60 disabled:cursor-not-allowed`}
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

// ─── RiwayatTab ───────────────────────────────────────────────────────────────

function RiwayatTab() {
  const router  = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState<string | null>(null);

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

  const handleClick = (item: HistoryItem) => {
    // Hanya navigasi ke halaman pembayaran kalau masih pending
    if (item.status === 'PENDING') {
      router.push(`/pembayaran/${item.orderId}`);
    }
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
    <div className="max-w-2xl mx-auto space-y-4">
      {history.map((item) => {
        const logoUrl   = getLogoUrl(item.bankKey, item.ewalletKey, item.methodId);
        const isPending = item.status === 'PENDING';

        return (
          <div
            key={item.id}
            onClick={() => handleClick(item)}
            className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all
              ${isPending ? 'cursor-pointer hover:border-blue-300 hover:shadow-md group' : 'cursor-default'}`}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
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

              {/* Lanjut bayar hint */}
              {isPending && (
                <span className="flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                  <ExternalLink size={13} /> Lanjut bayar
                </span>
              )}
            </div>

            {/* Body — 3 kolom persis seperti screenshot */}
            <div className="px-5 py-4 grid grid-cols-3 gap-4">
              {/* Metode Pembayaran */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Metode Pembayaran</p>
                {logoUrl ? (
                  <div className="mb-1.5">
                    <Image
                      src={logoUrl}
                      alt={item.method}
                      width={52} height={26}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : null}
                <p className="text-sm font-bold text-slate-800 leading-tight">{item.method}</p>
                {item.methodDetail && (
                  <p className="text-xs text-slate-500 mt-1 font-mono tracking-wide">
                    {item.methodDetail.replace(/(.{4})/g, '$1 ').trim()}
                  </p>
                )}
              </div>

              {/* Waktu Transaksi */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Waktu Transaksi</p>
                <p className="text-sm font-semibold text-slate-800">{item.date}</p>
                {isPending && item.expiredAt && (
                  <div className="mt-1.5">
                    <CountdownMini expiredAt={item.expiredAt} />
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Status</p>
                <StatusBadge status={item.status} />
                {item.total > 0 && (
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">
                    {formatRupiah(item.total)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PaketAktifTab ────────────────────────────────────────────────────────────

function PaketAktifTab() {
  const [pkg, setPkg]         = useState<ActivePackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res  = await fetch('/api/profile');
        const data = await res.json();
        const tier: Tier = data?.profile?.subscription_tier ?? data?.subscription_tier ?? 'free';
        const expiry: string | null = data?.profile?.subscription_expires_at ?? data?.subscription_expires_at ?? null;

        const TIER_NAME: Record<Tier, string> = { free: 'Gratis', premium: 'Premium', platinum: 'Platinum' };

        setPkg({
          tier,
          name: TIER_NAME[tier],
          expiry: expiry
            ? new Date(expiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : null,
          features: PACKAGE_FEATURES[tier] ?? PACKAGE_FEATURES.free,
        });
      } catch {
        setPkg({ tier: 'free', name: 'Gratis', expiry: null, features: PACKAGE_FEATURES.free });
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

  const tierColor = { free: 'text-slate-600 bg-slate-100', premium: 'text-blue-600 bg-blue-50', platinum: 'text-amber-700 bg-amber-50' }[pkg.tier];
  const Icon      = { free: Shield, premium: Zap, platinum: Crown }[pkg.tier];

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
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${tierColor}`}>AKTIF</span>
        </div>

        <div className="h-px bg-slate-100 mb-4" />

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Fitur yang tersedia</p>
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

      <div className="max-w-5xl mx-auto mb-6">
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setError(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {activeTab === 'beli'    && <BeliPaketTab onError={setError} />}
        {activeTab === 'riwayat' && <RiwayatTab />}
        {activeTab === 'aktif'   && <PaketAktifTab />}
      </div>
    </div>
  );
}