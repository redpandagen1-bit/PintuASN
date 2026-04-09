// lib/supabase/blog-queries.ts

import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { Post, PostFormData } from '@/types/blog'

// ── PUBLIC QUERIES ──────────────────────────────────────────

export async function getPublishedPosts(options?: {
  category?: string
  limit?: number
  offset?: number
}): Promise<{ posts: Post[]; total: number }> {
  const supabase = await createClient()
  const limit = options?.limit ?? 9
  const offset = options?.offset ?? 0

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { posts: data ?? [], total: count ?? 0 }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) return null
  return data
}

export async function getRelatedPosts(category: string, excludeSlug: string): Promise<Post[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .limit(3)

  return data ?? []
}

export async function incrementViewCount(slug: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('increment_view_count', { post_slug: slug })
}

// Fungsi untuk generateStaticParams — pakai public client tanpa cookies
export async function getAllPublishedSlugs(): Promise<string[]> {
  const supabase = createPublicClient()

  const { data } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published')

  return data?.map((p: { slug: string }) => p.slug) ?? []
}

// ── ADMIN QUERIES ────────────────────────────────────────────

export async function getAllPostsAdmin(): Promise<Post[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createPost(formData: PostFormData): Promise<Post> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...formData,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePost(id: string, formData: Partial<PostFormData>): Promise<Post> {
  const supabase = await createClient()

  const updateData: any = { ...formData }
  if (formData.status === 'published') {
    const existing = await getPostByIdAdmin(id)
    if (!existing?.published_at) {
      updateData.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data } = await query
  return (data?.length ?? 0) > 0
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}