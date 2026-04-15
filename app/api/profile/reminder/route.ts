// ============================================================
// app/api/profile/reminder/route.ts
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { ReminderPreference } from '@/types/roadmap';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: ReminderPreference = await req.json();

  const supabase = await createClient();

  const { error } = await supabase
    .from('user_reminder_preferences')
    .upsert(
      {
        user_id:       userId,
        enabled:       body.enabled,
        interval_days: body.intervalDays ?? null,
        custom_days:   body.customDays   ?? null,
        exam_date:     body.examDate     ?? null,
        last_notif_at: body.lastNotifAt  ?? null,
        updated_at:    new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.error('[reminder] upsert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_reminder_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // PGRST116 = row not found — bukan error
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) return NextResponse.json(null);

  const pref: ReminderPreference = {
    enabled:      data.enabled,
    intervalDays: data.interval_days ?? null,
    customDays:   data.custom_days   ?? null,
    examDate:     data.exam_date     ?? null,
    lastNotifAt:  data.last_notif_at ?? null,
  };

  return NextResponse.json(pref);
}