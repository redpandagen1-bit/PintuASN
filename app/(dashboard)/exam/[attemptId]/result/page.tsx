import { notFound, redirect } from 'next/navigation';
import { getAttemptById, getPackageById, getAttemptWithAnswers } from '@/lib/supabase/queries';
import { ResultContent } from '@/components/exam/result-content';

interface ResultPageProps {
  params: {
    attemptId: string;
  };
}



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

async function getResultData(attemptId: string) {
  // ✅ STEP 1: Fetch attempt (must be completed)
  const attempt = await getAttemptById(attemptId);
  
  // Redirect if not completed
  if (attempt.status !== 'completed') {
    redirect(`/exam/${attemptId}`);
  }

  // ✅ STEP 2: Fetch package info
  const pkg = await getPackageById(attempt.package_id);
  const attemptWithPackage = { ...attempt, packages: pkg };

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

  return {
    attempt: attemptWithPackage,
    totalScore,
    totalAnswered,
    timeTaken,
    passed,
    scores,
    categoryAnswered
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { attemptId } = params;

  let resultData;
  try {
    resultData = await getResultData(attemptId);
  } catch (error) {
    console.error('Error loading result page:', error);
    notFound();
  }

  return <ResultContent {...resultData!} />;
}