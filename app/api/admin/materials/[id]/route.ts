import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Hanya allow field yang valid
    const allowedFields = ['title', 'description', 'category', 'type', 'content_url', 'tier', 'duration_minutes', 'is_active', 'is_new', 'order_index'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });
    }

    // Validasi kalau ada
    if (updates.category && !['TWK', 'TIU', 'TKP', 'INFORMASI'].includes(updates.category as string)) {
      return NextResponse.json({ error: 'Kategori tidak valid' }, { status: 400 });
    }
    if (updates.tier && !['free', 'premium', 'platinum'].includes(updates.tier as string)) {
      return NextResponse.json({ error: 'Tier tidak valid' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const { data: material, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;
    if (!material) return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ material });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = await createAdminClient();

    // Soft delete
    const { error } = await supabase
      .from('materials')
      .update({ is_deleted: true, is_active: false })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}