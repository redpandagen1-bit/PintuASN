'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User, Mail, Phone, Building, Calendar, ChevronDown, MapPin, Save,
} from 'lucide-react';

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

const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-800 placeholder:text-slate-400";
const iconInputClass = "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-800 placeholder:text-slate-400";

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

interface Props {
  email: string;
  defaultName: string;
}

export default function OnboardingFullForm({ email, defaultName }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: defaultName,
    phone: '',
    gender: '',
    birth_date: '',
    address: '',
    province: '',
    city: '',
    district: '',
    postal_code: '',
    target_institution: '',
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.full_name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    setIsLoading(true);
    try {
      const genderMap: Record<string, string> = { Pria: 'male', Wanita: 'female' };
      const payload = {
        ...form,
        gender: genderMap[form.gender] ?? form.gender ?? null,
        onboarding_completed: true,
      };

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Gagal menyimpan profil');
      }
      toast.success('Profil berhasil disimpan!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
              value={email}
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
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={form.district}
              onChange={e => set('district', e.target.value)}
              placeholder="Nama kecamatan..."
              className={iconInputClass}
            />
          </div>
        </Field>

      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <Save size={15} />
          {isLoading ? 'Menyimpan...' : 'Simpan & Mulai'}
        </button>
      </div>
    </div>
  );
}
