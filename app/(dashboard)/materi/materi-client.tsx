'use client';

// ============================================================
// app/(dashboard)/materi/materi-client.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react';
import {
  BookOpen, FileText, Flag, Brain, ChevronLeft, ChevronRight,
  GraduationCap, Clock, Users, Star, PlayCircle, BookMarked,
  Lightbulb, X, FileIcon, ExternalLink, Play, Lock,
} from 'lucide-react';
import { UpgradeModal }           from '@/components/shared/upgrade-modal';

import { canAccess }              from '@/lib/subscription-utils';
import type { SubscriptionTier }  from '@/lib/subscription-utils';

import type { Material }          from './page';

interface MateriPageClientProps {
  materials: Material[];
  userTier:  SubscriptionTier;
}

const TABS = [
  { id: 'SEMUA',     label: 'Semua',         icon: BookOpen,
    description: 'Semua materi SKD CPNS — Informasi, TWK, TIU, dan TKP.' },
  { id: 'INFORMASI', label: 'Informasi CPNS', icon: FileText,
    description: 'Panduan lengkap seleksi CPNS — jadwal, persyaratan, dan alur pendaftaran.' },
  { id: 'TWK', label: 'TWK', icon: Flag,
    description: 'Materi TWK mencakup Pancasila, UUD 1945, NKRI, dan Bela Negara.' },
  { id: 'TIU', label: 'TIU', icon: Brain,
    description: 'Materi TIU: verbal, numerik, figural, dan logika penalaran.' },
  { id: 'TKP', label: 'TKP', icon: BookMarked,
    description: 'Materi TKP: pelayanan publik, sosial budaya, teknologi, dan profesionalisme.' },
] as const;

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

function TierBadge({ tier }: { tier: Material['tier'] }) {
  if (tier === 'premium')  return (
    <div className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
      <Star size={9} fill="currentColor" /> Premium
    </div>
  );
  if (tier === 'platinum') return (
    <div className="flex items-center gap-1 bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
      <Star size={9} fill="currentColor" /> Platinum
    </div>
  );
  return null;
}

function ContentModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const ytId         = getYoutubeId(material.content_url);
  const driveEmbedUrl = material.type === 'pdf' ? getGoogleDriveEmbedUrl(material.content_url) : null;
  const isPdf        = material.type === 'pdf';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`bg-slate-900 rounded-2xl w-full shadow-2xl overflow-hidden ${isPdf ? 'max-w-4xl' : 'max-w-3xl'}`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors">
                <ExternalLink size={13} /> Buka di Tab Baru
              </a>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {material.type === 'video' && ytId ? (
          <div className="aspect-video bg-black">
            <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          </div>
        ) : isPdf && driveEmbedUrl ? (
          <div className="h-[70vh] bg-slate-800">
            <iframe src={driveEmbedUrl} className="w-full h-full" allow="autoplay" />
          </div>
        ) : isPdf ? (
          <div className="aspect-video bg-slate-800 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center">
              <FileIcon size={32} className="text-orange-400" />
            </div>
            <p className="text-slate-300 text-sm text-center px-6 max-w-sm">
              Preview tidak tersedia. Klik tombol di bawah untuk membuka dokumen.
            </p>
            <a href={material.content_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-colors">
              <ExternalLink size={15} /> Buka Dokumen
            </a>
          </div>
        ) : (
          <div className="aspect-video bg-slate-800 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Konten tidak tersedia</p>
          </div>
        )}

        {material.description && (
          <div className="px-5 py-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm leading-relaxed">{material.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MateriCard({
  material, userTier, onPlay, onLocked,
}: {
  material:  Material;
  userTier:  SubscriptionTier;
  onPlay:    (m: Material) => void;
  onLocked:  (title: string, tier: 'premium' | 'platinum') => void;
}) {
  const contentTier = material.tier as SubscriptionTier;
  const accessible  = canAccess(userTier, contentTier);
  const ytId        = material.type === 'video' ? getYoutubeId(material.content_url) : null;

  const handleClick = () => {
    if (accessible) onPlay(material);
    else onLocked(material.title, contentTier as 'premium' | 'platinum');
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col group">
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
        <TierBadge tier={material.tier} />
        {material.is_new && (
          <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Baru</div>
        )}
      </div>

      {material.type === 'video' && ytId && (
        <div className="relative rounded-t-2xl overflow-hidden cursor-pointer" onClick={handleClick}>
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt={material.title}
            className={`w-full aspect-video object-cover transition-all duration-200 ${!accessible ? 'brightness-50' : ''}`}
          />
          {accessible ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <Play size={20} className="text-slate-800 ml-0.5" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <Lock size={20} className="text-white" />
              </div>
              <span className="text-white text-xs font-bold bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                Konten {contentTier === 'platinum' ? 'Platinum' : 'Premium'}
              </span>
            </div>
          )}
        </div>
      )}

      {material.type === 'pdf' && (
        <div
          className={`rounded-t-2xl overflow-hidden border-b cursor-pointer ${
            accessible ? 'bg-orange-50 border-orange-100' : 'bg-slate-100 border-slate-200'
          }`}
          onClick={handleClick}
        >
          <div className="aspect-video flex flex-col items-center justify-center gap-2">
            {accessible ? (
              <>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FileIcon size={24} className="text-orange-500" />
                </div>
                <span className="text-orange-600 text-xs font-bold uppercase tracking-wide">Dokumen PDF</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                  <Lock size={24} className="text-slate-400" />
                </div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">
                  Konten {contentTier === 'platinum' ? 'Platinum' : 'Premium'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <h4 className={`text-sm font-bold mb-1.5 leading-snug pr-16 ${accessible ? 'text-slate-800' : 'text-slate-500'}`}>
          {material.title}
        </h4>
        {material.description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2 flex-1">
            {material.description}
          </p>
        )}
        {material.duration_minutes && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-4">
            <Clock size={11} /> <span>{material.duration_minutes} menit</span>
          </div>
        )}
        {accessible ? (
          <button onClick={handleClick}
            className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-800 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5">
            {material.type === 'pdf'
              ? <><FileIcon size={13} /> Buka Materi</>
              : <><PlayCircle size={13} /> Tonton Materi</>
            }
          </button>
        ) : (
          <button onClick={handleClick}
            className="w-full py-2 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-300 transition-all duration-200 flex items-center justify-center gap-1.5">
            <Lock size={13} />
            Buka dengan {contentTier === 'platinum' ? 'Platinum' : 'Premium'}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ category }: { category: string }) {
  return (
    <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <BookOpen size={24} className="text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1">Materi {category} Segera Hadir</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Kami sedang menyiapkan materi terbaik untuk kategori ini.
      </p>
    </div>
  );
}

export default function MateriPageClient({ materials, userTier }: MateriPageClientProps) {
  const [activeTab,      setActiveTab]      = useState<string>('SEMUA');
  const [activeModal,    setActiveModal]    = useState<Material | null>(null);
  const [showLeftArrow,  setShowLeftArrow]  = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [upgradeOpen,    setUpgradeOpen]    = useState(false);
  const [upgradeTier,    setUpgradeTier]    = useState<'premium' | 'platinum'>('premium');
  const [upgradeTitle,   setUpgradeTitle]   = useState('');

  const scrollRef       = useRef<HTMLDivElement>(null);
  const activeTabConfig = TABS.find(t => t.id === activeTab)!;
  const tabMaterials    = activeTab === 'SEMUA'
    ? materials
    : materials.filter(m => m.category === activeTab);
  const totalMaterials  = materials.length;
  const categories      = new Set(materials.map(m => m.category)).size;

  const handleLocked = (title: string, tier: 'premium' | 'platinum') => {
    setUpgradeTitle(title);
    setUpgradeTier(tier);
    setUpgradeOpen(true);
  };

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollTo({
      left: scrollRef.current.scrollLeft + (dir === 'left' ? -200 : 200),
      behavior: 'smooth',
    });
  };

  return (
    <>
      <div className="space-y-5 pb-10">

        {/* HERO */}
        <div className="bg-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 mb-4">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300">Pusat Materi SKD CPNS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Pelajari <span className="text-yellow-400">Materinya</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Kuasai semua materi SKD TWK, TIU, TKP dengan video pembelajaran dari para ahli.
            </p>
          </div>
          <div className="relative z-10 flex gap-3 flex-shrink-0 w-full md:w-auto">
            {[
              { icon: GraduationCap, value: totalMaterials > 0 ? totalMaterials : '—', label: 'Total Materi' },
              { icon: Lightbulb,     value: categories > 0 ? categories : '—',         label: 'Kategori'     },
              { icon: Users,         value: '1000+',                                     label: 'Pelajar'      },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex-1 md:w-28 text-center">
                <div className="text-yellow-400 mb-1 flex justify-center"><Icon size={20} /></div>
                <div className="text-xl font-black text-white">{value}</div>
                <div className="text-[11px] text-slate-300">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS + HEADER GABUNGAN — A & B dijadikan satu */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

          {/* Tab buttons — A: lebih kecil */}
          <div className="relative px-2 pt-2">
            {showLeftArrow && (
              <button onClick={() => scroll('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1 border border-slate-200 hover:bg-slate-50">
                <ChevronLeft size={13} className="text-slate-600" />
              </button>
            )}
            <div ref={scrollRef} onScroll={checkScroll}
              className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth px-5">
              {TABS.map(tab => {
                const Icon    = tab.icon;
                const isActive = tab.id === activeTab;
                const count   = tab.id === 'SEMUA'
                    ? materials.length
                    : materials.filter(m => m.category === tab.id).length;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? 'bg-slate-800 text-yellow-400 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}>
                    <Icon size={13} />
                    {tab.label}
                    {count > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-yellow-400/20 text-yellow-300' : 'bg-slate-200 text-slate-500'
                      }`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {showRightArrow && (
              <button onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1 border border-slate-200 hover:bg-slate-50">
                <ChevronRight size={13} className="text-slate-600" />
              </button>
            )}
          </div>

          {/* Tab info — B: gabung di bawah tab, tanpa card terpisah */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-2">
              <activeTabConfig.icon size={13} className="text-slate-400 flex-shrink-0" />
              <p className="text-[11px] text-slate-400 leading-snug">{activeTabConfig.description}</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex-shrink-0 ml-3">
              <PlayCircle size={10} /> {tabMaterials.length} Materi
            </span>
          </div>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tabMaterials.length > 0
            ? tabMaterials.map(m => (
                <MateriCard
                  key={m.id} material={m} userTier={userTier}
                  onPlay={setActiveModal} onLocked={handleLocked}
                />
              ))
            : <EmptyState category={activeTab === 'SEMUA' ? 'Semua' : activeTabConfig.label} />
          }
        </div>
      </div>

      {activeModal && (
        <ContentModal material={activeModal} onClose={() => setActiveModal(null)} />
      )}

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredTier={upgradeTier}
        contentTitle={upgradeTitle}
      />
    </>
  );
}