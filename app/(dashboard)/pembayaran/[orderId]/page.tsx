// app/(dashboard)/pembayaran/[orderId]/page.tsx
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock, Copy, Check, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, XCircle, RefreshCw, Tag, ChevronRight,
  CreditCard,
} from 'lucide-react';
import {
  PAYMENT_METHODS, METHOD_LOGOS, VA_INSTRUCTIONS, CSTORE_INSTRUCTIONS,
  formatRupiah,
  type PaymentMethod, type OrderData,
} from '@/constants/payment';
import PaymentMethodModal from '@/components/payment/PaymentMethodModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function useCountdown(expiredAt: string, active: boolean) {
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
    if (!active) return;
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc, active]);
  return time;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
  const [copied, setCopied] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);

  const [referralInput, setReferralInput] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/payment/order/${orderId}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          if (data.order.vaNumber || data.order.qrisUrl || data.order.ewalletUrl || data.order.paymentCode) {
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

  // Auto-poll status (only when on step 2)
  useEffect(() => {
    if (!order || order.status !== 'pending' || step !== 2) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status/${orderId}`);
        const data = await res.json();
        if (data.status === 'settlement' || data.status === 'capture') {
          router.push('/dashboard?payment=success');
        } else if (data.status === 'expire' || data.status === 'cancel') {
          setOrder(prev => prev ? { ...prev, status: data.status } : prev);
        }
      } catch (e) { console.error(e); }
    }, 5000);
    return () => clearInterval(t);
  }, [order, orderId, router, step]);

  const countdown = useCountdown(
    order?.expiredAt ?? new Date(Date.now() + 86400000).toISOString(),
    step === 2
  );

  // ─────────────────────────────────────────────────────────────────
  // PATCH: handleApplyReferral (updated)
  // ─────────────────────────────────────────────────────────────────
  const handleApplyReferral = async () => {
    if (!order || !referralInput.trim()) return;
    setReferralLoading(true);
    setReferralError('');
    try {
      // Step 1: Validasi kode (untuk preview di UI)
      const validateRes = await fetch('/api/payment/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralInput.trim(), basePrice: order.basePrice }),
      });
      const validateData = await validateRes.json();
      if (!validateRes.ok) {
        setReferralError(validateData.error || 'Kode tidak valid');
        return;
      }
      // Step 2: Apply ke order — simpan diskon ke database ✅
      const applyRes = await fetch('/api/payment/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralInput.trim(), orderId }),
      });
      const applyData = await applyRes.json();
      if (!applyRes.ok) {
        setReferralError(applyData.error || 'Gagal mengaplikasikan kode');
        return;
      }
      // Update UI state dari hasil apply (sumber kebenaran = DB)
      setDiscountAmount(applyData.discountAmount);
      setReferralApplied(true);
      if (applyData.discountType === 'percent') {
        setDiscountPercent(applyData.discountValue);
      } else {
        setDiscountPercent(null);
      }
      setOrder(prev => prev ? {
        ...prev,
        discountAmount: applyData.discountAmount,
        finalPrice:     applyData.finalPrice,
        referralCode:   referralInput.trim().toUpperCase(),
      } : prev);
    } catch {
      setReferralError('Gagal memvalidasi kode');
    } finally {
      setReferralLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // PATCH: handleRemoveReferral (updated)
  // ─────────────────────────────────────────────────────────────────
  const handleRemoveReferral = async () => {
    // Hapus dari DB dulu
    try {
      await fetch('/api/payment/referral/apply', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
    } catch (e) {
      console.error('Gagal menghapus referral dari DB:', e);
    }
    // Reset UI state
    setReferralApplied(false);
    setReferralInput('');
    setDiscountAmount(0);
    setDiscountPercent(null);
    setReferralError('');
    setOrder(prev => prev ? {
      ...prev,
      discountAmount: 0,
      finalPrice:     prev.basePrice,
      referralCode:   null,
    } : prev);
  };

  // Lanjutkan ke step 2
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
      if (!res.ok) throw new Error(data.error || 'Gagal memproses');
      setOrder(prev => prev ? {
        ...prev,
        paymentMethod: selectedMethod.id,
        vaNumber: data.vaNumber,
        qrisUrl: data.qrisUrl,
        ewalletUrl: data.ewalletUrl,
        paymentCode: data.paymentCode,
        adminFee: selectedMethod.adminFee,
        total: data.total,
        finalPrice: data.total,
      } : prev);
      setStep(2);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Terjadi kesalahan');
    } finally {
      setLoadingMethod(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
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
    } catch (e) { console.error(e); }
    finally {
      setCancelLoading(false);
      router.push('/beli-paket');
    }
  };

  // Derived
  const basePrice    = order?.basePrice ?? 0;
  const adminFee     = selectedMethod?.adminFee ?? order?.adminFee ?? 0;
  const discount     = order?.discountAmount ?? discountAmount;
  const totalDisplay = Math.max(basePrice - discount, 0) + adminFee;

  const activeMethod = PAYMENT_METHODS.find(m => m.id === order?.paymentMethod);
  const instructions =
    activeMethod?.bank ? VA_INSTRUCTIONS[activeMethod.bank] ?? null
    : activeMethod?.type === 'cstore' ? CSTORE_INSTRUCTIONS[activeMethod.id] ?? null
    : null;

  // ─── Loading ────────────────────────────────────────────────────────────────
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

  // Tampilkan "sudah lunas" hanya jika benar-benar settlement
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

  // JANGAN block render untuk cancel/expire — biarkan user lihat info lalu redirect manual
  // hanya tampilkan banner peringatan

  return (
    <>
      {/* Payment Method Modal */}
      {showMethodModal && (
        <PaymentMethodModal
          selected={selectedMethod}
          onSelect={setSelectedMethod}
          onClose={() => setShowMethodModal(false)}
        />
      )}

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

          {/* ── Banner cancel/expire ─────────────────────────────────────────── */}
          {(order.status === 'cancel' || order.status === 'expired' || order.status === 'expire') && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <XCircle size={18} className="text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm font-semibold">Pesanan ini telah dibatalkan atau kadaluarsa</p>
                <p className="text-red-500 text-xs mt-0.5">Silakan buat pesanan baru untuk melanjutkan pembelian.</p>
              </div>
              <button
                onClick={() => router.push('/beli-paket')}
                className="text-xs font-semibold text-red-600 border border-red-300 hover:bg-red-100 px-3 py-1.5 rounded-lg transition flex-shrink-0"
              >
                Beli Ulang
              </button>
            </div>
          )}

          {/* ── Countdown — ONLY on Step 2 ──────────────────────────────────── */}
          {step === 2 && (
            !countdown.expired ? (
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm">
                <Clock size={20} className="text-slate-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-800 text-sm font-semibold">Sisa Waktu Pembayaran</p>
                  <p className="text-slate-500 text-xs">Selesaikan sebelum waktu habis</p>
                </div>
                <div className="font-mono font-bold text-red-600 text-2xl tracking-widest">
                  {String(countdown.h).padStart(2,'0')}:{String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <XCircle size={18} className="text-red-500" />
                <p className="text-red-700 text-sm font-semibold">Waktu pembayaran telah habis</p>
              </div>
            )
          )}

          {/* ══════════════════ STEP 1 ══════════════════════════════════════════ */}
          {step === 1 && (
            <>
              {/* Ringkasan */}
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
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        Diskon Referral
                        {discountPercent !== null && (
                          <span className="ml-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {discountPercent}%
                          </span>
                        )}
                      </span>
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-emerald-700">{referralInput.toUpperCase()}</p>
                          {discountPercent !== null && (
                            <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
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

              {/* Metode Pembayaran — tombol trigger modal */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h2 className="font-bold text-slate-800 text-sm mb-3">Metode Pembayaran</h2>
                <button
                  onClick={() => setShowMethodModal(true)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all
                    ${selectedMethod
                      ? 'border-blue-400 bg-blue-50 hover:border-blue-500'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                  `}
                >
                  {selectedMethod ? (
                    <>
                      <div className="w-9 h-9 flex-shrink-0 bg-white border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        {METHOD_LOGOS[selectedMethod.id] ? (
                          <Image src={METHOD_LOGOS[selectedMethod.id]} alt={selectedMethod.name} width={32} height={32} className="object-contain p-1" unoptimized />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600">{selectedMethod.name.slice(0, 3).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-slate-800">{selectedMethod.name}</p>
                        <p className="text-xs text-slate-400">
                          {selectedMethod.adminFee > 0 ? `+${formatRupiah(selectedMethod.adminFee)} biaya admin` : 'Gratis biaya admin'}
                        </p>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">Ganti</span>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center">
                        <CreditCard size={18} className="text-slate-400" />
                      </div>
                      <span className="flex-1 text-left text-sm text-slate-400">Pilih metode pembayaran</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleLanjutkan}
                disabled={!selectedMethod || loadingMethod}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMethod
                  ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                  : <><ChevronRight size={16} /> Lanjutkan Pembayaran</>}
              </button>
            </>
          )}

          {/* ══════════════════ STEP 2 ══════════════════════════════════════════ */}
          {step === 2 && (
            <>
              {/* Info transaksi */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                  <p className="font-bold text-slate-800 text-base">{order.packageName}</p>
                  <button
                    onClick={() => handleCopy(orderId)}
                    className="mt-1 flex items-center gap-1.5 text-slate-400 text-xs font-medium hover:text-slate-600 transition"
                  >
                    {copied === orderId ? <Check size={13} /> : <Copy size={13} />}
                    #{orderId}
                  </button>
                </div>

                <div className="px-5 py-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Metode Pembayaran</p>
                    {activeMethod && METHOD_LOGOS[activeMethod.id] && (
                      <Image src={METHOD_LOGOS[activeMethod.id]} alt={activeMethod.name} width={48} height={24} className="object-contain mb-1" unoptimized />
                    )}
                    <p className="text-sm font-bold text-slate-800 leading-tight">{activeMethod?.name}</p>
                    {order.vaNumber && (
                      <p className="text-slate-800 font-bold text-sm mt-1 tracking-wide">
                        {order.vaNumber.replace(/(.{4})/g, '$1 ').trim()}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Waktu Transaksi</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatTanggal(
                        order.expiredAt
                          ? new Date(new Date(order.expiredAt).getTime() - 24 * 60 * 60 * 1000).toISOString()
                          : new Date().toISOString()
                      )}
                    </p>
                  </div>
                  <div>
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
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> {order.referralCode}
                        {discountPercent !== null && (
                          <span className="ml-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {discountPercent}%
                          </span>
                        )}
                      </span>
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

              {/* VA Number */}
              {order.vaNumber && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-slate-800 text-sm">Nomor Virtual Account</h2>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{activeMethod?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="font-mono font-bold text-slate-900 text-xl flex-1 tracking-widest whitespace-nowrap overflow-hidden">
                      {order.vaNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(order.vaNumber!)}
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                    >
                      {copied === order.vaNumber ? <Check size={13} /> : <Copy size={13} />}
                      {copied === order.vaNumber ? 'Disalin!' : 'Salin'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">Transfer tepat {formatRupiah(order.total)}</p>
                </div>
              )}

              {/* Payment Code (Convenience Store) */}
              {order.paymentCode && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-slate-800 text-sm">Kode Pembayaran</h2>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{activeMethod?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="font-mono font-bold text-slate-900 text-2xl flex-1 tracking-widest">
                      {order.paymentCode}
                    </span>
                    <button
                      onClick={() => handleCopy(order.paymentCode!)}
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                    >
                      {copied === order.paymentCode ? <Check size={13} /> : <Copy size={13} />}
                      {copied === order.paymentCode ? 'Disalin!' : 'Salin'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">Tunjukkan kode ini ke kasir {activeMethod?.name}</p>
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
                  <h2 className="font-bold text-slate-800 text-sm mb-3">Bayar dengan {activeMethod?.name}</h2>
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

          <div className="pb-4" />
        </div>
      </div>
    </>
  );
}