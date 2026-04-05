import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const allowedFields = [
      'full_name',
      'phone',
      'gender',
      'birth_date',
      'address',
      'province',
      'city',
      'district',
      'postal_code',
      'target_institution',
      'onboarding_completed',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field] ?? null;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });
    }

    // Validasi full_name
    if (updates.full_name !== undefined && updates.full_name !== null) {
      if (typeof updates.full_name !== 'string' || (updates.full_name as string).trim().length === 0) {
        return NextResponse.json({ error: 'Nama lengkap tidak boleh kosong' }, { status: 400 });
      }
      if ((updates.full_name as string).length > 100) {
        return NextResponse.json({ error: 'Nama lengkap maksimal 100 karakter' }, { status: 400 });
      }
      updates.full_name = (updates.full_name as string).trim();
    }

    // Validasi gender
    if (updates.gender && !['Pria', 'Wanita'].includes(updates.gender as string)) {
      return NextResponse.json({ error: 'Gender tidak valid' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}