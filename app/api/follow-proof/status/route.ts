// ============================================================
// app/api/follow-proof/status/route.ts
// Cek apakah user ini SUDAH PERNAH upload bukti follow (berlaku global,
// sekali submit → tidak diminta lagi untuk paket/promo lain).
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('follow_proof_submissions')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ hasSubmitted: !!data });
  } catch (e) {
    console.error('[follow-proof/status]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
