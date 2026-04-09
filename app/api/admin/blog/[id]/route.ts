// app/api/admin/blog/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth/check-admin'
import {
  getPostByIdAdmin,
  updatePost,
  deletePost,
  checkSlugExists,
} from '@/lib/supabase/blog-queries'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const post = await getPostByIdAdmin(params.id)
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('[BLOG POST ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Cek slug duplikat jika slug diubah
    if (body.slug) {
      const slugExists = await checkSlugExists(body.slug, params.id)
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const post = await updatePost(params.id, body)
    return NextResponse.json({ post })
  } catch (error) {
    console.error('[BLOG POST ERROR]', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await deletePost(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[BLOG POST ERROR]', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}