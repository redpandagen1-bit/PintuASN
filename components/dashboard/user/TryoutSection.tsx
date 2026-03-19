'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { PackageCardUser } from '@/components/shared/package-card-user';
import TryoutFilterTabs from '@/components/dashboard/user/TryoutFilterTabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';

type TierFilter = 'Semua' | 'Gratis' | 'Premium' | 'Platinum';

interface TryoutSectionProps {
  packages: Array<{
    id: string;
    title: string;
    description?: string | null;
    difficulty: string;
    tier?: string;
    completedUsersCount: number;
    [key: string]: unknown;
  }>;
  packageIdsWithAttempts: string[];
}

const TIER_MAP: Record<TierFilter, string> = {
  'Semua':    '',
  'Gratis':   'free',
  'Premium':  'premium',
  'Platinum': 'platinum',
};

export default function TryoutSection({ packages, packageIdsWithAttempts }: TryoutSectionProps) {
  const [activeFilter, setActiveFilter] = useState<TierFilter>('Semua');
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeSet = new Set(packageIdsWithAttempts);

  const filtered = useMemo(() => {
    if (activeFilter === 'Semua') return packages.slice(0, 6);
    return packages
      .filter(pkg => pkg.tier === TIER_MAP[activeFilter])
      .slice(0, 6);
  }, [packages, activeFilter]);

  const hasMore = useMemo(() => {
    const base = activeFilter === 'Semua'
      ? packages
      : packages.filter(pkg => pkg.tier === TIER_MAP[activeFilter]);
    return base.length > 6;
  }, [packages, activeFilter]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 240 : -240, behavior: 'smooth' });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Daftar Tryout</h2>
          <p className="text-slate-500 text-xs mt-0.5">Pilih paket simulasi SKD sesuai kebutuhanmu.</p>
        </div>
        <TryoutFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      {/* Horizontal scroll row — fixed height so empty state doesn't collapse */}
      <div className="relative">
        {filtered.length > 0 ? (
          <>
            {/* Scroll container */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-1 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {filtered.map((pkg) => (
                <div key={pkg.id} className="flex-shrink-0 w-[210px]">
                  <PackageCardUser
                    packageData={pkg as any}
                    hasActiveAttempt={activeSet.has(pkg.id)}
                    completedUsersCount={pkg.completedUsersCount}
                  />
                </div>
              ))}
            </div>

            {/* Scroll + Tryout Lainnya controls */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {hasMore && (
                <Link href="/daftar-tryout">
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs px-4">
                    Tryout Lainnya <ChevronRight size={14} />
                  </Button>
                </Link>
              )}
            </div>
          </>
        ) : (
          /* Empty state — fixed height agar layout tidak collapse */
          <div className="h-[220px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Tidak Ada Paket {activeFilter !== 'Semua' ? activeFilter : ''}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {activeFilter === 'Semua'
                ? 'Paket tryout akan segera tersedia.'
                : `Belum ada paket tier ${activeFilter} saat ini.`}
            </p>
          </div>
        )}
      </div>
    </>
  );
}