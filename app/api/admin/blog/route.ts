// app/api/admin/blog/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { checkIsAdmin } from '@/lib/auth/check-admin'
import { getAllPostsAdmin, createPost, checkSlugExists } from '@/lib/supabase/blog-queries'

// Segarkan daftar blog dan seluruh halaman artikel setelah perubahan konten,
// agar artikel yang baru dibuat/dipublish langsung tampil (bukan menunggu ISR
// atau rebuild). 'page' pada [slug] merevalidasi semua halaman artikel dinamis.
function revalidateBlog() {
  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
}

export async function GET() {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const posts = await getAllPostsAdmin()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('[BLOG POST ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Validasi field wajib
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { error: 'Title, slug, dan content wajib diisi' },
        { status: 400 }
      )
    }

    // Cek slug duplikat
    const slugExists = await checkSlugExists(body.slug)
    if (slugExists) {
      return NextResponse.json(
        { error: 'Slug sudah digunakan, gunakan slug lain' },
        { status: 400 }
      )
    }

    const post = await createPost(body)
    revalidateBlog()
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('[BLOG POST ERROR]', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}