import { redirect, notFound } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { 
  getAttemptById, 
  getPackageQuestions,
  getAttemptWithAnswers 
} from '@/lib/supabase/queries';
import { ExamInterface } from '@/components/exam/exam-interface';

export default async function ExamPage({ 
  params 
}: { 
  params: Promise<{ attemptId: string }> 
}) {
  console.log('🚀 ExamPage START');
  
  const { attemptId } = await params;
  console.log('📍 attemptId:', attemptId);
  
  const user = await currentUser();
  console.log('👤 user:', user?.id);
  
  if (!user) {
    console.log('❌ No user, redirecting to sign-in');
    redirect('/sign-in');
  }

  console.log('🔍 Fetching attempt...');
  
  // ⭐ FIX: Destructure attempt and questions from response
  const { attempt, questions: packageQuestions } = await getAttemptById(attemptId);
  
  console.log('🎯 Attempt fetched:', {
    id: attempt?.id,
    status: attempt?.status,
    userId: attempt?.user_id,
    packageId: attempt?.package_id,
    packageTitle: attempt?.packages?.title
  });

  if (!attempt) {
    console.log('❌ Attempt not found');
    notFound();
  }

  if (attempt.user_id !== user.id) {
    console.log('❌ User mismatch, redirecting to dashboard');
    redirect('/dashboard');
  }

  if (attempt.status === 'completed') {
    console.log('✅ Completed, redirecting to result');
    redirect(`/exam/${attemptId}/result`);
  }

  if (attempt.status !== 'in_progress') {
    console.log('❌ Status not in_progress, redirecting to dashboard');
    redirect('/dashboard');
  }

  console.log('✅ All checks passed, rendering ExamInterface');
  console.log('📦 Package questions count:', packageQuestions?.length || 0);

  // Get existing answers
  const { answers: existingAnswers } = await getAttemptWithAnswers(attemptId);

  const initialAnswers = new Map(
    existingAnswers.map(ans => [ans.question_id, ans.choice_id])
  );

  console.log('📝 Existing answers count:', existingAnswers.length);

  return (
    <ExamInterface
      attemptId={attemptId}
      packageTitle={attempt.packages?.title || 'Tryout'}
      questions={packageQuestions}
      initialAnswers={Object.fromEntries(initialAnswers)}
      startedAt={attempt.started_at}
      timeRemaining={Math.floor(attempt.time_remaining / 1000)}
    />
  );
}