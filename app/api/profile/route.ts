import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });

    const body = await req.json();

    const allowedFields = [
      'full_name', 'phone', 'gender', 'birth_date', 'address',
      'province', 'city', 'district', 'postal_code', 'target_institution',
      'onboarding_completed',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field] ?? null;
    }

    if (Object.keys(updates).length === 0)
      return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });

    if (updates.full_name !== undefined && updates.full_name !== null) {
      if (typeof updates.full_name !== 'string' || (updates.full_name as string).trim().length === 0)
        return NextResponse.json({ error: 'Nama lengkap tidak boleh kosong' }, { status: 400 });
      if ((updates.full_name as string).length > 100)
        return NextResponse.json({ error: 'Nama lengkap maksimal 100 karakter' }, { status: 400 });
      updates.full_name = (updates.full_name as string).trim();
    }

    if (updates.gender && !['male', 'female', 'other'].includes(updates.gender as string))
      return NextResponse.json({ error: 'Jenis kelamin tidak valid' }, { status: 400 });

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

    const supabase = await createClient();

    // Cek apakah row dengan user_id ini sudah ada
    const { data: existingByUserId } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingByUserId) {
      // Row sudah ada by user_id → langsung UPDATE
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[PATCH /api/profile] update error:', error);
        return NextResponse.json({ error: 'Gagal menyimpan profil. Silakan coba lagi.' }, { status: 500 });
      }
      return NextResponse.json({ profile });
    }

    // Row belum ada by user_id — cek apakah ada row dengan email yang sama
    // (bisa terjadi kalau webhook Clerk sudah insert row tapi user_id belum ter-set)
    if (email) {
      const { data: existingByEmail } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .maybeSingle();

      if (existingByEmail) {
        // Ada row dengan email ini tapi user_id berbeda → update row itu
        const { data: profile, error } = await supabase
          .from('profiles')
          .update({ user_id: userId, ...updates })
          .eq('email', email)
          .select()
          .single();

        if (error) {
          console.error('[PATCH /api/profile] update by email error:', error);
          return NextResponse.json({ error: 'Gagal menyimpan profil. Silakan coba lagi.' }, { status: 500 });
        }
        return NextResponse.json({ profile });
      }
    }

    // Tidak ada row sama sekali → INSERT baru
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({ user_id: userId, ...(email ? { email } : {}), ...updates })
      .select()
      .single();

    if (error) {
      console.error('[PATCH /api/profile] insert error:', error);
      return NextResponse.json({ error: 'Gagal menyimpan profil. Silakan coba lagi.' }, { status: 500 });
    }
    return NextResponse.json({ profile });

  } catch (err: any) {
    console.error('[PATCH /api/profile] unexpected error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan. Silakan coba lagi.' }, { status: 500 });
  }
}