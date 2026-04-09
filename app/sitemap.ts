// app/sitemap.ts
// Ganti file sitemap.ts yang sudah ada dengan ini

import { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/supabase/blog-queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts } = await getPublishedPosts({ limit: 1000 })

  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://pintuasn.com/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: 'https://pintuasn.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://pintuasn.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://pintuasn.com/sign-up',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://pintuasn.com/sign-in',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...blogUrls,
  ]
}