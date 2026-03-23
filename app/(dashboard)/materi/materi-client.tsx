'use client';

import { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Flag,
  Brain,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Clock,
  Users,
  Star,
  Lock,
  PlayCircle,
  BookMarked,
  Lightbulb,
  X,
  FileIcon,
  ExternalLink,
  Play,
} from 'lucide-react';
import Link from 'next/link';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: 'TWK' | 'TIU' | 'TKP' | 'INFORMASI';
  type: 'video' | 'pdf';
  content_url: string;
  tier: 'free' | 'premium' | 'platinum';
  duration_minutes: number | null;
  is_active: boolean;
  is_new: boolean;
  order_index: number;
}

interface MateriPageClientProps {
  materials: Material[];
}

// ── TAB CONFIG ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'INFORMASI', label: 'Informasi CPNS', icon: FileText, description: 'Panduan lengkap seleksi CPNS — jadwal, persyaratan, dan alur pendaftaran.' },
  { id: 'TWK',       label: 'TWK',            icon: Flag,     description: 'Materi TWK mencakup Pancasila, UUD 1945, NKRI, dan Bela Negara.' },
  { id: 'TIU',       label: 'TIU',            icon: Brain,    description: 'Materi TIU: verbal, numerik, figural, dan logika penalaran.' },
  { id: 'TKP',       label: 'TKP',            icon: BookMarked, description: 'Materi TKP: pelayanan publik, sosial budaya, teknologi, dan profesionalisme.' },
];

// ── HELPERS ────────────────────────────────────────────────────────────────

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    return null;
  } catch { return null; }
}

// Convert Google Drive share URL → embed URL
function getGoogleDriveEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // https://drive.google.com/file/d/FILE_ID/view
    const match = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    // https://drive.google.com/open?id=FILE_ID
    const id = u.searchParams.get('id');
    if (id) return `https://drive.google.com/file/d/${id}/preview`;
    return null;
  } catch { return null; }
}

// ── TIER BADGE ─────────────────────────────────────────────────────────────

export function TierBadge({ tier }: { tier: 'premium' | 'platinum' | 'free' }) {
  if (tier === 'premium') return (
    <div className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
      <Star size={9} fill="currentColor" /> Premium
    </div>
  );
  if (tier === 'platinum') return (
    <div className="flex items-center gap-1 bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
      <Star size={9} fill="currentColor" /> Platinum
    </div>
  );
  return null; // gratis tidak perlu badge
}

// ── CONTENT MODAL ─────────────────────────────────────────────────────────

function ContentModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const ytId = getYoutubeId(material.content_url);
  const driveEmbedUrl = material.type === 'pdf' ? getGoogleDriveEmbedUrl(material.content_url) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // PDF modal — lebih tinggi untuk baca dokumen
  const isPdf = material.type === 'pdf';

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
              : <Play size={16} className="text-red-400 flex-shrink-0" />
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
              <a
                href={material.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors"
              >
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
          // Google Drive embed — tinggi lebih besar untuk baca PDF
          <div className="h-[70vh] bg-slate-800">
            <iframe
              src={driveEmbedUrl}
              className="w-full h-full"
              allow="autoplay"
            />
          </div>
        ) : isPdf ? (
          // PDF tanpa Google Drive — fallback buka link
          <div className="aspect-video bg-slate-800 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center">
              <FileIcon size={32} className="text-orange-400" />
            </div>
            <p className="text-slate-300 text-sm text-center px-6 max-w-sm">
              Preview tidak tersedia untuk link ini. Klik tombol di bawah untuk membuka dokumen.
            </p>
            <a
              href={material.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <ExternalLink size={15} /> Buka Dokumen
            </a>
          </div>
        ) : (
          <div className="aspect-video bg-slate-800 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Konten tidak tersedia</p>
          </div>
        )}

        {/* Description */}
        {material.description && (
          <div className="px-5 py-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm leading-relaxed">{material.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MATERI CARD ────────────────────────────────────────────────────────────

function MateriCard({
  material,
  onPlay,
}: {
  material: Material;
  onPlay: (m: Material) => void;
}) {
  const isPaid = material.tier !== 'free';
  const ytId = material.type === 'video' ? getYoutubeId(material.content_url) : null;

  return (
    <div className={`relative bg-white rounded-2xl border transition-all duration-200 flex flex-col group ${
      isPaid
        ? 'border-slate-200 hover:border-blue-200 hover:shadow-md'
        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
    }`}>

      {/* Badges — top right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
        {isPaid && <TierBadge tier={material.tier} />}
        {material.is_new && (
          <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Baru</div>
        )}
      </div>

      {/* Thumbnail — semua video (gratis maupun berbayar) */}
      {material.type === 'video' && ytId && (
        <div
          className={`relative rounded-t-2xl overflow-hidden ${!isPaid ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => { if (!isPaid) onPlay(material); }}
        >
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt={material.title}
            className="w-full aspect-video object-cover"
          />
          {/* Overlay: play button untuk gratis, gembok untuk berbayar */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isPaid
              ? 'bg-black/50'
              : 'bg-black/20 opacity-0 group-hover:opacity-100'
          }`}>
            {isPaid ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <Lock size={20} className="text-white" />
                </div>
                <span className="text-white text-xs font-bold bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  {material.tier === 'premium' ? 'Konten Premium' : 'Konten Platinum'}
                </span>
              </div>
            ) : (
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <Play size={20} className="text-slate-800 ml-0.5" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF thumbnail — icon saja */}
      {material.type === 'pdf' && (
        <div className="rounded-t-2xl overflow-hidden bg-orange-50 border-b border-orange-100">
          <div className="aspect-video flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileIcon size={24} className="text-orange-500" />
            </div>
            <span className="text-orange-600 text-xs font-bold uppercase tracking-wide">Dokumen PDF</span>
          </div>
        </div>
      )}

      {/* Card content */}
      <div className="p-5 flex-1 flex flex-col">
        <h4 className="text-sm font-bold text-slate-800 mb-1.5 leading-snug pr-16">
          {material.title}
        </h4>
        {material.description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2 flex-1">
            {material.description}
          </p>
        )}

        {material.duration_minutes && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-4">
            <Clock size={11} />
            <span>{material.duration_minutes} menit</span>
          </div>
        )}

        {/* CTA */}
        {isPaid ? (
          <Link href="/pricing">
            <button className="w-full py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-blue-500 transition-all duration-200">
              Upgrade untuk Akses
            </button>
          </Link>
        ) : (
          <button
            onClick={() => onPlay(material)}
            className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-800 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            {material.type === 'pdf'
              ? <><FileIcon size={13} /> Buka Materi</>
              : <><PlayCircle size={13} /> Tonton Materi</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────────────────────

function EmptyState({ category }: { category: string }) {
  return (
    <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <BookOpen size={24} className="text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1">Materi {category} Segera Hadir</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Kami sedang menyiapkan materi terbaik untuk kategori ini. Nantikan update selanjutnya!
      </p>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function MateriPageClient({ materials }: MateriPageClientProps) {
  const [activeTab, setActiveTab] = useState<string>('INFORMASI');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [activeModal, setActiveModal] = useState<Material | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTabConfig = TABS.find(t => t.id === activeTab)!;

  // Filter materi untuk tab aktif
  const tabMaterials = materials.filter(m => m.category === activeTab);
  const freeCount = tabMaterials.filter(m => m.tier === 'free').length;
  const paidCount = tabMaterials.filter(m => m.tier !== 'free').length;

  // Stats hero — hitung dari data real
  const totalMaterials = materials.length;
  const categories = new Set(materials.map(m => m.category)).size;

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
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + (dir === 'left' ? -200 : 200),
      behavior: 'smooth',
    });
  };

  return (
    <div className="space-y-5 pb-10">

      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
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
            Kuasai semua materi SKD TWK, TIU, TKP dengan video pembelajaran dari para ahli. Belajar lebih cerdas, lulus lebih cepat.
          </p>
        </div>

        <div className="relative z-10 flex gap-3 flex-shrink-0 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex-1 md:w-28 text-center">
            <div className="text-yellow-400 mb-1 flex justify-center"><GraduationCap size={20} /></div>
            <div className="text-xl font-black text-white">{totalMaterials > 0 ? `${totalMaterials}` : '—'}</div>
            <div className="text-[11px] text-slate-300">Total Materi</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex-1 md:w-28 text-center">
            <div className="text-yellow-400 mb-1 flex justify-center"><Lightbulb size={20} /></div>
            <div className="text-xl font-black text-white">{categories > 0 ? categories : '—'}</div>
            <div className="text-[11px] text-slate-300">Kategori</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex-1 md:w-28 text-center">
            <div className="text-yellow-400 mb-1 flex justify-center"><Users size={20} /></div>
            <div className="text-xl font-black text-white">500+</div>
            <div className="text-[11px] text-slate-300">Pelajar</div>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="relative">
          {showLeftArrow && (
            <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 border border-slate-200 hover:bg-slate-50">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
          )}
          <div ref={scrollRef} onScroll={checkScroll} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth px-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              const count = materials.filter(m => m.category === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-yellow-400 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-yellow-400/20 text-yellow-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {showRightArrow && (
            <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 border border-slate-200 hover:bg-slate-50">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* ── ACTIVE TAB HEADER ────────────────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl px-6 py-5 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <activeTabConfig.icon size={20} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">{activeTabConfig.label}</h2>
            <p className="text-slate-400 text-xs mt-0.5">{activeTabConfig.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
            <PlayCircle size={12} /> {freeCount} Gratis
          </span>
          {paidCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
              <Star size={12} fill="currentColor" /> {paidCount} Berbayar
            </span>
          )}
        </div>
      </div>

      {/* ── MATERI GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tabMaterials.length > 0
          ? tabMaterials.map(m => (
              <MateriCard key={m.id} material={m} onPlay={setActiveModal} />
            ))
          : <EmptyState category={activeTabConfig.label} />
        }
      </div>

      {/* ── UPGRADE BANNER ───────────────────────────────────────────── */}
      {paidCount > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-yellow-400" fill="currentColor" />
                <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">Premium Access</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                Buka Semua Materi <span className="text-yellow-400">Premium</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Dapatkan akses ke seluruh materi eksklusif, bank soal lengkap, dan pembahasan video dari para pakar SKD CPNS.
              </p>
            </div>
            <Link href="/pricing" className="flex-shrink-0">
              <button className="px-6 py-3 bg-yellow-400 text-slate-900 font-black rounded-xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20 whitespace-nowrap">
                Upgrade Sekarang
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ── VIDEO MODAL ──────────────────────────────────────────────── */}
      {activeModal && (
        <ContentModal material={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}