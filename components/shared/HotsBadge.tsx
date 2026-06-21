'use client';

// ============================================================
// components/shared/HotsBadge.tsx
// ------------------------------------------------------------
// Badge "HOTS" (Higher Order Thinking Skills) dengan aksen api.
// Dipasang di pojok kanan atas card paket tryout, di atas badge
// tier. Tampil hanya jika paket di-flag is_hots oleh admin.
// ============================================================

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

type HotsSize = 'sm' | 'md';

const SIZE: Record<HotsSize, { wrap: string; icon: number; text: string }> = {
  sm: { wrap: 'px-1.5 py-0.5 gap-0.5', icon: 9,  text: 'text-[9px]'  },
  md: { wrap: 'px-2 py-0.5 gap-1',     icon: 11, text: 'text-[10px]' },
};

export function HotsBadge({
  size = 'md',
  className,
}: {
  size?: HotsSize;
  className?: string;
}) {
  const s = SIZE[size];

  return (
    <span
      title="Soal HOTS — Higher Order Thinking Skills"
      className={cn(
        'relative inline-flex items-center rounded-full font-black uppercase tracking-wider text-white',
        'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600',
        'shadow-[0_0_10px_rgba(249,115,22,0.55)] ring-1 ring-orange-300/60',
        s.wrap,
        s.text,
        className,
      )}
    >
      {/* lapisan kilau api lembut */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/0 to-white/25" />
      <Flame
        size={s.icon}
        className="relative animate-pulse text-yellow-200 drop-shadow-[0_0_3px_rgba(254,240,138,0.9)]"
        fill="currentColor"
      />
      <span className="relative">HOTS</span>
    </span>
  );
}
