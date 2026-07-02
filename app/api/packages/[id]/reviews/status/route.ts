import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/packages/[id]/reviews/status
// Returns whether the current user has already reviewed THIS PACKAGE (scope
// per paket, bukan per attempt). Sekali user memberi ulasan untuk paket ini,
// popup ulasan tidak muncul lagi walau membuka attempt lain dari paket yang
// sama (mis. dari Riwayat). Param attempt_id diabaikan (kompatibilitas lama).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ reviewed: false });

  const { id: packageId } = await params;

  const supabase = await createAdminClient();

  const { data } = await supabase
    .from('package_reviews')
    .select('id')
    .eq('package_id', packageId)
    .eq('user_id', userId)
    .maybeSingle();

  // Sudah pernah mengulas paket ini = tidak perlu popup lagi.
  const reviewed = data !== null;

  return NextResponse.json({ reviewed });
}
