import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

// Catat bahwa user membuka sebuah materi modul (untuk progres Roadmap).
// Upsert by (user_id, module_id) — aman dipanggil berulang. Non-fatal.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

    const { moduleId } = await req.json();
    if (!moduleId || typeof moduleId !== 'string') {
      return NextResponse.json({ ok: false, error: 'moduleId wajib' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('material_module_views')
      .upsert({ user_id: userId, module_id: moduleId }, { onConflict: 'user_id,module_id' });
    if (error) return NextResponse.json({ ok: false }, { status: 200 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
