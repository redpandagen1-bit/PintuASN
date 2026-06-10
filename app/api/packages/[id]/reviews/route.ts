import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: packageId } = await params;
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('package_reviews')
    .select(`
      id, rating, comment, created_at, user_id,
      profiles ( full_name )
    `)
    .eq('package_id', packageId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reviews = (data || []).map((r: any) => {
    const profilesRaw = r.profiles;
    const profile = Array.isArray(profilesRaw) ? profilesRaw[0] : profilesRaw;
    const fullName = profile?.full_name ?? null;
    const displayName = fullName
      ? fullName.split(' ')[0]
      : 'Pengguna';
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user_display: displayName,
    };
  });

  return NextResponse.json({ reviews });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: packageId } = await params;
  const body = await req.json();
  const { rating, comment, attempt_id } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating tidak valid' }, { status: 400 });
  }

  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('package_reviews')
    .upsert(
      {
        package_id: packageId,
        user_id: userId,
        attempt_id: attempt_id ?? null,
        rating,
        comment: comment?.trim() || null,
      },
      { onConflict: 'user_id,package_id' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
