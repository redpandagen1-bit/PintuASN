// app/blog/[slug]/page.tsx

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getAllPublishedSlugs,
  getPostBySlug,
  getRelatedPosts,
  incrementViewCount,
} from '@/lib/supabase/blog-queries'
import type { Post } from '@/types/blog'

// Generate static params untuk semua published posts
export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Dynamic SEO metadata per artikel
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Artikel tidak ditemukan – PintuASN' }

  const title = post.meta_title ?? `${post.title} – PintuASN`
  const description =
    post.meta_description ?? post.excerpt ?? 'Baca artikel tips CPNS di PintuASN.'

  return {
    title,
    description,
    authors: [{ name: post.author_name }],
    openGraph: {
      title,
      description,
      url: `https://pintuasn.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.published_at ?? post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      images: post.cover_image
        ? [{ url: post.cover_image, width: 1200, height: 630 }]
        : [{ url: 'https://pintuasn.com/images/og-image.jpg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [post.cover_image ?? 'https://pintuasn.com/images/og-image.jpg'],
    },
    alternates: { canonical: `https://pintuasn.com/blog/${post.slug}` },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function RelatedCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="related-card">
      <div className="related-card__img">
        {post.cover_image ? (
          <Image src={post.cover_image} alt={post.title} fill className="related-card__image" />
        ) : (
          <div className="related-card__placeholder">📝</div>
        )}
      </div>
      <div className="related-card__body">
        <span className="related-card__cat">{post.category}</span>
        <h3 className="related-card__title">{post.title}</h3>
        <span className="related-card__read">{post.reading_time} menit baca</span>
      </div>
    </Link>
  )
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  // Increment view count (non-blocking)
  incrementViewCount(post.slug)

  const relatedPosts = await getRelatedPosts(post.category, post.slug)

  // JSON-LD Article schema untuk SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? '',
    image: post.cover_image ?? 'https://pintuasn.com/images/og-image.jpg',
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: post.author_name,
      url: 'https://pintuasn.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PintuASN',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pintuasn.com/images/Logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://pintuasn.com/blog/${post.slug}`,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://pintuasn.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://pintuasn.com/blog' },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://pintuasn.com/blog/${post.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        *{margin:0;padding:0;box-sizing:border-box}
        :root{
          --y:#0077B6;--yd:#005A8E;--yl:#EFF6FF;
          --s50:#f8fafc;--s100:#f1f5f9;--s200:#e2e8f0;
          --s400:#94a3b8;--s600:#475569;--s800:#1e293b;--s900:#0f172a;
          --font:'Plus Jakarta Sans',sans-serif;
          --font-serif:'Lora',serif;
        }
        body{font-family:var(--font);background:#fff;color:var(--s800);overflow-x:hidden}

        .art-nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--s100);padding:0 28px;height:64px;display:flex;align-items:center;justify-content:space-between}
        .art-nav__logo{font-size:18px;font-weight:800;color:var(--s900);text-decoration:none;display:flex;align-items:center;gap:8px}
        .art-nav__back{font-size:13px;font-weight:600;color:var(--s600);text-decoration:none;display:flex;align-items:center;gap:6px;transition:color .2s}
        .art-nav__back:hover{color:var(--y)}

        .breadcrumb{max-width:760px;margin:0 auto;padding:20px 28px 0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .breadcrumb a{font-size:13px;color:var(--s400);text-decoration:none;transition:color .2s}
        .breadcrumb a:hover{color:var(--y)}
        .breadcrumb span{font-size:13px;color:var(--s200)}
        .breadcrumb__current{font-size:13px;color:var(--s600);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

        .art-hero{max-width:760px;margin:0 auto;padding:32px 28px 40px}
        .art-hero__category{display:inline-flex;align-items:center;gap:6px;background:var(--yl);color:var(--yd);font-size:12px;font-weight:700;padding:4px 12px;border-radius:50px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:20px;text-decoration:none}
        .art-hero__title{font-family:var(--font-serif);font-size:clamp(26px,4vw,42px);font-weight:600;color:var(--s900);line-height:1.25;margin-bottom:20px;letter-spacing:-.3px}
        .art-hero__excerpt{font-size:18px;color:var(--s600);line-height:1.7;margin-bottom:28px;font-style:italic}
        .art-hero__meta{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:20px 0;border-top:1px solid var(--s100);border-bottom:1px solid var(--s100)}
        .art-hero__author{display:flex;align-items:center;gap:10px}
        .art-hero__avatar{width:40px;height:40px;border-radius:50%;background:var(--s800);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700}
        .art-hero__author-info{display:flex;flex-direction:column}
        .art-hero__author-name{font-size:14px;font-weight:700;color:var(--s900)}
        .art-hero__date{font-size:12px;color:var(--s400)}
        .art-hero__stats{display:flex;align-items:center;gap:12px;margin-left:auto}
        .art-hero__stat{font-size:12px;color:var(--s400);display:flex;align-items:center;gap:4px}

        .art-cover{max-width:900px;margin:0 auto 40px;padding:0 28px}
        .art-cover__img{position:relative;height:460px;border-radius:16px;overflow:hidden;background:var(--s50)}
        .art-cover__image{object-fit:cover}

        .art-layout{max-width:760px;margin:0 auto;padding:0 28px 80px;display:grid;grid-template-columns:1fr}
        .art-content{font-family:var(--font-serif);font-size:18px;line-height:1.85;color:var(--s800)}
        .art-content h2{font-family:var(--font);font-size:24px;font-weight:800;color:var(--s900);margin:40px 0 16px;letter-spacing:-.3px}
        .art-content h3{font-family:var(--font);font-size:20px;font-weight:700;color:var(--s900);margin:32px 0 12px}
        .art-content p{margin-bottom:24px}
        .art-content ul,.art-content ol{margin:0 0 24px 24px}
        .art-content li{margin-bottom:8px}
        .art-content strong{font-weight:700;color:var(--s900)}
        .art-content em{font-style:italic}
        .art-content blockquote{border-left:4px solid var(--y);padding:16px 20px;background:var(--yl);border-radius:0 8px 8px 0;margin:32px 0;font-style:italic;color:var(--yd)}
        .art-content a{color:var(--y);text-decoration:underline}
        .art-content img{width:100%;border-radius:12px;margin:24px 0}
        .art-content code{background:var(--s100);padding:2px 6px;border-radius:4px;font-size:14px;font-family:monospace}
        .art-content pre{background:var(--s800);color:#e2e8f0;padding:20px;border-radius:12px;overflow-x:auto;margin:24px 0}
        .art-content pre code{background:transparent;color:inherit;padding:0}
        .art-content hr{border:none;border-top:1px solid var(--s100);margin:40px 0}

        .art-tags{display:flex;flex-wrap:wrap;gap:8px;margin:40px 0 0;padding-top:32px;border-top:1px solid var(--s100)}
        .art-tag{padding:5px 14px;background:var(--s50);border:1px solid var(--s200);border-radius:50px;font-size:12px;font-weight:600;color:var(--s600);text-decoration:none;transition:all .2s}
        .art-tag:hover{background:var(--yl);color:var(--yd);border-color:rgba(0,119,182,.3)}

        .art-cta{background:var(--s800);border-radius:20px;padding:36px;text-align:center;margin:48px 0}
        .art-cta h3{font-size:20px;font-weight:800;color:#fff;margin-bottom:10px}
        .art-cta p{font-size:14px;color:rgba(255,255,255,.55);margin-bottom:24px;line-height:1.7}
        .art-cta a{display:inline-flex;align-items:center;gap:8px;background:var(--y);color:#fff;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;transition:all .2s}
        .art-cta a:hover{background:var(--yd)}

        .related{max-width:1180px;margin:0 auto;padding:0 28px 80px}
        .related__title{font-size:20px;font-weight:800;color:var(--s900);margin-bottom:24px;display:flex;align-items:center;gap:10px}
        .related__title::before{content:'';width:24px;height:3px;background:var(--y);border-radius:2px}
        .related__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .related-card{display:grid;grid-template-columns:100px 1fr;gap:12px;text-decoration:none;padding:16px;border:1px solid var(--s100);border-radius:12px;transition:all .2s}
        .related-card:hover{border-color:var(--y);background:var(--yl)}
        .related-card__img{position:relative;height:72px;border-radius:8px;overflow:hidden;background:var(--s50)}
        .related-card__image{object-fit:cover}
        .related-card__placeholder{height:100%;display:flex;align-items:center;justify-content:center;font-size:24px}
        .related-card__body{display:flex;flex-direction:column;gap:4px}
        .related-card__cat{font-size:10px;font-weight:700;color:var(--yd);text-transform:uppercase;letter-spacing:.5px}
        .related-card__title{font-size:13px;font-weight:700;color:var(--s900);line-height:1.4}
        .related-card__read{font-size:11px;color:var(--s400);margin-top:auto}

        .art-footer{background:var(--s50);border-top:1px solid var(--s100);padding:32px 28px;text-align:center}
        .art-footer p{font-size:13px;color:var(--s400)}
        .art-footer a{color:var(--y);text-decoration:none;font-weight:600}

        @media(max-width:768px){
          .art-nav{padding:0 16px}
          .breadcrumb{padding:16px 16px 0}
          .art-hero{padding:24px 16px 32px}
          .art-hero__title{font-size:clamp(22px,6vw,32px)}
          .art-hero__excerpt{font-size:16px}
          .art-cover{padding:0 16px}
          .art-cover__img{height:240px}
          .art-layout{padding:0 16px 60px}
          .art-content{font-size:16px}
          .art-content h2{font-size:20px}
          .related{padding:0 16px 60px}
          .related__grid{grid-template-columns:1fr}
          .art-hero__stats{margin-left:0}
        }
      `}</style>

      {/* NAV */}
      <nav className="art-nav">
        <a href="/" className="art-nav__logo">
          <Image src="/images/logo-navbar.svg" width={80} height={80} alt="PintuASN" />
        </a>
        <a href="/blog" className="art-nav__back">← Kembali ke Blog</a>
      </nav>

      {/* BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Beranda</a>
        <span>›</span>
        <a href="/blog">Blog</a>
        <span>›</span>
        <span className="breadcrumb__current">{post.title}</span>
      </nav>

      {/* ARTICLE HERO */}
      <header className="art-hero">
        <a href={`/blog?category=${encodeURIComponent(post.category)}`} className="art-hero__category">
          {post.category}
        </a>
        <h1 className="art-hero__title">{post.title}</h1>
        {post.excerpt && <p className="art-hero__excerpt">{post.excerpt}</p>}
        <div className="art-hero__meta">
          <div className="art-hero__author">
            <div className="art-hero__avatar">
              {post.author_name.charAt(0).toUpperCase()}
            </div>
            <div className="art-hero__author-info">
              <span className="art-hero__author-name">{post.author_name}</span>
              <span className="art-hero__date">
                {formatDate(post.published_at ?? post.created_at)}
              </span>
            </div>
          </div>
          <div className="art-hero__stats">
            <span className="art-hero__stat">📖 {post.reading_time} menit baca</span>
            <span className="art-hero__stat">👁 {post.view_count.toLocaleString('id-ID')} views</span>
          </div>
        </div>
      </header>

      {/* COVER IMAGE */}
      {post.cover_image && (
        <div className="art-cover">
          <div className="art-cover__img">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              className="art-cover__image"
              sizes="(max-width:768px) 100vw, 900px"
            />
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="art-layout">
        <article
          className="art-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* TAGS */}
        {post.tags && post.tags.length > 0 && (
          <div className="art-tags">
            {post.tags.map((tag) => (
              <a key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="art-tag">
                #{tag}
              </a>
            ))}
          </div>
        )}

        {/* CTA BOX */}
        <div className="art-cta">
          <h3>Siap Latihan SKD CPNS Sekarang?</h3>
          <p>
            Coba simulasi tryout gratis yang 99% mirip sistem BKN. Analitik mendalam,
            ranking nasional, dan roadmap belajar terstruktur.
          </p>
          <a href="/sign-up">🎯 Daftar Gratis Sekarang</a>
        </div>
      </div>

      {/* RELATED POSTS */}
      {relatedPosts.length > 0 && (
        <section className="related">
          <h2 className="related__title">Artikel Terkait</h2>
          <div className="related__grid">
            {relatedPosts.map((rp) => (
              <RelatedCard key={rp.id} post={rp} />
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="art-footer">
        <p>© 2026 <a href="/">PintuASN</a> · Platform Simulasi CAT SKD CPNS Terpercaya</p>
      </footer>
    </>
  )
}