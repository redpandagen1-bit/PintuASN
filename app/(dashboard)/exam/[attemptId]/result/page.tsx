import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG } from '@/constants/scoring';
import ResultHeader from '@/components/exam/result/ResultHeader';
import ScoreSummary from '@/components/exam/result/ScoreSummary';
import LeaderboardSection from '@/components/exam/result/LeaderboardSection';
import RankingSection from '@/components/exam/result/RankingSection';
import ProgressChartSection from '@/components/exam/result/ProgressChartSection';
import AttemptsHistorySection from '@/components/exam/result/AttemptsHistorySection';
import TimeAnalysisSection from '@/components/exam/result/TimeAnalysisSection';
import ResultActions from '@/components/exam/result/ResultActions';

interface ResultPageProps {
  params: Promise<{ attemptId: string }>;
}

interface AttemptData {
  id: string;
  user_id: string;
  package_id: string;
  status: string;
  score_twk: number | null;
  score_tiu: number | null;
  score_tkp: number | null;
  final_score: number | null;
  is_passed: boolean | null;
  started_at: string;
  completed_at: string | null;
  packages: {
    id: string;
    title: string | null;
    description: string | null;
    difficulty: string;
  } | null;
}

interface LeaderboardItem {
  id: string;
  user_id: string;
  final_score: number | null;
  completed_at: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  rank: number;
}

interface AttemptHistory {
  final_score: number | null;
  score_twk: number | null;
  score_tiu: number | null;
  score_tkp: number | null;
  completed_at: string | null;
}

interface AnswerData {
  id: string;
  answered_at: string;
  time_spent_seconds: number | null;
  questions: {
    id: string;
    content: string | null;
    category: string;
  } | null;
}

async function getResultData(attemptId: string, userId: string) {
  const supabase = await createAdminClient();

  // Fetch current attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select(`
      *,
      packages (id, title, description, difficulty)
    `)
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (!attempt || attempt.status !== 'completed') {
    redirect('/dashboard');
  }

  // Fetch leaderboard (top 100)
  const { data: leaderboard, error: leaderboardError } = await supabase
    .from('attempts')
    .select(`
      id,
      user_id,
      final_score,
      completed_at,
      profiles (full_name, avatar_url)
    `)
    .eq('package_id', attempt.package_id)
    .eq('status', 'completed')
    .order('final_score', { ascending: false })
    .order('completed_at', { ascending: true })
    .limit(100);

  // Calculate package rank
  const { count: higherScoresCount, error: rankError } = await supabase
    .from('attempts')
    .select('*', { count: 'exact', head: true })
    .eq('package_id', attempt.package_id)
    .eq('status', 'completed')
    .gt('final_score', attempt.final_score || 0);

  const { count: totalParticipants, error: totalError } = await supabase
    .from('attempts')
    .select('user_id', { count: 'exact', head: true })
    .eq('package_id', attempt.package_id)
    .eq('status', 'completed');

  const packageRank = (higherScoresCount || 0) + 1;

  // Fetch progress chart data (all attempts for this package by user)
  const { data: attemptHistory, error: historyError } = await supabase
    .from('attempts')
    .select('final_score, score_twk, score_tiu, score_tkp, completed_at')
    .eq('user_id', userId)
    .eq('package_id', attempt.package_id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true });

  // Fetch last 3 attempts
  const lastThreeAttempts = attemptHistory?.slice(-3) || [];

  // Fetch time analysis data
  const { data: answers, error: answersError } = await supabase
    .from('attempt_answers')
    .select(`
      id,
      answered_at,
      time_spent_seconds,
      questions (id, content, category)
    `)
    .eq('attempt_id', attemptId)
    .order('answered_at', { ascending: true });

  return {
    attempt,
    packageInfo: attempt.packages,
    leaderboard: leaderboard?.map((item, index) => ({
      ...item,
      rank: index + 1
    })) || [],
    packageRank,
    totalParticipants: totalParticipants || 0,
    attemptHistory: attemptHistory || [],
    lastThreeAttempts,
    answers: answers || [],
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { attemptId } = await params;
  const data = await getResultData(attemptId, userId);

  // Calculate duration
  const duration = data.attempt.completed_at && data.attempt.started_at
    ? Math.round((new Date(data.attempt.completed_at).getTime() - 
        new Date(data.attempt.started_at).getTime()) / 60000)
    : 0;

  // Find user rank in leaderboard
  const userRankInLeaderboard = data.leaderboard.find(
    item => item.user_id === userId
  )?.rank;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Section 1: Header */}
      <ResultHeader 
        isPassed={data.attempt.is_passed}
        packageTitle={data.packageInfo?.title}
      />

      {/* Section 2: Score Summary */}
      <ScoreSummary 
        finalScore={data.attempt.final_score || 0}
        scoreTWK={data.attempt.score_twk || 0}
        scoreTIU={data.attempt.score_tiu || 0}
        scoreTKP={data.attempt.score_tkp || 0}
        duration={duration}
        difficulty={data.packageInfo?.difficulty}
        isPassed={data.attempt.is_passed}
      />

      {/* Section 3 & 4: Grid 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Left: Leaderboard */}
        <LeaderboardSection 
          leaderboard={data.leaderboard}
          currentUserId={userId}
          userRank={userRankInLeaderboard}
          packageTitle={data.packageInfo?.title}
        />

        {/* Right: Package Ranking */}
        <RankingSection 
          packageRank={data.packageRank}
          totalParticipants={data.totalParticipants}
          userBestScore={data.attempt.final_score || 0}
        />
      </div>

      {/* Section 5: Progress Chart */}
      <ProgressChartSection 
        attemptHistory={data.attemptHistory}
      />

      {/* Section 6: Last 3 Attempts */}
      <AttemptsHistorySection 
        attempts={data.lastThreeAttempts}
      />

      {/* Section 7: Time Analysis */}
      <TimeAnalysisSection 
        answers={data.answers}
        attemptStartTime={data.attempt.started_at}
      />

      {/* Actions */}
      <ResultActions 
        attemptId={attemptId}
        isPassed={data.attempt.is_passed}
      />
    </div>
  );
}