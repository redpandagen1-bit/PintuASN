'use client'
// app/(admin)/admin/blog/page.tsx
// Tambahkan route ini di admin panel

import { useEffect, useState } from 'react'
import type { Post } from '@/types/blog'

type Tab = 'list' | 'create' | 'edit'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

const CATEGORIES = ['Tips CPNS','TWK','TIU','TKP','Strategi Belajar','Info CPNS','Passing Grade','Review']
const EMPTY_FORM = {
  title:'', slug:'', excerpt:'', content:'', cover_image:'',
  category:'Tips CPNS', tags:[] as string[], author_name:'Tim PintuASN',
  status:'draft' as 'draft'|'published', meta_title:'', meta_description:'', reading_time:5
}

export default function AdminBlogPage() {
  const [tab, setTab] = useState<Tab>('list')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [tagInput, setTagInput] = useState('')
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string|null>(null)

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog')
      const data = await res.json()
      setPosts(data.posts ?? [])
    } catch { showToast('Gagal memuat artikel', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPosts() }, [])

  const handleTitleChange = (val: string) => {
    setForm(f => ({ ...f, title: val, slug: slugify(val), meta_title: val }))
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }))
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  const openCreate = () => {
    setForm({ ...EMPTY_FORM })
    setEditId(null)
    setTab('create')
  }

  const openEdit = async (post: Post) => {
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt ?? '',
      content: post.content, cover_image: post.cover_image ?? '',
      category: post.category, tags: post.tags, author_name: post.author_name,
      status: post.status, meta_title: post.meta_title ?? '',
      meta_description: post.meta_description ?? '', reading_time: post.reading_time,
    })
    setEditId(post.id)
    setTab('edit')
  }

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.content) {
      showToast('Title, slug, dan content wajib diisi', 'error')
      return
    }
    setSaving(true)
    try {
      const url = editId ? `/api/admin/blog/${editId}` : '/api/admin/blog'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(editId ? 'Artikel berhasil diupdate!' : 'Artikel berhasil dibuat!')
      fetchPosts()
      setTab('list')
    } catch (e: any) {
      showToast(e.message || 'Gagal menyimpan', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      showToast('Artikel dihapus')
      fetchPosts()
      setDeleteId(null)
    } catch { showToast('Gagal menghapus', 'error') }
  }

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",minHeight:'100vh',background:'#f8fafc'}}>

      {/* TOAST */}
      {toast && (
        <div style={{position:'fixed',top:20,right:20,zIndex:999,background:toast.type==='success'?'#1e293b':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,fontSize:14,fontWeight:600,boxShadow:'0 8px 24px rgba(0,0,0,0.15)'}}>
          {toast.type==='success'?'✓ ':'✗ '}{toast.msg}
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:998,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,padding:32,maxWidth:400,width:'90%',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:16}}>🗑️</div>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Hapus Artikel?</h3>
            <p style={{fontSize:14,color:'#64748b',marginBottom:24}}>Tindakan ini tidak bisa dibatalkan.</p>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setDeleteId(null)} style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',fontWeight:600}}>Batal</button>
              <button onClick={()=>handleDelete(deleteId)} style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#ef4444',color:'#fff',cursor:'pointer',fontWeight:600}}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'0 28px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <h1 style={{fontSize:18,fontWeight:800,color:'#0f172a'}}>📝 Kelola Blog</h1>
          <div style={{display:'flex',gap:4}}>
            {(['list','create'] as Tab[]).map(t => (
              <button key={t} onClick={()=>t==='create'?openCreate():setTab(t)}
                style={{padding:'6px 14px',borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,
                  background:tab===t||( t==='create'&&tab==='edit')?'#1e293b':'transparent',
                  color:tab===t||(t==='create'&&tab==='edit')?'#fff':'#64748b'}}>
                {t==='list'?'Semua Artikel':tab==='edit'?'Edit Artikel':'+ Buat Artikel'}
              </button>
            ))}
          </div>
        </div>
        <div style={{fontSize:13,color:'#94a3b8'}}>{posts.length} artikel · {posts.filter(p=>p.status==='published').length} published</div>
      </div>

      <div style={{maxWidth:1180,margin:'0 auto',padding:28}}>

        {/* LIST TAB */}
        {tab === 'list' && (
          <div>
            {/* STATS */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
              {[
                {label:'Total',val:posts.length,icon:'📄',color:'#1e293b'},
                {label:'Published',val:posts.filter(p=>p.status==='published').length,icon:'✅',color:'#16a34a'},
                {label:'Draft',val:posts.filter(p=>p.status==='draft').length,icon:'📋',color:'#f59e0b'},
                {label:'Total Views',val:posts.reduce((a,p)=>a+p.view_count,0).toLocaleString('id-ID'),icon:'👁',color:'#0077B6'},
              ].map(s=>(
                <div key={s.label} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'20px 16px'}}>
                  <div style={{fontSize:20,marginBottom:8}}>{s.icon}</div>
                  <div style={{fontSize:28,fontWeight:800,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:12,color:'#94a3b8',marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* SEARCH */}
            <div style={{marginBottom:16}}>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Cari judul atau kategori..."
                style={{width:'100%',padding:'10px 16px',borderRadius:10,border:'1px solid #e2e8f0',fontSize:14,outline:'none',background:'#fff'}} />
            </div>

            {/* TABLE */}
            <div style={{background:'#fff',borderRadius:14,border:'1px solid #e2e8f0',overflow:'hidden'}}>
              {loading ? (
                <div style={{padding:40,textAlign:'center',color:'#94a3b8'}}>Memuat artikel...</div>
              ) : filteredPosts.length === 0 ? (
                <div style={{padding:60,textAlign:'center',color:'#94a3b8'}}>
                  <div style={{fontSize:40,marginBottom:12}}>📭</div>
                  <div style={{fontWeight:600}}>Belum ada artikel</div>
                </div>
              ) : (
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#f8fafc',borderBottom:'1px solid #e2e8f0'}}>
                      {['Judul','Kategori','Status','Views','Tanggal','Aksi'].map(h=>(
                        <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post,i)=>(
                      <tr key={post.id} style={{borderBottom:i<filteredPosts.length-1?'1px solid #f1f5f9':'none'}}>
                        <td style={{padding:'14px 16px'}}>
                          <div style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:2}}>{post.title}</div>
                          <div style={{fontSize:11,color:'#94a3b8',fontFamily:'monospace'}}>/blog/{post.slug}</div>
                        </td>
                        <td style={{padding:'14px 16px'}}>
                          <span style={{background:'#f1f5f9',padding:'3px 10px',borderRadius:50,fontSize:12,fontWeight:600,color:'#475569'}}>{post.category}</span>
                        </td>
                        <td style={{padding:'14px 16px'}}>
                          <span style={{padding:'4px 10px',borderRadius:50,fontSize:12,fontWeight:700,
                            background:post.status==='published'?'#dcfce7':'#fef9c3',
                            color:post.status==='published'?'#16a34a':'#a16207'}}>
                            {post.status==='published'?'Published':'Draft'}
                          </span>
                        </td>
                        <td style={{padding:'14px 16px',fontSize:13,color:'#64748b'}}>{post.view_count.toLocaleString('id-ID')}</td>
                        <td style={{padding:'14px 16px',fontSize:12,color:'#94a3b8'}}>{formatDate(post.published_at??post.created_at)}</td>
                        <td style={{padding:'14px 16px'}}>
                          <div style={{display:'flex',gap:8}}>
                            <a href={`/blog/${post.slug}`} target="_blank"
                              style={{padding:'6px 12px',borderRadius:7,border:'1px solid #e2e8f0',background:'#fff',fontSize:12,fontWeight:600,color:'#475569',textDecoration:'none',cursor:'pointer'}}>
                              👁 Lihat
                            </a>
                            <button onClick={()=>openEdit(post)}
                              style={{padding:'6px 12px',borderRadius:7,border:'none',background:'#1e293b',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                              ✏️ Edit
                            </button>
                            <button onClick={()=>setDeleteId(post.id)}
                              style={{padding:'6px 12px',borderRadius:7,border:'none',background:'#fef2f2',color:'#ef4444',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CREATE / EDIT TAB */}
        {(tab === 'create' || tab === 'edit') && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:24,alignItems:'start'}}>

            {/* MAIN FORM */}
            <div style={{display:'flex',flexDirection:'column',gap:20}}>

              {/* TITLE */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:24}}>
                <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:8}}>Judul Artikel *</label>
                <input value={form.title} onChange={e=>handleTitleChange(e.target.value)}
                  placeholder="Cara Lolos SKD CPNS 2026 dengan Strategi yang Tepat"
                  style={{width:'100%',padding:'12px 16px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:16,fontWeight:600,outline:'none'}} />
                <div style={{marginTop:10}}>
                  <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>Slug (URL)</label>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:12,color:'#94a3b8'}}>pintuasn.com/blog/</span>
                    <input value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))}
                      style={{flex:1,padding:'8px 12px',borderRadius:6,border:'1px solid #e2e8f0',fontSize:13,fontFamily:'monospace',outline:'none'}} />
                  </div>
                </div>
              </div>

              {/* EXCERPT */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:24}}>
                <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:8}}>Ringkasan / Excerpt</label>
                <textarea value={form.excerpt} onChange={e=>setForm(f=>({...f,excerpt:e.target.value,meta_description:e.target.value}))}
                  placeholder="Ringkasan singkat artikel (akan muncul di list blog dan preview Google)"
                  rows={3}
                  style={{width:'100%',padding:'12px 16px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:14,outline:'none',resize:'vertical',lineHeight:1.6}} />
                <div style={{fontSize:11,color:'#94a3b8',marginTop:6}}>{form.excerpt.length}/160 karakter (ideal untuk SEO)</div>
              </div>

              {/* CONTENT */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:24}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px'}}>Konten Artikel * (HTML)</label>
                  <span style={{fontSize:11,color:'#94a3b8'}}>Gunakan tag HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;blockquote&gt;</span>
                </div>
                <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}
                  placeholder={'<h2>Pendahuluan</h2>\n<p>Isi artikel di sini...</p>\n<h2>Strategi Utama</h2>\n<p>Lanjutan artikel...</p>'}
                  rows={20}
                  style={{width:'100%',padding:'12px 16px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,fontFamily:'monospace',outline:'none',resize:'vertical',lineHeight:1.7}} />
              </div>

              {/* SEO */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:24}}>
                <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:16}}>🔍 SEO Settings</label>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:13,fontWeight:600,color:'#475569',display:'block',marginBottom:6}}>Meta Title</label>
                  <input value={form.meta_title} onChange={e=>setForm(f=>({...f,meta_title:e.target.value}))}
                    placeholder="Judul untuk Google (maks 60 karakter)"
                    style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:14,outline:'none'}} />
                  <div style={{fontSize:11,color:form.meta_title.length>60?'#ef4444':'#94a3b8',marginTop:4}}>{form.meta_title.length}/60</div>
                </div>
                <div>
                  <label style={{fontSize:13,fontWeight:600,color:'#475569',display:'block',marginBottom:6}}>Meta Description</label>
                  <textarea value={form.meta_description} onChange={e=>setForm(f=>({...f,meta_description:e.target.value}))}
                    placeholder="Deskripsi untuk Google (maks 160 karakter)"
                    rows={3}
                    style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:14,outline:'none',resize:'vertical'}} />
                  <div style={{fontSize:11,color:form.meta_description.length>160?'#ef4444':'#94a3b8',marginTop:4}}>{form.meta_description.length}/160</div>
                </div>
                {/* Google Preview */}
                <div style={{marginTop:16,padding:16,background:'#f8fafc',borderRadius:10,border:'1px solid #e2e8f0'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.5px'}}>Preview Google</div>
                  <div style={{fontSize:14,color:'#1a0dab',fontWeight:500}}>{form.meta_title || form.title || 'Judul Artikel'}</div>
                  <div style={{fontSize:12,color:'#006621',margin:'2px 0'}}>pintuasn.com › blog › {form.slug || 'slug-artikel'}</div>
                  <div style={{fontSize:13,color:'#4d5156'}}>{form.meta_description || form.excerpt || 'Deskripsi artikel akan muncul di sini...'}</div>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>

              {/* PUBLISH */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:12}}>Status Publikasi</label>
                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  {(['draft','published'] as const).map(s=>(
                    <button key={s} onClick={()=>setForm(f=>({...f,status:s}))}
                      style={{flex:1,padding:'8px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,
                        background:form.status===s?(s==='published'?'#dcfce7':'#fef9c3'):'#f1f5f9',
                        color:form.status===s?(s==='published'?'#16a34a':'#a16207'):'#64748b'}}>
                      {s==='published'?'✅ Published':'📋 Draft'}
                    </button>
                  ))}
                </div>
                <button onClick={handleSave} disabled={saving}
                  style={{width:'100%',padding:'12px',borderRadius:10,border:'none',background:saving?'#94a3b8':'#1e293b',color:'#fff',fontSize:14,fontWeight:700,cursor:saving?'not-allowed':'pointer',transition:'all .2s'}}>
                  {saving?'Menyimpan...':editId?'💾 Update Artikel':'🚀 Simpan Artikel'}
                </button>
                {editId && (
                  <button onClick={()=>{setTab('list');setEditId(null)}}
                    style={{width:'100%',marginTop:8,padding:'10px',borderRadius:10,border:'1px solid #e2e8f0',background:'transparent',color:'#64748b',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    Batal
                  </button>
                )}
              </div>

              {/* COVER IMAGE */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:10}}>Cover Image URL</label>
                <input value={form.cover_image} onChange={e=>setForm(f=>({...f,cover_image:e.target.value}))}
                  placeholder="https://..."
                  style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}} />
                {form.cover_image && (
                  <div style={{marginTop:10,borderRadius:8,overflow:'hidden',height:120,background:'#f1f5f9',position:'relative'}}>
                    <img src={form.cover_image} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                  </div>
                )}
              </div>

              {/* CATEGORY */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:10}}>Kategori</label>
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                  style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:14,outline:'none',background:'#fff'}}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>

              {/* TAGS */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:10}}>Tags</label>
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag()}}}
                    placeholder="Ketik + Enter"
                    style={{flex:1,padding:'8px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}} />
                  <button onClick={addTag} style={{padding:'8px 14px',borderRadius:8,border:'none',background:'#1e293b',color:'#fff',fontWeight:700,cursor:'pointer'}}>+</button>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {form.tags.map(tag=>(
                    <span key={tag} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',background:'#f1f5f9',borderRadius:50,fontSize:12,fontWeight:600,color:'#475569'}}>
                      #{tag}
                      <button onClick={()=>removeTag(tag)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:14,lineHeight:1,padding:0}}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* READING TIME & AUTHOR */}
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:10}}>Penulis & Waktu Baca</label>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:4}}>Nama Penulis</label>
                  <input value={form.author_name} onChange={e=>setForm(f=>({...f,author_name:e.target.value}))}
                    style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}} />
                </div>
                <div>
                  <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:4}}>Estimasi Baca (menit)</label>
                  <input type="number" value={form.reading_time} min={1} max={60}
                    onChange={e=>setForm(f=>({...f,reading_time:Number(e.target.value)}))}
                    style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}