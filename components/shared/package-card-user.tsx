import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Package } from '@/types/database';
import { Clock, FileText, Users } from 'lucide-react';

interface PackageCardUserProps {
  packageData: Package & { tier?: string };
  hasActiveAttempt?: boolean;
  completedUsersCount?: number;
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

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'premium':  return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'platinum': return 'bg-purple-100 text-purple-700 border-purple-200';
      default:         return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'premium':  return 'Premium';
      case 'platinum': return 'Platinum';
      default:         return 'Gratis';
    }
  };

  // Truncate title to max 15 chars
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
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getTierColor(packageData.tier)}`}>
          {getTierLabel(packageData.tier)}
        </span>
      </div>

      {/* Stats — difficulty first, then soal/menit/peserta */}
      <div className="px-4 pb-3 flex flex-col gap-1.5 text-xs text-slate-500">
        {/* Difficulty — paling atas */}
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