import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Award, Target, Zap } from 'lucide-react';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG } from '@/constants/scoring';

interface ScoreSummaryProps {
  finalScore: number;
  scoreTWK: number;
  scoreTIU: number;
  scoreTKP: number;
  duration: number;
  difficulty: string;
  isPassed: boolean | null;
}

export default function ScoreSummary({ 
  finalScore, 
  scoreTWK, 
  scoreTIU, 
  scoreTKP, 
  duration, 
  difficulty, 
  isPassed 
}: ScoreSummaryProps) {
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'mudah': return 'bg-green-100 text-green-800 border-green-200';
      case 'sedang': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sulit': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'mudah': return 'Mudah';
      case 'sedang': return 'Sedang';
      case 'sulit': return 'Sulit';
      default: return 'Sedang';
    }
  };

  const getScoreColor = (score: number, maxScore: number, passingGrade: number) => {
    const percentage = (score / maxScore) * 100;
    if (score >= passingGrade) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const twkPercentage = (scoreTWK / TWK_CONFIG.MAX_SCORE) * 100;
  const tiuPercentage = (scoreTIU / TIU_CONFIG.MAX_SCORE) * 100;
  const tkpPercentage = (scoreTKP / TKP_CONFIG.MAX_SCORE) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Score */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Target className="w-8 h-8 text-primary mr-2" />
              <span className="text-sm text-muted-foreground font-medium">Total Nilai</span>
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              {finalScore.toLocaleString('id-ID')}
            </div>
            <Badge variant={isPassed ? 'default' : 'destructive'} className="w-full">
              {isPassed ? 'LULUS' : 'TIDAK LULUS'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* TWK Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-medium mb-3">TWK</div>
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(scoreTWK, TWK_CONFIG.MAX_SCORE, TWK_CONFIG.PASSING_GRADE)}`}>
              {scoreTWK.toLocaleString('id-ID')}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Nilai:</span>
                <span className="font-medium">{twkPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Min:</span>
                <span className="font-medium">{TWK_CONFIG.PASSING_GRADE}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    scoreTWK >= TWK_CONFIG.PASSING_GRADE ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(twkPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TIU Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-medium mb-3">TIU</div>
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(scoreTIU, TIU_CONFIG.MAX_SCORE, TIU_CONFIG.PASSING_GRADE)}`}>
              {scoreTIU.toLocaleString('id-ID')}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Nilai:</span>
                <span className="font-medium">{tiuPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Min:</span>
                <span className="font-medium">{TIU_CONFIG.PASSING_GRADE}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    scoreTIU >= TIU_CONFIG.PASSING_GRADE ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(tiuPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TKP Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-medium mb-3">TKP</div>
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(scoreTKP, TKP_CONFIG.MAX_SCORE, TKP_CONFIG.PASSING_GRADE)}`}>
              {scoreTKP.toLocaleString('id-ID')}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Nilai:</span>
                <span className="font-medium">{tkpPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Min:</span>
                <span className="font-medium">{TKP_CONFIG.PASSING_GRADE}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    scoreTKP >= TKP_CONFIG.PASSING_GRADE ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(tkpPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Below Scores */}
      <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Duration */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm text-muted-foreground">Durasi</div>
                <div className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                  {duration.toLocaleString('id-ID')} menit
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty */}
        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-sm text-muted-foreground">Tingkat</div>
                <Badge className={`mt-1 ${getDifficultyColor(difficulty)}`}>
                  {getDifficultyLabel(difficulty)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className={isPassed ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8" />
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant={isPassed ? 'default' : 'destructive'} className="mt-1">
                  {isPassed ? 'LULUS' : 'TIDAK LULUS'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
