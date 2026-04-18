'use client';

// components/mobile/MobilePaymentStatus.tsx
// Mobile-only payment status/VA page — Pathfinder Navy MD3 design

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────

interface MobilePaymentStatusProps {
  orderId:      string;
  status:       string;
  totalAmount:  number;
  vaNumber?:    string | null;
  bankName?:    string | null;
  expiredAt?:   string | null;
  packageName?: string | null;
  onCheckStatus: () => Promise<void>;
}

// ── Countdown hook ────────────────────────────────────────────

function useCountdown(expiredAt: string | null | undefined) {
  const calc = useCallback(() => {
    if (!expiredAt) return { h: 0, m: 0, s: 0, expired: true };
    const diff = new Date(expiredAt).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, expired: false };
  }, [expiredAt]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

// ── Instruction item ──────────────────────────────────────────

function InstructionGroup({
  title,
  icon,
  steps,
}: {
  title: string;
  icon:  React.ReactNode;
  steps: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md3-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center justify-between p-4 transition-colors text-left',
          open ? 'bg-md-surface-container-low/30 border-l-4 border-md-secondary' : 'hover:bg-md-surface-container-low/50',
        )}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className={cn('font-semibold text-sm', open ? 'text-md-primary font-bold' : 'text-md-on-surface')}>
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp size={18} className="text-md-secondary" />
          : <ChevronDown size={18} className="text-md-outline" />
        }
      </button>
      {open && steps.length > 0 && (
        <div className="p-5 pt-2 space-y-4 text-xs leading-relaxed text-md-on-surface-variant">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary text-white text-[10px] flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <p dangerouslySetInnerHTML={{ __html: step }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

export function MobilePaymentStatus({
  orderId,
  status,
  totalAmount,
  vaNumber,
  bankName,
  expiredAt,
  packageName,
  onCheckStatus,
}: MobilePaymentStatusProps) {
  const [copied, setCopied]   = useState(false);
  const [checking, setChecking] = useState(false);
  const countdown             = useCountdown(expiredAt);

  const isPending  = status === 'pending';
  const isPaid     = status === 'paid' || status === 'settlement';
  const isExpired  = countdown.expired && isPending;

  async function handleCopy() {
    if (!vaNumber) return;
    await navigator.clipboard.writeText(vaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCheck() {
    setChecking(true);
    try { await onCheckStatus(); } finally { setChecking(false); }
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  return (
    <main className="px-6 py-4 max-w-md mx-auto">

      {/* ── Status & Timer ────────────────────────────────────── */}
      <div className="mb-6">
        <div className="bg-md-surface-container-low rounded-xl p-5 flex items-center justify-between overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-md-secondary-container opacity-10 rounded-full blur-2xl" />
          <div>
            <span className="text-label-sm text-md-on-surface-variant mb-1 block">Status</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'w-2 h-2 rounded-full',
                isPaid ? 'bg-emerald-500' : isExpired ? 'bg-md-error' : 'bg-md-secondary',
              )} />
              <span className={cn(
                'font-bold text-lg',
                isPaid ? 'text-emerald-600' : isExpired ? 'text-md-error' : 'text-md-secondary',
              )} style={{ fontFamily: 'var(--font-jakarta)' }}>
                {isPaid ? 'Lunas' : isExpired ? 'Kedaluwarsa' : 'Pending'}
              </span>
            </div>
          </div>
          {!isPaid && !isExpired && expiredAt && (
            <div className="text-right">
              <span className="text-label-sm text-md-on-surface-variant mb-1 block">Berakhir Dalam</span>
              <div className="font-extrabold text-md-primary text-xl tracking-tight"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {pad(countdown.h)} : {pad(countdown.m)} : {pad(countdown.s)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Payment Details Card ──────────────────────────────── */}
      <div className="bg-white rounded-xl p-6 shadow-md3-sm mb-6">
        {/* Total */}
        <div className="mb-8 pb-6 border-b border-dashed border-md-outline-variant/20">
          <p className="text-xs text-md-on-surface-variant font-medium mb-2">Total Pembayaran</p>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg text-md-primary">Rp</span>
            <span className="font-extrabold text-3xl text-md-primary tracking-tight"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
          {packageName && (
            <p className="text-xs text-md-on-surface-variant mt-1">{packageName}</p>
          )}
        </div>

        {/* VA Number */}
        {vaNumber && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-md-on-surface-variant font-medium mb-1">Nomor Virtual Account</p>
                <p className="font-bold text-xl text-md-primary tracking-wider"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {vaNumber}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="bg-md-surface-container-low p-3 rounded-xl text-md-primary hover:bg-md-surface-container active-press"
              >
                {copied ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
              </button>
            </div>

            {/* Bank info */}
            {bankName && (
              <div className="flex items-center gap-3 bg-md-surface-container-low p-4 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-lg">
                  🏦
                </div>
                <div>
                  <p className="font-bold text-sm text-md-primary">{bankName}</p>
                  <p className="text-[10px] text-md-on-surface-variant">Virtual Account</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Payment Instructions ──────────────────────────────── */}
      {vaNumber && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="font-bold text-md-on-surface"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              Cara Pembayaran
            </h2>
          </div>
          <InstructionGroup
            title="ATM"
            icon={<span className="text-md-on-surface-variant text-xl">🏧</span>}
            steps={[
              'Masukkan kartu ATM dan PIN Anda.',
              'Pilih menu <strong>Transaksi Lainnya</strong> → <strong>Transfer</strong> → <strong>Virtual Account</strong>.',
              `Masukkan nomor Virtual Account <strong>${vaNumber}</strong>.`,
              'Konfirmasi detail transaksi dan selesaikan pembayaran.',
            ]}
          />
          <InstructionGroup
            title="Mobile Banking"
            icon={<span className="text-md-secondary text-xl">📱</span>}
            steps={[
              'Buka aplikasi mobile banking bank Anda.',
              'Pilih menu <strong>Pembayaran</strong> → <strong>Virtual Account</strong>.',
              `Masukkan nomor Virtual Account <strong>${vaNumber}</strong>.`,
              'Konfirmasi detail pembayaran dan masukkan PIN mobile banking Anda.',
            ]}
          />
          <InstructionGroup
            title="Internet Banking"
            icon={<span className="text-md-on-surface-variant text-xl">🌐</span>}
            steps={[
              'Login ke internet banking bank Anda.',
              'Pilih menu <strong>Transfer</strong> → <strong>Virtual Account</strong>.',
              `Masukkan nomor <strong>${vaNumber}</strong> sebagai nomor tujuan.`,
              'Konfirmasi dan selesaikan transaksi.',
            ]}
          />
        </div>
      )}

      {/* ── Fixed Bottom CTA ──────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-md-outline-variant/10 z-40">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleCheck}
            disabled={checking || isPaid}
            className={cn(
              'w-full font-extrabold py-4 rounded-xl shadow-md3-sm active-press flex items-center justify-center gap-2 text-sm',
              isPaid
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-md-secondary-container text-md-primary',
            )}
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            {checking
              ? <><RefreshCw size={16} className="animate-spin" /> Memeriksa...</>
              : isPaid
              ? '✅ Pembayaran Berhasil'
              : <><RefreshCw size={16} /> Cek Status Pembayaran</>
            }
          </button>
          <p className="text-center text-[10px] text-md-on-surface-variant px-4">
            Setelah melakukan pembayaran, mohon tunggu beberapa saat selagi sistem memproses transaksi Anda.
          </p>
        </div>
      </div>

    </main>
  );
}
