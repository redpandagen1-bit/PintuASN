'use client';

import { useState } from 'react';
import {
  User, Mail, Phone, Shield, CreditCard, LogOut,
  Camera, CheckCircle2, Building, Calendar, ChevronDown,
  MapPin, Star, Save, X, Edit3,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Profile } from '@/types/database';
import type { UserStats } from '@/lib/supabase/queries';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface ProfileContentProps {
  initialProfile: Profile;
  initialStats: UserStats;
}

type ActiveTab = 'profil' | 'keamanan' | 'langganan';

// ── INDONESIAN PROVINCES ───────────────────────────────────────────────────

const PROVINCES = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi',
  'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
  'Kepulauan Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah',
  'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali',
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat',
  'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur',
  'Kalimantan Utara', 'Sulawesi Utara', 'Sulawesi Tengah',
  'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo',
  'Sulawesi Barat', 'Maluku', 'Maluku Utara', 'Papua Barat', 'Papua',
];

// ── HELPERS ────────────────────────────────────────────────────────────────

function getTierInfo(tier?: string) {
  switch (tier) {
    case 'premium':
      return { label: 'Premium', color: 'bg-blue-500 text-white', dot: 'bg-blue-400' };
    case 'platinum':
      return { label: 'Platinum', color: 'bg-purple-500 text-white', dot: 'bg-purple-400' };
    default:
      return { label: 'Gratis', color: 'bg-emerald-500 text-white', dot: 'bg-emerald-400' };
  }
}

function getInitials(name?: string) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── FIELD COMPONENT ────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-800 placeholder:text-slate-400";
const iconInputClass = "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-800 placeholder:text-slate-400";

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function ProfileContent({ initialProfile, initialStats }: ProfileContentProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('profil');
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const dbToUiGender: Record<string, string> = { male: 'Pria', female: 'Wanita' };
  const uiToDbGender: Record<string, string> = { Pria: 'male', Wanita: 'female' };

  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    gender: dbToUiGender[profile.gender || ''] || '',
    birth_date: profile.birth_date || '',
    address: profile.address || '',
    province: profile.province || '',
    city: profile.city || '',
    district: profile.district || '',
    postal_code: profile.postal_code || '',
    target_institution: profile.target_institution || '',
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const tier = getTierInfo(profile.subscription_tier);

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        gender: uiToDbGender[form.gender] ?? form.gender ?? null,
      };
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan');
      const { profile: updated } = await res.json();
      setProfile(updated);
      toast.success('Profil berhasil diperbarui!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const tabs = [
    { id: 'profil' as ActiveTab, label: 'Informasi Profil', icon: User },
    { id: 'keamanan' as ActiveTab, label: 'Keamanan', icon: Shield },
    { id: 'langganan' as ActiveTab, label: 'Paket Berlangganan', icon: CreditCard },
  ];

  return (
    <div className="space-y-5 pb-10">

      {/* ── HERO HEADER ──────────────────────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400 rounded-full opacity-10 blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 bg-slate-700 border-4 border-slate-600 shadow-[0_0_0_3px_rgba(250,204,21,0.4)] rounded-full flex items-center justify-center text-3xl font-black text-white overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(profile.full_name)
              )}
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer rounded-full">
                <Camera className="text-white" size={22} />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {profile.full_name || 'Nama belum diisi'}
              </h1>
              <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg ${tier.color} mx-auto md:mx-0`}>
                <Star size={12} fill="currentColor" /> {tier.label}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Bergabung sejak {new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <Mail size={14} className="text-yellow-400" />
                {profile.email}
              </span>
              {profile.target_institution && (
                <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <Building size={14} className="text-yellow-400" />
                  Target: {profile.target_institution}
                </span>
              )}
            </div>
          </div>

          {/* Stats mini */}
          <div className="flex md:flex-col gap-3 shrink-0">
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center border border-white/10">
              <div className="text-xl font-black text-white">{initialStats.totalAttempts}</div>
              <div className="text-[11px] text-slate-400">Tryout</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center border border-white/10">
              <div className="text-xl font-black text-white">{initialStats.bestScore}</div>
              <div className="text-[11px] text-slate-400">Skor Terbaik</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-5 items-start">

        {/* Sidebar tabs */}
        <div className="w-full md:w-56 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-yellow-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-yellow-400' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}

          <div className="hidden md:block h-px bg-slate-100 my-1" />

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all whitespace-nowrap flex-shrink-0"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">

          {/* ── TAB: PROFIL ── */}
          {activeTab === 'profil' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Data Diri</h2>
                <p className="text-sm text-slate-500 mt-0.5">Perbarui informasi data diri Anda.</p>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Nama Lengkap */}
                <Field label="Nama Lengkap" required>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => set('full_name', e.target.value)}
                      placeholder="Nama lengkap"
                      className={iconInputClass}
                    />
                  </div>
                </Field>

                {/* Email — readonly */}
                <Field label="Email">
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </Field>

                {/* No HP */}
                <Field label="Nomor WhatsApp">
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="08xx-xxxx-xxxx"
                      className={iconInputClass}
                    />
                  </div>
                </Field>

                {/* Instansi */}
                <Field label="Instansi Tujuan">
                  <div className="relative">
                    <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.target_institution}
                      onChange={e => set('target_institution', e.target.value)}
                      placeholder="Contoh: Kementerian Keuangan"
                      className={iconInputClass}
                    />
                  </div>
                </Field>

                {/* Jenis Kelamin */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Jenis Kelamin</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Pria', 'Wanita'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set('gender', g)}
                        className={`flex flex-col items-center justify-center py-5 border-2 rounded-2xl transition-all duration-200 ${
                          form.gender === g
                            ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <span className="text-4xl mb-2">{g === 'Pria' ? '👨🏻‍💼' : '👩🏻‍💼'}</span>
                        <span className="font-bold text-sm">{g}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tanggal Lahir */}
                <Field label="Tanggal Lahir">
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={form.birth_date}
                      onChange={e => set('birth_date', e.target.value)}
                      className={iconInputClass}
                    />
                  </div>
                </Field>

                {/* Kode Pos */}
                <Field label="Kode Pos">
                  <input
                    type="text"
                    value={form.postal_code}
                    onChange={e => set('postal_code', e.target.value)}
                    placeholder="Kode pos..."
                    className={inputClass}
                  />
                </Field>

                {/* Alamat */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Alamat</label>
                  <textarea
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="Alamat lengkap..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Provinsi */}
                <Field label="Provinsi">
                  <div className="relative">
                    <select
                      value={form.province}
                      onChange={e => set('province', e.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">Pilih Provinsi</option>
                      {PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </Field>

                {/* Kabupaten/Kota */}
                <Field label="Kabupaten/Kota">
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder="Nama kabupaten/kota..."
                    className={inputClass}
                  />
                </Field>

                {/* Kecamatan */}
                <Field label="Kecamatan">
                  <input
                    type="text"
                    value={form.district}
                    onChange={e => set('district', e.target.value)}
                    placeholder="Nama kecamatan..."
                    className={inputClass}
                  />
                </Field>

              </div>

              {/* Save button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <Save size={15} />
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: KEAMANAN ── */}
          {activeTab === 'keamanan' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Keamanan & Password</h2>
                <p className="text-sm text-slate-500 mt-0.5">Kelola keamanan akun Anda.</p>
              </div>
              <div className="h-px bg-slate-100" />

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Shield size={24} className="text-yellow-400" />
                </div>
                <h3 className="font-bold text-slate-800">Kelola via Clerk</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Password dan keamanan akun dikelola melalui sistem autentikasi Clerk.
                  Gunakan tombol di bawah untuk mengubah password.
                </p>
                <a
                  href="https://accounts.pintuasn.com/user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
                >
                  Kelola Keamanan Akun
                </a>
              </div>
            </div>
          )}

          {/* ── TAB: LANGGANAN ── */}
          {activeTab === 'langganan' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Paket Berlangganan</h2>
                <p className="text-sm text-slate-500 mt-0.5">Status dan detail paket aktif Anda.</p>
              </div>
              <div className="h-px bg-slate-100" />

              {/* Current plan */}
              <div className={`rounded-2xl p-6 border-2 ${
                profile.subscription_tier === 'platinum'
                  ? 'border-purple-200 bg-purple-50'
                  : profile.subscription_tier === 'premium'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800">Paket Saat Ini</h3>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${tier.color}`}>
                    {tier.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {profile.subscription_tier === 'free'
                    ? 'Anda menggunakan paket gratis. Upgrade untuk akses penuh ke semua materi dan tryout premium.'
                    : `Anda memiliki akses ${tier.label} ke semua konten PintuASN.`}
                </p>
              </div>

              {profile.subscription_tier === 'free' && (
                <a href="/pricing">
                  <button className="w-full py-3 bg-slate-800 text-yellow-400 font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <Star size={16} fill="currentColor" />
                    Upgrade Sekarang
                  </button>
                </a>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}