'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  ImageIcon, Link2, Link2Off, Upload, X, Save,
  Ticket, Plus, Trash2, Copy, Check, RefreshCw,
  ChevronDown, ChevronUp, Eye, EyeOff, Info,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Switch }   from '@/components/ui/switch';
import { Badge }    from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ── constants ────────────────────────────────────────────────
const BANNER_WIDTH  = 1200;
const BANNER_HEIGHT = 400;
const ASPECT_RATIO  = BANNER_WIDTH / BANNER_HEIGHT;

// ── types ────────────────────────────────────────────────────
interface Banner {
  id: string;
  title: string;
  image_url: string;
  button_link: string;
  is_active: boolean;
  order_index: number;
}

interface ReferralCode {
  id: string;
  name: string | null;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expired_at: string | null;
  created_at: string;
}

interface Props {
  initialBanners:   Banner[];
  initialReferrals: ReferralCode[];
}

// ── helpers ──────────────────────────────────────────────────
function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── component ────────────────────────────────────────────────
export default function UserInfoClient({ initialBanners, initialReferrals }: Props) {
  // ── banner state ──────────────────────────────────────────
  const [banners,       setBanners]       = useState<Banner[]>(initialBanners);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [savingBanner,  setSavingBanner]  = useState(false);
  const [dragOver,      setDragOver]      = useState(false);
  const [bannerError,   setBannerError]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── referral state ────────────────────────────────────────
  const [referrals,    setReferrals]    = useState<ReferralCode[]>(initialReferrals);
  const [showForm,     setShowForm]     = useState(false);
  const [savingRef,    setSavingRef]    = useState(false);
  const [refError,     setRefError]     = useState<string | null>(null);
  const [copied,       setCopied]       = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: string;
    max_uses: string;
    is_active: boolean;
    expired_at: string;
  }>({
    name: '', code: generateCode(), discount_type: 'percent',
    discount_value: '10', max_uses: '', is_active: true, expired_at: '',
  });

  // ── banner handlers ───────────────────────────────────────
  const openEditBanner = (b: Banner) => {
    setEditingBanner({ ...b });
    setBannerPreview(b.image_url);
    setBannerError(null);
  };

  const resetBannerEdit = () => {
    setEditingBanner(null);
    setBannerPreview(null);
    setBannerError(null);
  };

  const updateBanner = (patch: Partial<Banner>) =>
    setEditingBanner(prev => (prev ? { ...prev, ...patch } : prev));

  const handleBannerFile = async (file: File) => {
    setBannerError(null);
    if (!file.type.startsWith('image/')) {
      setBannerError('File harus berupa gambar (JPG / PNG / WebP).'); return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = objectUrl;
    await new Promise<void>(r => { img.onload = () => r(); });
    const ratio = img.width / img.height;
    URL.revokeObjectURL(objectUrl);
    if (Math.abs(ratio - ASPECT_RATIO) > 0.15) {
      setBannerError(`Rasio harus 3:1 (${BANNER_WIDTH}×${BANNER_HEIGHT}px). Gambar: ${img.width}×${img.height}px.`);
      return;
    }
    setBannerPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/admin/upload/banner', { method: 'POST', body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Upload gagal');
      updateBanner({ image_url: json.url ?? '' });
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const saveBanner = async () => {
    if (!editingBanner) return;
    if (!editingBanner.image_url) { setBannerError('Upload gambar dulu.'); return; }
    if (!editingBanner.title.trim()) { setBannerError('Judul wajib diisi.'); return; }
    setSavingBanner(true);
    try {
      const res  = await fetch(`/api/admin/banners/${editingBanner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner),
      });
      const json = await res.json() as Banner & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan');
      setBanners(prev => prev.map(b => (b.id === json.id ? json : b)));
      resetBannerEdit();
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setSavingBanner(false);
    }
  };

  const toggleBannerActive = async (b: Banner) => {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !b.is_active }),
    });
    if (res.ok) setBanners(prev => prev.map(x => (x.id === b.id ? { ...x, is_active: !x.is_active } : x)));
  };

  // ── referral handlers ─────────────────────────────────────
  const copyCode = (code: string) => {
    void navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveReferral = async () => {
    setRefError(null);
    if (!draft.code.trim()) { setRefError('Kode tidak boleh kosong.'); return; }
    const val = Number(draft.discount_value);
    if (!val || val <= 0) { setRefError('Nilai diskon harus lebih dari 0.'); return; }
    if (draft.discount_type === 'percent' && val > 100) {
      setRefError('Diskon persen maksimal 100%.'); return;
    }
    setSavingRef(true);
    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:           draft.name.trim() || null,
          code:           draft.code.trim().toUpperCase(),
          discount_type:  draft.discount_type,
          discount_value: val,
          max_uses:       draft.max_uses ? Number(draft.max_uses) : null,
          is_active:      draft.is_active,
          expired_at:     draft.expired_at || null,
        }),
      });
      const json = await res.json() as ReferralCode & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Gagal membuat kode');
      setReferrals(prev => [json, ...prev]);
      setShowForm(false);
      setDraft({
        name: '', code: generateCode(), discount_type: 'percent',
        discount_value: '10', max_uses: '', is_active: true, expired_at: '',
      });
    } catch (e) {
      setRefError(e instanceof Error ? e.message : 'Gagal membuat kode');
    } finally {
      setSavingRef(false);
    }
  };

  const toggleReferralActive = async (r: ReferralCode) => {
    const res = await fetch(`/api/admin/referrals/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !r.is_active }),
    });
    if (res.ok) setReferrals(prev => prev.map(x => (x.id === r.id ? { ...x, is_active: !x.is_active } : x)));
  };

  const deleteReferral = async (id: string) => {
    if (!confirm('Hapus kode referral ini?')) return;
    const res = await fetch(`/api/admin/referrals/${id}`, { method: 'DELETE' });
    if (res.ok) setReferrals(prev => prev.filter(r => r.id !== id));
  };

  // ── render ────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Platform</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola banner dashboard dan kode referral.</p>
      </div>

      {/* ══════════════ SECTION: BANNER ══════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <ImageIcon size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Banner Dashboard</h2>
            <p className="text-xs text-slate-500">Ganti gambar, atur link, atau nonaktifkan banner.</p>
          </div>
        </div>

        {/* Spesifikasi format */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-start gap-3">
            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700 space-y-0.5">
              <p className="font-semibold">Spesifikasi Gambar Banner</p>
              <p>Ukuran: <strong>1200 × 400 px</strong> &nbsp;|&nbsp; Rasio: <strong>3:1</strong> &nbsp;|&nbsp; Format: JPG, PNG, WebP &nbsp;|&nbsp; Maks: <strong>5 MB</strong></p>
              <p className="text-blue-600">Gambar dengan rasio berbeda akan ditolak otomatis saat upload.</p>
            </div>
          </CardContent>
        </Card>

        {/* Banner list */}
        <div className="space-y-3">
          {banners.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">Belum ada banner.</p>
          )}
          {banners.map(banner => (
            <Card key={banner.id} className="overflow-hidden border border-slate-200">
              <CardContent className="p-0 flex items-stretch">
                {/* Thumbnail */}
                <div className="relative w-44 h-[58px] shrink-0 bg-slate-100 border-r">
                  {banner.image_url
                    ? <Image src={banner.image_url} alt={banner.title} fill className="object-cover" />
                    : <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon size={20} /></div>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 px-4 py-3 flex items-center gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-800 truncate">{banner.title}</p>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      {banner.button_link
                        ? <><Link2 size={10} />{banner.button_link}</>
                        : <><Link2Off size={10} className="text-red-400" /><span className="text-red-400">Tidak dapat diklik</span></>
                      }
                    </p>
                  </div>
                  <Badge variant={banner.is_active ? 'default' : 'secondary'} className="shrink-0 text-xs">
                    {banner.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 pr-4">
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={() => void toggleBannerActive(banner)}
                  />
                  <Button size="sm" variant="outline" onClick={() => openEditBanner(banner)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ══════════════ SECTION: REFERRAL ══════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Ticket size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Kode Referral</h2>
              <p className="text-xs text-slate-500">Generate, nonaktifkan, atau hapus kode. Kode tidak bisa diedit setelah dibuat.</p>
            </div>
          </div>
          <Button
            onClick={() => { setShowForm(v => !v); setRefError(null); }}
            className="flex items-center gap-2"
            variant={showForm ? 'outline' : 'default'}
          >
            {showForm ? <><X size={15} /> Batal</> : <><Plus size={15} /> Generate Kode</>}
          </Button>
        </div>

        {/* Form generate */}
        {showForm && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-emerald-800">Kode Baru</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Nama <span className="text-slate-400 font-normal">(opsional)</span></Label>
                  <Input
                    value={draft.name}
                    onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                    placeholder="misal: Kode Ramadan 2026"
                  />
                </div>
                {/* Kode */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Kode Referral</Label>
                  <div className="flex gap-2">
                    <Input
                      value={draft.code}
                      onChange={e => setDraft(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      className="font-mono tracking-widest uppercase"
                      placeholder="CONTOH123"
                    />
                    <Button
                      type="button" size="icon" variant="outline"
                      onClick={() => setDraft(p => ({ ...p, code: generateCode() }))}
                      title="Generate ulang"
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                </div>
                {/* Tipe diskon */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tipe Diskon</Label>
                  <Select
                    value={draft.discount_type}
                    onValueChange={v => setDraft(p => ({ ...p, discount_type: v as 'percent' | 'fixed' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Persen (%)</SelectItem>
                      <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Nilai diskon */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Nilai Diskon {draft.discount_type === 'percent' ? '(%)' : '(Rp)'}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={draft.discount_type === 'percent' ? 100 : undefined}
                    value={draft.discount_value}
                    onChange={e => setDraft(p => ({ ...p, discount_value: e.target.value }))}
                    placeholder={draft.discount_type === 'percent' ? '10' : '50000'}
                  />
                </div>
                {/* Maks penggunaan */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Maks Penggunaan <span className="text-slate-400 font-normal">(kosongkan = unlimited)</span></Label>
                  <Input
                    type="number"
                    min={1}
                    value={draft.max_uses}
                    onChange={e => setDraft(p => ({ ...p, max_uses: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                {/* Expired */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tanggal Kadaluarsa <span className="text-slate-400 font-normal">(opsional)</span></Label>
                  <Input
                    type="date"
                    value={draft.expired_at}
                    onChange={e => setDraft(p => ({ ...p, expired_at: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="ref-active"
                  checked={draft.is_active}
                  onCheckedChange={v => setDraft(p => ({ ...p, is_active: v }))}
                />
                <Label htmlFor="ref-active" className="text-xs">Aktifkan kode langsung setelah dibuat</Label>
              </div>

              {refError && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{refError}</p>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => void saveReferral()}
                  disabled={savingRef}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save size={14} />
                  {savingRef ? 'Menyimpan...' : 'Simpan Kode'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral list */}
        <div className="space-y-2">
          {referrals.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">Belum ada kode referral.</p>
          )}
          {referrals.map(r => (
            <Card key={r.id} className="border border-slate-200">
              <CardContent className="px-4 py-3 flex items-center gap-4">
                {/* Kode */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="font-mono font-bold text-sm tracking-widest text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                    {r.code}
                  </span>
                  <button
                    onClick={() => copyCode(r.code)}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                    title="Salin kode"
                  >
                    {copied === r.code ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {r.name && <p className="text-xs font-medium text-slate-700 truncate">{r.name}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-semibold">
                      {r.discount_type === 'percent' ? `${r.discount_value}%` : `Rp ${r.discount_value.toLocaleString('id-ID')}`}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {r.used_count}/{r.max_uses ?? '∞'} pakai
                    </span>
                    {r.expired_at && (
                      <span className="text-[10px] text-slate-400">
                        Exp: {formatDate(r.expired_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={r.is_active ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {r.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  <Switch
                    checked={r.is_active}
                    onCheckedChange={() => void toggleReferralActive(r)}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 w-7 p-0"
                    onClick={() => void deleteReferral(r.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ══════════════ MODAL: EDIT BANNER ══════════════ */}
      {editingBanner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-base">Edit Banner</h2>
              <button onClick={resetBannerEdit} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Upload zone */}
              <div>
                <Label className="mb-2 block text-xs font-medium">
                  Gambar Banner
                  <span className="text-slate-400 font-normal ml-1">({BANNER_WIDTH}×{BANNER_HEIGHT}px · rasio 3:1)</span>
                </Label>
                <div
                  className={[
                    'relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors',
                    dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400',
                    uploading ? 'pointer-events-none opacity-60' : '',
                  ].join(' ')}
                  style={{ aspectRatio: `${BANNER_WIDTH} / ${BANNER_HEIGHT}` }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) void handleBannerFile(f); }}
                  onClick={() => fileRef.current?.click()}
                >
                  {(bannerPreview ?? editingBanner.image_url) && (
                    <Image
                      src={bannerPreview ?? editingBanner.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className={[
                    'absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity',
                    (bannerPreview ?? editingBanner.image_url) ? 'bg-black/40 opacity-0 hover:opacity-100' : 'opacity-100',
                  ].join(' ')}>
                    <Upload size={24} className="text-white" />
                    <p className="text-white text-xs font-medium">
                      {uploading ? 'Mengupload...' : 'Klik atau drag gambar ke sini'}
                    </p>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) void handleBannerFile(f); e.target.value = ''; }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Judul Banner</Label>
                  <Input
                    value={editingBanner.title}
                    onChange={e => updateBanner({ title: e.target.value })}
                    placeholder="Promo Spesial 2026"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Link Banner
                    <span className="text-slate-400 font-normal ml-1">(kosongkan = tidak bisa diklik)</span>
                  </Label>
                  <Input
                    value={editingBanner.button_link}
                    onChange={e => updateBanner({ button_link: e.target.value })}
                    placeholder="/daftar-tryout"
                  />
                </div>
              </div>

              {/* Preview link status */}
              <div className={[
                'flex items-center gap-2 text-xs px-3 py-2 rounded-lg',
                editingBanner.button_link
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700',
              ].join(' ')}>
                {editingBanner.button_link
                  ? <><Link2 size={12} /> Banner akan mengarah ke: <strong>{editingBanner.button_link}</strong></>
                  : <><Link2Off size={12} /> Banner tidak akan bisa diklik (tidak ada link)</>
                }
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="banner-active-modal"
                  checked={editingBanner.is_active}
                  onCheckedChange={v => updateBanner({ is_active: v })}
                />
                <Label htmlFor="banner-active-modal" className="text-xs">Tampilkan banner di dashboard</Label>
              </div>

              {bannerError && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{bannerError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
              <Button variant="outline" size="sm" onClick={resetBannerEdit}>Batal</Button>
              <Button
                size="sm"
                onClick={() => void saveBanner()}
                disabled={savingBanner || uploading}
                className="flex items-center gap-2"
              >
                <Save size={13} />
                {savingBanner ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}