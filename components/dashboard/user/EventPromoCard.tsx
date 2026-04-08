'use client';

// ============================================================
// components/dashboard/user/EventPromoCard.tsx
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import Image      from 'next/image';
import Link       from 'next/link';
import {
  Copy, Check, Clock, Users, ChevronDown, ChevronUp,
  Tag, Zap, CalendarDays, Ticket,
} from 'lucide-react';
import { Badge }    from '@/components/ui/badge';
import { Button }   from '@/components/ui/button';
import type { Event, EventType } from '@/types/events';

// ── helpers ──────────────────────────────────────────────────

const TYPE_CONFIG: Record<EventType, { label: string; color: string; icon: React.ReactNode }> = {
  promo:      { label: 'Promo',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Tag  size={11} /> },
  event:      { label: 'Event',      color: 'bg-blue-100   text-blue-700   border-blue-200',   icon: <CalendarDays size={11} /> },
  flash_sale: { label: 'Flash Sale', color: 'bg-red-100    text-red-700    border-red-200',    icon: <Zap  size={11} /> },
  diskon:     { label: 'Diskon',     color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Ticket size={11} /> },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Countdown hook
function useCountdown(endDate: string | null) {
  const calc = useCallback(() => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000)  / 60_000);
    const s = Math.floor((diff % 60_000)     / 1_000);
    return { d, h, m, s, expired: false };
  }, [endDate]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!endDate) return;
    const id = setInterval(() => setTime(calc()), 1_000);
    return () => clearInterval(id);
  }, [endDate, calc]);

  return time;
}

// ── main component ────────────────────────────────────────────

interface Props { event: Event }

export default function EventPromoCard({ event }: Props) {
  const [copied,      setCopied]      = useState(false);
  const [termsOpen,   setTermsOpen]   = useState(false);
  const countdown = useCountdown(event.end_date);
  const cfg       = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.promo;

  // Status
  const now       = Date.now();
  const isExpired = event.end_date ? new Date(event.end_date).getTime() < now : false;
  const isComingSoon = event.start_date ? new Date(event.start_date).getTime() > now : false;
  const quotaFull = event.quota != null && event.quota_used >= event.quota;

  // Quota %
  const quotaPct = event.quota
    ? Math.min(100, Math.round((event.quota_used / event.quota) * 100))
    : null;

  const handleCopy = async () => {
    if (!event.referral_code) return;
    await navigator.clipboard.writeText(event.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={[
      'group relative flex flex-col rounded-2xl overflow-hidden border bg-white',
      'shadow-sm hover:shadow-lg transition-all duration-300',
      (isExpired || quotaFull) ? 'opacity-60 grayscale' : '',
    ].join(' ')}>

      {/* ── Banner ─────────────────────────────────────────── */}
      <div className="relative w-full aspect-[3/1] overflow-hidden bg-slate-100">
        <Image
          src={event.banner_url}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Overlay badge top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border backdrop-blur-sm ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
          {isComingSoon && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-800/80 text-white backdrop-blur-sm">
              Coming Soon
            </span>
          )}
          {isExpired && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-500/80 text-white backdrop-blur-sm">
              Berakhir
            </span>
          )}
          {quotaFull && !isExpired && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-600/80 text-white backdrop-blur-sm">
              Habis
            </span>
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Title + Benefit */}
        <div>
          <h3 className="font-bold text-slate-900 text-lg leading-snug">{event.title}</h3>
          {event.benefit && (
            <p className="mt-1 text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {event.benefit}
            </p>
          )}
        </div>

        {/* Periode + Countdown */}
        {(event.start_date || event.end_date) && (
          <div className="space-y-2">
            {/* Tanggal */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays size={13} className="shrink-0" />
              <span>
                {event.start_date ? formatDate(event.start_date) : 'Sekarang'}
                {' '}&ndash;{' '}
                {event.end_date ? formatDate(event.end_date) : 'Tidak terbatas'}
              </span>
            </div>

            {/* Countdown — hanya tampil jika ada end_date & belum expired & selisih < 7 hari */}
            {countdown && !countdown.expired && !isComingSoon && countdown.d < 7 && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-red-500 shrink-0" />
                <span className="text-xs text-red-600 font-medium">Berakhir dalam</span>
                <div className="flex items-center gap-1 text-xs font-mono font-bold">
                  {countdown.d > 0 && (
                    <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                      {countdown.d}h
                    </span>
                  )}
                  <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                    {String(countdown.h).padStart(2, '0')}j
                  </span>
                  <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                    {String(countdown.m).padStart(2, '0')}m
                  </span>
                  <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                    {String(countdown.s).padStart(2, '0')}d
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Quota bar */}
        {event.quota != null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users size={12} /> Kuota
              </span>
              <span className={quotaFull ? 'text-red-500 font-semibold' : 'font-medium text-slate-700'}>
                {quotaFull
                  ? 'Kuota habis'
                  : `${event.quota - event.quota_used} sisa dari ${event.quota}`}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${quotaFull ? 'bg-red-400' : 'bg-emerald-500'}`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Referral / Promo Code */}
        {event.referral_code && (
          <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-widest mb-0.5">
                Kode Promo
              </p>
              <p className="font-mono font-extrabold text-emerald-800 text-lg tracking-widest truncate">
                {event.referral_code}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className={[
                'shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all',
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100',
              ].join(' ')}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
        )}

        {/* Syarat & Ketentuan */}
        {event.terms && (
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => setTermsOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span>Syarat &amp; Ketentuan</span>
              {termsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {termsOpen && (
              <div className="px-4 pb-3 pt-1 text-xs text-slate-500 leading-relaxed border-t bg-slate-50 whitespace-pre-line">
                {event.terms}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {event.cta_link && !isExpired && !quotaFull && !isComingSoon && (
          <div className="mt-auto pt-1">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11">
              <Link href={event.cta_link}>{event.cta_label ?? 'Klaim Sekarang'}</Link>
            </Button>
          </div>
        )}
        {isComingSoon && (
          <div className="mt-auto pt-1">
            <Button disabled className="w-full rounded-xl h-11 font-semibold" variant="outline">
              Segera Hadir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}