import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { attemptId, answers } = body;

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Verify attempt ownership
    const { data: attempt, error: verifyError } = await supabase
      .from('attempts')
      .select('id, user_id, status, package_id')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (verifyError || !attempt) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    if (attempt.status === 'completed') {
      return NextResponse.json({ error: 'Attempt already completed' }, { status: 400 });
    }

    // Save answers
    const answersToSave = answers.map((ans: { questionId: string; choiceId: string }) => ({
      attempt_id: attemptId,
      question_id: ans.questionId,
      choice_id: ans.choiceId,
      is_flagged: false,
      answered_at: new Date().toISOString(),
    }));

    const { error: saveError } = await supabase
      .from('attempt_answers')
      .upsert(answersToSave, { onConflict: 'attempt_id,question_id' });

    if (saveError) {
      console.error('Submit: failed to save answers', saveError.code);
      return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
    }

    // Calculate scores via DB function
    const { data: scoreData, error: scoreError } = await supabase
      .rpc('calculate_attempt_score', { attempt_uuid: attemptId });

    if (scoreError) {
      console.error('Submit: score calculation failed', scoreError.code);
      return NextResponse.json({ error: 'Failed to calculate scores' }, { status: 500 });
    }

    // Update attempt with scores
    if (scoreData && scoreData.length > 0) {
      const scores = scoreData[0];

      const { error: updateError } = await supabase
        .from('attempts')
        .update({
          score_twk: scores.twk_score,
          score_tiu: scores.tiu_score,
          score_tkp: scores.tkp_score,
          final_score: scores.total_score,
          is_passed: scores.is_passed,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', attemptId);

      if (updateError) {
        console.error('Submit: failed to update attempt', updateError.code);
        return NextResponse.json({ error: 'Failed to update attempt' }, { status: 500 });
      }
    }

    // Fetch final state
    const { data: finalAttempt, error: fetchFinalError } = await supabase
      .from('attempts')
      .select('status, completed_at, score_twk, score_tiu, score_tkp, final_score, is_passed')
      .eq('id', attemptId)
      .single();

    if (fetchFinalError || !finalAttempt) {
      return NextResponse.json({ error: 'Failed to fetch attempt status' }, { status: 500 });
    }

    if (finalAttempt.status !== 'completed') {
      return NextResponse.json({ error: 'Failed to complete attempt submission' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      scores: {
        twk: finalAttempt.score_twk || 0,
        tiu: finalAttempt.score_tiu || 0,
        tkp: finalAttempt.score_tkp || 0,
        total: finalAttempt.final_score || 0,
        isPassed: finalAttempt.is_passed || false,
      },
      attemptId,
      completedAt: finalAttempt.completed_at,
      totalScore: finalAttempt.final_score || 0,
    });

  } catch (error) {
    console.error('Submit: unexpected error', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
