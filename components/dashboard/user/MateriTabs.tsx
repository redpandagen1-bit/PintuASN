'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, Flag, Brain, ChevronLeft, ChevronRight } from 'lucide-react';

const MATERI_TABS = [
  { id: 'info-cpns', label: 'Informasi CPNS 2026', icon: FileText },
  { id: 'skb-cat', label: 'Materi SKB CAT', icon: BookOpen },
  { id: 'twk', label: 'Tes Wawasan Kebangsaan (TWK)', icon: Flag },
  { id: 'psikotes', label: 'Psikotes CPNS', icon: Brain },
];

export default function MateriTabs() {
  const [activeTab, setActiveTab] = useState('info-cpns');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeTabData = MATERI_TABS.find(tab => tab.id === activeTab);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 200;
    const newScrollLeft = direction === 'left' 
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation with Scroll Arrows */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-slate-50 transition-colors border border-slate-200"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
        )}

        {/* Tabs Container */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-8"
        >
          {MATERI_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  tab.id === activeTab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-slate-50 transition-colors border border-slate-200"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        )}
      </div>

      {/* Tab Content - Empty State */}
      <Card>
        <CardContent className="py-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            {activeTabData && <activeTabData.icon className="w-8 h-8 text-slate-400" />}
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Materi Segera Hadir
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Kami sedang menyiapkan materi pembelajaran untuk {activeTabData?.label}. 
            Nantikan update selanjutnya!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
