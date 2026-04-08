// ============================================================
// app/(admin)/admin/events/page.tsx
// ============================================================

import { createClient }      from '@/lib/supabase/server';
import { requireAdmin }      from '@/lib/auth/check-admin';
import AdminEventsClient     from './admin-events-client';
import type { Event }        from '@/types/events';

async function getAllEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at',  { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
}

export default async function AdminEventsPage() {
  await requireAdmin();
  const events = await getAllEvents();
  return <AdminEventsClient initialEvents={events} />;
}