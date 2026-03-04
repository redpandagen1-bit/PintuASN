import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@/lib/supabase/server';

// POST - Create new question with choices
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAdmin();
    const supabase = await createClient();
    const body = await request.json();

    const {
      category,
      content,
      image_url,
      explanation,
      topic,
      difficulty,
      choices,
      package_id,
    } = body;

    console.log('📝 Creating question:', { category, package_id, choicesCount: choices?.length });

    // Validate required fields
    if (!category || !content || !choices || choices.length !== 5) {
      return NextResponse.json(
        { error: 'Category, content, and 5 choices are required' },
        { status: 400 }
      );
    }

    // Validate TWK/TIU has one correct answer
    if (category !== 'TKP') {
      const correctAnswers = choices.filter((c: any) => c.is_answer);
      if (correctAnswers.length !== 1) {
        return NextResponse.json(
          { error: 'TWK/TIU questions must have exactly one correct answer' },
          { status: 400 }
        );
      }
    }

    // Validate TKP has scores for all choices
    if (category === 'TKP') {
      const hasScores = choices.every(
        (c: any) => c.score >= 1 && c.score <= 5
      );
      if (!hasScores) {
        return NextResponse.json(
          { error: 'TKP questions must have scores (1-5) for all choices' },
          { status: 400 }
        );
      }
    }

    // 1. Insert question
    const { data: question, error: qError } = await supabase
      .from('questions')
      .insert({
        category,
        content,
        image_url: image_url || null,
        explanation: explanation || null,
        topic: topic || null,
        difficulty: difficulty || 'medium',
        is_published: true,
        status: 'published',
        created_by: userId,
      })
      .select()
      .single();

    if (qError) {
      console.error('❌ Error inserting question:', qError);
      throw qError;
    }

    console.log('✅ Question created:', question.id);

    // 2. Insert choices
    const choicesData = choices.map((c: any) => ({
      question_id: question.id,
      label: c.label,
      content: c.content,
      is_answer: category === 'TKP' ? false : (c.is_answer || false),
      score: category === 'TKP' ? c.score : null,
    }));

    const { error: cError } = await supabase
      .from('choices')
      .insert(choicesData);

    if (cError) {
      console.error('❌ Error inserting choices:', cError);
      // Rollback - delete question
      await supabase.from('questions').delete().eq('id', question.id);
      throw cError;
    }

    console.log('✅ Choices created');

    // 3. Add to package if package_id provided
    if (package_id) {
      console.log('📦 Adding question to package:', package_id);

      try {
        // Get current max position
        const { data: maxPos, error: maxPosError } = await supabase
          .from('package_questions')
          .select('position')
          .eq('package_id', package_id)
          .order('position', { ascending: false })
          .limit(1);

        if (maxPosError) {
          console.error('❌ Error getting max position:', maxPosError);
          throw maxPosError;
        }

        const nextPosition = maxPos && maxPos.length > 0 ? maxPos[0].position + 1 : 1;

        console.log('📍 Next position:', nextPosition);

        const { data: pqData, error: pqError } = await supabase
          .from('package_questions')
          .insert({
            package_id: package_id,
            question_id: question.id,
            position: nextPosition,
          })
          .select();

        if (pqError) {
          console.error('❌ Error adding to package:', pqError);
          console.error('Full error:', JSON.stringify(pqError, null, 2));
          
          // Rollback - delete question and choices
          await supabase.from('choices').delete().eq('question_id', question.id);
          await supabase.from('questions').delete().eq('id', question.id);
          
          throw new Error('Gagal menambahkan soal ke paket: ' + pqError.message);
        }

        console.log('✅ Question added to package:', pqData);
      } catch (pkgError: any) {
        console.error('❌ Package assignment error:', pkgError);
        throw pkgError;
      }
    }

    return NextResponse.json({ success: true, question }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Create question error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create question' },
      { status: 500 }
    );
  }
}