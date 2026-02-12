import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@/lib/supabase/server';
import { CSVQuestionRow } from '@/lib/validations/question-schema';

export async function POST(request: NextRequest) {
  try {
    // Check admin
    const userId = await requireAdmin();

    const body = await request.json();
    const { questions } = body as { questions: CSVQuestionRow[] };

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions provided' },
        { status: 400 }
      );
    }

    // Limit: max 500 questions per upload
    if (questions.length > 500) {
      return NextResponse.json(
        { error: 'Maksimal 500 soal per upload' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each question
    for (const q of questions) {
      try {
        // Insert question
        const { data: question, error: questionError } = await supabase
          .from('questions')
          .insert({
            category: q.category,
            content: q.question_text,
            explanation: q.explanation || null,
            topic: q.topic || null,
            difficulty: q.difficulty,
            image_url: q.image_url || null,
            type: 'multiple_choice',
            is_published: false,
            status: 'draft',
            created_by: userId,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Insert choices
        const choices = [
          { label: 'A', content: q.option_a },
          { label: 'B', content: q.option_b },
          { label: 'C', content: q.option_c },
          { label: 'D', content: q.option_d },
          { label: 'E', content: q.option_e },
        ];

        const choicesData = choices.map((choice) => {
          if (q.category === 'TKP') {
            // TKP: set score, is_answer = false
            const scoreKey = `tkp_score_${choice.label.toLowerCase()}` as keyof CSVQuestionRow;
            return {
              question_id: question.id,
              label: choice.label,
              content: choice.content,
              is_answer: false,
              score: (q as any)[scoreKey],
            };
          } else {
            // TWK/TIU: set is_answer based on correct_answer
            const isCorrect = 'correct_answer' in q && q.correct_answer === choice.label;
            return {
              question_id: question.id,
              label: choice.label,
              content: choice.content,
              is_answer: isCorrect,
              score: null,
            };
          }
        });

        const { error: choicesError } = await supabase
          .from('choices')
          .insert(choicesData);

        if (choicesError) throw choicesError;

        successCount++;
      } catch (error) {
        failedCount++;
        errors.push(
          `Row ${successCount + failedCount}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10), // Return first 10 errors only
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}