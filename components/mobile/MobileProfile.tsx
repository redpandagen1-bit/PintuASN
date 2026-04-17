'use client';

// components/mobile/MobileProfile.tsx
// Mobile-only profile page — Pathfinder Navy MD3 design

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, LogOut, ChevronDown, Star, Shield, Camera, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/database';
import type { UserStats } from '@/lib/supabase/queries';

// ── Types ─────────────────────────────────────────────────────

type ProfileTab = 'profil' | 'keamanan' | 'langganan';

interface MobileProfileProps {
  initialProfile: Profile;
  initialStats:   UserStats;
}

// ── Helpers ───────────────────────────────────────────────────

function getInitials(name?: string) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function tierBadge(tier?: string) {
  switch (tier) {
    case 'premium':  return { label: 'Premium',  bg: 'bg-blue-500',   text: 'text-white' };
    case 'platinum': return { label: 'Platinum', bg: 'bg-purple-500', text: 'text-white' };
    default:         return { label: 'Gratis',   bg: 'bg-emerald-500',text: 'text-white' };
  }
}

const PROVINCES = [
  'Aceh','Sumatera Utara','Sumatera Barat','Riau','Jambi',
  'Sumatera Selatan','Bengkulu','Lampung','Kepulauan Bangka Belitung',
  'Kepulauan Riau','DKI Jakarta','Jawa Barat','Jawa Tengah',
  'DI Yogyakarta','Jawa Timur','Banten','Bali',
  'Nusa Tenggara Barat','Nusa Tenggara Timur','Kalimantan Barat',
  'Kalimantan Tengah','Kalimantan Selatan','Kalimantan Timur',
  'Kalimantan Utara','Sulawesi Utara','Sulawesi Tengah',
  'Sulawesi Selatan','Sulawesi Tenggara','Gorontalo',
  'Sulawesi Barat','Maluku','Maluku Utara','Papua Barat','Papua',
];

// ── Label field ───────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-md-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-white border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-md-secondary-container text-md-on-surface font-medium placeholder:text-md-outline-variant outline-none';
const selectCls = inputCls + ' appearance-none';

// ── Component ─────────────────────────────────────────────────

export function MobileProfile({ initialProfile, initialStats }: MobileProfileProps) {
  const [profile, setProfile]   = useState(initialProfile);
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profil');
  const [uploading, setUploading] = useState(false);
  const avatarInputRef            = useRef<HTMLInputElement>(null);
  const { signOut } = useClerk();
  const router      = useRouter();

  const badge    = tierBadge(profile.subscription_tier);
  const initials = getInitials(profile.full_name);

  function patch<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      toast.success('Profil berhasil disimpan!');
    } catch {
      toast.error('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.push('/sign-in');
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload/image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal upload');
      patch('avatar_url', data.url);
      toast.success('Foto profil diperbarui!');
    } catch {
      toast.error('Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  }

  const tierInfo = {
    free:     { label: 'Gratis',   color: 'bg-emerald-100 text-emerald-700' },
    premium:  { label: 'Premium',  color: 'bg-blue-100 text-blue-700'       },
    platinum: { label: 'Platinum', color: 'bg-purple-100 text-purple-700'   },
  }[profile.subscription_tier ?? 'free'] ?? { label: 'Gratis', color: 'bg-emerald-100 text-emerald-700' };

  return (
    <main className="pb-32 mt-[72px]">

      {/* ── User Identity Hero ────────────────────────────────── */}
      <section className="px-4 mb-6">
        <div className="bg-md-surface-container-low rounded-2xl p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                className="relative group active-press"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading}
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name ?? 'Avatar'}
                    className="w-24 h-24 rounded-full object-cover shadow-md3-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-md-primary flex items-center justify-center text-white text-3xl font-extrabold shadow-md3-md">
                    {initials}
                  </div>
                )}
                {/* Camera overlay */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={22} className="text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
              {/* Tier badge */}
              <div className={cn(
                'absolute -bottom-1 -right-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm',
                badge.bg, badge.text,
              )}>
                <Star size={10} fill="currentColor" />
                {badge.label}
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-md-primary mb-1"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {profile.full_name ?? 'Pengguna'}
            </h2>
            <p className="text-md-on-surface-variant text-sm mb-6">
              {profile.email}
            </p>

            {/* Stats 2-col */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white p-4 rounded-xl shadow-md3-sm flex flex-col items-center">
                <span className="text-2xl font-black text-md-primary"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {initialStats.totalAttempts}
                </span>
                <span className="text-label-sm text-md-on-surface-variant">Tryout Diikuti</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md3-sm flex flex-col items-center border-l-4 border-md-secondary-container">
                <span className="text-2xl font-black text-md-secondary"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {initialStats.bestScore > 0 ? initialStats.bestScore : '-'}
                </span>
                <span className="text-label-sm text-md-on-surface-variant">Skor Terbaik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="px-4 mb-2">
        <div className="bg-md-surface-container-low rounded-2xl p-1.5 flex gap-1">
          {([
            { id: 'profil',    label: 'Profil',     icon: <Star size={13} /> },
            { id: 'keamanan',  label: 'Keamanan',   icon: <Shield size={13} /> },
            { id: 'langganan', label: 'Langganan',  icon: <CreditCard size={13} /> },
          ] as { id: ProfileTab; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs transition-all active-press',
                activeTab === tab.id
                  ? 'bg-white text-md-primary shadow-md3-sm'
                  : 'text-md-on-surface-variant',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Data Diri Form ────────────────────────────────────── */}
      {activeTab === 'profil' && (
      <section className="px-4 space-y-5">
        {/* Section label */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-md-secondary-container rounded-full" />
          <h3 className="text-lg font-bold text-md-primary"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Data Diri
          </h3>
        </div>

        <div className="space-y-4">
          <Field label="Nama Lengkap">
            <input
              type="text"
              className={inputCls}
              value={profile.full_name ?? ''}
              onChange={e => patch('full_name', e.target.value)}
              placeholder="Nama lengkap"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              value={profile.email ?? ''}
              readOnly
              disabled
            />
          </Field>

          <Field label="Nomor WhatsApp">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant text-sm font-semibold">
                +62
              </span>
              <input
                type="tel"
                className={cn(inputCls, 'pl-14')}
                value={profile.phone ?? ''}
                onChange={e => patch('phone', e.target.value)}
                placeholder="81234567890"
              />
            </div>
          </Field>

          <Field label="Instansi Tujuan">
            <input
              type="text"
              className={inputCls}
              value={profile.target_institution ?? ''}
              onChange={e => patch('target_institution', e.target.value)}
              placeholder="Cth: Kementerian Keuangan"
            />
          </Field>

          <Field label="Jenis Kelamin">
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => patch('gender', g)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active-press',
                    profile.gender === g
                      ? 'bg-md-secondary-container text-md-on-secondary-container shadow-sm'
                      : 'bg-white text-md-on-surface-variant',
                  )}
                >
                  {g === 'male' ? '♂' : '♀'}
                  {g === 'male' ? 'Pria' : 'Wanita'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Tanggal Lahir">
            <input
              type="date"
              className={inputCls}
              value={profile.birth_date ?? ''}
              onChange={e => patch('birth_date', e.target.value)}
            />
          </Field>

          {/* Address cluster */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Field label="Kode Pos">
                <input
                  type="text"
                  className={inputCls}
                  value={profile.postal_code ?? ''}
                  onChange={e => patch('postal_code', e.target.value)}
                  placeholder="12345"
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Alamat">
                <input
                  type="text"
                  className={inputCls}
                  value={profile.address ?? ''}
                  onChange={e => patch('address', e.target.value)}
                  placeholder="Jl. Merdeka No. 10"
                />
              </Field>
            </div>
          </div>

          <Field label="Provinsi">
            <div className="relative">
              <select
                className={selectCls}
                value={profile.province ?? ''}
                onChange={e => patch('province', e.target.value)}
              >
                <option value="">Pilih provinsi</option>
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none" />
            </div>
          </Field>

          <Field label="Kota / Kabupaten">
            <input
              type="text"
              className={inputCls}
              value={profile.city ?? ''}
              onChange={e => patch('city', e.target.value)}
              placeholder="Jakarta Selatan"
            />
          </Field>

          <Field label="Kecamatan">
            <input
              type="text"
              className={inputCls}
              value={profile.district ?? ''}
              onChange={e => patch('district', e.target.value)}
              placeholder="Tebet"
            />
          </Field>
        </div>

        {/* Save button */}
        <div className="pt-2 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-md-secondary-container text-md-on-secondary-container py-4 rounded-xl font-extrabold text-sm shadow-md3-sm active-press uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 active-press mb-4"
        >
          <LogOut size={16} />
          Keluar Akun
        </button>
      </section>
      )}

      {/* ── Keamanan Tab ──────────────────────────────────────── */}
      {activeTab === 'keamanan' && (
        <section className="px-4 pt-2 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-md-secondary-container rounded-full" />
            <h3 className="text-lg font-bold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Keamanan
            </h3>
          </div>

          <div className="bg-md-surface-container-low rounded-2xl p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-md-primary rounded-2xl flex items-center justify-center">
              <Shield size={24} className="text-md-secondary-container" />
            </div>
            <div>
              <h4 className="font-bold text-md-on-surface mb-1">Kelola via Clerk</h4>
              <p className="text-sm text-md-on-surface-variant leading-relaxed">
                Password dan keamanan akun dikelola melalui sistem autentikasi Clerk.
              </p>
            </div>
            <a
              href="https://accounts.pintuasn.com/user"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-md-primary text-white font-extrabold py-4 rounded-xl text-sm flex items-center justify-center gap-2 active-press"
            >
              <Shield size={16} />
              Kelola Keamanan Akun
            </a>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 active-press"
          >
            <LogOut size={16} />
            Keluar Akun
          </button>
        </section>
      )}

      {/* ── Langganan Tab ─────────────────────────────────────── */}
      {activeTab === 'langganan' && (
        <section className="px-4 pt-2 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-md-secondary-container rounded-full" />
            <h3 className="text-lg font-bold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Paket Berlangganan
            </h3>
          </div>

          <div className={cn(
            'rounded-2xl p-6 border-2',
            profile.subscription_tier === 'platinum' ? 'border-purple-200 bg-purple-50' :
            profile.subscription_tier === 'premium'  ? 'border-blue-200 bg-blue-50'     :
            'border-md-outline-variant/20 bg-md-surface-container-low',
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-md-primary" />
                <span className="font-bold text-md-on-surface">Paket Saat Ini</span>
              </div>
              <span className={cn('text-xs font-black px-3 py-1 rounded-full', tierInfo.color)}>
                {tierInfo.label.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-md-on-surface-variant">
              {profile.subscription_tier === 'free'
                ? 'Anda menggunakan paket gratis. Upgrade untuk akses penuh ke semua materi dan tryout premium.'
                : `Anda memiliki akses ${tierInfo.label} ke semua konten PintuASN.`
              }
            </p>
          </div>

          {profile.subscription_tier === 'free' && (
            <Link href="/beli-paket">
              <button className="w-full bg-md-primary text-white font-extrabold py-4 rounded-xl text-sm flex items-center justify-center gap-2 active-press">
                <Star size={16} fill="currentColor" />
                Upgrade Sekarang
              </button>
            </Link>
          )}

          {profile.subscription_tier !== 'free' && (
            <Link href="/beli-paket">
              <button className="w-full bg-md-surface-container-low text-md-primary font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 active-press">
                Lihat Detail Paket
              </button>
            </Link>
          )}
        </section>
      )}

    </main>
  );
}
