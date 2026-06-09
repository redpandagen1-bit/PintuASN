// app/api/notifications/route.ts
import { auth }              from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse }      from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createAdminClient();

  const [{ data: items }, { count }] = await Promise.all([
    supabase
      .from('notifications')
      .select('id, type, title, body, link, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false),
  ]);

  return NextResponse.json({
    notifications: items ?? [],
    unreadCount:   count ?? 0,
  });
}
