'use client';

// components/mobile/MobileMateri.tsx
// Mobile-only materi page — Pathfinder Navy MD3 design

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

type TabId = 'INFORMASI' | 'TWK' | 'TIU' | 'TKP';

interface MobileMateriProps {
  materials: Material[];
  userTier:  SubscriptionTier;
}

// ── Constants ─────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'INFORMASI', label: 'Info',   icon: <FileText size={14} /> },
  { id: 'TWK',       label: 'TWK',    icon: <Flag size={14} /> },
  { id: 'TIU',       label: 'TIU',    icon: <Brain size={14} /> },
  { id: 'TKP',       label: 'TKP',    icon: <BookMarked size={14} /> },
];

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  premium:  { label: 'PREMIUM',  cls: 'bg-amber-500/10 text-amber-700 border border-amber-200' },
  platinum: { label: 'PLATINUM', cls: 'bg-purple-500/10 text-purple-700 border border-purple-200' },
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
  const ytId         = getYoutubeId(material.content_url);
  const driveEmbedUrl = material.type === 'pdf' ? getGoogleDriveEmbedUrl(material.content_url) : null;
  const isPdf        = material.type === 'pdf';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 flex-shrink-0"
        onClick={e => e.stopPropagation()}>
        <div className="min-w-0 flex items-center gap-2">
          {isPdf
            ? <FileIcon size={16} className="text-orange-400 flex-shrink-0" />
            : <Play     size={16} className="text-red-400 flex-shrink-0" />
          }
          <div className="min-w-0">
            <h3 className="text-white font-bold text-sm truncate">{material.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-slate-400 text-xs">{material.category}</span>
              {material.duration_minutes && (
                <span className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock size={10} /> {material.duration_minutes} menit
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {isPdf && (
            <a href={material.content_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-semibold">
              <ExternalLink size={13} /> Buka
            </a>
          )}
          <button onClick={onClose} className="p-2 bg-slate-700 rounded-lg">
            <X size={18} className="text-slate-300" />
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
          <div className="h-full flex flex-col items-center justify-center gap-5 p-8">
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center">
              <FileIcon size={32} className="text-orange-400" />
            </div>
            <p className="text-slate-300 text-sm text-center max-w-xs">
              Preview tidak tersedia. Buka dokumen di browser.
            </p>
            <a href={material.content_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl text-sm font-semibold">
              <ExternalLink size={15} /> Buka Dokumen
            </a>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400 text-sm">Konten tidak tersedia</p>
          </div>
        )}
      </div>

      {material.description && (
        <div className="px-5 py-4 border-t border-slate-700 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <p className="text-slate-400 text-sm leading-relaxed">{material.description}</p>
        </div>
      )}
    </div>
  );
}

// ── Upgrade prompt ────────────────────────────────────────────

function LockedModal({ tier, onClose }: { tier: 'premium' | 'platinum'; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-md p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 bg-md-surface-container rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Lock size={28} className="text-md-primary" />
        </div>
        <h3 className="font-extrabold text-lg text-md-primary mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
          Materi {tier === 'premium' ? 'Premium' : 'Platinum'}
        </h3>
        <p className="text-md-on-surface-variant text-sm mb-8">
          Upgrade paket kamu untuk mengakses materi {tier === 'premium' ? 'Premium' : 'Platinum'} ini.
        </p>
        <div className="space-y-3">
          <a href="/beli-paket" className="block">
            <button className="w-full bg-md-primary text-white font-extrabold py-4 rounded-xl text-sm">
              Upgrade Sekarang
            </button>
          </a>
          <button onClick={onClose} className="w-full text-md-on-surface-variant text-sm py-2">
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

  const handleTap = () => {
    if (accessible) onPlay(material);
    else onLocked(material.tier as 'premium' | 'platinum');
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl overflow-hidden shadow-md3-sm active-press',
        !accessible && 'opacity-80',
      )}
      onClick={handleTap}
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
            <div className={cn(
              'absolute inset-0 flex items-center justify-center',
              accessible ? 'bg-black/20' : 'bg-black/40',
            )}>
              {accessible
                ? <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <Play size={20} className="text-slate-800 ml-0.5" />
                  </div>
                : <div className="w-12 h-12 bg-black/60 rounded-full border border-white/20 flex items-center justify-center">
                    <Lock size={20} className="text-white" />
                  </div>
              }
            </div>
          </div>
        ) : (
          <div className={cn(
            'aspect-video flex flex-col items-center justify-center gap-2',
            accessible ? 'bg-md-surface-container-low' : 'bg-slate-200',
          )}>
            {accessible
              ? <FileIcon size={32} className="text-orange-500" />
              : <Lock size={28} className="text-slate-400" />
            }
            <span className="text-xs font-semibold text-md-on-surface-variant">
              {accessible ? 'PDF Dokumen' : 'Terkunci'}
            </span>
          </div>
        )}

        {/* New badge */}
        {material.is_new && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            BARU
          </div>
        )}
        {/* Tier badge */}
        {badge && (
          <div className={cn('absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full', badge.cls)}>
            {badge.label}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-bold text-sm text-md-on-surface leading-snug mb-2 line-clamp-2">
          {material.title}
        </p>
        <div className="flex items-center gap-3 text-xs text-md-on-surface-variant">
          <span className="flex items-center gap-1">
            {material.type === 'video' ? <Play size={11} /> : <FileText size={11} />}
            {material.type === 'video' ? 'Video' : 'PDF'}
          </span>
          {material.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {material.duration_minutes} menit
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

export function MobileMateri({ materials, userTier }: MobileMateriProps) {
  const [activeTab, setActiveTab]       = useState<TabId>('INFORMASI');
  const [search, setSearch]             = useState('');
  const [activeModal, setActiveModal]   = useState<Material | null>(null);
  const [lockedTier, setLockedTier]     = useState<'premium' | 'platinum' | null>(null);

  const filtered = useMemo(() => {
    return materials.filter(m => {
      const matchTab    = m.category === activeTab;
      const matchSearch = search === '' || m.title.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [materials, activeTab, search]);

  const counts = useMemo(() => {
    return TABS.reduce((acc, tab) => {
      acc[tab.id] = materials.filter(m => m.category === tab.id).length;
      return acc;
    }, {} as Record<TabId, number>);
  }, [materials]);

  return (
    <main className="pb-32 px-6 pt-4">

      {/* Modals */}
      {activeModal && (
        <ContentModal material={activeModal} onClose={() => setActiveModal(null)} />
      )}
      {lockedTier && (
        <LockedModal tier={lockedTier} onClose={() => setLockedTier(null)} />
      )}

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-md-primary tracking-tight mb-1"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Materi Belajar
        </h1>
        <p className="text-md-on-surface-variant text-sm">
          Pilih materi sesuai kategori SKD yang ingin dipelajari.
        </p>
      </div>

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="mb-5 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/50" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari materi..."
          className="w-full pl-12 pr-4 py-4 bg-white rounded-xl ring-1 ring-md-outline-variant/20 focus:ring-md-secondary-container shadow-md3-sm placeholder:text-md-on-surface-variant/40 outline-none text-sm"
        />
      </div>

      {/* ── Category Tabs ─────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 mb-6 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm active-press transition-colors',
              activeTab === tab.id
                ? 'bg-md-primary text-white shadow-md3-sm'
                : 'bg-white text-md-on-surface-variant',
            )}
          >
            {tab.icon}
            {tab.label}
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-md-surface-container text-md-on-surface-variant',
            )}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab Description ───────────────────────────────────── */}
      <div className="bg-md-surface-container-low rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-md-secondary" />
          <span className="text-xs font-bold text-md-secondary uppercase tracking-wider">{activeTab}</span>
        </div>
        <p className="text-xs text-md-on-surface-variant leading-relaxed">
          {activeTab === 'INFORMASI' && 'Panduan lengkap seleksi CPNS — jadwal, persyaratan, dan alur pendaftaran.'}
          {activeTab === 'TWK'       && 'Materi TWK mencakup Pancasila, UUD 1945, NKRI, dan Bela Negara.'}
          {activeTab === 'TIU'       && 'Materi TIU: verbal, numerik, figural, dan logika penalaran.'}
          {activeTab === 'TKP'       && 'Materi TKP: pelayanan publik, sosial budaya, teknologi, dan profesionalisme.'}
        </p>
      </div>

      {/* ── Materi Grid ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto mb-3 text-md-outline-variant" />
          <p className="text-md-on-surface-variant text-sm">
            {search ? 'Tidak ada materi yang cocok.' : 'Belum ada materi untuk kategori ini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
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

    </main>
  );
}
