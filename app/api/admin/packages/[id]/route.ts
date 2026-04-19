import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';

// GET - Get package by ID with questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();

    if (pkgError) throw pkgError;

    const { data: questions, error: qError } = await supabase
      .from('package_questions')
      .select(`
        position,
        questions!inner (
          id,
          category,
          content,
          difficulty,
          topic,
          is_published
        )
      `)
      .eq('package_id', id)
      .order('position');

    if (qError) throw qError;

    return NextResponse.json({
      package: pkg,
      questions: questions.map((pq: any) => ({
        position: pq.position,
        ...pq.questions,
      })),
    });
  } catch (error: any) {
    console.error('Get package error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch package' },
      { status: 500 }
    );
  }
}

// PATCH - Update package info
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('packages')
      .update({
        title: body.title,
        description: body.description,
        difficulty: body.difficulty,
        tier: body.tier,
        duration_minutes: body.duration_minutes,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ package: data });
  } catch (error: any) {
    console.error('Update package error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update package' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createAdminClient();

    // Check if package has attempts
    const { data: attempts } = await supabase
      .from('attempts')
      .select('id')
      .eq('package_id', id)
      .limit(1);

    if (attempts && attempts.length > 0) {
      return NextResponse.json(
        { error: 'Paket tidak bisa dihapus karena sudah ada percobaan' },
        { status: 400 }
      );
    }

    // Soft delete
    const { error } = await supabase
      .from('packages')
      .update({ is_deleted: true, is_active: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete package error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete package' },
      { status: 500 }
    );
  }
}