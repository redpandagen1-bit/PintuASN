import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target } from 'lucide-react';

interface RankingSectionProps {
  packageRank: number;
  totalParticipants: number;
  userBestScore: number;
}

export default function RankingSection({ packageRank, totalParticipants, userBestScore }: RankingSectionProps) {
  const getRankColor = (rank: number, total: number) => {
    const percentage = (rank / total) * 100;
    if (percentage <= 10) return 'text-green-600';
    if (percentage <= 30) return 'text-blue-600';
    if (percentage <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankBadge = (rank: number, total: number) => {
    const percentage = (rank / total) * 100;
    if (percentage <= 10) return 'default';
    if (percentage <= 30) return 'secondary';
    if (percentage <= 60) return 'outline';
    return 'destructive';
  };

  const percentage = (packageRank / totalParticipants) * 100;
  const topPercentage = Math.round((totalParticipants - packageRank + 1) / totalParticipants * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Peringkat Paket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Ranking */}
        <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className={`h-6 w-6 ${getRankColor(packageRank, totalParticipants)}`} />
            <span className="text-sm font-medium text-muted-foreground">Peringkat Anda</span>
          </div>
          <div className="text-5xl font-bold mb-2">
            #{packageRank.toLocaleString('id-ID')}
          </div>
          <div className="text-sm text-muted-foreground">
            dari {totalParticipants.toLocaleString('id-ID')} peserta
          </div>
          <Badge variant={getRankBadge(packageRank, totalParticipants)} className="mt-3">
            Top {topPercentage.toLocaleString('id-ID')}%
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Best Score */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm text-muted-foreground">Skor Terbaik</div>
                <div className="text-xl font-bold text-green-700 dark:text-green-300">
                  {userBestScore.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm text-muted-foreground">Total Peserta</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {totalParticipants.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Breakdown */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-3">Detail Peringkat</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Posisi:</span>
              <span className="font-medium">#{packageRank.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Persentase:</span>
              <span className="font-medium">{percentage.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Di atas:</span>
              <span className="font-medium">{(packageRank - 1).toLocaleString('id-ID')} orang</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Di bawah:</span>
              <span className="font-medium">{(totalParticipants - packageRank).toLocaleString('id-ID')} orang</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
