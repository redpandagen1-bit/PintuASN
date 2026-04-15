import { redirect, notFound } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import {
  getAttemptById,
  getAttemptWithAnswers
} from '@/lib/supabase/queries';
import { ExamInterface } from '@/components/exam/exam-interface';

export default async function ExamPage({
  params
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params;

  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Fetch attempt+questions dan existing answers secara parallel
  const [
    { attempt, questions: packageQuestions },
    { answers: existingAnswers },
  ] = await Promise.all([
    getAttemptById(attemptId),
    getAttemptWithAnswers(attemptId),
  ]);

  if (!attempt) {
    notFound();
  }

  if (attempt.user_id !== user.id) {
    redirect('/dashboard');
  }

  if (attempt.status === 'completed') {
    redirect(`/exam/${attemptId}/result`);
  }

  if (attempt.status !== 'in_progress') {
    redirect('/dashboard');
  }

  const initialAnswers = new Map(
    existingAnswers.map(ans => [ans.question_id, ans.choice_id])
  );

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
