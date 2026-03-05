import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@/lib/supabase/server';

// POST - Create/Update question with specific position
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
      explanation_image_url,
      topic,
      difficulty,
      choices,
      package_id,
      position,
    } = body;

    console.log('📝 Creating/Updating question:', { category, package_id, position, choicesCount: choices?.length });

    // Validate required fields
    if (!category || !content || !choices || choices.length !== 5) {
      return NextResponse.json(
        { error: 'Category, content, and 5 choices are required' },
        { status: 400 }
      );
    }

    if (!package_id || !position) {
      return NextResponse.json(
        { error: 'package_id and position are required' },
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

    // Check if question already exists at this position
    const { data: existing } = await supabase
      .from('package_questions')
      .select('question_id')
      .eq('package_id', package_id)
      .eq('position', position)
      .single();

    let questionId: string;

    if (existing) {
      // UPDATE existing question
      console.log('🔄 Updating existing question at position', position);
      questionId = existing.question_id;

      // Prepare update data
      const updateData: any = {
        category,
        content,
        image_url: image_url || null,
        explanation: explanation || null,
        topic: topic || null,
        difficulty: difficulty || 'medium',
        is_published: true,
        status: 'published',
      };

      // Only add explanation_image_url if provided
      if (explanation_image_url) {
        updateData.explanation_image_url = explanation_image_url;
      }

      const { error: qError } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', questionId);

      if (qError) {
        console.error('❌ Error updating question:', qError);
        throw qError;
      }

      // Delete old choices
      await supabase.from('choices').delete().eq('question_id', questionId);

    } else {
      // INSERT new question
      console.log('✨ Creating new question at position', position);

      // Prepare insert data
      const insertData: any = {
        category,
        content,
        image_url: image_url || null,
        explanation: explanation || null,
        topic: topic || null,
        difficulty: difficulty || 'medium',
        is_published: true,
        status: 'published',
        created_by: userId,
      };

      // Only add explanation_image_url if provided
      if (explanation_image_url) {
        insertData.explanation_image_url = explanation_image_url;
      }

      const { data: question, error: qError } = await supabase
        .from('questions')
        .insert(insertData)
        .select()
        .single();

      if (qError) {
        console.error('❌ Error inserting question:', qError);
        throw qError;
      }

      questionId = question.id;

      // Insert package_questions relation
      const { error: pqError } = await supabase
        .from('package_questions')
        .insert({
          package_id: package_id,
          question_id: questionId,
          position: position,
        });

      if (pqError) {
        console.error('❌ Error linking question to package:', pqError);
        // Rollback
        await supabase.from('questions').delete().eq('id', questionId);
        throw pqError;
      }
    }

    // Insert/Update choices
    const choicesData = choices.map((c: any) => ({
      question_id: questionId,
      label: c.label,
      content: c.content,
      image_url: c.image_url || null,
      is_answer: category === 'TKP' ? false : (c.is_answer || false),
      score: category === 'TKP' ? c.score : null,
    }));

    const { error: cError } = await supabase
      .from('choices')
      .insert(choicesData);

    if (cError) {
      console.error('❌ Error inserting choices:', cError);
      throw cError;
    }

    console.log('✅ Question saved at position', position);

    return NextResponse.json({ success: true, questionId }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Create question error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create question' },
      { status: 500 }
    );
  }
}