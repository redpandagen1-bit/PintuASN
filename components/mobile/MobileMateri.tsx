'use client';

// components/mobile/MobileMateri.tsx
// Mobile-only materi page — compact, slate-800 hero, consistent with other mobile pages

import { useState, useMemo } from 'react';
import {
  Search, Play, FileText, Lock, X, ExternalLink,
  FileIcon, Clock, BookOpen, Flag, Brain, BookMarked,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { canAccess } from '@/lib/subscription-utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';
import type { Material } from '@/app/(dashboard)/materi/page';

// ── Types ─────────────────────────────────────────────────────

type TabId = 'SEMUA' | 'INFORMASI' | 'TWK' | 'TIU' | 'TKP';

interface MobileMateriProps {
  materials: Material[];
  userTier:  SubscriptionTier;
}

// ── Constants ─────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'SEMUA',     label: 'Semua', icon: <BookOpen   size={12} /> },
  { id: 'INFORMASI', label: 'Info',  icon: <FileText   size={12} /> },
  { id: 'TWK',       label: 'TWK',   icon: <Flag       size={12} /> },
  { id: 'TIU',       label: 'TIU',   icon: <Brain      size={12} /> },
  { id: 'TKP',       label: 'TKP',   icon: <BookMarked size={12} /> },
];

const TAB_DESC: Record<TabId, string> = {
  SEMUA:     'Semua materi SKD CPNS — Informasi, TWK, TIU, dan TKP.',
  INFORMASI: 'Jadwal, persyaratan, dan alur pendaftaran CPNS.',
  TWK:       'Pancasila, UUD 1945, NKRI, dan Bela Negara.',
  TIU:       'Verbal, numerik, figural, dan logika penalaran.',
  TKP:       'Pelayanan publik, sosial budaya, dan profesionalisme.',
};

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  premium:  { label: 'PREMIUM',  cls: 'bg-amber-500/90 text-white' },
  platinum: { label: 'PLATINUM', cls: 'bg-purple-500/90 text-white' },
};

// ── Helpers ───────────────────────────────────────────────────

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be')          return u.pathname.slice(1).split('?')[0];
    return null;
  } catch { return null; }
}

function getGoogleDriveEmbedUrl(url: string): string | null {
  try {
    const u     = new URL(url);
    const match = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    const id    = u.searchParams.get('id');
    if (id)    return `https://drive.google.com/file/d/${id}/preview`;
    return null;
  } catch { return null; }
}

// ── Content Modal ─────────────────────────────────────────────

function ContentModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const ytId          = getYoutubeId(material.content_url);
  const driveEmbedUrl = material.type === 'pdf' ? getGoogleDriveEmbedUrl(material.content_url) : null;
  const isPdf         = material.type === 'pdf';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 flex-shrink-0"
        onClick={e => e.stopPropagation()}>
        <div className="min-w-0 flex items-center gap-2">
          {isPdf
            ? <FileIcon size={15} className="text-orange-400 flex-shrink-0" />
            : <Play     size={15} className="text-red-400 flex-shrink-0" />
          }
          <div className="min-w-0">
            <h3 className="text-white font-bold text-sm truncate">{material.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-slate-400 text-xs">{material.category}</span>
              {material.duration_minutes && (
                <span className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock size={10} /> {material.duration_minutes} mnt
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {isPdf && (
            <a href={material.content_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-semibold">
              <ExternalLink size={12} /> Buka
            </a>
          )}
          <button onClick={onClose} className="p-1.5 bg-slate-700 rounded-lg">
            <X size={16} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
        {material.type === 'video' && ytId ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : isPdf && driveEmbedUrl ? (
          <iframe src={driveEmbedUrl} className="w-full h-full" allow="autoplay" />
        ) : isPdf ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center">
              <FileIcon size={28} className="text-orange-400" />
            </div>
            <p className="text-slate-300 text-sm text-center max-w-xs">
              Preview tidak tersedia. Buka dokumen di browser.
            </p>
            <a href={material.content_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-semibold">
              <ExternalLink size={14} /> Buka Dokumen
            </a>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400 text-sm">Konten tidak tersedia</p>
          </div>
        )}
      </div>

      {material.description && (
        <div className="px-4 py-3 border-t border-slate-700 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <p className="text-slate-400 text-xs leading-relaxed">{material.description}</p>
        </div>
      )}
    </div>
  );
}

// ── Locked Prompt ─────────────────────────────────────────────

function LockedModal({ tier, onClose }: { tier: 'premium' | 'platinum'; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-md p-7 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-slate-700" />
        </div>
        <h3 className="font-extrabold text-base text-slate-800 mb-1.5">
          Materi {tier === 'premium' ? 'Premium' : 'Platinum'}
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Upgrade untuk mengakses materi {tier === 'premium' ? 'Premium' : 'Platinum'} ini.
        </p>
        <div className="space-y-2.5">
          <a href="/beli-paket" className="block">
            <button className="w-full bg-slate-800 text-white font-extrabold py-3 rounded-xl text-sm">
              Upgrade Sekarang
            </button>
          </a>
          <button onClick={onClose} className="w-full text-slate-400 text-sm py-1.5">
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Materi Card ───────────────────────────────────────────────

function MateriCard({
  material, userTier, onPlay, onLocked,
}: {
  material:  Material;
  userTier:  SubscriptionTier;
  onPlay:    (m: Material) => void;
  onLocked:  (tier: 'premium' | 'platinum') => void;
}) {
  const accessible = canAccess(userTier, material.tier as SubscriptionTier);
  const ytId       = material.type === 'video' ? getYoutubeId(material.content_url) : null;
  const badge      = TIER_BADGE[material.tier];

  return (
    <div
      className={cn(
        'bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 active-press cursor-pointer',
        !accessible && 'opacity-75',
      )}
      onClick={() => accessible ? onPlay(material) : onLocked(material.tier as 'premium' | 'platinum')}
    >
      {/* Thumbnail */}
      <div className="relative">
        {material.type === 'video' && ytId ? (
          <div className="relative aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
              alt={material.title}
              className={cn('w-full h-full object-cover', !accessible && 'brightness-50')}
            />
            <div className={cn('absolute inset-0 flex items-center justify-center', accessible ? 'bg-black/20' : 'bg-black/40')}>
              {accessible
                ? <div className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center">
                    <Play size={16} className="text-slate-800 ml-0.5" />
                  </div>
                : <div className="w-9 h-9 bg-black/60 rounded-full border border-white/20 flex items-center justify-center">
                    <Lock size={15} className="text-white" />
                  </div>
              }
            </div>
          </div>
        ) : (
          <div className={cn(
            'aspect-video flex flex-col items-center justify-center gap-1.5',
            accessible ? 'bg-slate-50' : 'bg-slate-100',
          )}>
            {accessible
              ? <FileIcon size={26} className="text-orange-500" />
              : <Lock size={22} className="text-slate-400" />
            }
            <span className="text-[10px] font-semibold text-slate-400">
              {accessible ? 'PDF' : 'Terkunci'}
            </span>
          </div>
        )}

        {/* Badges */}
        {material.is_new && (
          <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
            BARU
          </div>
        )}
        {badge && (
          <div className={cn('absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full', badge.cls)}>
            {badge.label}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="font-semibold text-xs text-slate-800 leading-snug mb-1.5 line-clamp-2">
          {material.title}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            {material.type === 'video' ? <Play size={9} /> : <FileText size={9} />}
            {material.type === 'video' ? 'Video' : 'PDF'}
          </span>
          {material.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock size={9} /> {material.duration_minutes} mnt
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

export function MobileMateri({ materials, userTier }: MobileMateriProps) {
  const [activeTab,   setActiveTab]   = useState<TabId>('SEMUA');
  const [search,      setSearch]      = useState('');
  const [activeModal, setActiveModal] = useState<Material | null>(null);
  const [lockedTier,  setLockedTier]  = useState<'premium' | 'platinum' | null>(null);

  const filtered = useMemo(() => materials.filter(m => {
    const matchTab    = activeTab === 'SEMUA' || m.category === activeTab;
    const matchSearch = search === '' || m.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  }), [materials, activeTab, search]);

  const counts = useMemo(() => {
    const result = { SEMUA: materials.length } as Record<TabId, number>;
    for (const tab of TABS) {
      if (tab.id !== 'SEMUA') {
        result[tab.id] = materials.filter(m => m.category === tab.id).length;
      }
    }
    return result;
  }, [materials]);

  return (
    <main className="pb-24">

      {/* Modals */}
      {activeModal && <ContentModal material={activeModal} onClose={() => setActiveModal(null)} />}
      {lockedTier  && <LockedModal  tier={lockedTier}     onClose={() => setLockedTier(null)}  />}

      {/* ══════════════════════════════════════════════════════
          HERO — slate-800, all-around rounded
      ══════════════════════════════════════════════════════ */}
      <div className="bg-slate-800 relative overflow-hidden rounded-3xl mx-3 mt-3 shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-4 pt-4 pb-4">
          {/* Title */}
          <h1 className="text-xl font-extrabold text-white leading-tight mb-0.5">
            Materi <span className="text-yellow-400">Belajar</span>
          </h1>
          <p className="text-slate-400 text-xs mb-3">
            Pilih kategori SKD untuk mulai belajar.
          </p>

          {/* Search — compact dark */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari materi..."
              className="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-slate-400 placeholder:text-slate-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TABS — pill strip, "Semua" as first & default
      ══════════════════════════════════════════════════════ */}
      <div className="flex gap-2 overflow-x-auto py-2.5 px-4 scrollbar-hide bg-white border-b border-slate-100">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold text-xs transition-colors',
              activeTab === tab.id
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500',
            )}
          >
            {tab.icon}
            {tab.label}
            <span className={cn(
              'text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center',
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500',
            )}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="px-4 pt-3">

        {/* Tab description */}
        <div className="flex items-start gap-1.5 mb-3 px-0.5">
          <BookOpen size={11} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {TAB_DESC[activeTab]}
          </p>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-14 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <BookOpen size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {search ? `Tidak ditemukan "${search}"` : 'Belum ada materi.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-slate-400 underline">
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(m => (
              <MateriCard
                key={m.id}
                material={m}
                userTier={userTier}
                onPlay={mat => setActiveModal(mat)}
                onLocked={tier => setLockedTier(tier)}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
