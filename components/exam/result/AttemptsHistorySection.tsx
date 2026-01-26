import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG } from '@/constants/scoring';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AttemptHistory {
  final_score: number | null;
  score_twk: number | null;
  score_tiu: number | null;
  score_tkp: number | null;
  completed_at: string | null;
}

interface AttemptsHistorySectionProps {
  attempts: AttemptHistory[];
}

export default function AttemptsHistorySection({ attempts }: AttemptsHistorySectionProps) {
  if (attempts.length === 0) return null;

  const checkPass = (score: number | null, passingGrade: number) => (score || 0) >= passingGrade;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Riwayat Percobaan (3 Terakhir)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {attempts.map((attempt, index) => {
            const isPassed = 
              checkPass(attempt.score_twk, TWK_CONFIG.PASSING_GRADE) &&
              checkPass(attempt.score_tiu, TIU_CONFIG.PASSING_GRADE) &&
              checkPass(attempt.score_tkp, TKP_CONFIG.PASSING_GRADE);

            return (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Percobaan #{index + 1}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(attempt.completed_at || '').toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Nilai</TableHead>
                        <TableHead className="text-right">Min</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>TWK</TableCell>
                        <TableCell className="text-right font-bold">{attempt.score_twk || 0}</TableCell>
                        <TableCell className="text-right">{TWK_CONFIG.PASSING_GRADE}</TableCell>
                        <TableCell className="text-center">
                          {checkPass(attempt.score_twk, TWK_CONFIG.PASSING_GRADE) ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 inline" />
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>TIU</TableCell>
                        <TableCell className="text-right font-bold">{attempt.score_tiu || 0}</TableCell>
                        <TableCell className="text-right">{TIU_CONFIG.PASSING_GRADE}</TableCell>
                        <TableCell className="text-center">
                          {checkPass(attempt.score_tiu, TIU_CONFIG.PASSING_GRADE) ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 inline" />
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>TKP</TableCell>
                        <TableCell className="text-right font-bold">{attempt.score_tkp || 0}</TableCell>
                        <TableCell className="text-right">{TKP_CONFIG.PASSING_GRADE}</TableCell>
                        <TableCell className="text-center">
                          {checkPass(attempt.score_tkp, TKP_CONFIG.PASSING_GRADE) ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 inline" />
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-semibold">Total Score:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{attempt.final_score?.toLocaleString('id-ID') || 0}</span>
                      <Badge variant={isPassed ? 'default' : 'destructive'}>
                        {isPassed ? 'LULUS' : 'TIDAK LULUS'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
