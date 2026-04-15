import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { attemptId, answers, flaggedQuestions } = body;

    if (!attemptId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: attemptId and answers' },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers must be an array' },
        { status: 400 }
      );
    }

    if (answers.length === 0) {
      return NextResponse.json({ success: true, saved: 0 });
    }

    for (const ans of answers) {
      if (!ans.questionId || !ans.choiceId) {
        return NextResponse.json(
          { error: 'Each answer must have questionId and choiceId' },
          { status: 400 }
        );
      }
    }

    const supabase = await createAdminClient();

    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('user_id, status')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (attempt.status !== 'in_progress') {
      // Attempt sudah selesai — tidak perlu save, tapi jangan error
      // Ini bisa terjadi kalau sendBeacon fired setelah submit berhasil
      return NextResponse.json({ success: true, saved: 0, skipped: 'already_completed' });
    }

    // Prepare answers untuk upsert
    const answersToSave = answers.map((ans: { questionId: string; choiceId: string }) => ({
      attempt_id: attemptId,
      question_id: ans.questionId,
      choice_id: ans.choiceId,
      is_flagged: flaggedQuestions?.includes(ans.questionId) || false,
      answered_at: new Date().toISOString(),
    }));

    // Upsert: insert baru atau update yang sudah ada
    // onConflict: attempt_id + question_id harus ada unique constraint di DB
    const { error: saveError } = await supabase
      .from('attempt_answers')
      .upsert(answersToSave, {
        onConflict: 'attempt_id,question_id',
      });

    if (saveError) {
      console.error('Save answers error:', saveError);
      return NextResponse.json(
        { error: 'Failed to save answers' },
        { status: 500 }
      );
    }

    // Update timestamp attempt
    await supabase
      .from('attempts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', attemptId);

    return NextResponse.json({
      success: true,
      saved: answersToSave.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Save answers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}