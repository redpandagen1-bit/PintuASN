'use client';

// components/mobile/MobileDashboard.tsx
// Mobile-only dashboard layout following Pathfinder Navy MD3 mockup

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Users,
  ChevronRight, ArrowRight, Clock,
  CheckCircle, BarChart2,
  Award, TrendingUp,
  Crown, Lock, Zap,
  Landmark, Brain, HeartHandshake, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { canAccess }             from '@/lib/subscription-utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';
import { UpgradeModal }          from '@/components/shared/upgrade-modal';
import { pickLatest }            from '@/components/dashboard/user/MateriTerbaru';

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
  id:             string;
  title:          string;
  category:       string;
  topic:          string;
  tier:           string;
  read_minutes:   number | null;
  is_new:         boolean;
  is_placeholder: boolean;
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
  { label: 'Materi',        href: '/materi',        iconFile: 'materi'       },
  { label: 'Peluang Formasi', href: '/peluang-formasi', iconFile: 'peluang_formasi' },
  { label: 'Daftar Tryout', href: '/daftar-tryout', iconFile: 'daftar_tryout' },
  { label: 'Drilling',      href: '/drilling',      iconFile: 'drilling' },
  { label: 'Riwayat',       href: '/history',       iconFile: 'riwayat'      },
  { label: 'Beli Paket',    href: '/beli-paket',    iconFile: 'beli_paket'   },
  { label: 'Event & Promo', href: '/events-promo',  iconFile: 'event_promo'  },
  { label: 'Grup',          href: 'https://wa.me/6285190868980?text=halo%20admin%20pintuASN%2C%20saya%20ingin%20join%20grup', iconFile: 'grup' },
] as const;

// ── Tryout card constants (identik dengan MobileDaftarTryout) ─

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  free:     { label: 'Gratis',   cls: 'bg-emerald-500 text-white'  },
  premium:  { label: 'Premium',  cls: 'bg-sky-500 text-white'      },
  platinum: { label: 'Platinum', cls: 'bg-purple-500 text-white'   },
};

const DIFFICULTY_BADGE: Record<string, string> = {
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard:   'bg-red-100 text-red-700',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Mudah', medium: 'Sedang', hard: 'Sulit',
};

function fmtCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Konfigurasi kategori materi (ikon + warna) ────────────────

const MAT_CAT: Record<string, { label: string; icon: React.ElementType; chip: string; iconWrap: string }> = {
  INFORMASI: { label: 'Info CPNS', icon: Info,           chip: 'bg-indigo-100 text-indigo-700', iconWrap: 'bg-indigo-500' },
  TWK:       { label: 'TWK',       icon: Landmark,       chip: 'bg-sky-100 text-sky-700',       iconWrap: 'bg-sky-500'    },
  TIU:       { label: 'TIU',       icon: Brain,          chip: 'bg-violet-100 text-violet-700', iconWrap: 'bg-violet-500' },
  TKP:       { label: 'TKP',       icon: HeartHandshake, chip: 'bg-amber-100 text-amber-700',   iconWrap: 'bg-amber-500'  },
};

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

  // Materi terbaru: buang placeholder, "Baru" didahulukan, bergiliran antar
  // kategori (helper sama dengan versi desktop).
  const materiTerbaru = pickLatest(materials, 4);

  // ── Upgrade modal state ───────────────────────────────────────
  const [modalOpen,  setModalOpen]  = useState(false);
  const [modalTier,  setModalTier]  = useState<'premium' | 'platinum'>('premium');
  const [modalTitle, setModalTitle] = useState('');

  const handleLocked = (title: string, tier: 'premium' | 'platinum') => {
    setModalTitle(title);
    setModalTier(tier);
    setModalOpen(true);
  };

  // ── Offer banner logic ────────────────────────────────────────
  const showOffer  = userTier !== 'platinum';
  const isPremium  = userTier === 'premium';
  const offerPrice = isPremium ? 'Rp 29.000' : 'Rp 99.000';
  const offerOrig  = isPremium ? 'Rp 119.000' : 'Rp 200.000';

  return (
    <main className="space-y-6">

      {/* ── Menu Grid 2×4 ────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-4 gap-x-3 gap-y-3 max-w-[390px] mx-auto">
          {MENU_ITEMS.map(({ label, href, iconFile }) => {
            const external = href.startsWith('http');
            const inner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/icons/${iconFile}.svg`}
                  alt={label}
                  width={52}
                  height={52}
                  className="transition-all group-active:scale-95"
                  style={{ opacity: 0.85 }}
                />
                <span className="text-[10px] font-semibold text-md-primary text-center leading-tight"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {label}
                </span>
              </>
            );
            const cls = 'flex flex-col items-center gap-1 py-1.5 group active-press';
            return external ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <Link key={label} href={href} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Upgrade / Premium CTA (compact) ─────────────────── */}
      {showOffer && (
        <section className="px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-3 shadow-lg">

            {/* Header: icon + judul + deskripsi inline */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Crown size={13} className="text-yellow-400 flex-shrink-0 mt-px" />
                <div>
                  <h3 className="text-white font-bold text-xs leading-tight"
                    style={{ fontFamily: 'var(--font-jakarta)' }}>
                    Upgrade{' '}
                    <span className="text-yellow-400">
                      {isPremium ? 'Platinum' : 'Premium'}
                    </span>
                  </h3>
                  <p className="text-slate-400 text-[10px] leading-tight mt-0.5">
                    {isPremium
                      ? 'Akses fitur eksklusif & video SKD lengkap.'
                      : 'Tryout Premium + Materi video lengkap.'}
                  </p>
                </div>
              </div>

              {/* Harga di kanan atas */}
              <div className="flex-shrink-0 text-right">
                <p className="text-slate-500 text-[9px] line-through leading-none">{offerOrig}</p>
                <p className="text-white font-bold text-sm leading-tight"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {offerPrice}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-2" />

            {/* Feature grid 3-col compact */}
            <div className="grid grid-cols-3 gap-1 mb-2.5">
              {[
                { val: '∞', label: 'Riwayat' },
                { val: 'HD', label: isPremium ? 'Materi Video' : 'Materi SKD' },
                { val: 'Pro', label: 'Analisis' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-md py-1 text-center">
                  <p className="text-[10px] font-black leading-none text-yellow-400">
                    {val}
                  </p>
                  <p className="text-slate-400 text-[8px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <Link href="/beli-paket">
              <button className="w-full bg-white text-slate-800 font-semibold py-2 px-4 rounded-xl active-press transition-all text-xs shadow-md">
                Upgrade Sekarang
              </button>
            </Link>

          </div>
        </section>
      )}

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

      {/* ── Daftar Tryout (2-col grid — identik dengan MobileDaftarTryout) ── */}
      {packages.length > 0 && (
        <section className="space-y-3 px-4">
          {/* Section header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-base font-bold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
                Daftar Tryout
              </h2>
              <p className="text-slate-500 text-[10px] mt-0.5">Pilih paket simulasi SKD sesuai kebutuhanmu.</p>
            </div>
            <Link href="/daftar-tryout" className="text-xs font-semibold text-md-on-surface-variant uppercase tracking-wide flex items-center gap-0.5">
              Lihat Semua <ChevronRight size={12} />
            </Link>
          </div>

          {/* Horizontal slider — desain kartu identik MobileDaftarTryout */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {packages.slice(0, 4).map(pkg => {
              const hasActive   = activeSet.has(pkg.id);
              const contentTier = (pkg.tier ?? 'free') as SubscriptionTier;
              const accessible  = canAccess(userTier, contentTier);
              const badge       = TIER_BADGE[contentTier] ?? TIER_BADGE.free;
              const diffBadge   = DIFFICULTY_BADGE[pkg.difficulty] ?? 'bg-slate-100 text-slate-600';
              const diffLabel   = DIFFICULTY_LABEL[pkg.difficulty] ?? pkg.difficulty;

              return (
                <div
                  key={pkg.id}
                  className={cn(
                    'min-w-[calc(50vw-22px)] bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden',
                    !accessible && 'opacity-90',
                  )}
                >
                  {/* Top row: tier badge + difficulty */}
                  <div className="flex items-center justify-between px-3 pt-3 pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full', badge.cls)}>
                        {badge.label}
                      </span>
                      {hasActive && (
                        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Lanjutkan
                        </span>
                      )}
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg', diffBadge)}>
                      {diffLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="px-3 pb-2">
                    <h3 className={cn(
                      'text-sm font-bold leading-snug',
                      accessible ? 'text-slate-800' : 'text-slate-500',
                    )}>
                      {pkg.title}
                    </h3>
                  </div>

                  {/* Meta row — satu baris horizontal */}
                  <div className="flex items-center gap-3 px-3 pb-2.5 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} />
                      {pkg.total_questions ?? 110}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {pkg.duration_minutes ?? 100} mnt
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {fmtCount(pkg.completedUsersCount)}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="px-3 pb-3">
                    {accessible ? (
                      <Link href={`/packages/${pkg.id}`}>
                        <button className={cn(
                          'w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]',
                          hasActive
                            ? 'bg-amber-400 text-slate-900 active:bg-amber-500'
                            : 'bg-slate-900 text-white active:bg-slate-700',
                        )}>
                          {hasActive
                            ? <><ArrowRight size={12} />Lanjutkan Tryout</>
                            : <><ChevronRight size={12} />Mulai Tryout</>
                          }
                        </button>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleLocked(pkg.title, contentTier as 'premium' | 'platinum')}
                        className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-100 text-slate-500 active:bg-slate-200 transition-colors"
                      >
                        {contentTier === 'platinum'
                          ? <><Crown size={11} />Buka dengan Platinum</>
                          : <><Zap size={11} />Buka dengan Premium</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lihat semua */}
          <Link href="/daftar-tryout">
            <button className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold active:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
              Lihat Semua Tryout <ChevronRight size={13} />
            </button>
          </Link>
        </section>
      )}

      {/* ── Materi Terbaru ───────────────────────────────────── */}
      {materiTerbaru.length > 0 && (
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
            {materiTerbaru.map(mat => {
              const cat        = MAT_CAT[mat.category] ?? MAT_CAT.INFORMASI;
              const Icon       = cat.icon;
              const accessible = canAccess(userTier, mat.tier as SubscriptionTier);
              const isPaid     = mat.tier !== 'free';

              return (
                <Link key={mat.id} href="/materi" className="block active-press">
                  <div className="bg-white rounded-2xl p-3.5 flex gap-3.5 items-center shadow-md3-sm">
                    {/* Ikon kategori */}
                    <div className={cn('w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center relative', cat.iconWrap)}>
                      <Icon size={22} className="text-white" strokeWidth={2} />
                      {!accessible && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
                          <Lock size={10} className="text-slate-500" />
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {mat.is_new && (
                          <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                            BARU
                          </span>
                        )}
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase', cat.chip)}>
                          {cat.label}
                        </span>
                        {isPaid && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-100 text-slate-500 capitalize">
                            {mat.tier}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xs text-md-primary leading-tight line-clamp-2">
                        {mat.title}
                      </h3>
                      <span className="text-[10px] font-bold text-md-secondary uppercase tracking-widest flex items-center gap-1">
                        {mat.read_minutes ? `${mat.read_minutes} mnt baca` : (accessible ? 'Baca Materi' : 'Lihat Materi')}
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

      {/* ── Upgrade Modal ────────────────────────────────────── */}
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requiredTier={modalTier}
        contentTitle={modalTitle}
      />

    </main>
  );
}
