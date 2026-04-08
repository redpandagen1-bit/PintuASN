// ============================================================
// app/api/admin/events/route.ts  —  GET all | POST create
// ============================================================

import { createClient }   from '@/lib/supabase/server';
import { requireAdmin }   from '@/lib/auth/check-admin';
import { NextResponse }   from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { searchParams } = new URL(req.url);
    const includeInactive  = searchParams.get('all') === '1';

    let query = supabase.from('events').select('*').order('order_index').order('created_at', { ascending: false });
    if (!includeInactive) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const body     = await req.json() as Record<string, unknown>;

    // Validasi wajib
    if (!body.title || !body.banner_url)
      return NextResponse.json({ error: 'title dan banner_url wajib diisi' }, { status: 400 });

    const { data, error } = await supabase
      .from('events')
      .insert({
        title:        body.title,
        type:         body.type         ?? 'promo',
        banner_url:   body.banner_url,
        description:  body.description  ?? null,
        benefit:      body.benefit      ?? null,
        referral_code: body.referral_code ?? null,
        cta_label:    body.cta_label    ?? 'Klaim Sekarang',
        cta_link:     body.cta_link     ?? null,
        start_date:   body.start_date   ?? null,
        end_date:     body.end_date     ?? null,
        quota:        body.quota        ?? null,
        terms:        body.terms        ?? null,
        is_active:    body.is_active    ?? true,
        order_index:  body.order_index  ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}