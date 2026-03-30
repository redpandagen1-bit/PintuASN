'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Copy, Check, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';

// ── Types ──────────────────────────────────────────────────────────────────
interface PaymentMethod {
  id: string;
  name: string;
  type: 'va' | 'qris' | 'ewallet';
  bank?: string;
  adminFee: number;
}

interface OrderData {
  orderId: string;
  packageName: string;
  basePrice: number;
  adminFee: number;
  total: number;
  expiredAt: string;
  status: string;
  paymentMethod?: string;
  vaNumber?: string;
  qrisUrl?: string;
  ewalletUrl?: string;
}

// ── Payment Methods Config ─────────────────────────────────────────────────
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bri_va',     name: 'BRI Virtual Account',     type: 'va',      bank: 'bri',     adminFee: 4000 },
  { id: 'bca_va',     name: 'BCA Virtual Account',     type: 'va',      bank: 'bca',     adminFee: 4000 },
  { id: 'mandiri_va', name: 'Mandiri Virtual Account', type: 'va',      bank: 'mandiri', adminFee: 4000 },
  { id: 'qris',       name: 'QRIS',                    type: 'qris',                     adminFee: 0    },
  { id: 'gopay',      name: 'GoPay',                   type: 'ewallet',                  adminFee: 0    },
  { id: 'dana',       name: 'DANA',                    type: 'ewallet',                  adminFee: 0    },
  { id: 'shopeepay',  name: 'ShopeePay',               type: 'ewallet',                  adminFee: 0    },
  { id: 'other_bank', name: 'SeaBank & Bank Lain',     type: 'va',      bank: 'permata', adminFee: 4000 },
];

// ── VA Instructions ────────────────────────────────────────────────────────
const VA_INSTRUCTIONS: Record<string, { title: string; steps: string[] }[]> = {
  bri: [
    {
      title: 'ATM BRI',
      steps: [
        'Pilih menu utama → Transaksi Lain',
        'Pilih Pembayaran → Lainnya → BRIVA',
        'Masukkan nomor BRIVA dan pilih Benar',
        'Konfirmasi jumlah dan merchant, pilih Ya',
        'Pembayaran selesai, simpan bukti.',
      ],
    },
    {
      title: 'BRImo (Mobile Banking)',
      steps: [
        'Login BRImo → Pembayaran → BRIVA',
        'Masukkan nomor BRIVA',
        'Konfirmasi detail, masukkan PIN',
        'Pembayaran berhasil.',
      ],
    },
  ],
  bca: [
    {
      title: 'ATM BCA',
      steps: [
        'Pilih Transaksi Lainnya → Transfer → ke Rek BCA Virtual Account',
        'Masukkan nomor VA BCA',
        'Konfirmasi detail transaksi, pilih Ya',
        'Pembayaran selesai.',
      ],
    },
    {
      title: 'myBCA / BCA Mobile',
      steps: [
        'Login myBCA → Transfer Dana → BCA Virtual Account',
        'Masukkan nomor VA',
        'Konfirmasi dan masukkan PIN',
        'Selesai.',
      ],
    },
  ],
  mandiri: [
    {
      title: 'Livin by Mandiri',
      steps: [
        'Login Livin → Bayar → Multipayment',
        'Cari "Midtrans" sebagai penyedia',
        'Masukkan kode pembayaran (VA number)',
        'Konfirmasi dan masukkan PIN',
        'Pembayaran selesai.',
      ],
    },
    {
      title: 'ATM Mandiri',
      steps: [
        'Pilih Bayar/Beli → Lainnya → Lainnya → Multipayment',
        'Masukkan kode perusahaan: 88608, lanjut masukkan VA number',
        'Konfirmasi dan selesai.',
      ],
    },
  ],
  permata: [
    {
      title: 'SeaBank / Bank Lain (Transfer)',
      steps: [
        'Buka aplikasi bank Anda',
        'Pilih Transfer → Virtual Account / Rekening Lain',
        'Masukkan nomor VA yang tertera',
        'Konfirmasi nominal dan transfer',
        'Pembayaran selesai.',
      ],
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function useCountdown(expiredAt: string) {
  const calc = useCallback(() => {
    const diff = new Date(expiredAt).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, expired: false };
  }, [expiredAt]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);
  return time;
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function PembayaranPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();

  // ✅ Fix Next.js 15: unwrap params dengan React.use()
  const { orderId } = use(params);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loadingMethod, setLoadingMethod] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [openInstruction, setOpenInstruction] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/payment/order/${orderId}`);
        const data = await res.json();
        if (data.order) setOrder(data.order);
      } catch (e) {
        console.error(e);
      } finally {
        setPageLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Poll status every 5s if pending
  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status/${orderId}`);
        const data = await res.json();
        if (data.status === 'settlement' || data.status === 'capture') {
          router.push('/dashboard?payment=success');
        } else if (data.status === 'expire' || data.status === 'cancel') {
          setOrder(prev => prev ? { ...prev, status: 'expired' } : prev);
        }
      } catch (e) { console.error(e); }
    }, 5000);
    return () => clearInterval(t);
  }, [order, orderId, router]);

  const countdown = useCountdown(order?.expiredAt ?? new Date(Date.now() + 86400000).toISOString());

  const handleSelectMethod = async (method: PaymentMethod) => {
    if (!order) return;
    setSelectedMethod(method);
    setLoadingMethod(true);
    try {
      const res = await fetch('/api/payment/select-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, methodId: method.id, bank: method.bank }),
      });
      const data = await res.json();
      if (data.vaNumber || data.qrisUrl || data.ewalletUrl) {
        setOrder(prev => prev ? {
          ...prev,
          paymentMethod: method.id,
          vaNumber: data.vaNumber,
          qrisUrl: data.qrisUrl,
          ewalletUrl: data.ewalletUrl,
          adminFee: method.adminFee,
          total: prev.basePrice + method.adminFee,
        } : prev);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingMethod(false); }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/payment/status/${orderId}`);
      const data = await res.json();
      if (data.status === 'settlement' || data.status === 'capture') {
        router.push('/dashboard?payment=success');
      } else {
        alert('Pembayaran belum diterima. Silakan tunggu beberapa saat.');
      }
    } catch (e) { console.error(e); }
    finally { setLoadingStatus(false); }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <XCircle size={40} className="text-red-500" />
        <p className="text-slate-700 font-semibold">Order tidak ditemukan</p>
        <button onClick={() => router.push('/beli-paket')} className="text-blue-600 text-sm underline">
          Kembali ke halaman paket
        </button>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────
  if (order.status === 'settlement' || order.status === 'capture') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <CheckCircle2 size={56} className="text-green-500" />
        <h2 className="text-xl font-bold text-slate-800">Pembayaran Berhasil!</h2>
        <p className="text-slate-500 text-sm">Paket kamu sudah aktif. Selamat belajar!</p>
        <button onClick={() => router.push('/dashboard')}
          className="mt-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
          Ke Dashboard
        </button>
      </div>
    );
  }

  const instructions = selectedMethod?.bank ? VA_INSTRUCTIONS[selectedMethod.bank] : null;

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800">Selesaikan Pembayaran</h1>
          <p className="text-slate-500 text-sm mt-1">#{orderId}</p>
        </div>

        {/* Countdown */}
        {!countdown.expired ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Clock size={18} className="text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 text-sm font-semibold">Sisa Waktu Pembayaran</p>
              <p className="text-amber-600 text-xs">Selesaikan sebelum waktu habis</p>
            </div>
            <div className="font-mono font-bold text-amber-700 text-lg">
              {String(countdown.h).padStart(2,'0')}:{String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <XCircle size={18} className="text-red-500" />
            <p className="text-red-700 text-sm font-semibold">Waktu pembayaran telah habis</p>
          </div>
        )}

        {/* Order Detail */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h2 className="font-bold text-slate-800 text-sm">Detail Transaksi</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Paket</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px]">{order.packageName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Harga Paket</span>
              <span className="text-slate-800">{formatRupiah(order.basePrice)}</span>
            </div>
            {order.adminFee > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Biaya Admin</span>
                <span className="text-slate-800">{formatRupiah(order.adminFee)}</span>
              </div>
            )}
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between font-bold">
              <span className="text-slate-800">Total Pembayaran</span>
              <span className="text-blue-600 text-base">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Method Selection */}
        {!order.paymentMethod && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="font-bold text-slate-800 text-sm mb-3">Pilih Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => handleSelectMethod(method)}
                  disabled={loadingMethod}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:border-blue-400 hover:bg-blue-50
                    ${selectedMethod?.id === method.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="w-8 h-8 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-600">{method.name.slice(0,3).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{method.name}</p>
                    {method.adminFee > 0 && (
                      <p className="text-[10px] text-slate-400">+{formatRupiah(method.adminFee)}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {loadingMethod && (
              <div className="flex items-center justify-center gap-2 mt-4 text-blue-600 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Memproses metode pembayaran...
              </div>
            )}
          </div>
        )}

        {/* VA Number */}
        {order.vaNumber && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-800 text-sm">Nomor Virtual Account</h2>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {PAYMENT_METHODS.find(m => m.id === order.paymentMethod)?.name}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="font-mono font-bold text-slate-900 text-lg flex-1 tracking-wider">
                {order.vaNumber}
              </span>
              <button
                onClick={() => handleCopy(order.vaNumber!)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Disalin!' : 'Salin'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Transfer tepat {formatRupiah(order.total)} · Atas nama PT. PintuASN
            </p>
          </div>
        )}

        {/* QRIS */}
        {order.qrisUrl && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <h2 className="font-bold text-slate-800 text-sm mb-3">Scan QR Code</h2>
            <div className="inline-block p-3 bg-white border border-slate-200 rounded-xl">
              <Image src={order.qrisUrl} alt="QRIS" width={200} height={200} unoptimized />
            </div>
            <p className="text-xs text-slate-400 mt-2">Scan menggunakan aplikasi apapun yang mendukung QRIS</p>
          </div>
        )}

        {/* eWallet deeplink */}
        {order.ewalletUrl && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="font-bold text-slate-800 text-sm mb-3">
              Bayar dengan {PAYMENT_METHODS.find(m => m.id === order.paymentMethod)?.name}
            </h2>
            <a
              href={order.ewalletUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition"
            >
              Buka Aplikasi & Bayar
            </a>
            <p className="text-xs text-slate-400 text-center mt-2">Kamu akan diarahkan ke aplikasi e-wallet</p>
          </div>
        )}

        {/* Instructions */}
        {instructions && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="font-bold text-slate-800 text-sm mb-3">Cara Pembayaran</h2>
            <div className="space-y-2">
              {instructions.map((inst, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenInstruction(openInstruction === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
                  >
                    <span className="text-sm font-semibold text-slate-700">{inst.title}</span>
                    {openInstruction === i
                      ? <ChevronUp size={16} className="text-slate-400" />
                      : <ChevronDown size={16} className="text-slate.400" />
                    }
                  </button>
                  {openInstruction === i && (
                    <div className="px-4 pb-4 space-y-2">
                      {inst.steps.map((step, j) => (
                        <div key={j} className="flex gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            {j + 1}
                          </span>
                          <span className="text-slate-600">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check Status */}
        {(order.vaNumber || order.qrisUrl || order.ewalletUrl) && (
          <button
            onClick={handleCheckStatus}
            disabled={loadingStatus}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loadingStatus ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Cek Status Pembayaran
          </button>
        )}

        <p className="text-center text-slate-400 text-xs pb-4">
          Butuh bantuan? Hubungi support@pintuasn.com
        </p>
      </div>
    </div>
  );
}