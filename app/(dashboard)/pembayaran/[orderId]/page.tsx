// app/(dashboard)/pembayaran/[orderId]/page.tsx
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock, Copy, Check, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, XCircle, RefreshCw, Tag, ChevronRight, X
} from 'lucide-react';
import Image from 'next/image';

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
  discountAmount: number;
  referralCode: string | null;
  total: number;
  finalPrice: number;
  expiredAt: string;
  status: string;
  paymentMethod?: string;
  vaNumber?: string;
  qrisUrl?: string;
  ewalletUrl?: string;
}

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

function getMethodLogo(method: PaymentMethod): string | null {
  if (method.bank && BANK_LOGOS[method.bank]) return BANK_LOGOS[method.bank];
  if (method.type === 'ewallet' && EWALLET_LOGOS[method.id]) return EWALLET_LOGOS[method.id];
  if (method.type === 'qris') return QRIS_LOGO;
  return null;
}

const VA_INSTRUCTIONS: Record<string, { title: string; steps: string[] }[]> = {
  bri: [
    { title: 'ATM BRI', steps: ['Pilih menu utama → Transaksi Lain', 'Pilih Pembayaran → Lainnya → BRIVA', 'Masukkan nomor BRIVA dan pilih Benar', 'Konfirmasi jumlah dan merchant, pilih Ya', 'Pembayaran selesai, simpan bukti.'] },
    { title: 'BRImo (Mobile Banking)', steps: ['Login BRImo → Pembayaran → BRIVA', 'Masukkan nomor BRIVA', 'Konfirmasi detail, masukkan PIN', 'Pembayaran berhasil.'] },
  ],
  bca: [
    { title: 'ATM BCA', steps: ['Pilih Transaksi Lainnya → Transfer → ke Rek BCA Virtual Account', 'Masukkan nomor VA BCA', 'Konfirmasi detail transaksi, pilih Ya', 'Pembayaran selesai.'] },
    { title: 'myBCA / BCA Mobile', steps: ['Login myBCA → Transfer Dana → BCA Virtual Account', 'Masukkan nomor VA', 'Konfirmasi dan masukkan PIN', 'Selesai.'] },
  ],
  mandiri: [
    { title: 'Livin by Mandiri', steps: ['Login Livin → Bayar → Multipayment', 'Cari "Midtrans" sebagai penyedia', 'Masukkan kode pembayaran (VA number)', 'Konfirmasi dan masukkan PIN', 'Pembayaran selesai.'] },
    { title: 'ATM Mandiri', steps: ['Pilih Bayar/Beli → Lainnya → Lainnya → Multipayment', 'Masukkan kode perusahaan: 88608, lanjut masukkan VA number', 'Konfirmasi dan selesai.'] },
  ],
  permata: [
    { title: 'SeaBank / Bank Lain (Transfer)', steps: ['Buka aplikasi bank Anda', 'Pilih Transfer → Virtual Account / Rekening Lain', 'Masukkan nomor VA yang tertera', 'Konfirmasi nominal dan transfer', 'Pembayaran selesai.'] },
  ],
};

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

type Step = 1 | 2;

export default function PembayaranPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const { orderId } = use(params);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [loadingMethod, setLoadingMethod] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [openInstruction, setOpenInstruction] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [referralInput, setReferralInput] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/payment/order/${orderId}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          if (data.order.vaNumber || data.order.qrisUrl || data.order.ewalletUrl) {
            const method = PAYMENT_METHODS.find(m => m.id === data.order.paymentMethod);
            if (method) setSelectedMethod(method);
            setStep(2);
          }
          if (data.order.referralCode) {
            setReferralInput(data.order.referralCode);
            setReferralApplied(true);
            setDiscountAmount(data.order.discountAmount);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setPageLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

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

  const handleApplyReferral = async () => {
    if (!order || !referralInput.trim()) return;
    setReferralLoading(true);
    setReferralError('');
    try {
      const res = await fetch('/api/payment/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralInput.trim(), basePrice: order.basePrice }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReferralError(data.error || 'Kode tidak valid');
        return;
      }
      setDiscountAmount(data.discountAmount);
      setReferralApplied(true);
      setOrder(prev => prev ? {
        ...prev,
        discountAmount: data.discountAmount,
        finalPrice: data.finalPrice,
        referralCode: referralInput.trim().toUpperCase(),
      } : prev);
    } catch (e) {
      setReferralError('Gagal memvalidasi kode');
    } finally {
      setReferralLoading(false);
    }
  };

  const handleRemoveReferral = () => {
    setReferralApplied(false);
    setReferralInput('');
    setDiscountAmount(0);
    setReferralError('');
    setOrder(prev => prev ? {
      ...prev,
      discountAmount: 0,
      finalPrice: prev.basePrice,
      referralCode: null,
    } : prev);
  };

  const handleLanjutkan = async () => {
    if (!selectedMethod || !order) return;
    setLoadingMethod(true);
    try {
      const res = await fetch('/api/payment/select-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          methodId: selectedMethod.id,
          bank: selectedMethod.bank,
          referralCode: order.referralCode,
        }),
      });
      const data = await res.json();
      if (data.vaNumber || data.qrisUrl || data.ewalletUrl) {
        setOrder(prev => prev ? {
          ...prev,
          paymentMethod: selectedMethod.id,
          vaNumber: data.vaNumber,
          qrisUrl: data.qrisUrl,
          ewalletUrl: data.ewalletUrl,
          adminFee: selectedMethod.adminFee,
          total: data.total,
          finalPrice: data.total,
        } : prev);
        setStep(2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMethod(false);
    }
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

  const handleCancel = async () => {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
    setCancelLoading(true);
    try {
      await fetch(`/api/payment/order/${orderId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    } finally {
      setCancelLoading(false);
      router.push('/beli-paket');
    }
  };

  const basePrice = order?.basePrice ?? 0;
  const adminFee = selectedMethod?.adminFee ?? order?.adminFee ?? 0;
  const discount = order?.discountAmount ?? discountAmount;
  const totalDisplay = Math.max(basePrice - discount, 0) + adminFee;

  const formatTanggal = (iso: string) => {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

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
  const activeMethod = PAYMENT_METHODS.find(m => m.id === order.paymentMethod);
  const activeLogo = activeMethod ? getMethodLogo(activeMethod) : null;

  return (
    // ✅ PERUBAHAN: max-w-lg → max-w-2xl (container diperlebar)
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all
            ${step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
            {step > 1 ? <CheckCircle2 size={14} /> : '1'} Pilih Metode
          </span>
          <ChevronRight size={16} className="text-slate-400" />
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all
            ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            2 Bayar
          </span>
        </div>

        {/* ✅ PERUBAHAN: Countdown — background putih, text hitam, timer merah, posisi kanan */}
        {!countdown.expired ? (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm">
            <Clock size={20} className="text-slate-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-slate-800 text-sm font-semibold">Sisa Waktu Pembayaran</p>
              <p className="text-slate-500 text-xs">Selesaikan sebelum waktu habis</p>
            </div>
            {/* ✅ Timer diperbesar & berwarna merah, rata kanan */}
            <div className="font-mono font-bold text-red-600 text-2xl tracking-widest">
              {String(countdown.h).padStart(2,'0')}:{String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <XCircle size={18} className="text-red-500" />
            <p className="text-red-700 text-sm font-semibold">Waktu pembayaran telah habis</p>
          </div>
        )}

        {/* ── STEP 1 ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h2 className="font-bold text-slate-800 text-sm">Ringkasan Pesanan</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Paket</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[320px]">{order.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Harga</span>
                  <span className="text-slate-800">{formatRupiah(basePrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon Referral</span>
                    <span>- {formatRupiah(discount)}</span>
                  </div>
                )}
                {adminFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biaya Admin</span>
                    <span className="text-slate-800">{formatRupiah(adminFee)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">Total</span>
                  <span className="text-blue-600 text-base">{formatRupiah(totalDisplay)}</span>
                </div>
              </div>
            </div>

            {/* Kode Referral */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} className="text-slate-500" />
                <h2 className="font-bold text-slate-800 text-sm">Kode Referral</h2>
                <span className="text-xs text-slate-400">(opsional)</span>
              </div>
              {referralApplied ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">{referralInput.toUpperCase()}</p>
                      <p className="text-xs text-emerald-600">Hemat {formatRupiah(discount)}</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveReferral} className="text-xs text-slate-400 hover:text-red-500 transition">
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralInput}
                    onChange={e => { setReferralInput(e.target.value); setReferralError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyReferral()}
                    placeholder="Masukkan kode referral"
                    className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
                  />
                  <button
                    onClick={handleApplyReferral}
                    disabled={referralLoading || !referralInput.trim()}
                    className="px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition flex items-center gap-1.5"
                  >
                    {referralLoading ? <Loader2 size={14} className="animate-spin" /> : 'Pakai'}
                  </button>
                </div>
              )}
              {referralError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <XCircle size={12} /> {referralError}
                </p>
              )}
            </div>

            {/* Pilih Metode Pembayaran */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="font-bold text-slate-800 text-sm mb-3">Pilih Metode Pembayaran</h2>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(method => {
                  const logo = getMethodLogo(method);
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                        ${selectedMethod?.id === method.id
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'}
                      `}
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-white border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        {logo ? (
                          <Image src={logo} alt={method.name} width={36} height={36} className="object-contain p-1" unoptimized />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600">
                            {method.name.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 leading-tight truncate">{method.name}</p>
                        {method.adminFee > 0
                          ? <p className="text-[10px] text-slate-400">+{formatRupiah(method.adminFee)}</p>
                          : <p className="text-[10px] text-emerald-500">Gratis admin</p>
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleLanjutkan}
              disabled={!selectedMethod || loadingMethod}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMethod
                ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                : <><ChevronRight size={16} /> Lanjutkan Pembayaran</>
              }
            </button>
          </>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            {/* Info transaksi */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                <p className="font-bold text-slate-800 text-base">{order.packageName}</p>
                {/* ✅ PERUBAHAN: kode order warna abu-abu */}
                <button
                  onClick={() => handleCopy(orderId)}
                  className="mt-1 flex items-center gap-1.5 text-slate-400 text-xs font-medium hover:text-slate-600 transition"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  #{orderId}
                </button>
              </div>

              <div className="px-5 py-4 grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <p className="text-xs text-slate-400 mb-2">Metode Pembayaran</p>
                  {activeLogo ? (
                    <Image src={activeLogo} alt={activeMethod?.name ?? ''} width={48} height={48} className="object-contain mb-1" unoptimized />
                  ) : null}
                  <p className="text-sm font-bold text-slate-800 leading-tight">{activeMethod?.name}</p>
                  {order.vaNumber && (
                    <p className="text-slate-800 font-bold text-sm mt-1 tracking-wide">
                      {order.vaNumber.replace(/(.{4})/g, '$1 ').trim()}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <p className="text-xs text-slate-400 mb-2">Waktu Transaksi</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatTanggal(order.expiredAt
                      ? new Date(new Date(order.expiredAt).getTime() - 24 * 60 * 60 * 1000).toISOString()
                      : new Date().toISOString()
                    )}
                  </p>
                </div>

                <div className="col-span-1 flex flex-col items-start">
                  <p className="text-xs text-slate-400 mb-2">Status</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-white uppercase tracking-wide">
                    {order.status === 'pending' ? 'PENDING' : order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Detail Transaksi */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h2 className="font-bold text-slate-800 text-sm">Detail Transaksi</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Paket</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[320px]">{order.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Harga Paket</span>
                  <span className="text-slate-800">{formatRupiah(basePrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1"><Tag size={12} /> {order.referralCode}</span>
                    <span>- {formatRupiah(discount)}</span>
                  </div>
                )}
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

            {/* ✅ VA Number — hitam, rapi, satu baris, tanpa "Atas nama PT. PintuASN" */}
            {order.vaNumber && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-slate-800 text-sm">Nomor Virtual Account</h2>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {activeMethod?.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  {/* ✅ font-mono + whitespace-nowrap + overflow-hidden memastikan satu baris */}
                  <span className="font-mono font-bold text-slate-900 text-xl flex-1 tracking-widest whitespace-nowrap overflow-hidden">
                    {order.vaNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(order.vaNumber!)}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Disalin!' : 'Salin'}
                  </button>
                </div>
                {/* ✅ Keterangan transfer nominal saja, tanpa atas nama */}
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Transfer tepat {formatRupiah(order.total)}
                </p>
              </div>
            )}

            {/* QRIS */}
            {order.qrisUrl && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <h2 className="font-bold text-slate-800 text-sm mb-3">Scan QR Code</h2>
                <div className="inline-block p-3 bg-white border border-slate-200 rounded-xl">
                  <Image src={order.qrisUrl} alt="QRIS" width={200} height={200} unoptimized />
                </div>
                <p className="text-xs text-slate-400 mt-2">Scan menggunakan aplikasi apapun yang mendukung QRIS</p>
              </div>
            )}

            {/* eWallet */}
            {order.ewalletUrl && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-bold text-slate-800 text-sm mb-3">
                  Bayar dengan {activeMethod?.name}
                </h2>
                <a href={order.ewalletUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition">
                  Buka Aplikasi & Bayar
                </a>
                <p className="text-xs text-slate-400 text-center mt-2">Kamu akan diarahkan ke aplikasi e-wallet</p>
              </div>
            )}

            {/* Instructions */}
            {instructions && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-bold text-slate-800 text-sm mb-3">Cara Pembayaran</h2>
                <div className="space-y-2">
                  {instructions.map((inst, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenInstruction(openInstruction === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
                      >
                        <span className="text-sm font-semibold text-slate-700">{inst.title}</span>
                        {openInstruction === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {openInstruction === i && (
                        <div className="px-4 pb-4 space-y-2">
                          {inst.steps.map((s, j) => (
                            <div key={j} className="flex gap-3 text-sm">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                {j + 1}
                              </span>
                              <span className="text-slate-600">{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleCheckStatus}
              disabled={loadingStatus}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {loadingStatus ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Cek Status Pembayaran
            </button>

            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 hover:bg-red-50 py-3 rounded-xl transition disabled:opacity-50"
            >
              {cancelLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Batalkan Pesanan
            </button>

            <button onClick={() => setStep(1)} className="w-full text-sm text-slate-400 hover:text-slate-600 transition py-1">
              ← Ganti metode pembayaran
            </button>
          </>
        )}

        <p className="text-center text-slate-400 text-xs pb-4">
          Butuh bantuan? Hubungi support@pintuasn.com
        </p>
      </div>
    </div>
  );
}