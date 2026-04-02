'use client';

// ============================================================
// components/dashboard/user/MateriTabs.tsx
//
// Menampilkan 3 materi terbaru per tab di dashboard.
// Materi yang tidak bisa diakses → ikon gembok + UpgradeModal.
// Materi yang bisa diakses → buka ContentModal langsung.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import {
  BookOpen, FileText, Flag, Brain, ChevronLeft, ChevronRight,
  PlayCircle, Lock, Star, Clock, BookMarked, FileIcon, X,
  ExternalLink, Play,
} from 'lucide-react';
import Link        from 'next/link';
import { UpgradeModal } from '@/components/shared/upgrade-modal';

// ✅ Import dari subscription-utils — aman untuk Client Component
import { canAccess }              from '@/lib/subscription-utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';

// ─────────────────────────────────────────────────────────────
// TIPE
// ─────────────────────────────────────────────────────────────

interface Material {
  id:               string;
  title:            string;
  category:         'TWK' | 'TIU' | 'TKP' | 'INFORMASI';
  type:             'video' | 'pdf';
  tier:             'free' | 'premium' | 'platinum';
  duration_minutes: number | null;
  is_new:           boolean;
  content_url:      string;
}

interface MateriTabsProps {
  materials: Material[];
  userTier:  SubscriptionTier;
}

// ─────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'INFORMASI', label: 'Informasi CPNS', icon: FileText  },
  { id: 'TWK',       label: 'TWK',            icon: Flag       },
  { id: 'TIU',       label: 'TIU',            icon: Brain      },
  { id: 'TKP',       label: 'TKP',            icon: BookMarked },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// TIER BADGE
// ─────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: 'premium' | 'platinum' }) {
  if (tier === 'premium') return (
    <span className="flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
      <Star size={8} fill="currentColor" /> Premium
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
      <Star size={8} fill="currentColor" /> Platinum
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTENT MODAL (untuk materi yang accessible)
// ─────────────────────────────────────────────────────────────

function ContentModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const ytId          = getYoutubeId(material.content_url);
  const driveEmbedUrl = material.type === 'pdf' ? getGoogleDriveEmbedUrl(material.content_url) : null;
  const isPdf         = material.type === 'pdf';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 rounded-2xl w-full shadow-2xl overflow-hidden ${isPdf ? 'max-w-4xl' : 'max-w-3xl'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* Content */}
        {material.type === 'video' && ytId ? (
          <div className="aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export default function MateriTabs({ materials, userTier }: MateriTabsProps) {
  const [activeTab,      setActiveTab]      = useState('INFORMASI');
  const [showLeftArrow,  setShowLeftArrow]  = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [contentModal,   setContentModal]   = useState<Material | null>(null);
  const [upgradeOpen,    setUpgradeOpen]    = useState(false);
  const [upgradeTier,    setUpgradeTier]    = useState<'premium' | 'platinum'>('premium');
  const [upgradeTitle,   setUpgradeTitle]   = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

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

  // 3 materi terbaru dari tab aktif
  const tabItems = materials
    .filter(m => m.category === activeTab)
    .slice(0, 3);

  const handleItemClick = (item: Material) => {
    const accessible = canAccess(userTier, item.tier as SubscriptionTier);
    if (accessible) {
      setContentModal(item);
    } else {
      setUpgradeTitle(item.title);
      setUpgradeTier(item.tier as 'premium' | 'platinum');
      setUpgradeOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-4">

        {/* Tab nav */}
        <div className="relative">
          {showLeftArrow && (
            <button onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 border border-slate-200 hover:bg-slate-50">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
          )}
          <div ref={scrollRef} onScroll={checkScroll}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth px-6">
            {TABS.map(tab => {
              const Icon    = tab.icon;
              const isActive = tab.id === activeTab;
              const count   = materials.filter(m => m.category === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-yellow-400 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={15} />
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
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 border border-slate-200 hover:bg-slate-50">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          )}
        </div>

        {/* List item materi */}
        {tabItems.length > 0 ? (
          <div className="space-y-2">
            {tabItems.map(item => {
              const accessible = canAccess(userTier, item.tier as SubscriptionTier);
              const isPaid     = item.tier !== 'free';

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left group ${
                    accessible
                      ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-200 cursor-pointer'
                  }`}
                >
                  {/* Kiri: ikon + judul */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      !accessible
                        ? 'bg-blue-50'
                        : item.type === 'pdf'
                        ? 'bg-orange-50'
                        : 'bg-slate-100'
                    }`}>
                      {!accessible
                        ? <Lock size={14} className="text-blue-500" />
                        : item.type === 'pdf'
                        ? <FileIcon size={14} className="text-orange-500" />
                        : <PlayCircle size={14} className="text-slate-600" />
                      }
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-sm font-medium truncate ${accessible ? 'text-slate-700' : 'text-slate-500'}`}>
                        {item.title}
                      </span>
                      {item.is_new && (
                        <span className="flex-shrink-0 text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                          Baru
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kanan: badge + durasi */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {isPaid && <TierBadge tier={item.tier as 'premium' | 'platinum'} />}
                    {item.duration_minutes && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={11} /> {item.duration_minutes} mnt
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-slate-400 text-sm">Belum ada materi untuk kategori ini.</p>
          </div>
        )}

        {/* CTA ke halaman materi */}
        <Link href="/materi">
          <button className="w-full py-2.5 rounded-xl bg-slate-800 text-yellow-400 text-sm font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
            <BookOpen size={15} />
            Lihat Semua Materi
          </button>
        </Link>
      </div>

      {/* Content Modal */}
      {contentModal && (
        <ContentModal material={contentModal} onClose={() => setContentModal(null)} />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredTier={upgradeTier}
        contentTitle={upgradeTitle}
      />
    </>
  );
}