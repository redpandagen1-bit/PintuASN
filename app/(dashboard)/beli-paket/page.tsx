'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Shield, Crown, ArrowRight, Loader2, Star } from 'lucide-react';

const PACKAGES = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    priceLabel: 'Rp 0',
    period: 'Selamanya',
    description: 'Cocok untuk mencoba fitur dasar simulasi SKD',
    icon: Shield,
    badge: null,
    features: ['10 soal latihan per hari', 'Akses materi dasar', 'Statistik terbatas', 'Tidak ada simulasi penuh', 'Tidak ada pembahasan lengkap'],
    disabledFeatures: [2, 3, 4],
    cta: 'Pakai Gratis',
    isFree: true, isPremium: false, isPlatinum: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 149000,
    priceLabel: 'Rp 149.000',
    period: 'Hingga November 2026',
    description: 'Akses penuh untuk persiapan SKD CPNS 2026',
    icon: Zap,
    badge: 'Populer',
    features: ['Soal latihan tidak terbatas', 'Akses semua materi lengkap', 'Statistik & analisis performa', 'Simulasi ujian penuh SKD', 'Pembahasan setiap soal', 'Leaderboard & ranking'],
    disabledFeatures: [],
    cta: 'Mulai Premium',
    isFree: false, isPremium: true, isPlatinum: false,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 249000,
    priceLabel: 'Rp 249.000',
    period: 'Hingga November 2026',
    description: 'Paket lengkap dengan fitur eksklusif & prioritas',
    icon: Crown,
    badge: 'Terlengkap',
    features: ['Semua fitur Premium', 'Live class & webinar eksklusif', 'Konsultasi dengan mentor', 'Grup belajar khusus Platinum', 'Roadmap belajar personal', 'Garansi uang kembali 7 hari'],
    disabledFeatures: [],
    cta: 'Mulai Platinum',
    isFree: false, isPremium: false, isPlatinum: true,
  },
];

export default function BeliPaketPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (pkg: typeof PACKAGES[0]) => {
    if (pkg.isFree) { router.push('/dashboard'); return; }

    setLoadingId(pkg.id);
    setError(null);
    try {
      const res = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: pkg.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi');
      if (data.redirectUrl) router.push(data.redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-blue-100">
          <Star size={14} className="fill-blue-700" />
          Aktif hingga SKD CPNS 2026 berakhir
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Pilih Paket Belajar Kamu</h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Investasi terbaik untuk lolos SKD CPNS 2026. Akses penuh hingga ujian selesai di bulan November.
        </p>
        {error && (
          <div className="mt-4 inline-block bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>
        )}
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <div key={pkg.id} className={`relative rounded-2xl p-6 flex flex-col border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
              ${pkg.isPremium ? 'bg-blue-600 border-blue-500 shadow-blue-200 shadow-lg' : ''}
              ${pkg.isPlatinum ? 'bg-slate-900 border-slate-700' : ''}
              ${pkg.isFree ? 'bg-white border-slate-200' : ''}
            `}>
              {pkg.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap
                  ${pkg.isPremium ? 'bg-white text-blue-600' : 'bg-amber-400 text-slate-900'}
                `}>{pkg.badge}</div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                  ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-amber-400' : 'bg-slate-100'}
                `}>
                  <Icon size={20} className={pkg.isPlatinum ? 'text-slate-900' : pkg.isPremium ? 'text-white' : 'text-slate-600'} />
                </div>
                <div>
                  <p className={`font-bold text-lg leading-tight ${pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-900'}`}>{pkg.name}</p>
                  <p className={`text-xs ${pkg.isPremium ? 'text-blue-100' : pkg.isPlatinum ? 'text-slate-400' : 'text-slate-400'}`}>{pkg.period}</p>
                </div>
              </div>
              <div className="mb-4">
                <span className={`text-3xl font-bold ${pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-900'}`}>
                  {pkg.price === 0 ? 'Gratis' : pkg.priceLabel}
                </span>
                <p className={`text-xs mt-1 ${pkg.isPremium ? 'text-blue-100' : pkg.isPlatinum ? 'text-slate-400' : 'text-slate-400'}`}>{pkg.description}</p>
              </div>
              <div className={`h-px mb-4 ${pkg.isPremium ? 'bg-blue-500' : pkg.isPlatinum ? 'bg-slate-700' : 'bg-slate-100'}`} />
              <ul className="space-y-2.5 mb-6 flex-1">
                {pkg.features.map((feature, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-sm
                    ${pkg.disabledFeatures.includes(i) ? 'opacity-40 line-through' : pkg.isPremium || pkg.isPlatinum ? 'text-white' : 'text-slate-700'}
                  `}>
                    <Check size={15} className={`mt-0.5 flex-shrink-0 ${pkg.isPremium ? 'text-blue-200' : pkg.isPlatinum ? 'text-amber-400' : 'text-green-500'}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleBuy(pkg)}
                disabled={loadingId === pkg.id}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                  ${pkg.isPremium ? 'bg-white text-blue-600 hover:bg-blue-50' : ''}
                  ${pkg.isPlatinum ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' : ''}
                  ${pkg.isFree ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : ''}
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                {loadingId === pkg.id ? <Loader2 size={16} className="animate-spin" /> : <>{pkg.cta}<ArrowRight size={15} /></>}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-center text-slate-400 text-xs mt-8">
        Pembayaran aman & terenkripsi. Didukung oleh Midtrans. Butuh bantuan? Hubungi kami di support@pintuasn.com
      </p>
    </div>
  );
}