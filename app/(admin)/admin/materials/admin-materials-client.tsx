'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Search,
  Filter,
  Youtube,
  Clock,
  Tag,
  Crown,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: 'TWK' | 'TIU' | 'TKP' | 'INFORMASI';
  type: 'video' | 'pdf';
  content_url: string;
  tier: 'free' | 'premium' | 'platinum';
  duration_minutes: number | null;
  is_active: boolean;
  is_deleted: boolean;
  is_new: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

type FormData = Omit<Material, 'id' | 'is_deleted' | 'created_at' | 'updated_at'>;

const DEFAULT_FORM: FormData = {
  title: '',
  description: '',
  category: 'TWK',
  type: 'video',
  content_url: '',
  tier: 'free',
  duration_minutes: null,
  is_active: true,
  is_new: false,
  order_index: 0,
};

const CATEGORIES = [
  { value: 'TWK', label: 'Tes Wawasan Kebangsaan' },
  { value: 'TIU', label: 'Tes Intelegensia Umum' },
  { value: 'TKP', label: 'Tes Karakteristik Pribadi' },
  { value: 'INFORMASI', label: 'Informasi CPNS' },
];

const TIERS = [
  { value: 'free', label: 'Gratis', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'premium', label: 'Premium', color: 'bg-blue-100 text-blue-700' },
  { value: 'platinum', label: 'Platinum', color: 'bg-purple-100 text-purple-700' },
];

// ── HELPERS ────────────────────────────────────────────────────────────────

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    return null;
  } catch {
    return null;
  }
}

function getTierBadge(tier: string) {
  const map: Record<string, string> = {
    free: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    premium: 'bg-blue-100 text-blue-700 border-blue-200',
    platinum: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  const labels: Record<string, string> = { free: 'Gratis', premium: 'Premium', platinum: 'Platinum' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[tier] || map.free}`}>
      {labels[tier] || tier}
    </span>
  );
}

function getCategoryBadge(cat: string) {
  const map: Record<string, string> = {
    TWK: 'bg-blue-50 text-blue-700 border-blue-200',
    TIU: 'bg-green-50 text-green-700 border-green-200',
    TKP: 'bg-purple-50 text-purple-700 border-purple-200',
    INFORMASI: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[cat] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {cat}
    </span>
  );
}

// ── FORM MODAL ─────────────────────────────────────────────────────────────

function MaterialForm({
  initialData,
  onSubmit,
  onClose,
  isLoading,
}: {
  initialData: FormData;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<FormData>(initialData);
  const youtubeId = form.type === 'video' ? getYoutubeId(form.content_url) : null;

  const set = (field: keyof FormData, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Judul wajib diisi'); return; }
    if (!form.content_url.trim()) { toast.error('URL konten wajib diisi'); return; }
    if (form.type === 'video' && !getYoutubeId(form.content_url)) {
      toast.error('URL YouTube tidak valid'); return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData.title ? 'Edit Materi' : 'Tambah Materi Baru'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Judul */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Judul Materi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Contoh: Pancasila: Sejarah & Nilai-Nilai"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
            <textarea
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Deskripsi singkat isi materi ini..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none transition-all"
            />
          </div>

          {/* Kategori + Tier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white transition-all"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.value} — {c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tier Akses <span className="text-red-500">*</span>
              </label>
              <select
                value={form.tier}
                onChange={e => set('tier', e.target.value as FormData['tier'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white transition-all"
              >
                {TIERS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipe konten */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe Konten</label>
            <div className="flex gap-3">
              {(['video', 'pdf'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { set('type', t); set('content_url', ''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type === t
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {t === 'video' ? <Youtube size={16} /> : <BookOpen size={16} />}
                  {t === 'video' ? 'Video YouTube' : 'PDF / Link'}
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {form.type === 'video' ? 'URL YouTube' : 'URL Konten'} <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.content_url}
              onChange={e => set('content_url', e.target.value)}
              placeholder={
                form.type === 'video'
                  ? 'https://www.youtube.com/watch?v=... atau https://youtu.be/...'
                  : 'https://...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
            />
            {form.type === 'video' && form.content_url && !youtubeId && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                <AlertCircle size={12} /> URL YouTube tidak valid
              </p>
            )}
            {youtubeId && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <Check size={12} /> Video terdeteksi — ID: {youtubeId}
              </p>
            )}
          </div>

          {/* YouTube Preview */}
          {youtubeId && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preview Video</label>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Durasi */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Durasi (menit)
            </label>
            <input
              type="number"
              value={form.duration_minutes || ''}
              onChange={e => set('duration_minutes', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Contoh: 20"
              min={1}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
            />
          </div>

          {/* Status aktif */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">Status Aktif</p>
              <p className="text-xs text-slate-500 mt-0.5">Materi aktif akan tampil di halaman pengguna</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.is_active ? 'bg-slate-800' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.is_active ? 'translate-x-5.5 left-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Badge Baru */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">Badge "Baru"</p>
              <p className="text-xs text-slate-500 mt-0.5">Tampilkan label baru pada kartu materi ini</p>
            </div>
            <button
              type="button"
              onClick={() => set('is_new', !form.is_new)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.is_new ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.is_new ? 'translate-x-5.5 left-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Urutan tampil */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Urutan Tampil
            </label>
            <input
              type="number"
              value={form.order_index ?? 0}
              onChange={e => set('order_index', parseInt(e.target.value) || 0)}
              min={0}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Angka lebih kecil tampil lebih dulu. Default: 0</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Materi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DELETE CONFIRM ─────────────────────────────────────────────────────────

function DeleteConfirm({ title, onConfirm, onClose, isLoading }: {
  title: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-600" />
        </div>
        <h3 className="text-base font-bold text-slate-800 text-center mb-1">Hapus Materi?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          "<span className="font-semibold text-slate-700">{title}</span>" akan dihapus secara permanen.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
            {isLoading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN CLIENT ────────────────────────────────────────────────────────────

export default function AdminMaterialsClient({
  initialMaterials,
}: {
  initialMaterials: Material[];
}) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter
  const filtered = useMemo(() => {
    return materials.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || m.category === filterCat;
      const matchTier = filterTier === 'all' || m.tier === filterTier;
      return matchSearch && matchCat && matchTier;
    });
  }, [materials, search, filterCat, filterTier]);

  // Stats
  const stats = {
    total: materials.length,
    active: materials.filter(m => m.is_active).length,
    free: materials.filter(m => m.tier === 'free').length,
    premium: materials.filter(m => m.tier === 'premium').length,
    platinum: materials.filter(m => m.tier === 'platinum').length,
  };

  // CREATE
  const handleCreate = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan');
      const { material } = await res.json();
      setMaterials(prev => [material, ...prev]);
      setShowForm(false);
      toast.success('Materi berhasil ditambahkan!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATE
  const handleUpdate = async (data: FormData) => {
    if (!editTarget) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/materials/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal mengupdate');
      const { material } = await res.json();
      setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
      setEditTarget(null);
      toast.success('Materi berhasil diupdate!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // TOGGLE ACTIVE
  const handleToggleActive = async (m: Material) => {
    try {
      const res = await fetch(`/api/admin/materials/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !m.is_active }),
      });
      if (!res.ok) throw new Error('Gagal mengupdate status');
      const { material } = await res.json();
      setMaterials(prev => prev.map(x => x.id === material.id ? material : x));
      toast.success(`Materi ${material.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/materials/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      setMaterials(prev => prev.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Materi berhasil dihapus!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Materi</h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola konten video dan materi pembelajaran</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          <Plus size={16} />
          Tambah Materi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-800 text-white' },
          { label: 'Aktif', value: stats.active, color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
          { label: 'Gratis', value: stats.free, color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
          { label: 'Premium', value: stats.premium, color: 'bg-blue-50 text-blue-700 border border-blue-200' },
          { label: 'Platinum', value: stats.platinum, color: 'bg-purple-50 text-purple-700 border border-purple-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs font-semibold opacity-70 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul atau deskripsi..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="all">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
        </select>
        <select
          value={filterTier}
          onChange={e => setFilterTier(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="all">Semua Tier</option>
          {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <span className="flex items-center text-sm text-slate-500 px-1 whitespace-nowrap">
          {filtered.length} materi
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">Tidak ada materi ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba ubah filter atau tambah materi baru</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Materi</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tier</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(m => {
                  const ytId = m.type === 'video' ? getYoutubeId(m.content_url) : null;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      {/* Materi info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center">
                            {ytId ? (
                              <img
                                src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                alt={m.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Play size={16} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate max-w-[200px]">{m.title}</p>
                            {m.description && (
                              <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{m.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{getCategoryBadge(m.category)}</td>
                      <td className="px-4 py-4">{getTierBadge(m.tier)}</td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={12} />
                          {m.duration_minutes ? `${m.duration_minutes} mnt` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleActive(m)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                            m.is_active
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {m.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                          {m.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditTarget(m)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(m)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <MaterialForm
          initialData={DEFAULT_FORM}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isLoading={isLoading}
        />
      )}
      {editTarget && (
        <MaterialForm
          initialData={{
            title: editTarget.title,
            description: editTarget.description || '',
            category: editTarget.category,
            type: editTarget.type,
            content_url: editTarget.content_url,
            tier: editTarget.tier,
            duration_minutes: editTarget.duration_minutes,
            is_active: editTarget.is_active,
            is_new: editTarget.is_new,
            order_index: editTarget.order_index,
          }}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(null)}
          isLoading={isLoading}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}