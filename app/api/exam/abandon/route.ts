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
    const { attemptId } = body;

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Verify ownership before deleting
    const { data: attempt } = await supabase
      .from('attempts')
      .select('id, user_id, status')
      .eq('id', attemptId)
      .single();

    if (!attempt || attempt.user_id !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ success: true }); // already done
    }

    // Delete attempt entirely (no history, no resume)
    const { error } = await supabase
      .from('attempts')
      .delete()
      .eq('id', attemptId);

    if (error) {
      console.error('Error deleting attempt:', error);
      return NextResponse.json({ error: 'Failed to abandon attempt' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Abandon exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
