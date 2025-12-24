import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Brain, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryScoreCardProps {
  category: 'TWK' | 'TIU' | 'TKP';
  score: number;
  maxScore: number;
  passingScore: number;
  correct: number;
  total: number;
}

export function CategoryScoreCard({ 
  category, 
  score, 
  maxScore, 
  passingScore, 
  correct, 
  total 
}: CategoryScoreCardProps) {
  const scorePercentage = (score / maxScore) * 100;
  const passed = score >= passingScore;
  const accuracyPercentage = total > 0 ? (correct / total) * 100 : 0;

  // Category configurations
  const categoryConfig = {
    TWK: {
      name: 'Tes Wawasan Kebangsaan',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500'
    },
    TIU: {
      name: 'Tes Intelejensi Umum',
      icon: Brain,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-500'
    },
    TKP: {
      name: 'Tes Karakteristik Pribadi',
      icon: MessageSquare,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-500'
    }
  };

  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg",
      config.bgColor,
      config.borderColor,
      "border-2"
    )}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", passed ? "bg-white shadow-sm" : "bg-white/50")}>
              <Icon className={cn("w-6 h-6", config.iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {category}
              </h3>
              <p className="text-xs text-muted-foreground">
                {config.name}
              </p>
            </div>
          </div>
          
          <Badge 
            variant={passed ? "default" : "destructive"}
            className="text-xs px-2 py-1"
          >
            {passed ? 'LULUS' : 'TIDAK'}
          </Badge>
        </div>

        {/* Score Display */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">
              {score}
            </span>
            <span className="text-sm text-muted-foreground">
              /{maxScore}
            </span>
          </div>
          
          {/* Pass/Fail Status */}
          <div className="flex items-center gap-2 mt-2">
            {passed ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  ✓ Lulus (≥{passingScore})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  ✗ Belum ({score}/{passingScore})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Skor</span>
            <span className="text-xs font-semibold">
              {scorePercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={scorePercentage} 
            className={cn(
              "h-2",
              passed ? "" : "opacity-60"
            )}
          />
        </div>

        {/* Accuracy */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Akurasi</span>
            <span className="text-xs font-semibold">
              {correct}/{total} ({accuracyPercentage.toFixed(0)}%)
            </span>
          </div>
          <Progress 
            value={accuracyPercentage} 
            className="h-1.5 opacity-60"
          />
        </div>

        {/* Decorative Corner */}
        <div className="absolute top-2 right-2 opacity-10">
          <Icon className="w-12 h-12" />
        </div>
      </CardContent>
    </Card>
  );
}
