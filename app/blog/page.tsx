// app/blog/page.tsx

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedPosts } from '@/lib/supabase/blog-queries'
import { BLOG_CATEGORIES } from '@/types/blog'
import type { Post } from '@/types/blog'

export const metadata: Metadata = {
  title: 'Blog Tips CPNS & SKD – PintuASN',
  description:
    'Kumpulan artikel tips lolos SKD CPNS, strategi mengerjakan TWK TIU TKP, info passing grade terbaru, dan panduan persiapan ujian CAT BKN.',
  openGraph: {
    title: 'Blog Tips CPNS & SKD – PintuASN',
    description:
      'Tips lolos SKD CPNS, strategi TWK TIU TKP, dan info CPNS terbaru dari PintuASN.',
    url: 'https://pintuasn.com/blog',
    type: 'website',
  },
  alternates: { canonical: 'https://pintuasn.com/blog' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function BlogCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`blog-card ${featured ? 'blog-card--featured' : ''}`}>
      <div className="blog-card__image-wrap">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="blog-card__image"
            sizes={featured ? '(max-width:768px) 100vw, 60vw' : '(max-width:768px) 100vw, 33vw'}
          />
        ) : (
          <div className="blog-card__placeholder">
            <span>📝</span>
          </div>
        )}
        <span className="blog-card__category">{post.category}</span>
      </div>
      <div className="blog-card__body">
        <h2 className="blog-card__title">{post.title}</h2>
        {post.excerpt && <p className="blog-card__excerpt">{post.excerpt}</p>}
        <div className="blog-card__meta">
          <span className="blog-card__author">{post.author_name}</span>
          <span className="blog-card__dot">·</span>
          <span className="blog-card__date">
            {formatDate(post.published_at ?? post.created_at)}
          </span>
          <span className="blog-card__dot">·</span>
          <span className="blog-card__read">{post.reading_time} menit baca</span>
        </div>
      </div>
    </Link>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const { category, page } = await searchParams

  const currentPage = Number(page ?? 1)
  const limit = 9
  const offset = (currentPage - 1) * limit

  const { posts, total } = await getPublishedPosts({
    category,
    limit,
    offset,
  })

  const totalPages = Math.ceil(total / limit)
  const featuredPost = posts[0]
  const restPosts = posts.slice(1)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *{margin:0;padding:0;box-sizing:border-box}
        :root{
          --y:#0077B6;--yd:#005A8E;--yl:#EFF6FF;
          --s50:#f8fafc;--s100:#f1f5f9;--s200:#e2e8f0;
          --s400:#94a3b8;--s600:#475569;--s800:#1e293b;--s900:#0f172a;
          --font:'Plus Jakarta Sans',sans-serif;
        }
        body{font-family:var(--font);background:#fff;color:var(--s800);overflow-x:hidden}

        /* NAV */
        .blog-nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--s100);padding:0 28px;height:64px;display:flex;align-items:center;justify-content:space-between}
        .blog-nav__logo{font-size:18px;font-weight:800;color:var(--s900);text-decoration:none;display:flex;align-items:center;gap:8px}
        .blog-nav__back{font-size:13px;font-weight:600;color:var(--s600);text-decoration:none;display:flex;align-items:center;gap:6px;transition:color .2s}
        .blog-nav__back:hover{color:var(--y)}

        /* HERO */
        .blog-hero{background:var(--s800);padding:64px 28px 48px;text-align:center;position:relative;overflow:hidden}
        .blog-hero::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(-45deg,rgba(0,119,182,.03) 0,rgba(0,119,182,.03) 1px,transparent 1px,transparent 8px)}
        .blog-hero__tag{display:inline-flex;align-items:center;gap:6px;background:rgba(0,119,182,.15);border:1px solid rgba(0,119,182,.3);border-radius:50px;padding:5px 14px;font-size:12px;font-weight:700;color:#60a5fa;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px}
        .blog-hero__title{font-size:clamp(28px,5vw,46px);font-weight:800;color:#fff;line-height:1.2;margin-bottom:14px;letter-spacing:-.5px}
        .blog-hero__sub{font-size:16px;color:rgba(255,255,255,.5);max-width:520px;margin:0 auto;line-height:1.7}

        /* CATEGORIES */
        .blog-cats{background:#fff;border-bottom:1px solid var(--s100);padding:0 28px;overflow-x:auto;scrollbar-width:none}
        .blog-cats::-webkit-scrollbar{display:none}
        .blog-cats__inner{max-width:1180px;margin:0 auto;display:flex;gap:4px;padding:12px 0}
        .blog-cat{padding:7px 16px;border-radius:50px;font-size:13px;font-weight:600;text-decoration:none;white-space:nowrap;transition:all .2s;color:var(--s600);background:transparent}
        .blog-cat:hover{background:var(--s50);color:var(--s900)}
        .blog-cat--active{background:var(--s800);color:#fff}

        /* MAIN */
        .blog-main{max-width:1180px;margin:0 auto;padding:48px 28px}

        /* FEATURED */
        .blog-featured{margin-bottom:56px}
        .blog-featured__label{font-size:11px;font-weight:700;color:var(--yd);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;display:flex;align-items:center;gap:8px}
        .blog-featured__label::before{content:'';width:24px;height:2px;background:var(--y);border-radius:2px}

        /* CARDS */
        .blog-card{display:block;text-decoration:none;border-radius:16px;overflow:hidden;border:1px solid var(--s100);background:#fff;transition:transform .3s,box-shadow .3s}
        .blog-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.08)}
        .blog-card--featured{display:grid;grid-template-columns:1fr 1fr;gap:0;border-radius:20px}
        .blog-card--featured .blog-card__image-wrap{height:360px}
        .blog-card--featured .blog-card__body{padding:40px 36px;display:flex;flex-direction:column;justify-content:center}
        .blog-card--featured .blog-card__title{font-size:clamp(20px,2.5vw,28px)}
        .blog-card--featured .blog-card__excerpt{display:block!important;font-size:15px;line-height:1.7;color:var(--s600);margin-bottom:20px}
        .blog-card__image-wrap{position:relative;height:220px;background:var(--s50)}
        .blog-card__image{object-fit:cover}
        .blog-card__placeholder{height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;background:var(--s50)}
        .blog-card__category{position:absolute;top:14px;left:14px;background:var(--y);color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:50px;text-transform:uppercase;letter-spacing:.5px}
        .blog-card__body{padding:20px}
        .blog-card__title{font-size:16px;font-weight:700;color:var(--s900);line-height:1.4;margin-bottom:8px}
        .blog-card__excerpt{display:none;font-size:13.5px;color:var(--s600);line-height:1.65;margin-bottom:12px}
        .blog-card__meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .blog-card__author{font-size:12px;font-weight:600;color:var(--s800)}
        .blog-card__dot{color:var(--s400);font-size:10px}
        .blog-card__date,.blog-card__read{font-size:12px;color:var(--s400)}

        /* GRID */
        .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .blog-grid__label{font-size:11px;font-weight:700;color:var(--yd);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:20px;display:flex;align-items:center;gap:8px;grid-column:1/-1}
        .blog-grid__label::before{content:'';width:24px;height:2px;background:var(--y);border-radius:2px}

        /* EMPTY */
        .blog-empty{text-align:center;padding:80px 20px;color:var(--s400)}
        .blog-empty__icon{font-size:48px;margin-bottom:16px}
        .blog-empty h3{font-size:18px;font-weight:700;color:var(--s800);margin-bottom:8px}

        /* PAGINATION */
        .blog-pagination{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:56px;padding-top:40px;border-top:1px solid var(--s100)}
        .blog-page-btn{padding:8px 16px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s;color:var(--s600);border:1px solid var(--s200)}
        .blog-page-btn:hover{background:var(--s50);color:var(--s900)}
        .blog-page-btn--active{background:var(--s800);color:#fff;border-color:var(--s800)}
        .blog-page-btn--disabled{opacity:.4;pointer-events:none}

        /* FOOTER */
        .blog-footer{background:var(--s50);border-top:1px solid var(--s100);padding:32px 28px;text-align:center}
        .blog-footer p{font-size:13px;color:var(--s400)}
        .blog-footer a{color:var(--y);text-decoration:none;font-weight:600}

        @media(max-width:768px){
          .blog-nav{padding:0 16px}
          .blog-hero{padding:48px 20px 36px}
          .blog-main{padding:32px 16px}
          .blog-card--featured{grid-template-columns:1fr}
          .blog-card--featured .blog-card__image-wrap{height:220px}
          .blog-card--featured .blog-card__body{padding:20px}
          .blog-grid{grid-template-columns:1fr}
          .blog-cats{padding:0 16px}
        }
        @media(min-width:769px) and (max-width:1024px){
          .blog-grid{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>

      {/* NAV */}
      <nav className="blog-nav">
        <a href="/" className="blog-nav__logo">
          <Image src="/images/logo-navbar.svg" width={80} height={80} alt="PintuASN" />
        </a>
        <a href="/" className="blog-nav__back">← Kembali ke Beranda</a>
      </nav>

      {/* HERO */}
      <div className="blog-hero">
        <div className="blog-hero__tag">📚 Blog PintuASN</div>
        <h1 className="blog-hero__title">Tips & Strategi Lolos SKD CPNS</h1>
        <p className="blog-hero__sub">
          Artikel terpilih dari tim PintuASN untuk bantu kamu lulus seleksi dengan strategi yang tepat.
        </p>
      </div>

      {/* CATEGORIES */}
      <div className="blog-cats">
        <div className="blog-cats__inner">
          <a
            href="/blog"
            className={`blog-cat ${!category ? 'blog-cat--active' : ''}`}
          >
            Semua
          </a>
          {BLOG_CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`/blog?category=${encodeURIComponent(cat)}`}
              className={`blog-cat ${category === cat ? 'blog-cat--active' : ''}`}
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main className="blog-main">
        {posts.length === 0 ? (
          <div className="blog-empty">
            <div className="blog-empty__icon">📭</div>
            <h3>Belum ada artikel</h3>
            <p>Artikel sedang disiapkan, pantau terus ya!</p>
          </div>
        ) : (
          <>
            {/* FEATURED */}
            {featuredPost && currentPage === 1 && !category && (
              <div className="blog-featured">
                <div className="blog-featured__label">Artikel Terbaru</div>
                <BlogCard post={featuredPost} featured />
              </div>
            )}

            {/* GRID */}
            {restPosts.length > 0 && (
              <div className="blog-grid">
                <div className="blog-grid__label">
                  {total} Artikel{category ? ` · ${category}` : ''}
                </div>
                {restPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="blog-pagination">
                <a
                  href={`/blog?page=${currentPage - 1}${category ? `&category=${category}` : ''}`}
                  className={`blog-page-btn ${currentPage === 1 ? 'blog-page-btn--disabled' : ''}`}
                >
                  ← Sebelumnya
                </a>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/blog?page=${p}${category ? `&category=${category}` : ''}`}
                    className={`blog-page-btn ${p === currentPage ? 'blog-page-btn--active' : ''}`}
                  >
                    {p}
                  </a>
                ))}
                <a
                  href={`/blog?page=${currentPage + 1}${category ? `&category=${category}` : ''}`}
                  className={`blog-page-btn ${currentPage === totalPages ? 'blog-page-btn--disabled' : ''}`}
                >
                  Berikutnya →
                </a>
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="blog-footer">
        <p>© 2026 <a href="/">PintuASN</a> · Platform Simulasi CAT SKD CPNS Terpercaya</p>
      </footer>
    </>
  )
}