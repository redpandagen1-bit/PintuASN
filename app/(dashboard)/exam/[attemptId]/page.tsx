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
  params: { attemptId: string } 
}) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const attempt = await getAttemptById(params.attemptId);
  if (!attempt) notFound();

  if (attempt.user_id !== user.id) {
    redirect('/dashboard');
  }

  if (attempt.status === 'completed') {
    redirect(`/exam/${params.attemptId}/result`);
  }

  if (attempt.status !== 'in_progress') {
    redirect('/dashboard');
  }

  const packageQuestions = await getPackageQuestions(attempt.package_id);

  const { answers: existingAnswers } = await getAttemptWithAnswers(params.attemptId);

  const initialAnswers = new Map(
    existingAnswers.map(ans => [ans.question_id, ans.choice_id])
  );

  return (
    <ExamInterface
      attemptId={params.attemptId}
      packageTitle={attempt.packages.title}
      questions={packageQuestions}
      initialAnswers={Object.fromEntries(initialAnswers)}
      startedAt={attempt.started_at}
      timeRemaining={attempt.time_remaining}
    />
  );
}
