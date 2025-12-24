import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Target } from 'lucide-react';

interface ScoreBreakdownProps {
  score: number;
  maxScore: number;
  answeredQuestions: number;
  totalQuestions: number;
}

export function ScoreBreakdown({ 
  score, 
  maxScore, 
  answeredQuestions, 
  totalQuestions 
}: ScoreBreakdownProps) {
  const scorePercentage = (score / maxScore) * 100;
  const completionPercentage = (answeredQuestions / totalQuestions) * 100;
  
  // Determine color based on score
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Award className="h-6 w-6 text-blue-600" />
          Skor Total
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Score Display */}
          <div className="text-center">
            <div className="mb-4">
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {score}
              </div>
              <div className="text-xl text-gray-500">
                dari {maxScore} poin
              </div>
            </div>
            
            {/* Score Progress */}
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Persentase</span>
                <span className={`text-sm font-semibold ${getScoreColor(scorePercentage)}`}>
                  {scorePercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={scorePercentage} 
                className="h-3"
              />
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {scorePercentage >= 70 ? 'Baik' : scorePercentage >= 50 ? 'Cukup' : 'Perlu Perbaikan'}
              </div>
              <div className="text-xs text-muted-foreground">Kinerja</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-lg font-semibold text-green-600">
                {answeredQuestions}/{totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground">Dijawab</div>
            </div>
            
            <div className="text-center">
              <div className="mb-2">
                <div className="text-lg font-semibold text-purple-600">
                  {completionPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Kelengkapan</div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`text-center p-4 rounded-lg ${
            scorePercentage >= 70 
              ? 'bg-green-50 border border-green-200' 
              : scorePercentage >= 50 
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${
              scorePercentage >= 70 
                ? 'text-green-700' 
                : scorePercentage >= 50 
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              {scorePercentage >= 80 && "Luar biasa! Skor Anda sangat baik."}
              {scorePercentage >= 70 && scorePercentage < 80 && "Bagus! Skor Anda di atas rata-rata."}
              {scorePercentage >= 50 && scorePercentage < 70 && "Cukup baik, namun masih ada ruang untuk perbaikan."}
              {scorePercentage < 50 && "Perlu lebih banyak latihan untuk meningkatkan skor."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
