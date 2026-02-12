import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { togglePublishQuestion } from '@/lib/supabase/queries';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { publish } = await request.json();

    const updated = await togglePublishQuestion(id, publish);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Publish toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}