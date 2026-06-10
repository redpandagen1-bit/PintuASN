'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Package } from '@/types/database';
import { Clock, FileText, Users, Star, BarChart2 } from 'lucide-react';
import { ReviewsPopup } from '@/components/shared/ReviewsPopup';

interface PackageCardUserProps {
  packageData: Package & { tier?: string };
  hasActiveAttempt?: boolean;
  completedUsersCount?: number;
}

function TierBadge({ tier }: { tier?: string }) {
  if (tier === 'premium') {
    return (
      <div className="flex items-center gap-1 bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
        <Star size={9} fill="currentColor" />
        Premium
      </div>
    );
  }
  if (tier === 'platinum') {
    return (
      <div className="flex items-center gap-1 bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
        <Star size={9} fill="currentColor" />
        Platinum
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
      Gratis
    </div>
  );
}

export function PackageCardUser({
  packageData,
  hasActiveAttempt = false,
  completedUsersCount = 0
}: PackageCardUserProps) {
  const [reviewOpen, setReviewOpen] = useState(false);

  const truncatedTitle = packageData.title.length > 15
    ? packageData.title.slice(0, 15) + '...'
    : packageData.title;

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-w-[200px]">
        {/* Header: title + tier badge */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
          <h3
            className="text-sm font-bold text-slate-800 truncate"
            title={packageData.title}
          >
            {truncatedTitle}
          </h3>
          <TierBadge tier={packageData.tier} />
        </div>

        {/* Ulasan */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setReviewOpen(true)}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-yellow-600 transition-colors"
          >
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="underline underline-offset-1">Lihat ulasan</span>
          </button>
        </div>

        {/* Stats — horizontal */}
        <div className="px-4 pb-3 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-slate-400" />
            110 Soal
          </span>
          <span className="w-px h-3 bg-slate-200 flex-shrink-0" />
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            100 Mnt
          </span>
          <span className="w-px h-3 bg-slate-200 flex-shrink-0" />
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-slate-400" />
            {completedUsersCount.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Button */}
        <div className="px-4 pb-4 mt-auto">
          <div className="flex gap-2">
            <Link href={`/packages/${packageData.id}`} className="flex-1">
              <Button className="w-full text-sm h-9">
                {hasActiveAttempt ? 'Lanjutkan Tryout' : 'Mulai Tryout'}
              </Button>
            </Link>
            <Link href={`/packages/${packageData.id}/stats`}>
              <button
                title="Lihat Data"
                className="h-9 px-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center"
              >
                <BarChart2 size={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <ReviewsPopup
        packageId={packageData.id}
        packageTitle={packageData.title}
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </>
  );
}
