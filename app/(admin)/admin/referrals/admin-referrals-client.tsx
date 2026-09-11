'use client';

// ============================================================
// app/(admin)/admin/referrals/admin-referrals-client.tsx
// ============================================================

import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Tag } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Switch }   from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { ReferralCode, PackageTier } from '@/types/referral';

// ── helpers ────────────────────────────────────────────────────
type Draft = Omit<ReferralCode, 'created_at' | 'used_count'> & { id: string };

const blank = (): Draft => ({
  id:             '',
  name:           '',
  code:           '',
  discount_type:  'percent',
  discount_value: 10,
  max_uses:       null,
  is_active:      true,
  expired_at:     null,
  allowed_tiers:  null,
  override_duration_days: null,
});

function toInputDate(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}
function fromInputDate(val: string): string | null {
  if (!val) return null;
  return new Date(val).toISOString();
}

const TIER_OPTS: { value: PackageTier; label: string }[] = [
  { value: 'premium',  label: 'Premium' },
  { value: 'platinum', label: 'Platinum' },
];

// ── component ─────────────────────────────────────────────────
interface Props { initialReferrals: ReferralCode[] }

export default function AdminReferralsClient({ initialReferrals }: Props) {
  const [referrals, setReferrals] = useState<ReferralCode[]>(initialReferrals);
  const [editing,   setEditing]   = useState<Draft | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const openNew  = () => { setEditing(blank()); setError(null); };
  const openEdit = (r: ReferralCode) => { setEditing({ ...r }); setError(null); };
  const reset    = () => { setEditing(null); setError(null); };
  const patch    = (p: Partial<Draft>) => setEditing(prev => prev ? { ...prev, ...p } : prev);

  const toggleTier = (tier: PackageTier) => {
    if (!editing) return;
    const current = editing.allowed_tiers ?? [];
    const next = current.includes(tier)
      ? current.filter(t => t !== tier)
      : [...current, tier];
    patch({ allowed_tiers: next.length ? next : null });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.code.trim())  { setError('Kode wajib diisi.'); return; }
    if (!editing.discount_value || editing.discount_value <= 0) { setError('Nilai diskon wajib diisi.'); return; }
    if (editing.override_duration_days != null && editing.override_duration_days <= 0) {
      setError('Durasi akses khusus harus lebih dari 0 hari.'); return;
    }

    setSaving(true);
    try {
      const isNew = editing.id === '';
      const url   = isNew ? '/api/admin/referrals' : `/api/admin/referrals/${editing.id}`;
      const res   = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const json = await res.json() as ReferralCode & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan');

      setReferrals(prev =>
        isNew ? [json, ...prev] : prev.map(r => r.id === json.id ? json : r)
      );
      reset();
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menyimpan'); }
    finally     { setSaving(false); }
  };

  const handleToggle = async (r: ReferralCode) => {
    const res = await fetch(`/api/admin/referrals/${r.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !r.is_active }),
    });
    if (res.ok) setReferrals(prev => prev.map(x => x.id === r.id ? { ...x, is_active: !x.is_active } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kode referral ini?')) return;
    const res = await fetch(`/api/admin/referrals/${id}`, { method: 'DELETE' });
    if (res.ok) setReferrals(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kode Referral</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola kode diskon yang dipakai pengguna saat checkout. Kode ini yang benar-benar divalidasi di halaman pembayaran.
          </p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Plus size={16} /> Tambah Kode
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {referrals.length === 0 && (
          <p className="text-center text-slate-400 py-12">
            Belum ada kode referral. Klik &quot;Tambah Kode&quot; untuk mulai.
          </p>
        )}

        {referrals.map(r => (
          <Card key={r.id} className="overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-slate-400" />
                  <p className="font-mono font-bold text-slate-800">{r.code}</p>
                  {r.name && <span className="text-sm text-slate-500">{r.name}</span>}
                  <Badge variant={r.is_active ? 'default' : 'secondary'}>
                    {r.is_active ? 'Aktif' : 'Non-aktif'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                  <span>
                    {r.discount_type === 'percent' ? `Diskon ${r.discount_value}%` : `Diskon Rp${r.discount_value.toLocaleString('id-ID')}`}
                  </span>
                  <span>Terpakai: {r.used_count}{r.max_uses != null ? ` / ${r.max_uses}` : ''}</span>
                  {r.expired_at && (
                    <span>Kadaluarsa {new Date(r.expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  )}
                  <span>
                    Berlaku untuk: {r.allowed_tiers?.length ? r.allowed_tiers.join(', ') : 'Semua tier'}
                  </span>
                  {r.override_duration_days != null && (
                    <span className="text-amber-600 font-semibold">
                      Masa aktif khusus: {r.override_duration_days} hari
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={r.is_active} onCheckedChange={() => void handleToggle(r)} />
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => void handleDelete(r.id)}>
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">
                {editing.id !== '' ? 'Edit Kode Referral' : 'Tambah Kode Referral'}
              </h2>
              <button onClick={reset} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kode</Label>
                  <Input
                    value={editing.code}
                    onChange={e => patch({ code: e.target.value.toUpperCase() })}
                    placeholder="SKDHEMAT30"
                    className="font-mono"
                    disabled={editing.id !== ''}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nama <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                  <Input value={editing.name ?? ''} onChange={e => patch({ name: e.target.value || null })} placeholder="Promo Ramadan" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tipe Diskon</Label>
                  <Select value={editing.discount_type} onValueChange={v => patch({ discount_type: v as 'percent' | 'fixed' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Persen (%)</SelectItem>
                      <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Nilai Diskon</Label>
                  <Input
                    type="number" min={1}
                    value={editing.discount_value}
                    onChange={e => patch({ discount_value: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Berlaku untuk Tier <span className="text-slate-400 font-normal text-xs">(kosongkan = semua tier)</span></Label>
                <div className="flex items-center gap-4">
                  {TIER_OPTS.map(t => (
                    <label key={t.value} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={editing.allowed_tiers?.includes(t.value) ?? false}
                        onChange={() => toggleTier(t.value)}
                        className="rounded border-slate-300"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Masa Aktif Khusus (hari) <span className="text-slate-400 font-normal text-xs">(kosongkan = pakai durasi normal paket: 6 bulan premium / 1 tahun platinum)</span></Label>
                <Input
                  type="number" min={1}
                  value={editing.override_duration_days ?? ''}
                  onChange={e => patch({ override_duration_days: e.target.value ? Number(e.target.value) : null })}
                  placeholder="30"
                  className="w-40"
                />
                <p className="text-xs text-amber-600">
                  Contoh: isi 30 supaya akses premium/platinum yang diaktifkan lewat kode ini cuma berlaku 1 bulan,
                  bukan durasi normal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Maks. Pemakaian <span className="text-slate-400 font-normal text-xs">(kosongkan = tidak terbatas)</span></Label>
                  <Input
                    type="number" min={1}
                    value={editing.max_uses ?? ''}
                    onChange={e => patch({ max_uses: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kadaluarsa <span className="text-slate-400 font-normal text-xs">(opsional)</span></Label>
                  <Input
                    type="datetime-local"
                    value={toInputDate(editing.expired_at)}
                    onChange={e => patch({ expired_at: fromInputDate(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch id="ref-active" checked={editing.is_active} onCheckedChange={v => patch({ is_active: v })} />
                <Label htmlFor="ref-active">Aktifkan kode</Label>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
              <Button variant="outline" onClick={reset}>Batal</Button>
              <Button onClick={() => void handleSave()} disabled={saving} className="flex items-center gap-2">
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
