'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User, Mail, Phone, Calendar, Save,
} from 'lucide-react';
import SearchableDropdown from './searchable-dropdown';
import { INSTANSI } from '@/constants/instansi';
import { PROVINSI, KABUPATEN } from '@/constants/wilayah';

const iconInputClass = "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-800 placeholder:text-slate-400";
const plainInputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-800 placeholder:text-slate-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
    </div>
  );
}

function toFriendlyError(raw: string): string {
  const msg = raw?.toLowerCase() ?? '';
  if (msg.includes('coerce') || msg.includes('single json') || msg.includes('multiple'))
    return 'Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.';
  if (msg.includes('duplicate') || msg.includes('unique'))
    return 'Data sudah terdaftar. Silakan periksa kembali isian Anda.';
  if (msg.includes('foreign key') || msg.includes('violates'))
    return 'Data tidak valid. Silakan periksa kembali isian Anda.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Koneksi bermasalah. Periksa internet Anda lalu coba lagi.';
  if (msg.includes('unauthorized') || msg.includes('401'))
    return 'Sesi Anda telah berakhir. Silakan masuk ulang.';
  if (msg.includes('timeout'))
    return 'Waktu permintaan habis. Silakan coba lagi.';
  return raw || 'Gagal menyimpan profil. Silakan coba lagi.';
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

  const handleProvinceChange = (value: string) => {
    setForm(prev => ({ ...prev, province: value, city: '' }));
  };

  const handleSubmit = async () => {
    // ── Validasi per field — urutan sesuai tampilan form ────────────────

    if (!form.full_name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (form.full_name.trim().length < 3) {
      toast.error('Nama lengkap minimal 3 karakter');
      return;
    }

    if (!form.phone.trim()) {
      toast.error('Nomor WhatsApp wajib diisi');
      return;
    }
    if (!/^[0-9+]+$/.test(form.phone)) {
      toast.error('Nomor WhatsApp hanya boleh berisi angka dan tanda +');
      return;
    }
    if (form.phone.length < 9 || form.phone.length > 13) {
      toast.error('Nomor WhatsApp harus 9–13 karakter');
      return;
    }

    if (!form.target_institution) {
      toast.error('Instansi tujuan wajib dipilih');
      return;
    }

    if (!form.gender) {
      toast.error('Jenis kelamin wajib dipilih');
      return;
    }

    if (!form.birth_date) {
      toast.error('Tanggal lahir wajib diisi');
      return;
    }
    const birthYear = new Date(form.birth_date).getFullYear();
    if (birthYear > 2009) {
      toast.error('Usia minimal 16 tahun untuk mendaftar');
      return;
    }

    if (!form.postal_code.trim()) {
      toast.error('Kode pos wajib diisi');
      return;
    }
    if (!/^\d{5}$/.test(form.postal_code.trim())) {
      toast.error('Kode pos harus terdiri dari 5 angka');
      return;
    }

    if (!form.address.trim()) {
      toast.error('Alamat wajib diisi');
      return;
    }
    if (form.address.trim().length < 10) {
      toast.error('Alamat terlalu singkat, mohon isi dengan lengkap');
      return;
    }

    if (!form.province) {
      toast.error('Provinsi wajib dipilih');
      return;
    }

    if (!form.city) {
      toast.error('Kabupaten/Kota wajib dipilih');
      return;
    }

    if (!form.district.trim()) {
      toast.error('Kecamatan wajib diisi');
      return;
    }

    // ────────────────────────────────────────────────────────────────────

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
        let errorMsg = 'Gagal menyimpan profil. Silakan coba lagi.';
        try {
          const json = await res.json();
          errorMsg = toFriendlyError(json?.error ?? json?.message ?? errorMsg);
        } catch {
          // response bukan JSON — pakai pesan generik
        }
        throw new Error(errorMsg);
      }

      toast.success('Profil berhasil disimpan!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(toFriendlyError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Nama Lengkap */}
        <Field label="Nama Lengkap">
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

        {/* Email — readonly, tidak wajib karena dari akun */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              disabled
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* No HP */}
        <Field label="Nomor WhatsApp">
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={form.phone}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9+]/g, '');
                set('phone', val);
              }}
              placeholder="08xx-xxxx-xxxx"
              maxLength={13}
              className={iconInputClass}
            />
          </div>
        </Field>

        {/* Instansi Tujuan */}
        <Field label="Instansi Tujuan">
          <SearchableDropdown
            value={form.target_institution}
            onChange={v => set('target_institution', v)}
            options={INSTANSI}
            placeholder="Cari instansi tujuan..."
            pinnedOption="Belum Ditentukan"
          />
        </Field>

        {/* Jenis Kelamin */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
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
              max="2009-12-31"
              className={iconInputClass}
            />
          </div>
        </Field>

        {/* Kode Pos */}
        <Field label="Kode Pos">
          <input
            type="text"
            value={form.postal_code}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              set('postal_code', val);
            }}
            placeholder="Contoh: 57311"
            maxLength={5}
            className={plainInputClass}
          />
        </Field>

        {/* Alamat */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">
            Alamat <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder="Alamat lengkap (nama jalan, nomor rumah, RT/RW)..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-800 placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Provinsi */}
        <Field label="Provinsi">
          <SearchableDropdown
            value={form.province}
            onChange={handleProvinceChange}
            options={PROVINSI}
            placeholder="Cari provinsi..."
          />
        </Field>

        {/* Kabupaten/Kota */}
        <Field label="Kabupaten/Kota">
          <SearchableDropdown
            value={form.city}
            onChange={v => set('city', v)}
            options={form.province ? (KABUPATEN[form.province] ?? []) : []}
            placeholder="Cari kabupaten/kota..."
            disabled={!form.province}
            disabledPlaceholder="Pilih provinsi terlebih dahulu"
          />
        </Field>

        {/* Kecamatan */}
        <Field label="Kecamatan">
          <input
            type="text"
            value={form.district}
            onChange={e => set('district', e.target.value)}
            placeholder="Nama kecamatan..."
            className={plainInputClass}
          />
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