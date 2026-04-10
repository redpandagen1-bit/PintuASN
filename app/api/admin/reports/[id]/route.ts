// app/api/admin/reports/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkIsAdmin } from '@/lib/auth/check-admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const body = await req.json()

    const { error } = await supabase
      .from('question_reports')
      .update({ status: body.status })
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[REPORT PATCH ERROR]', error)
    return NextResponse.json({ error: 'Gagal update laporan' }, { status: 500 })
  }
}