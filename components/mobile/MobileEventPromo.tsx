'use client';

// components/mobile/MobileEventPromo.tsx
// Mobile-only event & promo page — Pathfinder Navy MD3 design

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Copy, ChevronRight, Check, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Event } from '@/types/events';

// ── Types ─────────────────────────────────────────────────────

interface MobileEventPromoProps {
  events: Event[];
}

// ── Helpers ───────────────────────────────────────────────────

function formatEventDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function typeLabel(type: string) {
  switch (type) {
    case 'flash_sale': return 'FLASH SALE';
    case 'diskon':     return 'DISKON';
    case 'promo':      return 'PROMO';
    default:           return 'EVENT';
  }
}

// ── CopyButton ────────────────────────────────────────────────

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-md-secondary text-sm font-bold active-press"
    >
      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
      {copied ? 'Tersalin!' : `COPY: ${code}`}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────

export function MobileEventPromo({ events }: MobileEventPromoProps) {
  const featured = events[0] ?? null;
  const rest     = events.slice(1);

  return (
    <main className="pb-32">

      {/* ── Page Title ────────────────────────────────────────── */}
      <section className="px-6 pt-6 pb-2">
        <h1 className="text-3xl font-extrabold text-md-primary tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Event &amp; Promo
        </h1>
        <p className="text-md-on-surface-variant text-sm font-medium">
          Temukan penawaran terbaik untuk perjalanan karir ASN Anda.
        </p>
      </section>

      {/* ── Featured Promo Card ───────────────────────────────── */}
      {featured ? (
        <section className="px-6 mt-6 mb-2">
          <div className="relative bg-md-primary-container rounded-[2rem] overflow-hidden shadow-md3-lg min-h-[220px] flex flex-col justify-end p-6">
            {/* Background image */}
            {featured.banner_url && (
              <div className="absolute inset-0 opacity-40">
                <img
                  src={featured.banner_url}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-md-primary/80 via-md-primary/20 to-transparent" />

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-md-secondary-container text-md-on-secondary-container text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-3">
                {typeLabel(featured.type)}
              </span>
              <h2 className="text-2xl font-extrabold text-white leading-tight mb-2"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {featured.title}
              </h2>
              {featured.description && (
                <p className="text-white/80 text-sm font-medium mb-4">
                  {featured.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                {(featured.start_date || featured.end_date) && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                    <Clock size={14} />
                    {featured.start_date && formatEventDate(featured.start_date)}
                    {featured.start_date && featured.end_date && ' — '}
                    {featured.end_date && formatEventDate(featured.end_date)}
                  </div>
                )}
                {featured.referral_code ? (
                  <button
                    onClick={() => navigator.clipboard.writeText(featured.referral_code!)}
                    className="bg-md-secondary-container text-md-on-secondary-container px-5 py-2.5 rounded-xl font-bold text-sm shadow-md3-sm active-press"
                  >
                    Copy Code
                  </button>
                ) : featured.cta_link ? (
                  <Link href={featured.cta_link}>
                    <button className="bg-md-secondary-container text-md-on-secondary-container px-5 py-2.5 rounded-xl font-bold text-sm shadow-md3-sm active-press">
                      {featured.cta_label}
                    </button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Empty state */
        <section className="px-6 mt-8 flex flex-col items-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-md-surface-container flex items-center justify-center mb-4">
            <Tag size={28} className="text-md-on-surface-variant" />
          </div>
          <h3 className="font-bold text-md-primary text-lg mb-1">Belum ada promo aktif</h3>
          <p className="text-md-on-surface-variant text-sm max-w-xs">
            Pantau terus halaman ini — promo &amp; event menarik akan segera hadir!
          </p>
        </section>
      )}

      {/* ── Promo List ────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="px-6 mt-6 space-y-6">
          {rest.map(event => {
            const isComingSoon = event.start_date
              ? new Date(event.start_date) > new Date()
              : false;

            return (
              <div
                key={event.id}
                className={cn(
                  'bg-md-surface-container-low rounded-[2rem] p-4 flex flex-col gap-4',
                  isComingSoon && 'opacity-75',
                )}
              >
                {/* Banner image */}
                {event.banner_url && (
                  <div className="h-44 rounded-2xl overflow-hidden relative">
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className={cn(
                        'w-full h-full object-cover',
                        isComingSoon && 'grayscale',
                      )}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm uppercase',
                        isComingSoon
                          ? 'bg-md-primary text-white'
                          : 'bg-white/90 backdrop-blur-sm text-md-secondary',
                      )}>
                        {isComingSoon ? 'COMING SOON' : (event.benefit ?? typeLabel(event.type))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="px-2 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-md-primary"
                      style={{ fontFamily: 'var(--font-jakarta)' }}>
                      {event.title}
                    </h3>
                    {event.benefit && (
                      <span className="text-md-secondary font-extrabold text-xl">
                        {event.benefit}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-md-on-surface-variant text-sm mb-4 leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-md-outline flex items-center gap-1">
                      <Clock size={12} />
                      {event.end_date
                        ? `Hingga ${formatEventDate(event.end_date)}`
                        : event.start_date
                        ? `Mulai ${formatEventDate(event.start_date)}`
                        : 'Selama persediaan ada'}
                    </span>

                    {isComingSoon ? (
                      <span className="bg-md-surface-container-highest text-md-on-surface-variant px-4 py-2 rounded-xl text-xs font-bold">
                        Nantikan
                      </span>
                    ) : event.referral_code ? (
                      <CopyButton code={event.referral_code} />
                    ) : event.cta_link ? (
                      <Link href={event.cta_link}>
                        <button className="text-md-secondary text-sm font-bold flex items-center gap-1 active-press">
                          {event.cta_label}
                          <ChevronRight size={14} />
                        </button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ── Referral Reward Card ──────────────────────────────── */}
      <div className="mx-6 mt-6 bg-md-surface-container-low rounded-[2rem] p-4 flex gap-4 items-center">
        <div className="w-20 h-20 bg-md-secondary-container rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-3xl">🎁</span>
        </div>
        <div className="flex-grow">
          <h4 className="text-sm font-bold text-md-primary mb-1"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Referral Reward
          </h4>
          <p className="text-[12px] text-md-on-surface-variant leading-tight">
            Undang teman dan dapatkan koin gratis senilai Rp&nbsp;50.000.
          </p>
        </div>
        <ChevronRight size={18} className="text-md-secondary flex-shrink-0" />
      </div>

    </main>
  );
}
