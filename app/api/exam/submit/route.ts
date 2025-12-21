import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { calculateAttemptScore } from '@/lib/scoring/engine';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { attemptId, answers } = body;

    // Validate required fields
    if (!attemptId) {
      return NextResponse.json(
        { error: 'Missing required field: attemptId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Start transaction - get attempt and lock it
    const { data: attempt, error: fetchError } = await supabase
      .from('attempts')
      .select('id, user_id, status')
      .eq('id', attemptId)
      .single();

    if (fetchError || !attempt) {
      console.error('Error fetching attempt:', fetchError);
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (attempt.status === 'completed') {
      return NextResponse.json(
        { error: 'Attempt already completed' },
        { status: 400 }
      );
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Attempt not in progress' },
        { status: 400 }
      );
    }

    // Save final answers if provided
    if (answers && Array.isArray(answers) && answers.length > 0) {
      // Validate answer structure
      for (const ans of answers) {
        if (!ans.questionId || !ans.choiceId) {
          return NextResponse.json(
            { error: 'Each answer must have questionId and choiceId' },
            { status: 400 }
          );
        }
      }

      const answersToSave = answers.map((ans: any) => ({
        attempt_id: attemptId,
        question_id: ans.questionId,
        choice_id: ans.choiceId,
        answered_at: new Date().toISOString(),
      }));

      const { error: saveError } = await supabase
        .from('attempt_answers')
        .upsert(answersToSave, {
          onConflict: 'attempt_id,question_id',
        });

      if (saveError) {
        console.error('Error saving final answers:', saveError);
        return NextResponse.json(
          { error: 'Failed to save final answers' },
          { status: 500 }
        );
      }
    }

    // Calculate scores using database function
    let scores;
    try {
      scores = await calculateAttemptScore(attemptId);
    } catch (scoreError) {
      console.error('Error calculating scores:', scoreError);
      return NextResponse.json(
        { error: 'Failed to calculate scores' },
        { status: 500 }
      );
    }

    // Update attempt status and scores in a transaction
    const updateData: any = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add scores if calculated
    if (scores) {
      updateData.score_twk = scores.twk;
      updateData.score_tiu = scores.tiu;
      updateData.score_tkp = scores.tkp;
      updateData.total_score = scores.total;
      updateData.is_passed = scores.isPassed;
    }

    const { error: updateError } = await supabase
      .from('attempts')
      .update(updateData)
      .eq('id', attemptId)
      .eq('status', 'in_progress'); // Ensure still in_progress (transaction safety)

    if (updateError) {
      console.error('Error updating attempt:', updateError);
      return NextResponse.json(
        { error: 'Failed to update attempt status' },
        { status: 500 }
      );
    }

    // Verify the update was successful
    const { data: updatedAttempt, error: verifyError } = await supabase
      .from('attempts')
      .select('status, completed_at, total_score')
      .eq('id', attemptId)
      .single();

    if (verifyError || !updatedAttempt || updatedAttempt.status !== 'completed') {
      console.error('Failed to verify attempt completion:', verifyError);
      return NextResponse.json(
        { error: 'Failed to complete attempt submission' },
        { status: 500 }
      );
    }

    // Return success with scores
    return NextResponse.json({
      success: true,
      scores,
      attemptId,
      completedAt: updatedAttempt.completed_at,
      totalScore: updatedAttempt.total_score,
    });

  } catch (error) {
    console.error('Submit exam error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
