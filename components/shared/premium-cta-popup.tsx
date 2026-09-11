'use client';

// ============================================================
// components/shared/premium-cta-popup.tsx
//
// Popup CTA berlangganan di halaman Dashboard. Muncul sekali tiap
// kali aplikasi dibuka — termasuk saat PWA dilaunch dari home screen,
// yang start_url-nya memang /dashboard. Tombolnya membuat order
// langsung lalu melempar user ke halaman pembayaran
// (/pembayaran/<orderId>).
//
// Catatan PWA: penanda "sudah dilihat" TIDAK boleh bergantung pada
// hook Clerk di client. Saat PWA cold start, Clerk sempat belum
// terhidrasi dan sessionId masih undefined; kalau itu jadi syarat,
// popup bisa tidak pernah tampil. userId dioper dari server saja.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, Zap, Crown, ArrowRight, Check, Loader2,
  ShieldCheck, Flame, Sparkles,
} from 'lucide-react';

type Plan = 'premium' | 'platinum';
type Tier = 'free' | 'premium' | 'platinum';

// Jeda sebelum popup muncul — biar halaman sempat ke-render dulu.
const SHOW_DELAY_MS = 1200;

const seenKey = (userId: string) => `pintuasn:premium-cta-seen:${userId}`;

const PLANS: Record<Plan, {
  name: string; price: string; original: string; period: string;
  badge: string; tagline: string; features: string[];
}> = {
  premium: {
    name:     'Premium',
    price:    'Rp 99.000',
    original: 'Rp 200.000',
    period:   'masa aktif 6 bulan',
    badge:    'Paling Banyak Dipilih',
    tagline:  'Semua yang kamu butuhkan untuk lolos SKD.',
    features: [
      'Semua tryout & materi Premium terbuka',
      'Pembahasan lengkap di setiap soal',
      'Statistik performa & peringkat nasional',
      'Latihan Soal SKD (TWK, TIU, TKP)',
    ],
  },
  platinum: {
    name:     'Platinum',
    price:    'Rp 119.000',
    original: 'Rp 349.000',
    period:   'masa aktif 1 tahun',
    badge:    'Paling Lengkap',
    tagline:  'Beda Rp 20 ribu, isinya beda kelas.',
    features: [
      'Semua fitur Premium, tanpa terkecuali',
      'Tryout & materi Platinum eksklusif',
      'Laporan perkembangan belajar',
      'Riwayat tanpa batas & analisis waktu pengerjaan',
    ],
  },
};

export function PremiumCtaPopup({ userTier, userId }: { userTier: Tier; userId: string }) {
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [plan, setPlan]       = useState<Plan>('premium');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Penanda in-memory: menahan popup muncul lagi saat user pindah halaman
  // lalu balik ke dashboard. Hangus sendiri saat aplikasi/PWA dibuka ulang.
  const shownThisLaunch = useRef(false);

  // ── Tampilkan sekali tiap aplikasi dibuka, untuk user yang masih free ─────
  useEffect(() => {
    if (userTier !== 'free') return;

    const key = seenKey(userId);
    let seen = shownThisLaunch.current;
    try {
      if (sessionStorage.getItem(key)) seen = true;
    } catch { /* sessionStorage bisa diblokir — jangan jadikan penghalang */ }
    if (seen) return;

    // Penanda ditulis saat popup benar-benar tampil, bukan saat effect jalan.
    // Di React Strict Mode (dev) effect dieksekusi dua kali; kalau penanda
    // ditulis lebih awal, eksekusi kedua langsung berhenti dan popup tak pernah muncul.
    const timer = setTimeout(() => {
      shownThisLaunch.current = true;
      try { sessionStorage.setItem(key, '1'); } catch { /* ignore */ }
      setVisible(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [userTier, userId]);

  const close = useCallback(() => setVisible(false), []);

  // Esc untuk menutup
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, close]);

  // Kunci scroll selama popup terbuka. <html> ikut dikunci karena di PWA
  // standalone iOS, overflow di <body> saja kadang masih bisa di-scroll.
  useEffect(() => {
    if (!visible) return;
    const body = document.body.style.overflow;
    const html = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = body;
      document.documentElement.style.overflow = html;
    };
  }, [visible]);

  // ── CTA: bikin order lalu langsung ke halaman pembayaran ──────────────────
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/payment/charge', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ package_id: plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi');
      if (!data.redirectUrl) throw new Error('Halaman pembayaran tidak tersedia');
      setVisible(false);
      router.push(data.redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
      setLoading(false);
    }
  };

  if (!visible) return null;

  const active     = PLANS[plan];
  const isPlatinum = plan === 'platinum';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-cta-title"
    >
      {/* Backdrop dengan efek blur tipis */}
      <div
        className="absolute inset-0 touch-none bg-slate-950/55 backdrop-blur-[5px] animate-ctaFadeIn"
        onClick={close}
      />

      {/* Kartu */}
      <div className="cta-sheet relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-ctaPopIn">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 pt-6 pb-7 flex-shrink-0 overflow-hidden">
          {/* Glow dekoratif */}
          <div className="pointer-events-none absolute -top-16 -right-10 w-44 h-44 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 w-44 h-44 rounded-full bg-amber-400/15 blur-3xl" />

          <button
            onClick={close}
            aria-label="Tutup"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition z-10"
          >
            <X size={15} className="text-white/80" />
          </button>

          {/* Grip bar untuk mobile bottom-sheet */}
          <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/25" />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full mb-3 tracking-wide">
              <Flame size={11} /> PROMO SKD 2026 · HEMAT s/d 66%
            </div>

            <h2
              id="premium-cta-title"
              className="text-white text-[22px] leading-tight font-extrabold mb-2"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              Jangan cuma ikut ujian.<br />
              <span className="text-yellow-400">Menangkan formasinya.</span>
            </h2>

            <p className="text-slate-300 text-[13px] leading-relaxed">
              Satu formasi diperebutkan ratusan pelamar. Yang lolos bukan yang paling pintar,
              tapi yang paling siap. Buka semua tryout, pembahasan, dan analisis performamu sekarang.
            </p>
          </div>
        </div>

        {/* ── Isi ────────────────────────────────────────────────────────── */}
        <div className="cta-scroll flex-1 overflow-y-auto">
          {/* Pilihan paket */}
          <div className="px-5 pt-5 pb-1 grid grid-cols-2 gap-2.5">
            {(Object.keys(PLANS) as Plan[]).map((key) => {
              const p        = PLANS[key];
              const selected = plan === key;
              const Icon     = key === 'platinum' ? Crown : Zap;
              return (
                <button
                  key={key}
                  onClick={() => setPlan(key)}
                  className={`relative text-left rounded-2xl border-2 p-3 pt-5 transition-all
                    ${selected
                      ? key === 'platinum'
                        ? 'border-amber-400 bg-amber-50/70 shadow-sm'
                        : 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <span className={`absolute -top-2 left-3 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap
                    ${key === 'platinum' ? 'bg-amber-400 text-slate-900' : 'bg-blue-600 text-white'}`}>
                    {p.badge}
                  </span>

                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon size={14} className={key === 'platinum' ? 'text-amber-500' : 'text-blue-600'} />
                    <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                    {selected && (
                      <span className={`ml-auto w-4 h-4 rounded-full flex items-center justify-center
                        ${key === 'platinum' ? 'bg-amber-400' : 'bg-blue-600'}`}>
                        <Check size={10} className={key === 'platinum' ? 'text-slate-900' : 'text-white'} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-through leading-none mb-0.5">{p.original}</p>
                  <p className="text-slate-900 font-extrabold text-lg leading-none">{p.price}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{p.period}</p>
                </button>
              );
            })}
          </div>

          {/* Fitur paket terpilih */}
          <div className="px-5 pt-4">
            <p className="text-[13px] font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <Sparkles size={13} className={isPlatinum ? 'text-amber-500' : 'text-blue-600'} />
              {active.tagline}
            </p>
            <ul className="space-y-2">
              {active.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-700 leading-snug">
                  <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                    ${isPlatinum ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <Check size={10} className={isPlatinum ? 'text-amber-600' : 'text-blue-600'} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Alasan untuk tidak menunda */}
          <div className="px-5 pt-4">
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
              <Flame size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800 leading-snug">
                <span className="font-bold">Harga promo persiapan SKD 2026.</span>{' '}
                Setiap hari tanpa latihan terarah adalah jarak yang makin jauh dari pesaingmu.
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-5 cta-safe-bottom border-t border-slate-100 bg-white flex-shrink-0 space-y-2">
          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60
              ${isPlatinum
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Menyiapkan pembayaran…</>
              : <>Aktifkan {active.name} · {active.price} <ArrowRight size={15} /></>}
          </button>

          <button
            onClick={close}
            disabled={loading}
            className="w-full py-2 text-slate-400 hover:text-slate-600 font-medium text-[12px] transition disabled:opacity-60"
          >
            Nanti saja, lanjut pakai versi gratis
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={12} className="text-emerald-500" />
            Pembayaran aman · QRIS, VA & e-wallet · Aktif seketika
          </p>
        </div>
      </div>
    </div>
  );
}
