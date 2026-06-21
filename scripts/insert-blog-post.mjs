// scripts/insert-blog-post.mjs
//
// Insert satu artikel blog ke tabel `posts` Supabase sebagai DRAFT.
// Dipakai oleh routine harian (auto-generate blog CPNS 2026).
//
// Jalankan:
//   node --env-file=.env.local scripts/insert-blog-post.mjs <path-ke-artikel.json>
//
// Format artikel.json (minimal):
//   {
//     "title": "Judul artikel",
//     "content": "Isi markdown...",
//     "excerpt": "Ringkasan singkat (opsional)",
//     "category": "Info CPNS",            // harus salah satu BLOG_CATEGORIES
//     "tags": ["cpns 2026", "skd"],       // opsional
//     "meta_title": "...",                // opsional
//     "meta_description": "...",          // opsional
//     "cover_image": "https://...",       // opsional
//     "author_name": "Tim PintuASN"       // opsional
//   }

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function markdownToHtml(md) {
  // Strip em dashes and en dashes
  let s = md.replace(/—/g, '-').replace(/–/g, '-')

  // Escape HTML special chars in code spans before other processing
  // Process GFM tables
  s = s.replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g, (table) => {
    const lines = table.trim().split('\n')
    const headers = lines[0].split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(h => `<th>${h.trim()}</th>`).join('')
    const rows = lines.slice(2).map(row => {
      const cells = row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('\n')
    return `<table>\n<thead><tr>${headers}</tr></thead>\n<tbody>${rows}</tbody>\n</table>\n`
  })

  // Headings
  s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Horizontal rule
  s = s.replace(/^---$/gm, '<hr>')

  // Blockquote
  s = s.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Inline code
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold + italic
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Unordered lists: collect consecutive `- ` lines
  s = s.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^- /, '').trim()}</li>`).join('\n')
    return `<ul>\n${items}\n</ul>\n`
  })

  // Split into blocks by blank lines, wrap non-tagged blocks in <p>
  const blocks = s.split(/\n{2,}/)
  s = blocks.map(block => {
    block = block.trim()
    if (!block) return ''
    if (/^<(h[1-6]|ul|ol|li|blockquote|hr|table|pre|div)/.test(block)) return block
    if (block === '<hr>') return block
    return `<p>${block.replace(/\n/g, ' ')}</p>`
  }).filter(Boolean).join('\n\n')

  return s
}

const VALID_CATEGORIES = [
  'Tips CPNS',
  'TWK',
  'TIU',
  'TKP',
  'Strategi Belajar',
  'Info CPNS',
  'Passing Grade',
  'Review',
]

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

function estimateReadingTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan. Jalankan dengan: node --env-file=.env.local ...')
    process.exit(1)
  }

  const jsonPath = process.argv[2]
  if (!jsonPath) {
    console.error('❌ Berikan path ke file JSON artikel. Contoh: node --env-file=.env.local scripts/insert-blog-post.mjs /tmp/artikel.json')
    process.exit(1)
  }

  let article
  try {
    article = JSON.parse(readFileSync(jsonPath, 'utf8'))
  } catch (err) {
    console.error('❌ Gagal membaca/parse JSON:', err.message)
    process.exit(1)
  }

  if (!article.title || !article.content) {
    console.error('❌ Field wajib: title dan content.')
    process.exit(1)
  }

  const category = VALID_CATEGORIES.includes(article.category) ? article.category : 'Info CPNS'

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Slug unik: kalau bentrok, tambahkan suffix tanggal/angka.
  let slug = generateSlug(article.title)
  const { data: existing } = await supabase.from('posts').select('slug').eq('slug', slug)
  if (existing && existing.length > 0) {
    slug = `${slug}-${new Date().toISOString().slice(0, 10)}`
    const { data: again } = await supabase.from('posts').select('slug').eq('slug', slug)
    if (again && again.length > 0) slug = `${slug}-${Date.now().toString().slice(-4)}`
  }

  const htmlContent = markdownToHtml(article.content)

  const row = {
    title: article.title,
    slug,
    excerpt: article.excerpt ?? null,
    content: htmlContent,
    cover_image: article.cover_image ?? null,
    category,
    tags: Array.isArray(article.tags) ? article.tags : [],
    author_name: article.author_name ?? 'Tim PintuASN',
    status: 'draft', // selalu draft — direview manual sebelum publish
    meta_title: article.meta_title ?? article.title,
    meta_description: article.meta_description ?? article.excerpt ?? null,
    reading_time: estimateReadingTime(article.content.replace(/<[^>]+>/g, '')),
    published_at: null,
  }

  const { data, error } = await supabase.from('posts').insert(row).select('id, slug, status').single()

  if (error) {
    console.error('❌ Gagal insert ke Supabase:', error.message)
    process.exit(1)
  }

  console.log(`✅ Draft dibuat: id=${data.id} slug=${data.slug} status=${data.status}`)
}

main()
