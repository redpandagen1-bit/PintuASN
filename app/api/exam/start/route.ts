import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get user from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse body
    const body = await req.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check package exists and is active
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json(
        { error: 'Package not found or inactive' },
        { status: 404 }
      );
    }

    // Check for existing in-progress attempt
    const { data: existing } = await supabase
      .from('attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('package_id', packageId)
      .eq('status', 'in_progress')
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active attempt for this package' },
        { status: 400 }
      );
    }

    // Create new attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        user_id: userId,
        package_id: packageId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        time_remaining: 6000000, // 100 minutes
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Error creating attempt:', attemptError);
      return NextResponse.json(
        { error: 'Failed to create attempt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attemptId: attempt.id,
      packageId: attempt.package_id,
      startedAt: attempt.started_at,
      timeRemaining: attempt.time_remaining,
    });

  } catch (error) {
    console.error('Start exam error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
