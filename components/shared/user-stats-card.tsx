'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  History, 
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import type { Attempt } from '@/types/database';

interface UserStatsProps {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  passRate: number;
  recentAttempts: Attempt[];
}

export function UserStatsCard({
  totalAttempts,
  averageScore,
  bestScore,
  passRate,
  recentAttempts,
}: UserStatsProps) {
  const getScoreColor = (score: number) => {
    const percentage = (score / 175) * 100; // 175 is max possible score
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    const percentage = (score / 175) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 70) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">Berlangsung</Badge>;
      case 'abandoned':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <div className="text-2xl font-bold text-slate-900">{totalAttempts}</div>
              <div className="text-sm text-slate-600">Total Percobaan</div>
            </div>
            
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore}
              </div>
              <div className="text-sm text-slate-600">Rata-rata Skor</div>
            </div>
            
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <div className={`text-2xl font-bold ${getScoreColor(bestScore)}`}>
                {bestScore}
              </div>
              <div className="text-sm text-slate-600">Skor Terbaik</div>
            </div>
            
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getPassRateColor(passRate)}`}>
                  {passRate}%
                </span>
              </div>
              <div className="text-sm text-slate-600">Tingkat Kelulusan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riwayat Terakhir</CardTitle>
          <Link href="/dashboard/history">
            <Button variant="outline" size="sm">
              Lihat Semua
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentAttempts.length > 0 ? (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/exam/${attempt.id}/result`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        Tryout #{attempt.id.slice(0, 8)}
                      </Link>
                      {getStatusBadge(attempt.status)}
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatDate(attempt.started_at)}
                    </div>
                  </div>
                  
                  {attempt.final_score !== null && (
                    <Badge 
                      variant="outline" 
                      className={getScoreBadgeColor(attempt.final_score)}
                    >
                      {attempt.final_score}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 mb-4">Belum ada riwayat tryout</p>
              <Link href="/daftar-tryout">
                <Button>Mulai Tryout</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
