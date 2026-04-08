'use client';

// ============================================================
// app/(admin)/admin/events/admin-events-client.tsx
// ============================================================

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Plus, Trash2, GripVertical, Upload, Save, X,
  ImageIcon, CalendarDays, Tag, Zap, Ticket,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Switch }   from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Event, EventDraft, EventType } from '@/types/events';

// ── constants ─────────────────────────────────────────────────
const BANNER_W = 1200;
const BANNER_H = 400;
const ASPECT   = BANNER_W / BANNER_H;

const TYPE_OPTS: { value: EventType; label: string; icon: React.ReactNode }[] = [
  { value: 'promo',      label: 'Promo',      icon: <Tag size={13} /> },
  { value: 'event',      label: 'Event',      icon: <CalendarDays size={13} /> },
  { value: 'flash_sale', label: 'Flash Sale', icon: <Zap size={13} /> },
  { value: 'diskon',     label: 'Diskon',     icon: <Ticket size={13} /> },
];

const TYPE_COLOR: Record<EventType, string> = {
  promo:      'bg-emerald-100 text-emerald-700',
  event:      'bg-blue-100 text-blue-700',
  flash_sale: 'bg-red-100 text-red-700',
  diskon:     'bg-orange-100 text-orange-700',
};

// ── helper ────────────────────────────────────────────────────
function toInputDate(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}
function fromInputDate(val: string): string | null {
  if (!val) return null;
  return new Date(val).toISOString();
}

// ── component ─────────────────────────────────────────────────
interface Props { initialEvents: Event[] }

export default function AdminEventsClient({ initialEvents }: Props) {
  const [events,    setEvents]    = useState<Event[]>(initialEvents);
  const [editing,   setEditing]   = useState<EventDraft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── helpers ─────────────────────────────────────────────────
  const blank = (): EventDraft => ({
    id:            '',
    title:         '',
    type:          'promo',
    banner_url:    '',
    description:   null,
    benefit:       null,
    referral_code: null,
    cta_label:     'Klaim Sekarang',
    cta_link:      '/beli-paket',
    start_date:    null,
    end_date:      null,
    quota:         null,
    terms:         null,
    is_active:     true,
    order_index:   events.length,
  });

  const openNew  = () => { setEditing(blank()); setPreview(null); setError(null); };
  const openEdit = (e: Event) => { setEditing({ ...e }); setPreview(e.banner_url); setError(null); };
  const reset    = () => { setEditing(null); setPreview(null); setError(null); };
  const patch    = (p: Partial<EventDraft>) => setEditing(prev => prev ? { ...prev, ...p } : prev);

  // ── file upload ─────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.src   = objectUrl;
    await new Promise<void>(r => { img.onload = () => r(); });
    const ratio = img.width / img.height;
    URL.revokeObjectURL(objectUrl);

    if (Math.abs(ratio - ASPECT) > 0.15) {
      setError(`Rasio gambar harus 3:1 (${BANNER_W}×${BANNER_H}px). Gambar kamu ${img.width}×${img.height}px.`);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res  = await fetch('/api/admin/upload/promo', { method: 'POST', body: fd }); // ← diubah ke /promo
      const json = await res.json() as { url?: string; error?: string };
      console.log('Upload response:', json); // ← tambahkan ini
      if (!res.ok) throw new Error(json.error ?? 'Upload gagal');
      patch({ banner_url: json.url ?? '' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload gagal'); }
    finally     { setUploading(false); }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = '';
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) void handleFile(f);
  };

  // ── save ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editing) return;
    if (!editing.banner_url)    { setError('Upload banner dulu.');  return; }
    if (!editing.title.trim())  { setError('Judul wajib diisi.');   return; }

    setSaving(true);
    try {
      const isNew = editing.id === '';
      const url   = isNew ? '/api/admin/events' : `/api/admin/events/${editing.id}`;
      const res   = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const json = await res.json() as Event & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan');

      setEvents(prev =>
        isNew ? [...prev, json] : prev.map(e => e.id === json.id ? json : e)
      );
      reset();
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menyimpan'); }
    finally     { setSaving(false); }
  };

  // ── toggle ──────────────────────────────────────────────────
  const handleToggle = async (ev: Event) => {
    const res = await fetch(`/api/admin/events/${ev.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !ev.is_active }),
    });
    if (res.ok) setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, is_active: !e.is_active } : e));
  };

  // ── delete ──────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus event/promo ini?')) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    if (res.ok) setEvents(prev => prev.filter(e => e.id !== id));
  };

  // ── render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Event &amp; Promo</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola semua konten promo dan event yang tampil di halaman pengguna.
          </p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Plus size={16} /> Tambah Event/Promo
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {events.length === 0 && (
          <p className="text-center text-slate-400 py-12">
            Belum ada event/promo. Klik &quot;Tambah Event/Promo&quot; untuk mulai.
          </p>
        )}

        {events.map(ev => (
          <Card key={ev.id} className="overflow-hidden">
            <CardContent className="p-0 flex items-stretch">
              <div className="flex items-center px-3 text-slate-300 cursor-grab">
                <GripVertical size={18} />
              </div>

              {/* Thumbnail */}
              <div className="relative w-40 h-[53px] shrink-0 bg-slate-100 border-r">
                {ev.banner_url ? (
                  <Image src={ev.banner_url} alt={ev.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 px-4 py-3 flex items-center gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 truncate">{ev.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[ev.type]}`}>
                      {ev.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                    {ev.benefit && <span className="text-emerald-600 font-semibold">{ev.benefit}</span>}
                    {ev.referral_code && <span>Kode: <strong className="font-mono">{ev.referral_code}</strong></span>}
                    {ev.end_date && (
                      <span>s.d. {new Date(ev.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    )}
                  </div>
                </div>
                <Badge variant={ev.is_active ? 'default' : 'secondary'}>
                  {ev.is_active ? 'Aktif' : 'Non-aktif'}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pr-4">
                <Switch checked={ev.is_active} onCheckedChange={() => void handleToggle(ev)} />
                <Button size="sm" variant="outline" onClick={() => openEdit(ev)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => void handleDelete(ev.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">
                {editing.id !== '' ? 'Edit Event/Promo' : 'Tambah Event/Promo Baru'}
              </h2>
              <button onClick={reset} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Banner upload */}
              <div>
                <Label className="mb-2 block">
                  Banner <span className="text-slate-400 font-normal">({BANNER_W}×{BANNER_H}px — rasio 3:1)</span>
                </Label>
                <div
                  className={[
                    'relative border-2 border-dashed rounded-xl overflow-hidden transition-colors cursor-pointer',
                    dragOver     ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400',
                    uploading    ? 'pointer-events-none opacity-60' : '',
                  ].join(' ')}
                  style={{ aspectRatio: `${BANNER_W} / ${BANNER_H}` }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  {(preview ?? editing.banner_url) ? (
                    <Image src={preview ?? editing.banner_url} alt="Preview" fill className="object-cover" />
                  ) : null}
                  <div className={[
                    'absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity',
                    (preview ?? editing.banner_url) ? 'bg-black/40 opacity-0 hover:opacity-100' : 'opacity-100',
                  ].join(' ')}>
                    <Upload size={28} className="text-white" />
                    <p className="text-white text-sm font-medium">
                      {uploading ? 'Mengupload...' : 'Klik atau drag gambar ke sini'}
                    </p>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileInput} />
              </div>

              {/* Title + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Judul</Label>
                  <Input value={editing.title} onChange={e => patch({ title: e.target.value })} placeholder="Promo Ramadan 2026" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipe</Label>
                  <Select value={editing.type} onValueChange={v => patch({ type: v as EventType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTS.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <span className="flex items-center gap-2">{t.icon}{t.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Benefit + Referral code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Benefit / Diskon <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                  <Input value={editing.benefit ?? ''} onChange={e => patch({ benefit: e.target.value || null })} placeholder="Diskon 30%" />
                </div>
                <div className="space-y-1.5">
                  <Label>Kode Promo / Referral <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                  <Input
                    value={editing.referral_code ?? ''}
                    onChange={e => patch({ referral_code: e.target.value.toUpperCase() || null })}
                    placeholder="SKDHEMAT30"
                    className="font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>Deskripsi <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                <Textarea
                  value={editing.description ?? ''}
                  onChange={e => patch({ description: e.target.value || null })}
                  placeholder="Tulis deskripsi singkat tentang promo/event ini..."
                  rows={3}
                />
              </div>

              {/* CTA label + link */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Label Tombol CTA</Label>
                  <Input value={editing.cta_label ?? ''} onChange={e => patch({ cta_label: e.target.value })} placeholder="Klaim Sekarang" />
                </div>
                <div className="space-y-1.5">
                  <Label>Link CTA <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                  <Input value={editing.cta_link ?? ''} onChange={e => patch({ cta_link: e.target.value || null })} placeholder="/beli-paket" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tanggal Mulai <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                  <Input
                    type="datetime-local"
                    value={toInputDate(editing.start_date)}
                    onChange={e => patch({ start_date: fromInputDate(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal Berakhir <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                  <Input
                    type="datetime-local"
                    value={toInputDate(editing.end_date)}
                    onChange={e => patch({ end_date: fromInputDate(e.target.value) })}
                  />
                </div>
              </div>

              {/* Quota */}
              <div className="space-y-1.5">
                <Label>Kuota <span className="text-slate-400 font-normal text-xs">(kosongkan = tidak terbatas)</span></Label>
                <Input
                  type="number"
                  min={1}
                  value={editing.quota ?? ''}
                  onChange={e => patch({ quota: e.target.value ? Number(e.target.value) : null })}
                  placeholder="100"
                  className="w-40"
                />
              </div>

              {/* Terms */}
              <div className="space-y-1.5">
                <Label>Syarat &amp; Ketentuan <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                <Textarea
                  value={editing.terms ?? ''}
                  onChange={e => patch({ terms: e.target.value || null })}
                  placeholder="1. Promo berlaku untuk pembelian pertama.&#10;2. Tidak dapat digabung dengan promo lain."
                  rows={3}
                />
              </div>

              {/* Order + Active */}
              <div className="flex items-center gap-6">
                <div className="space-y-1.5">
                  <Label>Urutan Tampil</Label>
                  <Input
                    type="number" min={0}
                    value={editing.order_index}
                    onChange={e => patch({ order_index: Number(e.target.value) })}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch
                    id="ev-active"
                    checked={editing.is_active}
                    onCheckedChange={v => patch({ is_active: v })}
                  />
                  <Label htmlFor="ev-active">Tampilkan di halaman pengguna</Label>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
              <Button variant="outline" onClick={reset}>Batal</Button>
              <Button onClick={() => void handleSave()} disabled={saving || uploading} className="flex items-center gap-2">
                <Save size={15} />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}