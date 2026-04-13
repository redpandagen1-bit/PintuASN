'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, Zap, Shield, Crown, ArrowRight, Loader2,
  ShoppingBag, History, PackageCheck, Copy, CheckCheck,
  X, Clock, Tag, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Lock,
} from 'lucide-react';
import Image from 'next/image';

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
    period: 'Hingga November 2026',
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
  platinum: ['Semua fitur Premium', 'Akses Riwayat tidak terbatas', 'Tryout paket platinum eksklusif', 'Materi platinum + video series SKD', 'Analisis soal dengan waktu pengerjaan terlama', 'Laporan perkembangan belajar', 'Masa aktif 1 tahun'],
};

// ─── Payment logos ────────────────────────────────────────────────────────────

const METHOD_LOGOS: Record<string, string> = {
  bri_va:    'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg',
  bca_va:    'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
  mandiri_va:'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
  bni_va:    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/BNI_logo.svg/320px-BNI_logo.svg.png',
  qris:      'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
  gopay:     'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
  shopeepay: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Logo_ShopeePay.png/320px-Logo_ShopeePay.png',
  dana:      'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg',
  alfamart:  'https://upload.wikimedia.org/wikipedia/commons/d/d6/Alfamart_logo.svg',
  indomaret: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Indomaret_logo2022.svg/320px-Indomaret_logo2022.svg.png',
};

const METHOD_NAMES: Record<string, string> = {
  bri_va: 'BRI Virtual Account', bca_va: 'BCA Virtual Account',
  mandiri_va: 'Mandiri Virtual Account', bni_va: 'BNI Virtual Account',
  qris: 'QRIS', gopay: 'GoPay', shopeepay: 'ShopeePay', dana: 'DANA',
  alfamart: 'Alfamart', indomaret: 'Indomaret',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = 'free' | 'premium' | 'platinum';

interface HistoryItem {
  id: string; orderId: string; name: string;
  method: string; methodDetail: string | null; date: string; status: string;
}

interface OrderDetail {
  orderId: string; packageName: string; basePrice: number; adminFee: number;
  discountAmount: number; referralCode: string | null; total: number;
  finalPrice: number; expiredAt: string; status: string;
  paymentMethod?: string; vaNumber?: string; qrisUrl?: string;
  ewalletUrl?: string; paymentCode?: string;
}

// ─── Status maps ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', SETTLEMENT: 'bg-green-100 text-green-700',
  SUCCESS: 'bg-green-100 text-green-700', FAILED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-100 text-slate-500', CANCEL: 'bg-slate-100 text-slate-500',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu Pembayaran', SETTLEMENT: 'Lunas', SUCCESS: 'Lunas',
  FAILED: 'Gagal', EXPIRED: 'Kadaluarsa', CANCEL: 'Dibatalkan',
};

function formatRupiah(n: number) { return 'Rp ' + n.toLocaleString('id-ID'); }

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(expiredAt: string) {
  const calc = useCallback(() => {
    const diff = new Date(expiredAt).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), expired: false };
  }, [expiredAt]);
  const [time, setTime] = useState(calc);
  useEffect(() => { const t = setInterval(() => setTime(calc()), 1000); return () => clearInterval(t); }, [calc]);
  return time;
}

// ─── Order Detail Popup ───────────────────────────────────────────────────────

function OrderDetailPopup({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [order, setOrder]         = useState<OrderDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState<string | null>(null);
  const [openInstr, setOpenInstr] = useState<number | null>(0);

  useEffect(() => {
    fetch(`/api/payment/order/${orderId}`)
      .then(r => r.json()).then(d => { if (d.order) setOrder(d.order); })
      .catch(console.error).finally(() => setLoading(false));
  }, [orderId]);

  const countdown = useCountdown(order?.expiredAt ?? new Date(Date.now() + 86400000).toISOString());
  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(null), 2000); };

  const isPending  = order?.status === 'pending';
  const methodKey  = order?.paymentMethod ?? '';
  const methodName = METHOD_NAMES[methodKey] ?? methodKey;
  const methodLogo = METHOD_LOGOS[methodKey] ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="font-bold text-slate-900 text-base">Detail Pembayaran</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition"><X size={16} className="text-slate-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          {loading
            ? <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-blue-500" /></div>
            : !order
            ? <div className="text-center py-10 text-slate-400"><XCircle size={32} className="mx-auto mb-2" /><p className="text-sm">Gagal memuat data order.</p></div>
            : <>
                {isPending && !countdown.expired && (
                  <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Clock size={18} className="text-slate-500 flex-shrink-0" />
                    <div className="flex-1"><p className="text-slate-800 text-sm font-semibold">Sisa Waktu Pembayaran</p><p className="text-slate-500 text-xs">Selesaikan sebelum waktu habis</p></div>
                    <div className="font-mono font-bold text-red-600 text-xl tracking-widest">{String(countdown.h).padStart(2,'0')}:{String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')}</div>
                  </div>
                )}
                {!isPending && (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${order.status === 'settlement' || order.status === 'capture' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                    {order.status === 'settlement' || order.status === 'capture' ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-slate-400" />}
                    <p className={`text-sm font-semibold ${order.status === 'settlement' || order.status === 'capture' ? 'text-green-700' : 'text-slate-600'}`}>
                      {order.status === 'settlement' || order.status === 'capture' ? 'Pembayaran berhasil' : 'Pesanan ini sudah tidak aktif'}
                    </p>
                  </div>
                )}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                    <p className="font-bold text-slate-800">{order.packageName}</p>
                    <button onClick={() => copy(orderId)} className="mt-1 flex items-center gap-1.5 text-slate-400 text-xs hover:text-slate-600 transition">
                      {copied === orderId ? <Check size={11} /> : <Copy size={11} />} #{orderId}
                    </button>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-3 text-sm">
                    <div><p className="text-xs text-slate-400 mb-1">Metode</p>{methodLogo && <Image src={methodLogo} alt={methodName} width={36} height={18} className="object-contain mb-1" unoptimized />}<p className="font-semibold text-slate-800 text-xs leading-tight">{methodName || '-'}</p></div>
                    <div><p className="text-xs text-slate-400 mb-1">Transaksi</p><p className="font-semibold text-slate-800 text-xs">{new Date(order.expiredAt ? new Date(order.expiredAt).getTime() - 86400000 : Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                    <div><p className="text-xs text-slate-400 mb-1">Status</p><span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[order.status.toUpperCase()] ?? 'bg-slate-100 text-slate-500'}`}>{STATUS_LABEL[order.status.toUpperCase()] ?? order.status}</span></div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                  <p className="font-bold text-slate-800 text-sm mb-1">Detail Transaksi</p>
                  <div className="flex justify-between"><span className="text-slate-500">Harga Paket</span><span>{formatRupiah(order.basePrice)}</span></div>
                  {order.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span className="flex items-center gap-1"><Tag size={11} />{order.referralCode}</span><span>- {formatRupiah(order.discountAmount)}</span></div>}
                  {order.adminFee > 0 && <div className="flex justify-between"><span className="text-slate-500">Biaya Admin</span><span>{formatRupiah(order.adminFee)}</span></div>}
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between font-bold"><span>Total</span><span className="text-blue-600">{formatRupiah(order.total)}</span></div>
                </div>
                {order.vaNumber && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="font-bold text-slate-800 text-sm mb-3">Nomor Virtual Account</p>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <span className="font-mono font-bold text-slate-900 text-lg flex-1 tracking-widest overflow-hidden">{order.vaNumber}</span>
                      <button onClick={() => copy(order.vaNumber!)} className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                        {copied === order.vaNumber ? <Check size={12} /> : <Copy size={12} />}{copied === order.vaNumber ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">Transfer tepat {formatRupiah(order.total)}</p>
                  </div>
                )}
                {order.paymentCode && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="font-bold text-slate-800 text-sm mb-3">Kode Pembayaran</p>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <span className="font-mono font-bold text-slate-900 text-2xl flex-1 tracking-widest">{order.paymentCode}</span>
                      <button onClick={() => copy(order.paymentCode!)} className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                        {copied === order.paymentCode ? <Check size={12} /> : <Copy size={12} />}{copied === order.paymentCode ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                )}
                {order.qrisUrl && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <p className="font-bold text-slate-800 text-sm mb-3">Scan QR Code</p>
                    <div className="inline-block p-3 bg-white border border-slate-200 rounded-xl"><Image src={order.qrisUrl} alt="QRIS" width={180} height={180} unoptimized /></div>
                    <p className="text-xs text-slate-400 mt-2">Scan menggunakan aplikasi yang mendukung QRIS</p>
                  </div>
                )}
                {order.ewalletUrl && isPending && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="font-bold text-slate-800 text-sm mb-3">Bayar dengan {methodName}</p>
                    <a href={order.ewalletUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition">Buka Aplikasi & Bayar</a>
                  </div>
                )}
                {order.vaNumber && <VaInstructions methodKey={methodKey} openInstr={openInstr} setOpenInstr={setOpenInstr} />}
              </>
          }
        </div>
      </div>
    </div>
  );
}

// ─── VA Instructions ──────────────────────────────────────────────────────────

const VA_INSTRUCTIONS: Record<string, { title: string; steps: string[] }[]> = {
  bri_va: [
    { title: 'BRImo (Mobile Banking)', steps: ['Login BRImo → Pembayaran → BRIVA', 'Masukkan nomor BRIVA', 'Konfirmasi detail, masukkan PIN', 'Pembayaran berhasil.'] },
    { title: 'ATM BRI', steps: ['Pilih menu utama → Transaksi Lain', 'Pilih Pembayaran → Lainnya → BRIVA', 'Masukkan nomor BRIVA dan pilih Benar', 'Konfirmasi jumlah, pilih Ya.'] },
  ],
  bca_va: [
    { title: 'myBCA / BCA Mobile', steps: ['Login myBCA → Transfer Dana → BCA Virtual Account', 'Masukkan nomor VA', 'Konfirmasi dan masukkan PIN', 'Selesai.'] },
    { title: 'ATM BCA', steps: ['Pilih Transaksi Lainnya → Transfer → ke Rek BCA Virtual Account', 'Masukkan nomor VA BCA', 'Konfirmasi detail transaksi, pilih Ya.'] },
  ],
  mandiri_va: [{ title: 'Livin by Mandiri', steps: ['Login Livin → Bayar → Multipayment', 'Cari "Midtrans" sebagai penyedia', 'Masukkan kode pembayaran (VA number)', 'Konfirmasi dan masukkan PIN.'] }],
  bni_va:     [{ title: 'BNI Mobile Banking', steps: ['Login BNI Mobile → Transfer → Virtual Account Billing', 'Masukkan nomor Virtual Account', 'Konfirmasi dan masukkan PIN.'] }],
};

function VaInstructions({ methodKey, openInstr, setOpenInstr }: { methodKey: string; openInstr: number | null; setOpenInstr: (v: number | null) => void }) {
  const instructions = VA_INSTRUCTIONS[methodKey];
  if (!instructions) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="font-bold text-slate-800 text-sm mb-3">Cara Pembayaran</p>
      <div className="space-y-2">
        {instructions.map((inst, i) => (
          <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
            <button onClick={() => setOpenInstr(openInstr === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition">
              <span className="text-sm font-semibold text-slate-700">{inst.title}</span>
              {openInstr === i ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {openInstr === i && (
              <div className="px-4 pb-4 space-y-2">
                {inst.steps.map((s, j) => (
                  <div key={j} className="flex gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{j + 1}</span>
                    <span className="text-slate-600">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature Icon ─────────────────────────────────────────────────────────────

function FeatureIcon({ has, isPremium, isPlatinum }: { has: boolean; isPremium: boolean; isPlatinum: boolean }) {
  if (has) return (
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
      ${isPlatinum ? 'bg-amber-400/25' : isPremium ? 'bg-white/20' : 'bg-emerald-100'}`}>
      <Check size={11} className={isPlatinum ? 'text-amber-300' : isPremium ? 'text-white' : 'text-emerald-600'} strokeWidth={3} />
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

  const isPremiumUser  = userTier === 'premium';
  const isPlatinumUser = userTier === 'platinum';

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
            ${pkg.isPlatinum ? 'bg-slate-900 border-slate-700' : ''}
            ${pkg.isFree     ? 'bg-white border-slate-200' : ''}
          `}>

            {/* Badge */}
            {pkg.badge && (
              <div className={`absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap z-10
                ${pkg.isPremium ? 'bg-white text-blue-600' : 'bg-amber-400 text-slate-900'}`}>
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

              <div className={`h-px ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-slate-700' : 'bg-slate-100'}`} />
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
                        ${pkg.isPremium ? 'text-blue-200/60' : pkg.isPlatinum ? 'text-slate-500' : 'text-slate-400'}`}>
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
              <div className={`h-px mb-3 ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-slate-700' : 'bg-slate-100'}`} />
              <button
                onClick={() => !isOwned && handleBuy(pkg)}
                disabled={isDisabled}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                  ${pkg.isPremium  ? 'bg-white text-blue-600 hover:bg-blue-50' : ''}
                  ${pkg.isPlatinum ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' : ''}
                  ${pkg.isFree     ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : ''}
                  ${isOwned && !showUpgradePrice ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isDisabled && !isOwned ? 'opacity-60 cursor-not-allowed' : ''}
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
  );
}

// ─── Tab: Riwayat ─────────────────────────────────────────────────────────────

function RiwayatTab() {
  const [history, setHistory]          = useState<HistoryItem[]>([]);
  const [loading, setLoading]          = useState(true);
  const [copied, setCopied]            = useState<string | null>(null);
  const [selectedOrderId, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payment/history').then(r => r.json()).then(d => { if (d.orders) setHistory(d.orders); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); navigator.clipboard.writeText(text);
    setCopied(text); setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;
  if (!history.length) return <div className="text-center py-16 text-slate-400"><History size={36} className="mx-auto mb-3 opacity-30" /><p className="text-sm">Belum ada riwayat pembelian.</p></div>;

  return (
    <>
      {selectedOrderId && <OrderDetailPopup orderId={selectedOrderId} onClose={() => setSelected(null)} />}
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} onClick={() => setSelected(item.orderId)}
            className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="mb-3">
              <p className="font-bold text-slate-900 text-sm">{item.name}</p>
              <button onClick={(e) => handleCopy(item.orderId, e)} className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 hover:text-blue-600 transition-colors">
                {copied === item.orderId ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />} #{item.orderId}
              </button>
            </div>
            <div className="h-px bg-slate-100 mb-4" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-slate-400 mb-1">Metode Pembayaran</p><p className="font-semibold text-slate-800">{item.method || '-'}</p>{item.methodDetail && <p className="text-slate-500 text-xs mt-0.5 font-mono truncate">{item.methodDetail}</p>}</div>
              <div><p className="text-xs text-slate-400 mb-1">Waktu Transaksi</p><p className="font-semibold text-slate-800">{item.date}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Status</p><span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLE[item.status] ?? 'bg-slate-100 text-slate-500'}`}>{STATUS_LABEL[item.status] ?? item.status}</span></div>
            </div>
            <p className="text-xs text-slate-400 mt-3 group-hover:text-blue-500 transition-colors text-right">Klik untuk lihat detail →</p>
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
  const [activeTab, setActiveTab] = useState<Tab>('beli');
  const [error, setError]         = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Paket Belajar</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">Pilih paket terbaik untuk persiapan SKD CPNS 2026.</p>
        {error && <div className="mt-3 inline-block bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-lg">{error}</div>}
      </div>

      <div className="max-w-5xl mx-auto mb-6">
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setError(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Icon size={15} />{label}
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
  );
}