// app/api/admin/reports/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkIsAdmin } from '@/lib/auth/check-admin'

// POST — user kirim laporan (tidak perlu admin)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const { error } = await supabase.from('question_reports').insert({
      question_id:       body.question_id,
      question_position: body.question_position,
      question_category: body.question_category,
      attempt_id:        body.attempt_id,
      package_title:     body.package_title,
      report_type:       body.report_type,
      note:              body.note ?? null,
      status:            'pending',
    })

    if (error) throw error
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[REPORT POST ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengirim laporan' }, { status: 500 })
  }
}

// GET — admin ambil semua laporan
export async function GET() {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('question_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ reports: data ?? [] })
  } catch (error) {
    console.error('[REPORT GET ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengambil laporan' }, { status: 500 })
  }
}