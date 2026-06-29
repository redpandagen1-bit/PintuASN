import { redirect, notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getAttemptById, getAttemptWithAnswers } from '@/lib/supabase/queries';
import { ExamInterface } from '@/components/exam/exam-interface';

export default async function DrillingRunPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [
    { attempt, questions },
    { answers: existingAnswers },
  ] = await Promise.all([
    getAttemptById(attemptId),
    getAttemptWithAnswers(attemptId),
  ]);

  if (!attempt) notFound();
  if (attempt.user_id !== userId) redirect('/dashboard');

  // Halaman ini khusus sesi drilling
  if (attempt.kind !== 'drilling') redirect(`/exam/${attemptId}`);

  if (attempt.status === 'completed') {
    redirect(`/exam/${attemptId}/result`);
  }
  if (attempt.status !== 'in_progress') {
    redirect('/drilling');
  }

  const initialAnswers = new Map(
    existingAnswers.map((ans) => [ans.question_id, ans.choice_id]),
  );

  return (
    <ExamInterface
      attemptId={attemptId}
      packageTitle={attempt.packages?.title || 'Drilling'}
      questions={questions}
      initialAnswers={Object.fromEntries(initialAnswers)}
      startedAt={attempt.started_at}
      timeRemaining={Math.floor(attempt.time_remaining / 1000)}
      resultPath={`/exam/${attemptId}/result`}
      cancelPath="/drilling"
    />
  );
}
