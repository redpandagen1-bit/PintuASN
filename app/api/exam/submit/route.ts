import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('🚀 POST /api/exam/submit - START');
  
  try {
    // ✅ STEP 1: Auth check
    console.log('🔐 Checking authentication...');
    const { userId } = await auth();
    
    if (!userId) {
      console.error('❌ No userId from auth');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('✅ User authenticated:', userId);

    // ✅ STEP 2: Parse request body
    console.log('📦 Parsing request body...');
    let body;
    try {
      body = await req.json();
      console.log('✅ Body parsed:', body);
    } catch (parseError) {
      console.error('❌ Failed to parse body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { attemptId, answers } = body;

    if (!attemptId) {
      console.error('❌ No attemptId in body');
      return NextResponse.json(
        { error: 'Attempt ID is required' },
        { status: 400 }
      );
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      console.error('❌ No answers provided');
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    console.log('✅ attemptId:', attemptId);
    console.log('✅ answers count:', answers.length);

    // ✅ STEP 3: Create Supabase client
    console.log('🔌 Creating Supabase admin client...');
    const supabase = await createAdminClient();
    console.log('✅ Supabase client created');

    // ✅ STEP 4: Verify attempt ownership
    console.log('🔍 Verifying attempt ownership...');
    const { data: attempt, error: verifyError } = await supabase
      .from('attempts')
      .select('id, user_id, status, package_id')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying attempt:', verifyError);
      return NextResponse.json(
        { error: 'Attempt not found or unauthorized', details: verifyError.message },
        { status: 404 }
      );
    }

    if (!attempt) {
      console.error('❌ Attempt not found');
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    console.log('✅ Attempt verified:', {
      id: attempt.id,
      status: attempt.status,
      userId: attempt.user_id
    });

    // Check if already completed
    if (attempt.status === 'completed') {
      console.warn('⚠️ Attempt already completed');
      return NextResponse.json(
        { error: 'Attempt already completed' },
        { status: 400 }
      );
    }

    // ✅ STEP 4.5: Save answers to database FIRST
    console.log(`💾 Saving ${answers.length} answers...`);

    const answersToSave = answers.map((ans: any) => ({
      attempt_id: attemptId,
      question_id: ans.questionId,
      choice_id: ans.choiceId,
      is_flagged: false,
      answered_at: new Date().toISOString(),
    }));

    const { error: saveError } = await supabase
      .from('attempt_answers')
      .upsert(answersToSave, {
        onConflict: 'attempt_id,question_id',
      });

    if (saveError) {
      console.error('❌ Error saving answers:', saveError);
      return NextResponse.json(
        { error: 'Failed to save answers', details: saveError.message },
        { status: 500 }
      );
    }

    console.log('✅ Answers saved successfully');

    // ✅ STEP 5: Verify answers were saved
    const { data: savedAnswers, error: checkError } = await supabase
      .from('attempt_answers')
      .select('id')
      .eq('attempt_id', attemptId);

    if (checkError) {
      console.error('❌ Error checking saved answers:', checkError);
    } else {
      console.log(`✅ Verified ${savedAnswers?.length || 0} answers in database`);
    }

    // ✅ STEP 6: Calculate scores using database function
    console.log('🧮 Calculating scores...');
    
    const { data: scoreData, error: scoreError } = await supabase
      .rpc('calculate_attempt_score', { 
        attempt_uuid: attemptId
      });

    if (scoreError) {
      console.error('❌ Error calculating scores:', scoreError);
      return NextResponse.json(
        { error: 'Failed to calculate scores', details: scoreError.message },
        { status: 500 }
      );
    }

    console.log('✅ Score calculation result:', scoreData);

    // ✅ STEP 7: Update attempt with scores and mark as completed
    if (scoreData && scoreData.length > 0) {
      const scores = scoreData[0];
      
      console.log('📝 Updating attempt with scores:', {
        twk: scores.twk_score,
        tiu: scores.tiu_score,
        tkp: scores.tkp_score,
        total: scores.total_score,
        isPassed: scores.is_passed
      });
      
      const { error: updateError } = await supabase
        .from('attempts')
        .update({
          score_twk: scores.twk_score,
          score_tiu: scores.tiu_score,
          score_tkp: scores.tkp_score,
          final_score: scores.total_score,
          is_passed: scores.is_passed,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      if (updateError) {
        console.error('❌ Error updating attempt:', updateError);
        return NextResponse.json(
          { error: 'Failed to update attempt', details: updateError.message },
          { status: 500 }
        );
      }

      console.log('✅ Attempt updated successfully');
    }

    // ✅ STEP 8: Fetch final attempt state
    console.log('📊 Fetching final attempt state...');
    const { data: finalAttempt, error: fetchFinalError } = await supabase
      .from('attempts')
      .select('status, completed_at, score_twk, score_tiu, score_tkp, final_score, is_passed')
      .eq('id', attemptId)
      .single();

    if (fetchFinalError || !finalAttempt) {
      console.error('❌ Error fetching final attempt:', fetchFinalError);
      return NextResponse.json(
        { error: 'Failed to fetch attempt status', details: fetchFinalError?.message },
        { status: 500 }
      );
    }

    console.log('✅ Final attempt state:', finalAttempt);

    // Verify completion
    if (finalAttempt.status !== 'completed') {
      console.error('❌ Attempt status not completed:', finalAttempt.status);
      return NextResponse.json(
        { error: 'Failed to complete attempt submission' },
        { status: 500 }
      );
    }

    // ✅ STEP 9: Return success response
    const successResponse = {
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
    };

    console.log('✅ Returning success response:', successResponse);
    console.log('🎉 POST /api/exam/submit - SUCCESS');

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('💥 FATAL ERROR in submit route:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}