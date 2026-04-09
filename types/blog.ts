// types/blog.ts

export type PostStatus = 'draft' | 'published'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  category: string
  tags: string[]
  author_name: string
  author_avatar: string | null
  status: PostStatus
  meta_title: string | null
  meta_description: string | null
  reading_time: number
  view_count: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PostFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category: string
  tags: string[]
  author_name: string
  status: PostStatus
  meta_title: string
  meta_description: string
  reading_time: number
}

export const BLOG_CATEGORIES = [
  'Tips CPNS',
  'TWK',
  'TIU',
  'TKP',
  'Strategi Belajar',
  'Info CPNS',
  'Passing Grade',
  'Review',
] as const