'use client';

// ============================================================
// components/roadmap/PeluangProjection.tsx
// Kartu "Proyeksi Peluang Lolos" — memakai data Peluang Formasi
// (percentile nasional + instansi tujuan).
// ============================================================

import Link from 'next/link';
import { Gauge, ArrowRight, TrendingUp, Building2 } from 'lucide-react';
import type { PeluangFormasi } from '@/lib/supabase/peluang-formasi';

function classify(pct: number | null): { label: string; ring: string; chip: string } {
  if (pct == null) return { label: 'Belum ada data', ring: '#94a3b8', chip: 'bg-slate-100 text-slate-500' };
  if (pct >= 75)   return { label: 'Peluang Besar',   ring: '#10b981', chip: 'bg-emerald-100 text-emerald-700' };
  if (pct >= 50)   return { label: 'Bersaing',        ring: '#f59e0b', chip: 'bg-amber-100 text-amber-700' };
  return { label: 'Perlu Ditingkatkan', ring: '#fb923c', chip: 'bg-orange-100 text-orange-700' };
}

export function PeluangProjection({ peluang }: { peluang: PeluangFormasi | null }) {
  const pct = peluang?.nationalPercentile ?? null;
  const cls = classify(pct);
  const hasData = !!peluang?.hasData;

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#1B2B5E]/8 flex items-center justify-center">
          <Gauge className="w-4 h-4 text-[#1B2B5E]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-extrabold text-[#1B2B5E]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Proyeksi Peluang Lolos
          </h3>
          <p className="text-[11px] text-slate-400">Estimasi daya saingmu, bukan hasil resmi BKN.</p>
        </div>
      </div>

      <div className="px-5 pb-5">
        {!hasData ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 mb-3">
              Kerjakan tryout dan tetapkan instansi tujuan untuk melihat proyeksi peluangmu.
            </p>
            <Link
              href="/peluang-formasi"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B2B5E] text-white text-xs font-bold hover:bg-[#1B2B5E]/90 transition"
            >
              Buka Peluang Formasi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              {/* Ring percentile */}
              <div
                className="relative w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: `conic-gradient(${cls.ring} ${(pct ?? 0) * 3.6}deg, #eef2f7 0deg)` }}
              >
                <div className="rounded-full bg-white flex flex-col items-center justify-center"
                  style={{ width: 60, height: 60 }}>
                  <span className="text-lg font-extrabold text-slate-800 leading-none">{pct ?? 0}%</span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wide">unggul</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${cls.chip}`}>
                  {cls.label}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Skor terbaikmu <span className="font-bold text-slate-800">{peluang!.finalScore}</span> mengungguli{' '}
                  <span className="font-bold text-slate-800">{pct}%</span> peserta PintuASN secara nasional.
                </p>
              </div>
            </div>

            {/* Instansi tujuan */}
            {peluang!.instansi && peluang!.instansiRank != null && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500 flex-1 truncate">
                  Di <span className="font-semibold text-slate-700">{peluang!.instansi}</span>
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[#1B2B5E]">
                  <TrendingUp className="w-3 h-3" /> Peringkat #{peluang!.instansiRank}
                </span>
              </div>
            )}

            <Link
              href="/peluang-formasi"
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1B2B5E] text-xs font-bold transition"
            >
              Lihat Detail Peluang <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
