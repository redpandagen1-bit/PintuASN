'use client'
// app/(admin)/admin/masukan/page.tsx

import { useEffect, useState } from 'react'
import { Flag, CheckCircle2, XCircle, Clock, RefreshCw, ExternalLink } from 'lucide-react'

type ReportStatus = 'pending' | 'resolved' | 'dismissed'

interface Report {
  id: string
  question_id: string
  question_position: number
  question_category: string
  attempt_id: string
  package_title: string
  report_type: string
  note: string | null
  status: ReportStatus
  created_at: string
}

const REPORT_TYPE_LABEL: Record<string, string> = {
  soal_salah:       '❌ Soal salah / typo',
  jawaban_salah:    '🔑 Kunci jawaban salah',
  pembahasan_salah: '📖 Pembahasan keliru',
  gambar_rusak:     '🖼️ Gambar tidak muncul',
  lainnya:          '💬 Lainnya',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminMasukanPage() {
  const [reports, setReports]   = useState<Report[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<ReportStatus | 'semua'>('semua')
  const [toast, setToast]       = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/reports')
      const data = await res.json()
      setReports(data.reports ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReports() }, [])

  const updateStatus = async (id: string, status: ReportStatus) => {
    setUpdating(id)
    try {
      await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      showToast(status === 'resolved' ? 'Ditandai selesai' : 'Diabaikan')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'semua' ? reports : reports.filter(r => r.status === filter)

  const counts = {
    semua:     reports.length,
    pending:   reports.filter(r => r.status === 'pending').length,
    resolved:  reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: '100vh', background: '#f8fafc' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flag size={18} color="#ef4444" />
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Masukan Soal</h1>
          {counts.pending > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50 }}>
              {counts.pending} baru
            </span>
          )}
        </div>
        <button onClick={fetchReports} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 28 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { key: 'semua',     label: 'Total Laporan', icon: '📋', color: '#1e293b' },
            { key: 'pending',   label: 'Menunggu',      icon: '🕐', color: '#f59e0b' },
            { key: 'resolved',  label: 'Selesai',       icon: '✅', color: '#16a34a' },
            { key: 'dismissed', label: 'Diabaikan',     icon: '🚫', color: '#94a3b8' },
          ].map(s => (
            <div key={s.key} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 14px', cursor: 'pointer', outline: filter === s.key ? `2px solid ${s.color}` : 'none' }}
              onClick={() => setFilter(s.key as any)}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{counts[s.key as keyof typeof counts]}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {(['semua', 'pending', 'resolved', 'dismissed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                background: filter === f ? '#1e293b' : '#f1f5f9',
                color: filter === f ? '#fff' : '#64748b' }}>
              {f === 'semua' ? 'Semua' : f === 'pending' ? 'Menunggu' : f === 'resolved' ? 'Selesai' : 'Diabaikan'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Memuat laporan...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Tidak ada laporan</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Soal', 'Paket', 'Jenis Masalah', 'Catatan', 'Waktu', 'Status', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    {/* Soal */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: r.question_category === 'TWK' ? '#dbeafe' : r.question_category === 'TIU' ? '#dcfce7' : '#f3e8ff',
                          color: r.question_category === 'TWK' ? '#1d4ed8' : r.question_category === 'TIU' ? '#16a34a' : '#7c3aed' }}>
                          {r.question_category}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>No. {r.question_position}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>{r.question_id.slice(0, 8)}...</div>
                    </td>
                    {/* Paket */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{r.package_title || '-'}</span>
                    </td>
                    {/* Jenis */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                        {REPORT_TYPE_LABEL[r.report_type] ?? r.report_type}
                      </span>
                    </td>
                    {/* Catatan */}
                    <td style={{ padding: '12px 14px', maxWidth: 200 }}>
                      <p style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.note || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>tidak ada catatan</span>}
                      </p>
                    </td>
                    {/* Waktu */}
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {formatDate(r.created_at)}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                        background: r.status === 'pending' ? '#fef9c3' : r.status === 'resolved' ? '#dcfce7' : '#f1f5f9',
                        color: r.status === 'pending' ? '#a16207' : r.status === 'resolved' ? '#16a34a' : '#94a3b8' }}>
                        {r.status === 'pending' ? '🕐 Menunggu' : r.status === 'resolved' ? '✅ Selesai' : '🚫 Diabaikan'}
                      </span>
                    </td>
                    {/* Aksi */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {r.status !== 'resolved' && (
                          <button onClick={() => updateStatus(r.id, 'resolved')} disabled={updating === r.id}
                            style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={11} /> Selesai
                          </button>
                        )}
                        {r.status !== 'dismissed' && (
                          <button onClick={() => updateStatus(r.id, 'dismissed')} disabled={updating === r.id}
                            style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: '#f1f5f9', color: '#94a3b8', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={11} /> Abaikan
                          </button>
                        )}
                        {r.status !== 'pending' && (
                          <button onClick={() => updateStatus(r.id, 'pending')} disabled={updating === r.id}
                            style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} /> Pending
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}