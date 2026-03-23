import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Package } from '@/types/database';
import { Clock, FileText, Users, Star } from 'lucide-react';

interface PackageCardUserProps {
  packageData: Package & { tier?: string };
  hasActiveAttempt?: boolean;
  completedUsersCount?: number;
}

function TierBadge({ tier }: { tier?: string }) {
  if (tier === 'premium') {
    return (
      <div className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
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
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':   return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard':   return 'bg-red-100 text-red-700 border-red-200';
      default:       return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':   return 'Mudah';
      case 'medium': return 'Sedang';
      case 'hard':   return 'Sulit';
      default:       return difficulty;
    }
  };

  const truncatedTitle = packageData.title.length > 15
    ? packageData.title.slice(0, 15) + '...'
    : packageData.title;

  return (
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

      {/* Stats */}
      <div className="px-4 pb-3 flex flex-col gap-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(packageData.difficulty)}`}>
            {getDifficultyLabel(packageData.difficulty)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span>110 Soal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>100 Menit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>{completedUsersCount.toLocaleString('id-ID')} Peserta</span>
        </div>
      </div>

      {/* Button */}
      <div className="px-4 pb-4 mt-auto">
        <Link href={`/packages/${packageData.id}`} className="w-full">
          <Button className="w-full text-sm h-9">
            {hasActiveAttempt ? 'Lanjutkan Tryout' : 'Mulai Tryout'}
          </Button>
        </Link>
      </div>
    </div>
  );
}