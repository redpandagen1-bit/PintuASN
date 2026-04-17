import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG } from '@/constants/scoring';
import { getUserTier } from '@/lib/supabase/queries';
import ResultClient from './_result-client';
import { MobilePageWrapper }   from '@/components/mobile/MobilePageWrapper';
import { MobileHasilSimulasi } from '@/components/mobile/MobileHasilSimulasi';

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
    .select(`
      id,
      answered_at,
      time_spent_seconds,
      choice_id,
      questions (
        id,
        content,
        category,
        choices ( id, is_answer, score )
      )
    `)
    .eq('attempt_id', attemptId)
    .order('answered_at', { ascending: true });

  const answersWithCorrect = (answers || []).map((a: any) => {
    const question = a.questions;
    const isCorrect = question?.category !== 'TKP'
      ? question?.choices?.find((c: any) => c.is_answer)?.id === a.choice_id
      : null;
    const userChoice = question?.choices?.find((c: any) => c.id === a.choice_id);
    const tkpScore = question?.category === 'TKP' ? (userChoice?.score ?? 0) : null;

    return {
      id: a.id,
      answered_at: a.answered_at,
      time_spent_seconds: a.time_spent_seconds,
      choice_id: a.choice_id,
      is_correct: isCorrect,
      tkp_score: tkpScore,
      questions: {
        id: question?.id,
        content: question?.content,
        category: question?.category,
      },
    };
  });

  // ✅ FIX: Supabase foreign key join mengembalikan profiles sebagai array,
  // tapi LeaderboardItem mengharapkan object tunggal | null.
  // Normalize di sini sebelum dikirim ke client component.
  const normalizedLeaderboard = (leaderboard || []).map((item, index) => {
    const profilesRaw = item.profiles;
    const profiles = Array.isArray(profilesRaw)
      ? (profilesRaw[0] ?? null)
      : profilesRaw ?? null;

    return {
      id: item.id,
      rank: index + 1,
      user_id: item.user_id,
      final_score: item.final_score,
      completed_at: item.completed_at,
      profiles: profiles as { full_name: string | null; avatar_url: string | null } | null,
    };
  });

  return {
    attempt,
    packageInfo: attempt.packages,
    leaderboard: normalizedLeaderboard,
    packageRank,
    totalParticipants: totalParticipants || 0,
    attemptHistory: attemptHistory || [],
    lastThreeAttempts: attemptHistory?.slice(-3) || [],
    answers: answersWithCorrect,
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { attemptId } = await params;

  // Fetch data & subscription tier secara paralel
  const [data, subscriptionTier] = await Promise.all([
    getResultData(attemptId, userId),
    getUserTier(userId),
  ]);

  const duration = data.attempt.completed_at && data.attempt.started_at
    ? Math.round((new Date(data.attempt.completed_at).getTime() -
        new Date(data.attempt.started_at).getTime()) / 60000)
    : 0;

  const userRankInLeaderboard = data.leaderboard.find(
    item => item.user_id === userId
  )?.rank;

  return (
    <>
      <MobilePageWrapper>
        <MobileHasilSimulasi
          attemptId={attemptId}
          finalScore={data.attempt.final_score}
          scoreTwk={data.attempt.score_twk}
          scoreTiu={data.attempt.score_tiu}
          scoreTkp={data.attempt.score_tkp}
          isPassed={data.attempt.is_passed}
          packageRank={data.packageRank}
          totalParticipants={data.totalParticipants}
          attemptHistory={data.attemptHistory}
          completedAt={data.attempt.completed_at}
          packageTitle={data.packageInfo?.title ?? null}
          leaderboard={data.leaderboard}
          userId={userId}
        />
      </MobilePageWrapper>
      <div className="hidden md:block">
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
          subscriptionTier={subscriptionTier}
        />
      </div>
    </>
  );
}