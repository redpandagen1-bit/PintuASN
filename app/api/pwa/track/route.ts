// app/api/pwa/track/route.ts
// Mencatat perangkat yang membuka PWA dalam mode terpasang (standalone).
// Anonim diperbolehkan — user_id diisi jika kebetulan sedang login.
import { auth }              from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse }      from 'next/server';

const ALLOWED_PLATFORMS = new Set(['ios', 'android', 'desktop', 'unknown']);

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { deviceId, platform = 'unknown' } = body as { deviceId?: string; platform?: string };

  if (!deviceId || typeof deviceId !== 'string' || deviceId.length > 100) {
    return NextResponse.json({ error: 'deviceId required' }, { status: 400 });
  }
  const plat = ALLOWED_PLATFORMS.has(platform) ? platform : 'unknown';

  // userId opsional — anonim tetap dicatat
  let userId: string | null = null;
  try { userId = (await auth()).userId ?? null; } catch { /* anonim */ }

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('pwa_installs')
    .upsert(
      {
        device_id:    deviceId,
        user_id:      userId,
        platform:     plat,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'device_id' },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
