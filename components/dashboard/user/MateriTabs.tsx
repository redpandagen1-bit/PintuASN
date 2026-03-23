'use client';

import { useState, useRef, useEffect } from 'react';
import {
  BookOpen, FileText, Flag, Brain, ChevronLeft, ChevronRight,
  PlayCircle, Lock, Star, Clock, BookMarked, FileIcon,
} from 'lucide-react';
import Link from 'next/link';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  title: string;
  category: 'TWK' | 'TIU' | 'TKP' | 'INFORMASI';
  type: 'video' | 'pdf';
  tier: 'free' | 'premium' | 'platinum';
  duration_minutes: number | null;
  is_new: boolean;
}

interface MateriTabsProps {
  materials: Material[];
}

// ── TAB CONFIG ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'INFORMASI', label: 'Informasi CPNS', icon: FileText },
  { id: 'TWK',       label: 'TWK',            icon: Flag      },
  { id: 'TIU',       label: 'TIU',            icon: Brain     },
  { id: 'TKP',       label: 'TKP',            icon: BookMarked},
];

// ── TIER BADGE ─────────────────────────────────────────────────────────────

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

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function MateriTabs({ materials }: MateriTabsProps) {
  const [activeTab, setActiveTab] = useState('INFORMASI');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
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
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + (dir === 'left' ? -200 : 200),
      behavior: 'smooth',
    });
  };

  // Ambil 3 materi dari tab aktif
  const tabItems = materials
    .filter(m => m.category === activeTab)
    .slice(0, 3);

  const isPaid = (tier: string) => tier !== 'free';

  return (
    <div className="space-y-4">

      {/* Tab nav */}
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

      {/* Preview items */}
      {tabItems.length > 0 ? (
        <div className="space-y-2">
          {tabItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all group ${
                isPaid(item.tier)
                  ? 'bg-slate-50 border-slate-200 hover:border-blue-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isPaid(item.tier) ? 'bg-blue-50' : item.type === 'pdf' ? 'bg-orange-50' : 'bg-slate-100'
                }`}>
                  {isPaid(item.tier)
                    ? <Lock size={14} className="text-blue-500" />
                    : item.type === 'pdf'
                    ? <FileIcon size={14} className="text-orange-500" />
                    : <PlayCircle size={14} className="text-slate-600" />
                  }
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-medium text-slate-700 truncate">{item.title}</span>
                  {item.is_new && (
                    <span className="flex-shrink-0 text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                      Baru
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {isPaid(item.tier) && <TierBadge tier={item.tier as 'premium' | 'platinum'} />}
                {item.duration_minutes && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock size={11} /> {item.duration_minutes} mnt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-slate-400 text-sm">Belum ada materi untuk kategori ini.</p>
        </div>
      )}

      {/* CTA */}
      <Link href="/materi">
        <button className="w-full py-2.5 rounded-xl bg-slate-800 text-yellow-400 text-sm font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
          <BookOpen size={15} />
          Lihat Semua Materi
        </button>
      </Link>
    </div>
  );
}