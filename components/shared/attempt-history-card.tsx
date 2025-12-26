'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Eye, 
  BookOpen,
  CheckCircle,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Attempt, Package } from '@/types/database';

interface AttemptHistoryCardProps {
  attempt: Attempt & { packages: Package };
}

export function AttemptHistoryCard({ attempt }: AttemptHistoryCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    return `${durationMinutes} menit`;
  };

  const isPassed = () => {
    const maxPossibleScore = 175;
    const passingScore = maxPossibleScore * 0.7;
    return attempt.final_score !== null && attempt.final_score >= passingScore;
  };

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/exam/${attempt.id}/result`
      : '';

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success('Link hasil berhasil disalin!');
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Gagal menyalin link');
    }
  };



  const getScoreBadgeColor = (score: number) => {
    const percentage = (score / 175) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 70) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">
              {attempt.packages?.title || 'Unknown Package'}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(attempt.completed_at || attempt.started_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{calculateDuration(attempt.started_at, attempt.completed_at || attempt.started_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {attempt.final_score !== null && (
              <Badge 
                variant="outline" 
                className={`text-base px-3 py-1 font-semibold ${getScoreBadgeColor(attempt.final_score)}`}
              >
                {attempt.final_score}
              </Badge>
            )}
            
            {isPassed() ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Lulus
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Tidak Lulus
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Breakdown */}
        {attempt.twk_score !== null || attempt.tiu_score !== null || attempt.tkp_score !== null && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 mb-2">Skor per Kategori:</div>
            <div className="grid grid-cols-3 gap-2">
              {attempt.twk_score !== null && (
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                  <span className="text-blue-700 font-medium">TWK</span>
                  <span className="text-blue-900 font-semibold">{attempt.twk_score}</span>
                </div>
              )}
              {attempt.tiu_score !== null && (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                  <span className="text-green-700 font-medium">TIU</span>
                  <span className="text-green-900 font-semibold">{attempt.tiu_score}</span>
                </div>
              )}
              {attempt.tkp_score !== null && (
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded text-sm">
                  <span className="text-purple-700 font-medium">TKP</span>
                  <span className="text-purple-900 font-semibold">{attempt.tkp_score}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/exam/${attempt.id}/result`}>
                <Eye className="h-4 w-4 mr-2" />
                Lihat Hasil
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href={`/exam/${attempt.id}/review`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Lihat Pembahasan
              </Link>
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="w-full"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Link Tersalin!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Salin Link Hasil
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
