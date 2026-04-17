'use client';

// components/mobile/MobileDashboard.tsx
// Mobile-only dashboard layout following Pathfinder Navy MD3 mockup

import Link from 'next/link';
import {
  BookOpen, ClipboardList, History,
  ShoppingCart, Megaphone, Users2,
  ChevronRight, ArrowRight, Play,
  BookMarked, Clock, Zap,
} from 'lucide-react';
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

// ── Menu grid items ───────────────────────────────────────────

const MENU_ITEMS = [
  { label: 'Materi',              href: '/materi',         Icon: BookOpen,      gold: false },
  { label: 'Daftar Tryout',       href: '/daftar-tryout',  Icon: ClipboardList, gold: false },
  { label: 'Riwayat',             href: '/history',        Icon: History,       gold: false },
  { label: 'Beli Paket',          href: '/beli-paket',     Icon: ShoppingCart,  gold: true  },
  { label: 'Event & Promo',       href: '/events-promo',   Icon: Megaphone,     gold: false },
  { label: 'Grup',                href: '/roadmap',        Icon: Users2,        gold: false },
] as const;

// ── Category chip colors ──────────────────────────────────────

const CAT_CHIP: Record<string, string> = {
  TWK: 'bg-blue-100 text-blue-700',
  TIU: 'bg-violet-100 text-violet-700',
  TKP: 'bg-amber-100 text-amber-700',
};

// ── Component ─────────────────────────────────────────────────

export function MobileDashboard({
  completedCount,
  averageScore,
  bestScore,
  packages,
  packageIdsWithAttempts,
  materials,
}: MobileDashboardProps) {
  const activeSet = new Set(packageIdsWithAttempts);

  return (
    <main className="px-6 space-y-8 mt-4 pb-28">

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-md-primary text-white p-8 min-h-[200px] flex flex-col justify-center">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-md-primary via-md-primary/90 to-md-tertiary-container/80 rounded-[2rem]" />
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute right-10 bottom-0 w-24 h-24 bg-md-secondary-container/10 rounded-full blur-xl" />

        <div className="relative z-10 space-y-4">
          <h1 className="text-2xl font-extrabold leading-tight max-w-[240px]"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Siap Menaklukkan<br />CPNS 2026?
          </h1>
          <p className="text-md-on-primary-container text-sm max-w-[210px] leading-relaxed">
            Asah kemampuanmu setiap hari dengan materi terupdate.
          </p>
          <Link href="/daftar-tryout">
            <button className="inline-flex items-center gap-2 bg-md-secondary-container text-md-primary font-bold px-6 py-3 rounded-xl active-press mt-1 shadow-md3-md">
              Mulai Perjalananmu
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Quick Stats Row ───────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Selesai',  value: completedCount },
          { label: 'Avg Skor', value: averageScore   },
          { label: 'Terbaik',  value: bestScore      },
        ].map(({ label, value }) => (
          <div key={label} className="bento-card p-3 text-center">
            <p className="text-xl font-black text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
              {value}
            </p>
            <p className="text-[10px] font-semibold text-md-on-surface-variant uppercase tracking-wider mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Menu Grid 3×2 ────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-3 gap-4">
          {MENU_ITEMS.map(({ label, href, Icon, gold }) => (
            <Link key={label} href={href} className="flex flex-col items-center gap-2 group active-press">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md3-sm flex items-center justify-center transition-all group-active:scale-95">
                <Icon
                  size={24}
                  className={gold ? 'text-md-secondary' : 'text-md-primary'}
                  strokeWidth={1.8}
                />
              </div>
              <span className="text-[11px] font-bold text-md-primary text-center leading-tight"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Premium CTA Banner ───────────────────────────────── */}
      <section>
        <div className="bg-md-secondary-container/10 rounded-3xl p-5 relative overflow-hidden flex items-center justify-between">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-md-secondary-container opacity-20 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-md-secondary text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                Limited Offer
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-md-primary leading-tight"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              Paket Premium 2026
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs line-through text-md-on-surface-variant font-medium">Rp 159.000</span>
              <span className="text-xl font-black text-md-secondary"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                Rp 99.000
              </span>
            </div>
          </div>
          <Link href="/beli-paket" className="relative z-10">
            <button className="bg-md-primary text-white font-bold px-4 py-2.5 rounded-xl text-xs active-press flex items-center gap-1 shadow-md3-md">
              Beli Sekarang
              <Zap size={14} />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Daftar Tryout (horizontal scroll) ───────────────── */}
      {packages.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              Daftar Tryout
            </h2>
            <Link href="/daftar-tryout"
              className="text-xs font-semibold text-md-on-surface-variant uppercase tracking-wide">
              Lihat Semua
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2">
            {packages.slice(0, 5).map(pkg => {
              const hasActive = activeSet.has(pkg.id);
              const tier = pkg.tier ?? 'free';
              const catLabel = tier === 'free' ? 'TWK' : tier === 'premium' ? 'TIU' : 'TKP';
              const catClass = CAT_CHIP[catLabel] ?? 'bg-slate-100 text-slate-600';

              return (
                <Link
                  key={pkg.id}
                  href={`/packages/${pkg.id}`}
                  className="min-w-[270px] bg-white rounded-3xl p-6 shadow-md3-md relative group overflow-hidden active-press flex-shrink-0 block"
                >
                  {/* Category chip — overlapping top right */}
                  <div className="absolute top-0 right-0 p-4">
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-extrabold uppercase text-label-sm ${catClass}`}>
                      {catLabel}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-md-primary leading-tight pr-12"
                        style={{ fontFamily: 'var(--font-jakarta)' }}>
                        {pkg.title}
                      </h3>
                      <div className="flex items-center gap-4 text-md-on-surface-variant">
                        <div className="flex items-center gap-1">
                          <BookMarked size={15} strokeWidth={1.6} />
                          <span className="text-xs font-medium">{pkg.total_questions ?? 110} Soal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={15} strokeWidth={1.6} />
                          <span className="text-xs font-medium">{pkg.duration_minutes ?? 100} Menit</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      {/* Participant avatars (decorative) */}
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`w-6 h-6 rounded-full border-2 border-white ${
                            i === 1 ? 'bg-slate-200' : i === 2 ? 'bg-slate-300' : 'bg-slate-400'
                          }`} />
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-md-surface-container-low flex items-center justify-center">
                          <span className="text-[7px] font-bold text-md-on-surface-variant">
                            +{pkg.completedUsersCount > 999
                              ? `${Math.floor(pkg.completedUsersCount / 1000)}k`
                              : pkg.completedUsersCount}
                          </span>
                        </div>
                      </div>

                      <button className="bg-md-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm active:scale-95 transition-transform flex items-center gap-1.5">
                        {hasActive ? (
                          <><Play size={13} fill="currentColor" /> Lanjut</>
                        ) : (
                          'Mulai'
                        )}
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
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              Materi Terbaru
            </h2>
            <Link href="/materi"
              className="text-xs font-semibold text-md-on-surface-variant uppercase tracking-wide flex items-center gap-1">
              Lihat Semua <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {materials.slice(0, 4).map(mat => {
              const catChip = CAT_CHIP[mat.category] ?? 'bg-slate-100 text-slate-600';
              return (
                <Link key={mat.id} href={mat.content_url ?? '/materi'} className="block active-press">
                  <div className="bg-white rounded-3xl p-4 flex gap-4 items-center shadow-md3-sm">
                    {/* Thumbnail placeholder */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-md-surface-container flex items-center justify-center relative">
                      <BookOpen size={28} className="text-md-on-surface-variant/40" />
                      <div className="absolute inset-0 bg-md-primary/10 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
                          <Play size={16} className="text-md-primary" fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {mat.is_new && (
                          <span className="bg-md-secondary-container/20 text-md-on-secondary-container text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                            BARU
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${catChip}`}>
                          {mat.category}
                        </span>
                        {mat.duration_minutes && (
                          <span className="text-[10px] text-md-on-surface-variant font-medium">
                            {mat.duration_minutes} Mnt
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-md-primary leading-tight line-clamp-2">
                        {mat.title}
                      </h3>
                      <span className="text-[10px] font-bold text-md-secondary uppercase tracking-widest flex items-center gap-1">
                        Tonton Materi <ChevronRight size={10} />
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
