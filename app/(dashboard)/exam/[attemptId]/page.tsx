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
  const { attemptId } = await params;
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const attempt = await getAttemptById(attemptId);
  if (!attempt) notFound();

  if (attempt.user_id !== user.id) {
    redirect('/dashboard');
  }

  if (attempt.status === 'completed') {
    redirect(`/exam/${attemptId}/result`);
  }

  if (attempt.status !== 'in_progress') {
    redirect('/dashboard');
  }

  const packageQuestions = await getPackageQuestions(attempt.package_id);

  const { answers: existingAnswers } = await getAttemptWithAnswers(attemptId);

  const initialAnswers = new Map(
    existingAnswers.map(ans => [ans.question_id, ans.choice_id])
  );

  return (
    <ExamInterface
      attemptId={attemptId}
      packageTitle={attempt.packages.title}
      questions={packageQuestions}
      initialAnswers={Object.fromEntries(initialAnswers)}
      startedAt={attempt.started_at}
      timeRemaining={attempt.time_remaining}
    />
  );
}
