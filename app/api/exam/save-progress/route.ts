import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId, timeRemaining } = await req.json();

    const supabase = await createClient();

    const { error } = await supabase
      .from('attempts')
      .update({ 
        time_remaining: timeRemaining,
        updated_at: new Date().toISOString() 
      })
      .eq('id', attemptId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error saving progress:', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save progress error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}