// app/api/push/unregister/route.ts
import { auth }              from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse }      from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Opsional: terima token spesifik untuk hapus satu device
  const body = await req.json().catch(() => ({}));
  const { token } = body as { token?: string };

  const supabase = await createAdminClient();

  const query = token
    ? supabase.from('device_tokens').delete().eq('user_id', userId).eq('token', token)
    : supabase.from('device_tokens').delete().eq('user_id', userId);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
