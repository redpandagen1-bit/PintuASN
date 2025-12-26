'use client';

import { ResultSummaryCard } from '@/components/exam/result-summary-card';
import { ScoreBreakdown } from '@/components/exam/score-breakdown';
import { CategoryScoreCard } from '@/components/exam/category-score-card';
import { ShareResultsButton } from '@/components/shared/share-results-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Trophy, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { Attempt, Package } from '@/types/database';

interface ResultContentProps {
  attempt: Attempt & { packages: Package };
  totalScore: number;
  totalAnswered: number;
  timeTaken: string;
  passed: boolean;
  scores: {
    TWK: number;
    TIU: number;
    TKP: number;
  };
  categoryAnswered: {
    TWK: number;
    TIU: number;
    TKP: number;
  };
}

// Constants
const CATEGORY_MAX_SCORES = {
  TWK: 150, // 30 questions × 5 points
  TIU: 175, // 35 questions × 5 points
  TKP: 225  // 45 questions × 5 points
};

const CATEGORY_QUESTIONS = {
  TWK: 30,
  TIU: 35,
  TKP: 45
};

const TOTAL_MAX_SCORE = 550;

export function ResultContent({
  attempt,
  totalScore,
  totalAnswered,
  timeTaken,
  passed,
  scores,
  categoryAnswered
}: ResultContentProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Hasil Ujian</h1>
          <p className="text-muted-foreground">
            {attempt.packages?.title || 'Unknown Package'} • {new Date(attempt.completed_at || '').toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Pass/Fail Indicator */}
      <ResultSummaryCard 
        passed={passed}
        totalScore={totalScore}
        maxScore={TOTAL_MAX_SCORE}
      />

      {/* Total Score Card */}
      <ScoreBreakdown 
        score={totalScore}
        maxScore={TOTAL_MAX_SCORE}
        answeredQuestions={totalAnswered}
        totalQuestions={110}
      />

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <CategoryScoreCard
          category="TWK"
          score={scores.TWK}
          maxScore={CATEGORY_MAX_SCORES.TWK}
          passingScore={65}
          correct={categoryAnswered.TWK}
          total={CATEGORY_QUESTIONS.TWK}
        />
        
        <CategoryScoreCard
          category="TIU"
          score={scores.TIU}
          maxScore={CATEGORY_MAX_SCORES.TIU}
          passingScore={80}
          correct={categoryAnswered.TIU}
          total={CATEGORY_QUESTIONS.TIU}
        />
        
        <CategoryScoreCard
          category="TKP"
          score={scores.TKP}
          maxScore={CATEGORY_MAX_SCORES.TKP}
          passingScore={166}
          correct={categoryAnswered.TKP}
          total={CATEGORY_QUESTIONS.TKP}
        />
      </div>

      {/* Statistics Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Statistik Pengerjaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{timeTaken}</div>
              <div className="text-sm text-muted-foreground">Waktu Pengerjaan</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalAnswered}/110
              </div>
              <div className="text-sm text-muted-foreground">Soal Dijawab</div>
              <div className="text-xs text-muted-foreground mt-1">
                TWK: {categoryAnswered.TWK}/30 • 
                TIU: {categoryAnswered.TIU}/35 • 
                TKP: {categoryAnswered.TKP}/45
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {((totalAnswered / 110) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Kelengkapan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          <Link href={`/exam/${attempt.id}/review`}>
            Lihat Pembahasan Soal
          </Link>
        </Button>
        
        <ShareResultsButton 
          attemptId={attempt.id}
          score={totalScore}
          maxScore={TOTAL_MAX_SCORE}
          passed={passed}
          packageName={attempt.packages?.title || 'Unknown Package'}
        />
        
        <Button variant="outline" size="lg" asChild>
          <Link href="/dashboard">
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>

      {/* Decorative element for passed exams */}
      {passed && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-400 rounded-full opacity-10 animate-pulse" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-green-300 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-500 rounded-full opacity-5 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      )}
    </div>
  );
}
