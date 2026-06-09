// app/api/push/register/route.ts
import { auth }              from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse }      from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { token, platform = 'web' } = body as { token?: string; platform?: string };

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const supabase = await createAdminClient();

  // Upsert: jika token sudah ada, perbarui updated_at & user_id saja
  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      {
        user_id:    userId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
