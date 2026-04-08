'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Plus, Trash2, GripVertical,
  Upload, Link as LinkIcon, Save, X, ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ── constants ─────────────────────────────────────────────────
const BANNER_WIDTH  = 1200;
const BANNER_HEIGHT = 400;
const ASPECT_RATIO  = BANNER_WIDTH / BANNER_HEIGHT; // 3:1

// ── types ─────────────────────────────────────────────────────
interface Banner {
  id: string;
  title: string;
  image_url: string;
  button_link: string;
  is_active: boolean;
  order_index: number;
}

// Draft saat create baru — id boleh kosong
interface BannerDraft {
  id: string;
  title: string;
  image_url: string;
  button_link: string;
  is_active: boolean;
  order_index: number;
}

interface Props {
  initialBanners: Banner[];
}

export default function AdminBannersClient({ initialBanners }: Props) {
  const [banners,   setBanners]   = useState<Banner[]>(initialBanners);
  const [editing,   setEditing]   = useState<BannerDraft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── helpers ──────────────────────────────────────────────────
  const openNew = () => {
    setEditing({
      id: '',
      title: '',
      image_url: '',
      button_link: '/daftar-tryout',
      is_active: true,
      order_index: banners.length,
    });
    setPreview(null);
    setError(null);
  };

  const openEdit = (banner: Banner) => {
    setEditing({ ...banner });
    setPreview(banner.image_url);
    setError(null);
  };

  const resetEdit = () => {
    setEditing(null);
    setPreview(null);
    setError(null);
  };

  const updateEditing = (patch: Partial<BannerDraft>) => {
    setEditing(prev => (prev ? { ...prev, ...patch } : prev));
  };

  // ── file upload ──────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG / PNG / WebP).');
      return;
    }

    // Validasi rasio aspek
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = objectUrl;
    await new Promise<void>(resolve => { img.onload = () => resolve(); });
    const ratio = img.width / img.height;
    URL.revokeObjectURL(objectUrl);

    if (Math.abs(ratio - ASPECT_RATIO) > 0.15) {
      setError(
        `Rasio gambar harus 3:1 (${BANNER_WIDTH}×${BANNER_HEIGHT}px). ` +
        `Gambar kamu ${img.width}×${img.height}px.`
      );
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/admin/upload/banner', { method: 'POST', body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Upload gagal');
      updateEditing({ image_url: json.url ?? '' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) void handleFile(f);
  };

  // ── save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editing) return;
    if (!editing.image_url) { setError('Upload gambar dulu.'); return; }
    if (!editing.title.trim()) { setError('Judul banner wajib diisi.'); return; }

    setSaving(true);
    try {
      const isNew = editing.id === '';
      const url   = isNew ? '/api/admin/banners' : `/api/admin/banners/${editing.id}`;
      const res   = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const json = await res.json() as Banner & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan');

      setBanners(prev =>
        isNew
          ? [...prev, json]
          : prev.map(b => (b.id === json.id ? json : b))
      );
      resetEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  // ── toggle active ─────────────────────────────────────────────
  const handleToggle = async (banner: Banner) => {
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    if (res.ok) {
      setBanners(prev =>
        prev.map(b => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
      );
    }
  };

  // ── delete ────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    if (res.ok) setBanners(prev => prev.filter(b => b.id !== id));
  };

  // ── render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Banner</h1>
          <p className="text-slate-500 text-sm mt-1">
            Ukuran wajib:{' '}
            <span className="font-semibold text-slate-700">
              {BANNER_WIDTH} × {BANNER_HEIGHT} px
            </span>{' '}
            (rasio 3:1)
          </p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Plus size={16} /> Tambah Banner
        </Button>
      </div>

      {/* Info box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 flex items-start gap-3">
          <ImageIcon size={20} className="text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold">Panduan Ukuran Gambar Banner</p>
            <p>
              Upload gambar dengan ukuran{' '}
              <strong>{BANNER_WIDTH} × {BANNER_HEIGHT} px</strong> (rasio 3:1).
              Format: JPG, PNG, WebP. Gambar dengan rasio yang tidak sesuai akan ditolak.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Banner list */}
      <div className="space-y-3">
        {banners.length === 0 && (
          <p className="text-center text-slate-400 py-12">
            Belum ada banner. Klik &quot;Tambah Banner&quot; untuk memulai.
          </p>
        )}

        {banners.map(banner => (
          <Card key={banner.id} className="overflow-hidden">
            <CardContent className="p-0 flex items-stretch">
              {/* Drag handle */}
              <div className="flex items-center px-3 text-slate-300 cursor-grab">
                <GripVertical size={18} />
              </div>

              {/* Preview thumbnail */}
              <div className="relative w-40 h-[53px] shrink-0 bg-slate-100 border-r">
                {banner.image_url ? (
                  <Image
                    src={banner.image_url}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 px-4 py-3 flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{banner.title}</p>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                    <LinkIcon size={11} /> {banner.button_link}
                  </p>
                </div>
                <Badge variant={banner.is_active ? 'default' : 'secondary'} className="shrink-0">
                  {banner.is_active ? 'Aktif' : 'Non-aktif'}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pr-4">
                <Switch
                  checked={banner.is_active}
                  onCheckedChange={() => void handleToggle(banner)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(banner)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void handleDelete(banner.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal edit / create */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">
                {editing.id !== '' ? 'Edit Banner' : 'Tambah Banner Baru'}
              </h2>
              <button onClick={resetEdit} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Upload zone */}
              <div>
                <Label className="mb-2 block">
                  Gambar Banner{' '}
                  <span className="text-slate-400 font-normal">
                    ({BANNER_WIDTH}×{BANNER_HEIGHT}px)
                  </span>
                </Label>

                <div
                  className={[
                    'relative border-2 border-dashed rounded-xl overflow-hidden transition-colors',
                    dragOver
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400',
                    uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer',
                  ].join(' ')}
                  style={{ aspectRatio: `${BANNER_WIDTH} / ${BANNER_HEIGHT}` }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  {(preview ?? editing.image_url) ? (
                    <Image
                      src={preview ?? editing.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : null}

                  <div
                    className={[
                      'absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity',
                      (preview ?? editing.image_url)
                        ? 'bg-black/40 opacity-0 hover:opacity-100'
                        : 'opacity-100',
                    ].join(' ')}
                  >
                    <Upload size={28} className="text-white" />
                    <p className="text-white text-sm font-medium">
                      {uploading ? 'Mengupload...' : 'Klik atau drag gambar ke sini'}
                    </p>
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onFileInput}
                />
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="banner-title">Judul Banner</Label>
                  <Input
                    id="banner-title"
                    value={editing.title}
                    onChange={e => updateEditing({ title: e.target.value })}
                    placeholder="contoh: Promo Ramadan 2026"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="banner-link">Link Tombol</Label>
                  <Input
                    id="banner-link"
                    value={editing.button_link}
                    onChange={e => updateEditing({ button_link: e.target.value })}
                    placeholder="/daftar-tryout"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="banner-active"
                  checked={editing.is_active}
                  onCheckedChange={v => updateEditing({ is_active: v })}
                />
                <Label htmlFor="banner-active">Tampilkan banner ini di dashboard</Label>
              </div>

              {error !== null && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
              <Button variant="outline" onClick={resetEdit}>
                Batal
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={saving || uploading}
                className="flex items-center gap-2"
              >
                <Save size={15} />
                {saving ? 'Menyimpan...' : 'Simpan Banner'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}