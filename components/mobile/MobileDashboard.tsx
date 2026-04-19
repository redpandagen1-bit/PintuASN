'use client';

// components/mobile/MobileDashboard.tsx
// Mobile-only dashboard layout following Pathfinder Navy MD3 mockup

import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen, ClipboardList, History,
  ShoppingCart, Megaphone, Users, Zap,
  ChevronRight, Play, Clock,
  BookMarked, CheckCircle, BarChart2,
  Award, TrendingUp, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';

// ── Types ─────────────────────────────────────────────────────

interface PackageItem {
  id:                  string;
  title:               string;
  difficulty:          string;
  tier?:               string;
  total_questions?:    number;
  duration_minutes?:   number;
  completedUsersCount: number;
}

interface MaterialItem {
  id:               string;
  title:            string;
  category:         string;
  type:             string;
  tier:             string;
  duration_minutes: number | null;
  is_new:           boolean;
  content_url:      string | null;
}

interface MobileDashboardProps {
  completedCount:         number;
  averageScore:           number;
  bestScore:              number;
  rankingDisplay:         string;
  packages:               PackageItem[];
  packageIdsWithAttempts: string[];
  materials:              MaterialItem[];
  userTier:               SubscriptionTier;
}

// ── Menu grid items (icons sama dengan sidebar desktop) ───────

const MENU_ITEMS = [
  { label: 'Materi',        href: '/materi',        Icon: BookOpen,   gold: false },
  { label: 'Daftar Tryout', href: '/daftar-tryout', Icon: ClipboardList, gold: false },
  { label: 'Riwayat',       href: '/history',       Icon: History,    gold: false },
  { label: 'Beli Paket',    href: '/beli-paket',    Icon: ShoppingCart, gold: true },
  { label: 'Event & Promo', href: '/events-promo',  Icon: Megaphone, gold: false },
  { label: 'Grup',          href: '/roadmap',       Icon: Users,      gold: false },
] as const;

// ── Category chip colors ──────────────────────────────────────

const CAT_CHIP: Record<string, string> = {
  TWK: 'bg-blue-100 text-blue-700',
  TIU: 'bg-violet-100 text-violet-700',
  TKP: 'bg-amber-100 text-amber-700',
};

// ── Helpers ───────────────────────────────────────────────────

function getYoutubeId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return m?.[1] ?? null;
}

// ── Component ─────────────────────────────────────────────────

export function MobileDashboard({
  completedCount,
  averageScore,
  bestScore,
  rankingDisplay,
  packages,
  packageIdsWithAttempts,
  materials,
  userTier,
}: MobileDashboardProps) {
  const activeSet = new Set(packageIdsWithAttempts);

  // ── Offer banner logic ────────────────────────────────────────
  const showOffer  = userTier !== 'platinum';
  const isPremium  = userTier === 'premium';
  const offerPrice = isPremium ? 'Rp 29.000' : 'Rp 99.000';
  const offerOrig  = isPremium ? 'Rp 119.000' : 'Rp 200.000';

  return (
    <main className="space-y-6">

      {/* ── Upgrade / Premium CTA Banner ─────────────────────── */}
      {showOffer && (
        <section className="px-4">
          <div className="rounded-2xl px-4 py-3.5 bg-white border border-slate-200 shadow-sm">
            {/* Row 1: label + badge */}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {isPremium ? 'Upgrade Spesial' : 'Limited Offer'}
            </p>
            {/* Row 2: title + CTA button */}
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-slate-800 leading-tight"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {isPremium ? (
                  <>Upgrade ke <span className="text-violet-600">Platinum</span></>
                ) : (
                  <>Paket <span className="text-violet-600">Premium</span> 2026</>
                )}
              </h3>
              <Link href="/beli-paket" className="flex-shrink-0">
                <button className="font-bold px-4 py-2.5 rounded-xl text-xs active-press flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
                  {isPremium ? 'Upgrade' : 'Beli Sekarang'}
                  <Zap size={14} />
                </button>
              </Link>
            </div>
            {/* Row 3: harga — selalu sebaris */}
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-sm line-through text-slate-400 font-medium">{offerOrig}</span>
              <span className="text-2xl font-black text-slate-800 leading-none"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {offerPrice}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── Menu Grid 3×2 ────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-3">
          {MENU_ITEMS.map(({ label, href, Icon, gold }) => (
            <Link key={label} href={href} className="flex flex-col items-center gap-2 py-3 group active-press">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md3-sm flex items-center justify-center transition-all group-active:scale-95">
                <Icon
                  size={22}
                  className={gold ? 'text-md-secondary' : 'text-md-primary'}
                  strokeWidth={1.8}
                />
              </div>
              <span className="text-[10px] font-bold text-md-primary text-center leading-tight"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Mini Statistik Belajar ─────────────────────────────── */}
      <section className="mx-4">
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl p-4 shadow-lg border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-jakarta)' }}>
                Statistik <span className="text-yellow-400">Belajar</span>
              </h2>
              <p className="text-slate-400 text-[10px] mt-0.5">Pantau perkembangan belajarmu.</p>
            </div>
            <Link href="/statistics">
              <span className="bg-white/10 border border-white/20 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                Detail <ChevronRight size={11} />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Selesai',   value: completedCount, Icon: CheckCircle },
              { label: 'Rata-rata', value: averageScore,   Icon: BarChart2   },
              { label: 'Peringkat', value: rankingDisplay, Icon: Award       },
              { label: 'Terbaik',   value: bestScore,      Icon: TrendingUp  },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-slate-700/50 rounded-xl py-2.5 px-1.5 flex flex-col items-center gap-1">
                <Icon size={13} className="text-yellow-400" strokeWidth={2} />
                <p className="text-white font-extrabold text-sm leading-none text-center"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {value}
                </p>
                <p className="text-slate-400 text-[8px] font-medium leading-tight text-center">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Daftar Tryout (horizontal scroll) ───────────────── */}
      {packages.length > 0 && (
        <section className="space-y-3">
          <div className="flex justify-between items-end px-4">
            <h2 className="text-base font-bold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Daftar Tryout
            </h2>
            <Link href="/daftar-tryout" className="text-xs font-semibold text-md-on-surface-variant uppercase tracking-wide">
              Lihat Semua
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-0 px-4 pb-2">
            {packages.slice(0, 5).map(pkg => {
              const hasActive = activeSet.has(pkg.id);
              const tier = pkg.tier ?? 'free';
              const catLabel = tier === 'free' ? 'TWK' : tier === 'premium' ? 'TIU' : 'TKP';
              const catClass = CAT_CHIP[catLabel] ?? 'bg-slate-100 text-slate-600';

              return (
                <Link
                  key={pkg.id}
                  href={`/packages/${pkg.id}`}
                  className="min-w-[240px] bg-white rounded-2xl p-4 shadow-md3-sm relative overflow-hidden active-press flex-shrink-0 block"
                >
                  {/* Category chip */}
                  <div className="absolute top-0 right-0 p-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded-lg font-extrabold uppercase ${catClass}`}>
                      {catLabel}
                    </span>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm text-md-primary leading-tight pr-10"
                        style={{ fontFamily: 'var(--font-jakarta)' }}>
                        {pkg.title}
                      </h3>
                      <div className="flex items-center gap-3 text-md-on-surface-variant">
                        <span className="flex items-center gap-1 text-[10px] font-medium">
                          <BookMarked size={12} strokeWidth={1.6} />
                          {pkg.total_questions ?? 110} Soal
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-medium">
                          <Clock size={12} strokeWidth={1.6} />
                          {pkg.duration_minutes ?? 100} Mnt
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {/* Participants — sama seperti desktop TryoutSection */}
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <Users size={13} className="text-slate-400" strokeWidth={1.6} />
                        {pkg.completedUsersCount.toLocaleString('id-ID')} Peserta
                      </span>

                      <button className="bg-md-primary text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-transform flex items-center gap-1.5">
                        {hasActive ? (
                          <><Play size={11} fill="currentColor" />Lanjut</>
                        ) : 'Mulai'}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Materi Terbaru ───────────────────────────────────── */}
      {materials.length > 0 && (
        <section className="space-y-3 px-4">
          <div className="flex justify-between items-end">
            <h2 className="text-base font-bold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Materi Terbaru
            </h2>
            <Link href="/materi" className="text-xs font-semibold text-md-on-surface-variant uppercase tracking-wide flex items-center gap-1">
              Lihat Semua <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {materials.slice(0, 4).map(mat => {
              const catChip  = CAT_CHIP[mat.category] ?? 'bg-slate-100 text-slate-600';
              const isVideo  = mat.type === 'video';
              const ytId     = isVideo ? getYoutubeId(mat.content_url) : null;
              const thumbUrl = ytId
                ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                : null;

              return (
                <Link key={mat.id} href={mat.content_url ?? '/materi'} className="block active-press">
                  <div className="bg-white rounded-2xl p-3.5 flex gap-3.5 items-center shadow-md3-sm">
                    {/* Thumbnail / icon */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-md-surface-container relative">
                      {isVideo && thumbUrl ? (
                        <>
                          <Image
                            src={thumbUrl}
                            alt={mat.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                          {/* Play overlay */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                              <Play size={12} className="text-md-primary ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </>
                      ) : isVideo ? (
                        /* Video tanpa YT ID */
                        <div className="w-full h-full bg-md-primary/10 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                            <Play size={12} className="text-md-primary ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      ) : (
                        /* PDF / dokumen */
                        <div className="w-full h-full bg-rose-50 flex flex-col items-center justify-center gap-0.5">
                          <FileText size={20} className="text-rose-400" strokeWidth={1.5} />
                          <span className="text-[8px] font-black text-rose-500 uppercase tracking-wider">PDF</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {mat.is_new && (
                          <span className="bg-md-secondary-container/20 text-md-on-secondary-container text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                            BARU
                          </span>
                        )}
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase', catChip)}>
                          {mat.category}
                        </span>
                        {mat.duration_minutes && (
                          <span className="text-[10px] text-md-on-surface-variant font-medium">
                            {mat.duration_minutes} Mnt
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xs text-md-primary leading-tight line-clamp-2">
                        {mat.title}
                      </h3>
                      <span className="text-[10px] font-bold text-md-secondary uppercase tracking-widest flex items-center gap-1">
                        {isVideo ? 'Tonton Materi' : 'Buka Materi'}
                        <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </main>
  );
}
