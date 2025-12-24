import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultSummaryCardProps {
  passed: boolean;
  totalScore: number;
  maxScore: number;
}

export function ResultSummaryCard({ passed, totalScore, maxScore }: ResultSummaryCardProps) {
  const scorePercentage = (totalScore / maxScore) * 100;
  
  return (
    <Card className={cn(
      "mb-8 overflow-hidden relative",
      passed 
        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" 
        : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
    )}>
      <CardContent className="p-8 text-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 text-6xl">
            {passed ? <Trophy className="w-16 h-16 text-green-600" /> : <XCircle className="w-16 h-16 text-red-600" />}
          </div>
        </div>

        {/* Status Icon */}
        <div className="mb-4 relative z-10">
          <div className={cn(
            "inline-flex items-center justify-center w-24 h-24 rounded-full",
            passed 
              ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
              : "bg-red-500 text-white shadow-lg shadow-red-500/30"
          )}>
            {passed ? (
              <CheckCircle className="w-12 h-12" />
            ) : (
              <XCircle className="w-12 h-12" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="mb-6 relative z-10">
          <h2 className={cn(
            "text-3xl font-bold mb-2",
            passed ? "text-green-700" : "text-red-700"
          )}>
            {passed ? "SELAMAT! Anda LULUS" : "Anda Belum Lulus"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {passed 
              ? "Kerja bagus! Anda telah melewati standar kelulusan." 
              : "Jangan menyerah! Coba lagi untuk hasil yang lebih baik."
            }
          </p>
        </div>

        {/* Score Display */}
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="text-4xl font-bold text-gray-800">
              {totalScore}
            </div>
            <div className="text-2xl text-gray-500">
              /{maxScore}
            </div>
            {passed && <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />}
          </div>
          
          <Badge 
            variant={passed ? "default" : "destructive"}
            className={cn(
              "text-sm px-4 py-1",
              passed 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
            )}
          >
            {scorePercentage.toFixed(1)}%
          </Badge>
        </div>

        {/* Decorative Elements */}
        {passed && (
          <div className="absolute -top-2 -right-2">
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-400 rounded-full opacity-20 animate-pulse" />
              <div className="absolute inset-2 bg-yellow-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
