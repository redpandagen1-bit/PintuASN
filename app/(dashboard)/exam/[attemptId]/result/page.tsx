import { notFound, redirect } from 'next/navigation';
import { getAttemptById, getPackageById, getAttemptWithAnswers } from '@/lib/supabase/queries';
import { ResultSummaryCard } from '@/components/exam/result-summary-card';
import { ScoreBreakdown } from '@/components/exam/score-breakdown';
import { CategoryScoreCard } from '@/components/exam/category-score-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Trophy, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface ResultPageProps {
  params: {
    attemptId: string;
  };
}

// Constants sesuai architecture.md Section 7
const CATEGORY_MAX_SCORES = {
  TWK: 150, // 30 questions × 5 points
  TIU: 175, // 35 questions × 5 points
  TKP: 225  // 45 questions × 5 points
};

const PASSING_SCORES = {
  TWK: 65,
  TIU: 80,
  TKP: 166
};

const CATEGORY_QUESTIONS = {
  TWK: 30,
  TIU: 35,
  TKP: 45
};

const TOTAL_MAX_SCORE = 550;

const calculateTimeTaken = (startedAt: string, completedAt?: string | null) => {
  if (!completedAt) return '0 menit 0 detik';
  
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const diffMs = end.getTime() - start.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit ${seconds} detik`;
  }
  return `${minutes} menit ${seconds} detik`;
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { attemptId } = params;

  try {
    // ✅ STEP 1: Fetch attempt (must be completed)
    const attempt = await getAttemptById(attemptId);
    
    // Redirect if not completed
    if (attempt.status !== 'completed') {
      redirect(`/exam/${attemptId}`);
    }

    // ✅ STEP 2: Fetch package info
    const pkg = await getPackageById(attempt.package_id);

    // ✅ STEP 3: Fetch answers untuk hitung answered count & category breakdown
    const { answers } = await getAttemptWithAnswers(attemptId);
    const totalAnswered = answers.length;

    // ✅ STEP 4: USE DATABASE SCORES (source of truth dari calculate_attempt_score)
    const scores = {
      TWK: attempt.score_twk ?? 0,
      TIU: attempt.score_tiu ?? 0,
      TKP: attempt.score_tkp ?? 0,
    };
    const totalScore = attempt.final_score ?? 0;
    
    // ✅ STEP 5: PASS LOGIC dari database (calculated by calculate_attempt_score)
    // Sesuai architecture.md: Pass = TWK≥65 AND TIU≥80 AND TKP≥166
    const passed = attempt.is_passed ?? false;

    // ✅ STEP 6: Calculate time taken
    const timeTaken = calculateTimeTaken(attempt.started_at, attempt.completed_at);

    // ✅ STEP 7: Category breakdown for display "X/30 dijawab"
    // NOTE: Ini simplified - karena kita tidak perlu re-calculate scores
    // Hanya untuk display purposes, bukan untuk scoring
    const categoryAnswered = {
      TWK: Math.min(totalAnswered, 30),
      TIU: Math.min(Math.max(0, totalAnswered - 30), 35),
      TKP: Math.min(Math.max(0, totalAnswered - 65), 45)
    };

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
              {pkg.title} • {new Date(attempt.completed_at || '').toLocaleDateString('id-ID', {
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
            passingScore={PASSING_SCORES.TWK}
            correct={categoryAnswered.TWK}
            total={CATEGORY_QUESTIONS.TWK}
          />
          
          <CategoryScoreCard
            category="TIU"
            score={scores.TIU}
            maxScore={CATEGORY_MAX_SCORES.TIU}
            passingScore={PASSING_SCORES.TIU}
            correct={categoryAnswered.TIU}
            total={CATEGORY_QUESTIONS.TIU}
          />
          
          <CategoryScoreCard
            category="TKP"
            score={scores.TKP}
            maxScore={CATEGORY_MAX_SCORES.TKP}
            passingScore={PASSING_SCORES.TKP}
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
            <Link href={`/exam/${attemptId}/review`}>
              Lihat Pembahasan Soal
            </Link>
          </Button>
          
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
  } catch (error) {
    console.error('Error loading result page:', error);
    notFound();
  }
}