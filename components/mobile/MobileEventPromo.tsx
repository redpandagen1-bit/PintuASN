'use client';

// components/mobile/MobileEventPromo.tsx
// Mobile-only event & promo — feature-parity dengan desktop EventPromoCard

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link  from 'next/link';
import {
  Copy, Check, Clock, Users, ChevronDown, ChevronUp,
  Tag, Zap, CalendarDays, Ticket, Megaphone,
} from 'lucide-react';
import { cn }          from '@/lib/utils';
import type { Event, EventType } from '@/types/events';

// ── Type config (identik desktop) ─────────────────────────────

const TYPE_CONFIG: Record<EventType, { label: string; color: string; icon: React.ReactNode }> = {
  promo:      { label: 'Promo',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Tag         size={10} /> },
  event:      { label: 'Event',      color: 'bg-blue-100   text-blue-700   border-blue-200',      icon: <CalendarDays size={10} /> },
  flash_sale: { label: 'Flash Sale', color: 'bg-red-100    text-red-700    border-red-200',       icon: <Zap         size={10} /> },
  diskon:     { label: 'Diskon',     color: 'bg-orange-100 text-orange-700 border-orange-200',    icon: <Ticket      size={10} /> },
};

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Countdown hook (sama persis desktop) ─────────────────────

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

// ── Single Event Card ─────────────────────────────────────────

function EventCard({ event }: { event: Event }) {
  const [copied,    setCopied]    = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const countdown = useCountdown(event.end_date);
  const cfg       = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.promo;

  const now          = Date.now();
  const isExpired    = event.end_date    ? new Date(event.end_date).getTime()    < now : false;
  const isComingSoon = event.start_date  ? new Date(event.start_date).getTime()  > now : false;
  const quotaFull    = event.quota != null && event.quota_used >= event.quota;

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
    <div className={cn(
      'bg-white rounded-2xl overflow-hidden shadow-sm',
      (isExpired || quotaFull) && 'opacity-60 grayscale',
    )}>

      {/* Banner */}
      <div className="relative w-full aspect-[3/1] overflow-hidden bg-slate-100">
        <Image
          src={event.banner_url}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw"
        />

        {/* Status badges — top-left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            'flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm',
            cfg.color,
          )}>
            {cfg.icon} {cfg.label}
          </span>
          {isComingSoon && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-white backdrop-blur-sm">
              Coming Soon
            </span>
          )}
          {isExpired && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/80 text-white backdrop-blur-sm">
              Berakhir
            </span>
          )}
          {quotaFull && !isExpired && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-600/80 text-white backdrop-blur-sm">
              Habis
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">

        {/* Title + Benefit */}
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug">{event.title}</h3>
          {event.benefit && (
            <p className="mt-0.5 text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {event.benefit}
            </p>
          )}
        </div>

        {/* Periode + Countdown */}
        {(event.start_date || event.end_date) && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays size={12} className="shrink-0" />
              <span>
                {event.start_date ? formatDate(event.start_date) : 'Sekarang'}
                {' – '}
                {event.end_date ? formatDate(event.end_date) : 'Tidak terbatas'}
              </span>
            </div>

            {/* Countdown — tampil jika < 7 hari & belum expired & bukan coming soon */}
            {countdown && !countdown.expired && !isComingSoon && countdown.d < 7 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Clock size={11} className="text-red-500 shrink-0" />
                <span className="text-[11px] text-red-600 font-medium">Berakhir dalam</span>
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
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
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Quota bar */}
        {event.quota != null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Users size={11} /> Kuota
              </span>
              <span className={cn(
                'font-medium',
                quotaFull ? 'text-red-500 font-semibold' : 'text-slate-700',
              )}>
                {quotaFull
                  ? 'Kuota habis'
                  : `${event.quota - event.quota_used} sisa dari ${event.quota}`}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  quotaFull ? 'bg-red-400' : 'bg-emerald-500',
                )}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Promo / Referral code */}
        {event.referral_code && (
          <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-widest mb-0.5">
                Kode Promo
              </p>
              <p className="font-mono font-extrabold text-emerald-800 text-base tracking-widest truncate">
                {event.referral_code}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className={cn(
                'shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all',
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-emerald-300 text-emerald-700 active:bg-emerald-50',
              )}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
        )}

        {/* Syarat & Ketentuan (collapsible) */}
        {event.terms && (
          <div className="bg-slate-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setTermsOpen(v => !v)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-600 active:bg-slate-100 transition-colors"
            >
              <span>Syarat &amp; Ketentuan</span>
              {termsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {termsOpen && (
              <div className="px-3.5 pb-3 pt-1 text-xs text-slate-500 leading-relaxed bg-slate-100 whitespace-pre-line">
                {event.terms}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {event.cta_link && !isExpired && !quotaFull && !isComingSoon && (
          <Link href={event.cta_link}>
            <button className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold active:bg-emerald-700 transition-colors">
              {event.cta_label ?? 'Klaim Sekarang'}
            </button>
          </Link>
        )}
        {isComingSoon && (
          <button disabled className="w-full py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm font-semibold cursor-not-allowed">
            Segera Hadir
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────

interface MobileEventPromoProps {
  events: Event[];
}

export function MobileEventPromo({ events }: MobileEventPromoProps) {
  return (
    <main className="pb-24 space-y-4">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-0.5">
          <Megaphone size={18} className="text-emerald-600" />
          <h1 className="text-xl font-extrabold text-slate-900"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Event &amp; Promo
          </h1>
        </div>
        <p className="text-slate-500 text-xs">
          Dapatkan penawaran terbaik untuk persiapan SKD kamu. Jangan sampai kehabisan!
        </p>
      </div>

      {/* ── Empty state ───────────────────────────────────────── */}
      {events.length === 0 && (
        <div className="mx-4 bg-white rounded-2xl p-12 flex flex-col items-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Megaphone size={24} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">Belum ada promo aktif</h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
            Pantau terus halaman ini — promo &amp; event menarik akan segera hadir!
          </p>
        </div>
      )}

      {/* ── Event cards ───────────────────────────────────────── */}
      {events.length > 0 && (
        <div className="px-4 space-y-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

    </main>
  );
}
