import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';

interface LeaderboardItem {
  id: string;
  rank: number;
  user_id: string;
  final_score: number | null;
  completed_at: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface LeaderboardSectionProps {
  leaderboard: LeaderboardItem[];
  currentUserId: string;
  userRank?: number;
  packageTitle?: string;
}

export default function Leader    boardSection({ 
  leaderboard, 
  currentUserId, 
  userRank,
  packageTitle 
}: LeaderboardSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard {packageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow 
                  key={entry.id}
                  className={entry.user_id === currentUserId ? 'bg-primary/10' : ''}
                >
                  <TableCell>
                    <Badge variant={entry.rank <= 3 ? 'default' : 'secondary'}>
                      #{entry.rank}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.profiles?.full_name || 'Anonymous'}
                    {entry.user_id === currentUserId && (
                      <span className="ml-2 text-xs text-primary">(Anda)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {entry.final_score?.toLocaleString('id-ID') || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {userRank && userRank > 100 && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-center">
            <p className="text-sm">
              Peringkat Anda: <span className="font-bold">#{userRank.toLocaleString('id-ID')}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
