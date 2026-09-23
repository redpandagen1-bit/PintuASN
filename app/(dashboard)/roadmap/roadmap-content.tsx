// app/(dashboard)/roadmap/roadmap-content.tsx
'use client';

import type { PathSection } from '@/types/roadmap';
import { RoadmapPath }       from '@/components/roadmap/RoadmapPath';
import { Map } from 'lucide-react';

interface RoadmapContentProps {
  sections: PathSection[];
}

export function RoadmapContent({ sections }: RoadmapContentProps) {
  return (
    <div className="min-h-screen bg-slate-50 -mt-2 pb-10">

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className="relative bg-[#1B2B5E] overflow-hidden rounded-2xl mb-6 shadow-lg shadow-[#1B2B5E]/20">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-white/[0.04]" />
          <div className="absolute top-6 right-28 w-36 h-36 rounded-full bg-[#F5A623]/10" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/[0.04]" />
          <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-[#F5A623]/5" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative px-5 pt-5 pb-5 md:px-6 md:pt-6 md:pb-6">
          <div className="inline-flex items-center gap-1.5 bg-[#F5A623]/20 text-[#F5A623] text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
            <Map className="w-3 h-3" />
            Roadmap Belajar
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Jalur Persiapan<br />
            <span className="text-[#F5A623]">SKD CPNS 2026</span>
          </h1>
          <p className="text-sm text-white/60 max-w-md">
            Buka satu per satu titik untuk melanjutkan perjalanan belajarmu.
          </p>
        </div>
      </div>

      {/* ── Peta Perjalanan Belajar ────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <RoadmapPath sections={sections} />
      </div>
    </div>
  );
}
