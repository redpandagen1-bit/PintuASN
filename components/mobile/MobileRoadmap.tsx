'use client';

// components/mobile/MobileRoadmap.tsx
// Mobile PWA Roadmap — hero + peta perjalanan belajar

import { RoadmapPath }       from '@/components/roadmap/RoadmapPath';
import type { PathSection } from '@/types/roadmap';
import { Map } from 'lucide-react';

interface MobileRoadmapProps {
  sections: PathSection[];
}

export function MobileRoadmap({ sections }: MobileRoadmapProps) {
  return (
    <main className="bg-slate-50 min-h-screen">

      {/* ── Hero: compact navy banner ─────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 pt-5 pb-6 mx-4 mt-4 rounded-2xl shadow-lg shadow-slate-800/20">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-12 -right-10 w-40 h-40 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#F5A623]/20 text-[#F5A623] text-[10px] font-extrabold px-2.5 py-1 rounded-full mb-3 uppercase tracking-widest">
            <Map className="w-3 h-3" /> Roadmap CPNS 2026
          </div>

          <h1 className="text-xl font-extrabold text-white leading-tight"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            Jalur Persiapan<br />
            <span className="text-[#F5A623]">SKD CPNS 2026</span>
          </h1>
          <p className="text-xs text-white/60 mt-2">
            Buka satu per satu titik untuk melanjutkan perjalanan belajarmu.
          </p>
        </div>
      </div>

      {/* ── Peta Perjalanan Belajar ────────────────────────── */}
      <div className="px-4 pt-4">
        <RoadmapPath sections={sections} />
      </div>

      {/* Bottom spacer for BottomNav */}
      <div className="h-24" />
    </main>
  );
}
