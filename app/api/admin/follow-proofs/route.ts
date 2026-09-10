// ============================================================
// app/api/admin/follow-proofs/route.ts  —  GET list
// ============================================================

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('follow_proof_submissions')
      .select('*, packages(title), events(title)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
