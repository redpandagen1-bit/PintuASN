import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, fullName, phone } = await request.json();

    if (userId !== clerkUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!fullName || fullName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nama lengkap minimal 3 karakter' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name:            fullName.trim(),
        phone:                phone?.trim() || null,
        onboarding_completed: true, // ← INI YANG HILANG — tanpa ini user loop selamanya
        updated_at:           new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error(`[onboarding] update failed [${userId}]:`, error.message);
      return NextResponse.json(
        { error: 'Gagal menyimpan data. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[onboarding] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}