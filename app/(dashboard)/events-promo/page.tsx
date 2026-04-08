// ============================================================
// app/(dashboard)/events-promo/page.tsx
// ============================================================

import { Suspense }         from 'react';
import { createClient }     from '@/lib/supabase/server';
import EventPromoCard       from '@/components/dashboard/user/EventPromoCard';
import { Skeleton }         from '@/components/ui/skeleton';
import type { Event }       from '@/types/events';
import { Megaphone }        from 'lucide-react';

// ── data fetching ─────────────────────────────────────────────
async function getActiveEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const now      = new Date().toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('order_index', { ascending: true })
    .order('created_at',  { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
}

// ── skeleton loader ───────────────────────────────────────────
function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-2xl overflow-hidden border shadow-sm">
          <Skeleton className="w-full aspect-[3/1]" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── events grid ───────────────────────────────────────────────
async function EventsGrid() {
  const events = await getActiveEvents();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Megaphone size={28} className="text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-700 text-lg">Belum ada promo aktif</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-sm">
          Pantau terus halaman ini — promo &amp; event menarik akan segera hadir!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map(event => (
        <EventPromoCard key={event.id} event={event} />
      ))}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────
export const metadata = {
  title:       'Event & Promo',
  description: 'Temukan promo dan event terbaru untuk memaksimalkan persiapan SKD kamu.',
};

export default function EventsPromoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Megaphone size={22} className="text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900">Event &amp; Promo</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Dapatkan penawaran terbaik untuk persiapan SKD kamu. Jangan sampai kehabisan!
        </p>
      </div>

      {/* Grid */}
      <Suspense fallback={<EventsSkeleton />}>
        <EventsGrid />
      </Suspense>
    </div>
  );
}