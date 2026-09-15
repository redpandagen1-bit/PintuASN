'use client';

// components/payment/OrderDetailPopup.tsx
// Popup detail pembayaran — dipakai bersama oleh halaman desktop (beli-paket)
// dan versi mobile (MobilePaketBelajar) supaya kontennya selalu identik.

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, X, Clock, Tag, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, CreditCard, RefreshCw, Copy, Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { IS_SNAP_MODE, openSnapForOrder } from '@/lib/payment/snap-client';
import { copyToClipboard } from '@/lib/utils';

// ─── Payment logos & names ──────────────────────────────────────────────────

export const METHOD_LOGOS: Record<string, string> = {
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

export const METHOD_NAMES: Record<string, string> = {
  bri_va: 'BRI Virtual Account', bca_va: 'BCA Virtual Account',
  mandiri_va: 'Mandiri Virtual Account', bni_va: 'BNI Virtual Account',
  qris: 'QRIS', gopay: 'GoPay', shopeepay: 'ShopeePay', dana: 'DANA',
  alfamart: 'Alfamart', indomaret: 'Indomaret', other_bank: 'SeaBank & Bank Lain',
  snap: 'Menunggu pemilihan metode',
};

// ─── Types ────────────────────────────────────────────────────────────────

export interface OrderDetail {
  orderId: string; packageName: string; basePrice: number; adminFee: number;
  discountAmount: number; referralCode: string | null; total: number;
  finalPrice: number; expiredAt: string; status: string;
  paymentMethod?: string; vaNumber?: string; qrisUrl?: string;
  ewalletUrl?: string; paymentCode?: string;
}

// ─── Status maps ────────────────────────────────────────────────────────────

export const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', SETTLEMENT: 'bg-green-100 text-green-700',
  SUCCESS: 'bg-green-100 text-green-700', FAILED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-100 text-slate-500', CANCEL: 'bg-slate-100 text-slate-500',
};
export const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu Pembayaran', SETTLEMENT: 'Lunas', SUCCESS: 'Lunas',
  FAILED: 'Gagal', EXPIRED: 'Kadaluarsa', CANCEL: 'Dibatalkan',
};

export function formatRupiah(n: number) { return 'Rp ' + n.toLocaleString('id-ID'); }

// ─── Countdown ────────────────────────────────────────────────────────────

function useCountdown(expiredAt: string) {
  const calc = useCallback(() => {
    const diff = new Date(expiredAt).getTime() - Date.now();
    if (!expiredAt || isNaN(diff)) return { h: 0, m: 0, s: 0, expired: false };
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), expired: false };
  }, [expiredAt]);
  const [time, setTime] = useState(calc);
  useEffect(() => {
    setTime(calc()); // koreksi seketika saat expiredAt berubah (hindari flash 24 jam)
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);
  return time;
}

// ─── VA Instructions ────────────────────────────────────────────────────────

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

// ─── Order Detail Popup ─────────────────────────────────────────────────────

export function OrderDetailPopup({ orderId, onClose, onChanged }: { orderId: string; onClose: () => void; onChanged: () => void }) {
  const router = useRouter();
  const [order, setOrder]         = useState<OrderDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState<string | null>(null);
  const [openInstr, setOpenInstr] = useState<number | null>(0);
  const [payLoading, setPayLoading]       = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const fetchOrder = useCallback(() => {
    return fetch(`/api/payment/order/${orderId}`)
      .then(r => r.json()).then(d => { if (d.order) setOrder(d.order); })
      .catch(console.error);
  }, [orderId]);

  useEffect(() => {
    fetchOrder().finally(() => setLoading(false));
  }, [fetchOrder]);

  // Jangan pakai fallback Date.now()+24jam — itu bikin countdown "balik ke 24 jam"
  // saat order belum kemuat. Pakai expiredAt asli; kalau kosong, countdown netral.
  const countdown = useCountdown(order?.expiredAt ?? '');
  const copy = (text: string) => { copyToClipboard(text); setCopied(text); setTimeout(() => setCopied(null), 2000); };

  const isPending  = order?.status === 'pending';
  const methodKey  = order?.paymentMethod ?? '';
  const methodName = METHOD_NAMES[methodKey] ?? methodKey;
  const methodLogo = METHOD_LOGOS[methodKey] ?? null;

  // Lanjutkan pembayaran — buka popup Snap langsung di sini (mode Snap),
  // atau pindah ke halaman pembayaran khusus untuk mode Core API.
  const handleContinuePayment = async () => {
    if (!IS_SNAP_MODE) { router.push(`/pembayaran/${orderId}`); return; }
    setStatusNotice(null);
    setPayLoading(true);
    try {
      await openSnapForOrder(orderId, {
        onSuccess: () => { onChanged(); fetchOrder(); },
        onPending: () => { onChanged(); fetchOrder(); },
        onClose:   () => { onChanged(); fetchOrder(); },
        onError:   () => alert('Pembayaran gagal. Silakan coba lagi.'),
      });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Terjadi kesalahan');
    } finally {
      // Popup Snap sudah tampil (atau gagal dibuka) — tombol boleh aktif
      // lagi di sini juga, tidak menunggu popup ditutup.
      setPayLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setConfirmingCancel(false);
    setStatusNotice(null);
    setCancelLoading(true);
    try {
      await fetch(`/api/payment/order/${orderId}`, { method: 'DELETE' });
      await fetchOrder();
      onChanged();
    } catch (e) { console.error(e); }
    finally { setCancelLoading(false); }
  };

  const handleCheckStatus = async () => {
    setStatusLoading(true);
    setStatusNotice(null);
    try {
      const res  = await fetch(`/api/payment/status/${orderId}`);
      const data = await res.json();
      if (data.status === 'settlement' || data.status === 'capture') {
        await fetchOrder();
        onChanged();
        setStatusNotice({ type: 'success', text: 'Pembayaran sudah diterima. Paket kamu sudah aktif.' });
      } else {
        setStatusNotice({ type: 'info', text: 'Pembayaran belum diterima. Silakan cek lagi beberapa saat.' });
      }
    } catch (e) {
      console.error(e);
      setStatusNotice({ type: 'info', text: 'Gagal memeriksa status. Coba lagi.' });
    } finally { setStatusLoading(false); }
  };

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
                {isPending && !countdown.expired && (
                  <div className="space-y-2">
                    <button
                      onClick={handleContinuePayment}
                      disabled={payLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {payLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                      Lanjutkan Pembayaran
                    </button>

                    {confirmingCancel ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-red-700 text-center">Yakin ingin membatalkan pesanan ini?</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setConfirmingCancel(false)}
                            disabled={cancelLoading}
                            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 rounded-lg text-xs transition disabled:opacity-50"
                          >
                            Tidak
                          </button>
                          <button
                            onClick={handleCancelOrder}
                            disabled={cancelLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                          >
                            {cancelLoading && <Loader2 size={13} className="animate-spin" />}
                            Ya, Batalkan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleCheckStatus}
                          disabled={statusLoading}
                          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                        >
                          {statusLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                          Cek Status
                        </button>
                        <button
                          onClick={() => { setStatusNotice(null); setConfirmingCancel(true); }}
                          disabled={cancelLoading}
                          className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                        >
                          {cancelLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                          Batalkan
                        </button>
                      </div>
                    )}

                    {statusNotice && (
                      <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium
                        ${statusNotice.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                        {statusNotice.type === 'success' ? <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" /> : <Clock size={14} className="flex-shrink-0 mt-0.5" />}
                        <span>{statusNotice.text}</span>
                      </div>
                    )}
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
