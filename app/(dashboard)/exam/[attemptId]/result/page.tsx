import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG } from '@/constants/scoring';
import ResultClient from './_result-client';

interface ResultPageProps {
  params: Promise<{ attemptId: string }>;
}

async function getResultData(attemptId: string, userId: string) {
  const supabase = await createAdminClient();

  const { data: attempt } = await supabase
    .from('attempts')
    .select(`*, packages (id, title, description, difficulty)`)
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (!attempt || attempt.status !== 'completed') redirect('/dashboard');

  const { data: leaderboard } = await supabase
    .from('attempts')
    .select(`id, user_id, final_score, completed_at, profiles (full_name, avatar_url)`)
    .eq('package_id', attempt.package_id)
    .eq('status', 'completed')
    .order('final_score', { ascending: false })
    .order('completed_at', { ascending: true })
    .limit(100);

  const { count: higherScoresCount } = await supabase
    .from('attempts')
    .select('*', { count: 'exact', head: true })
    .eq('package_id', attempt.package_id)
    .eq('status', 'completed')
    .gt('final_score', attempt.final_score || 0);

  const { count: totalParticipants } = await supabase
    .from('attempts')
    .select('user_id', { count: 'exact', head: true })
    .eq('package_id', attempt.package_id)
    .eq('status', 'completed');

  const packageRank = (higherScoresCount || 0) + 1;

  const { data: attemptHistory } = await supabase
    .from('attempts')
    .select('final_score, score_twk, score_tiu, score_tkp, completed_at')
    .eq('user_id', userId)
    .eq('package_id', attempt.package_id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true });

  const { data: answers } = await supabase
    .from('attempt_answers')
    .select(`id, answered_at, time_spent_seconds, questions (id, content, category)`)
    .eq('attempt_id', attemptId)
    .order('answered_at', { ascending: true });

  return {
    attempt,
    packageInfo: attempt.packages,
    leaderboard: leaderboard?.map((item, index) => ({ ...item, rank: index + 1 })) || [],
    packageRank,
    totalParticipants: totalParticipants || 0,
    attemptHistory: attemptHistory || [],
    lastThreeAttempts: attemptHistory?.slice(-3) || [],
    answers: answers || [],
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { attemptId } = await params;
  const data = await getResultData(attemptId, userId);

  const duration = data.attempt.completed_at && data.attempt.started_at
    ? Math.round((new Date(data.attempt.completed_at).getTime() -
        new Date(data.attempt.started_at).getTime()) / 60000)
    : 0;

  const userRankInLeaderboard = data.leaderboard.find(
    item => item.user_id === userId
  )?.rank;

  return (
    <ResultClient
      attemptId={attemptId}
      attempt={data.attempt}
      packageInfo={data.packageInfo}
      leaderboard={data.leaderboard}
      packageRank={data.packageRank}
      totalParticipants={data.totalParticipants}
      attemptHistory={data.attemptHistory}
      lastThreeAttempts={data.lastThreeAttempts}
      answers={data.answers}
      duration={duration}
      userId={userId}
      userRankInLeaderboard={userRankInLeaderboard}
    />
  );
}