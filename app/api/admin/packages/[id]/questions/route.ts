import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@/lib/supabase/server';

// GET - Get questions in package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: packageId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('package_questions')
      .select(`
        position,
        questions!inner (
          id,
          category,
          content,
          difficulty,
          topic,
          image_url,
          is_published,
          choices (
            id,
            label,
            content,
            is_answer,
            score
          )
        )
      `)
      .eq('package_id', packageId)
      .order('position');

    if (error) throw error;

    return NextResponse.json({
      questions: data.map((pq: any) => ({
        position: pq.position,
        ...pq.questions,
      })),
    });
  } catch (error: any) {
    console.error('Get package questions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST - Add question to package
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: packageId } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { question_id } = body;

    if (!question_id) {
      return NextResponse.json(
        { error: 'question_id is required' },
        { status: 400 }
      );
    }

    // Get current max position
    const { data: maxPos } = await supabase
      .from('package_questions')
      .select('position')
      .eq('package_id', packageId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = maxPos && maxPos.length > 0 ? maxPos[0].position + 1 : 1;

    // Insert
    const { data, error } = await supabase
      .from('package_questions')
      .insert({
        package_id: packageId,
        question_id: question_id,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Add question to package error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add question' },
      { status: 500 }
    );
  }
}

// DELETE - Remove question from package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: packageId } = await params;
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('question_id');
    const supabase = await createClient();

    if (!questionId) {
      return NextResponse.json(
        { error: 'question_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('package_questions')
      .delete()
      .eq('package_id', packageId)
      .eq('question_id', questionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Remove question from package error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove question' },
      { status: 500 }
    );
  }
}