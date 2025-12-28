import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, fullName, phone } = await request.json();

    // Verify user can only update their own profile
    if (userId !== clerkUserId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!fullName || fullName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nama lengkap minimal 3 karakter' },
        { status: 400 }
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}