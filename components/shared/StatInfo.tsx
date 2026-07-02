'use client';

// ============================================================
// components/shared/StatInfo.tsx
//
// Tombol "i" bulat keciiiil di pojok kanan atas tiap statistik.
// Saat diklik memunculkan popover kecil berisi penjelasan singkat.
//
//  - Statistik yang BISA diakses user (tier gratis/premium sesuai
//    haknya): popover cuma menampilkan teks penjelasan.
//  - Statistik yang TERKUNCI (butuh upgrade tier): popover juga
//    menampilkan CONTOH tampilan berupa data dummy, biar user tahu
//    fitur ini isinya seperti apa sebelum memutuskan upgrade.
//
// Dipakai di: halaman Statistik, hasil Drilling, dan hasil Exam.
// ============================================================

import { Info, Lock } from 'lucide-react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface StatInfoProps {
  /** Penjelasan singkat apa arti / gunanya statistik ini. */
  explanation: React.ReactNode;
  /** true jika statistik ini masih terkunci untuk tier user sekarang. */
  locked?: boolean;
  /**
   * Contoh tampilan (data dummy) yang muncul HANYA saat locked.
   * Dipakai supaya user paham isi fitur sebelum upgrade.
   */
  preview?: React.ReactNode;
  /** Tujuan tombol upgrade pada popover locked. */
  upgradeHref?: string;
  /** Label tier yang dibutuhkan (mis. "Platinum"). */
  tierLabel?: string;
  /**
   * Warna tombol menyesuaikan latar kartu:
   *  - 'dark'  : untuk kartu berlatar terang (ikon abu gelap) -> default
   *  - 'light' : untuk kartu berlatar gelap (ikon terang)
   */
  variant?: 'dark' | 'light';
  /** class tambahan untuk tombol (biasanya untuk absolute-positioning). */
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function StatInfo({
  explanation,
  locked = false,
  preview,
  upgradeHref = '/beli-paket',
  tierLabel = 'Platinum',
  variant = 'dark',
  className,
  side = 'bottom',
  align = 'end',
}: StatInfoProps) {
  const showPreview = locked && preview;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Penjelasan statistik"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            // Kuning solid + ikon gelap = kontras tinggi, terlihat jelas
            // termasuk di PWA Android. flex-none supaya tidak ikut mengecil.
            'inline-flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full',
            'bg-yellow-400 text-slate-900 shadow-sm transition-colors hover:bg-yellow-300',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/60',
            variant === 'light' ? 'ring-1 ring-white/30' : '',
            className,
          )}
        >
          <Info className="h-3 w-3" strokeWidth={2.75} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        onClick={(e) => e.stopPropagation()}
        className="w-64 p-0 overflow-hidden rounded-xl border-slate-200 shadow-lg"
      >
        {/* Penjelasan (selalu tampil) */}
        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Tentang statistik ini
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">{explanation}</p>
        </div>

        {/* Contoh dummy (hanya saat terkunci) */}
        {showPreview && (
          <div className="border-t border-slate-100 bg-slate-50 p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Lock className="h-3 w-3 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
                Contoh tampilan
              </span>
            </div>

            {/* Data dummy - jelas ditandai bukan data asli */}
            <div className="relative rounded-lg border border-slate-200 bg-white p-2.5 overflow-hidden">
              <div className="pointer-events-none select-none">{preview}</div>
              <span className="absolute right-1.5 top-1.5 rounded bg-slate-800/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                Contoh
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Ini contoh dengan data dummy. Upgrade{' '}
              <span className="font-semibold text-slate-700">{tierLabel}</span>{' '}
              untuk melihat data asli kamu.
            </p>
            <Link
              href={upgradeHref}
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-yellow-400 px-3 py-1.5 text-[11px] font-bold text-slate-900 transition-colors hover:bg-yellow-300"
            >
              Upgrade {tierLabel} →
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Mini-preview dummy — ilustrasi ringan (tanpa recharts) untuk popover     */
/* ─────────────────────────────────────────────────────────────────────── */

/** Grafik garis mini (untuk tren skor / progres). */
export function MiniLinePreview() {
  return (
    <svg viewBox="0 0 120 44" className="h-11 w-full" preserveAspectRatio="none">
      <polyline
        points="2,38 22,30 42,32 62,20 82,22 102,10 118,8"
        fill="none"
        stroke="#facc15"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="2,38 22,30 42,32 62,20 82,22 102,10 118,8"
        fill="url(#miniLineFill)"
        stroke="none"
        opacity="0.15"
        style={{ transform: 'scaleY(1)' }}
      />
      <defs>
        <linearGradient id="miniLineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Batang mini (untuk kecepatan / soal salah per kategori). */
export function MiniBarsPreview() {
  const bars = [
    { h: 60, c: '#38bdf8' },
    { h: 85, c: '#34d399' },
    { h: 45, c: '#a78bfa' },
  ];
  return (
    <div className="flex h-11 items-end justify-around gap-2 px-1">
      {bars.map((b, i) => (
        <div
          key={i}
          className="w-5 rounded-t"
          style={{ height: `${b.h}%`, backgroundColor: b.c }}
        />
      ))}
    </div>
  );
}

/** Donut mini (untuk ringkasan akurasi jawaban). */
export function MiniDonutPreview() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-11 w-11 flex-shrink-0 rounded-full"
        style={{
          background:
            'conic-gradient(#10b981 0% 68%, #f43f5e 68% 86%, #94a3b8 86% 100%)',
        }}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-white" />
        </div>
      </div>
      <div className="space-y-1 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Benar
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" /> Salah
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-400" /> Kosong
        </div>
      </div>
    </div>
  );
}

/** Tabel mini (untuk riwayat percobaan). */
export function MiniTablePreview() {
  const rows = [
    { d: '12 Jun', t: 412, ok: true },
    { d: '08 Jun', t: 388, ok: false },
    { d: '03 Jun', t: 356, ok: false },
  ];
  return (
    <div className="space-y-1">
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex items-center justify-between text-[10px] text-slate-500"
        >
          <span>{r.d}</span>
          <span className="font-bold text-slate-700">{r.t}</span>
          <span
            className={cn(
              'rounded px-1.5 py-0.5 font-bold',
              r.ok
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-500',
            )}
          >
            {r.ok ? 'Lulus' : 'Belum'}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Daftar item mini (untuk soal salah / soal terlama). */
export function MiniListPreview() {
  const rows = ['Soal #14 · TIU', 'Soal #7 · TWK', 'Soal #22 · TKP'];
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span className="flex-1 truncate">{r}</span>
          <span className="font-semibold text-slate-600">1m 20d</span>
        </div>
      ))}
    </div>
  );
}
