'use client';

// ============================================================
// components/statistics/PremiumGate.tsx
// Bungkus konten premium: bila terkunci -> konten di-blur + overlay
// gembok + CTA upgrade. Bila terbuka -> tampilkan apa adanya.
// ============================================================

import Link from 'next/link';
import { Lock } from 'lucide-react';

export function PremiumGate({
  locked,
  tierLabel = 'Platinum',
  children,
}: {
  locked: boolean;
  tierLabel?: string;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Konten asli di-blur sebagai teaser */}
      <div className="blur-[6px] pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* Overlay kunci */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-white/40 backdrop-blur-[1px] px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg">
          <Lock size={22} className="text-yellow-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Analitik Eksklusif {tierLabel}</p>
          <p className="text-xs text-slate-500 mt-0.5">Upgrade untuk membuka prediksi & peluang lengkapmu</p>
        </div>
        <Link
          href="/beli-paket"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-yellow-400/20"
        >
          Upgrade {tierLabel} →
        </Link>
      </div>
    </div>
  );
}
