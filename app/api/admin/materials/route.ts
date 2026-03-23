import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ materials: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await auth();
    const body = await req.json();

    const { title, description, category, type, content_url, tier, duration_minutes, is_active, is_new, order_index } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 });
    if (!content_url?.trim()) return NextResponse.json({ error: 'URL konten wajib diisi' }, { status: 400 });
    if (!['TWK', 'TIU', 'TKP', 'INFORMASI'].includes(category)) {
      return NextResponse.json({ error: 'Kategori tidak valid' }, { status: 400 });
    }
    if (!['video', 'pdf'].includes(type)) {
      return NextResponse.json({ error: 'Tipe tidak valid' }, { status: 400 });
    }
    if (!['free', 'premium', 'platinum'].includes(tier)) {
      return NextResponse.json({ error: 'Tier tidak valid' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const { data: material, error } = await supabase
      .from('materials')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        category,
        type,
        content_url: content_url.trim(),
        tier,
        duration_minutes: duration_minutes || null,
        is_active: is_active ?? true,
        is_new: is_new ?? false,
        order_index: order_index ?? 0,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ material }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}