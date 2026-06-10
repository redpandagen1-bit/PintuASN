import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/packages/[id]/reviews/status?attempt_id=xxx
// Returns whether the current user has already submitted a review for this specific attempt.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ reviewed: false });

  const { id: packageId } = await params;
  const attemptId = req.nextUrl.searchParams.get('attempt_id');

  const supabase = await createAdminClient();

  const { data } = await supabase
    .from('package_reviews')
    .select('attempt_id')
    .eq('package_id', packageId)
    .eq('user_id', userId)
    .maybeSingle();

  // Reviewed == a review exists AND it was submitted for this specific attempt.
  const reviewed = data !== null && data.attempt_id === attemptId;

  return NextResponse.json({ reviewed });
}
