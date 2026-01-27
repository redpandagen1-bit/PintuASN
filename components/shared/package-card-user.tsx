import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Package } from '@/types/database';
import { Clock, FileText, Users } from 'lucide-react';

interface PackageCardUserProps {
  packageData: Package;
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
      case 'easy':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Mudah';
      case 'medium':
        return 'Sedang';
      case 'hard':
        return 'Sulit';
      default:
        return difficulty;
    }
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">
            {packageData.title}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={getDifficultyColor(packageData.difficulty)}
          >
            {getDifficultyLabel(packageData.difficulty)}
          </Badge>
        </div>
        {packageData.description && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {packageData.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        {/* ✅ FIX: Layout vertikal agar lebih rapi */}
        <div className="flex flex-col space-y-2 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span>110 Soal</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>100 Menit</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{completedUsersCount.toLocaleString('id-ID')} Peserta</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Link href={`/packages/${packageData.id}`} className="w-full">
          <Button className="w-full">
            {hasActiveAttempt ? 'Lanjutkan Tryout' : 'Mulai Tryout'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}