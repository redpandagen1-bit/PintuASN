'use client';

// components/mobile/MobilePackageDetail.tsx
// Mobile package detail — feature-parity with desktop

import Link from 'next/link';
import {
  BookOpen, BrainCircuit, Users,
  Target, Clock, FileText, AlertCircle,
  PlayCircle, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExamInstructionsModal } from '@/components/exam/exam-instructions-modal';

// ── Types ─────────────────────────────────────────────────────

interface MobilePackageDetailProps {
  packageId:        string;
  title:            string;
  description?:     string | null;
  difficulty:       string;
  tier?:            string | null;
  hasActiveAttempt: boolean;
  activeAttemptId?: string | null;
}

// ── Constants ─────────────────────────────────────────────────

const TOTAL_QUESTIONS = 110;
const DURATION_MINUTES = 100;
const DISTRIBUTION     = { twk: 30, tiu: 35, tkp: 45 };
const PASSING_GRADE    = { twk: 65, tiu: 80, tkp: 166 };

// ── Helpers ───────────────────────────────────────────────────

function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case 'easy':   return { label: 'Mudah',  cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    case 'hard':   return { label: 'Sulit',  cls: 'bg-red-500/20 text-red-300 border-red-500/30'             };
    default:       return { label: 'Sedang', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'    };
  }
}

function getTierBadge(tier?: string | null) {
  switch (tier) {
    case 'premium':  return { label: 'Premium',  cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30'       };
    case 'platinum': return { label: 'Platinum', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    default:         return { label: 'Gratis',   cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  }
}

// ── Component ─────────────────────────────────────────────────

export function MobilePackageDetail({
  packageId,
  title,
  description,
  difficulty,
  tier,
  hasActiveAttempt,
  activeAttemptId,
}: MobilePackageDetailProps) {
  const diffBadge = getDifficultyBadge(difficulty);
  const tierBadge = getTierBadge(tier);

  return (
    <main className="pb-24">

      {/* ══════════════════════════════════════════════════════
          HERO — bg-slate-800, rounded bottom corners
      ══════════════════════════════════════════════════════ */}
      <div className="bg-slate-800 relative overflow-hidden rounded-3xl mx-3 mt-3 shadow-xl">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-4 pt-4 pb-6">

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full border', diffBadge.cls)}>
              {diffBadge.label}
            </span>
            <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full border', tierBadge.cls)}>
              {tierBadge.label}
            </span>
          </div>

          {/* Title + Button — same row */}
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-xl font-extrabold text-white leading-tight flex-1">
              {title}
            </h1>
            <div className="flex-shrink-0 mt-1">
              {hasActiveAttempt && activeAttemptId ? (
                <Link href={`/exam/${activeAttemptId}`}>
                  <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 hover:text-white text-slate-900 font-bold py-2 px-4 rounded-full text-sm transition-all shadow-[0_4px_14px_rgba(250,204,21,0.45)] hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap">
                    <PlayCircle size={15} />
                    Lanjutkan
                  </button>
                </Link>
              ) : (
                <div className="[&_button]:flex [&_button]:items-center [&_button]:gap-2 [&_button]:bg-yellow-400 [&_button:hover]:bg-yellow-500 [&_button:hover]:text-white [&_button]:text-slate-900 [&_button]:font-bold [&_button]:py-2 [&_button]:px-4 [&_button]:rounded-full [&_button]:border-0 [&_button]:text-sm [&_button]:transition-all [&_button]:shadow-[0_4px_14px_rgba(250,204,21,0.45)] [&_button]:whitespace-nowrap">
                  <ExamInstructionsModal packageId={packageId} />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CONTENT SECTIONS
      ══════════════════════════════════════════════════════ */}
      <div className="px-4 pt-4 space-y-4">

        {/* ── Quick Stats ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm border border-slate-100">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Soal</p>
              <p className="text-xl font-extrabold text-slate-800 leading-tight">{TOTAL_QUESTIONS}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm border border-slate-100">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Durasi</p>
              <p className="text-xl font-extrabold text-slate-800 leading-tight">{DURATION_MINUTES} <span className="text-sm font-semibold text-slate-500">mnt</span></p>
            </div>
          </div>
        </div>

        {/* ── Warning ───────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">Perhatian</p>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              Semua kategori harus memenuhi nilai ambang batas. Pastikan koneksi internet stabil sebelum memulai.
            </p>
          </div>
        </div>

        {/* ── Passing Grade ─────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-2">
            <Target size={14} className="text-yellow-600" />
            <h2 className="font-bold text-slate-800 text-sm">Target Passing Grade</h2>
          </div>
          <div className="p-4 space-y-3">
            {[
              { key: 'TWK', label: 'Tes Wawasan Kebangsaan',    value: PASSING_GRADE.twk, Icon: BookOpen,     cls: 'bg-blue-50 text-blue-600'    },
              { key: 'TIU', label: 'Tes Intelegensia Umum',     value: PASSING_GRADE.tiu, Icon: BrainCircuit, cls: 'bg-emerald-50 text-emerald-600' },
              { key: 'TKP', label: 'Tes Karakteristik Pribadi', value: PASSING_GRADE.tkp, Icon: Users,        cls: 'bg-purple-50 text-purple-600'  },
            ].map((item, i) => (
              <div key={item.key}>
                {i > 0 && <div className="h-px bg-slate-100 mb-3" />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', item.cls)}>
                      <item.Icon size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.key}</p>
                      <p className="text-[10px] text-slate-400">{item.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 mb-0.5">Nilai Minimal</p>
                    <p className="text-lg font-black text-slate-800">≥ {item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Distribusi Soal ───────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-2">
            <FileText size={14} className="text-slate-500" />
            <h2 className="font-bold text-slate-800 text-sm">Distribusi Jumlah Soal</h2>
          </div>
          <div className="p-4">
            {/* Segmented bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden mb-4">
              <div className="bg-indigo-500 transition-all" style={{ width: `${(DISTRIBUTION.twk / TOTAL_QUESTIONS) * 100}%` }} />
              <div className="bg-emerald-500 transition-all" style={{ width: `${(DISTRIBUTION.tiu / TOTAL_QUESTIONS) * 100}%` }} />
              <div className="bg-purple-500 transition-all"  style={{ width: `${(DISTRIBUTION.tkp / TOTAL_QUESTIONS) * 100}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'TWK', count: DISTRIBUTION.twk, dot: 'bg-indigo-500',  bg: 'bg-indigo-50'  },
                { label: 'TIU', count: DISTRIBUTION.tiu, dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
                { label: 'TKP', count: DISTRIBUTION.tkp, dot: 'bg-purple-500',  bg: 'bg-purple-50'  },
              ].map(item => (
                <div key={item.label} className={cn('rounded-xl p-3 text-center', item.bg)}>
                  <div className={cn('w-2 h-2 rounded-full mx-auto mb-1.5', item.dot)} />
                  <p className="text-2xl font-black text-slate-800 leading-none mb-1">{item.count}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Soal {item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Instruksi ringkas ─────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-slate-500" />
            <h2 className="font-bold text-slate-800 text-sm">Petunjuk Ujian</h2>
          </div>
          <ul className="p-4 space-y-2">
            {[
              'Waktu pengerjaan 100 menit tidak dapat dijeda.',
              'Jawaban tersimpan otomatis setiap 60 detik.',
              'Jangan menutup atau me-refresh browser selama ujian.',
              'Pastikan koneksi internet stabil sebelum memulai.',
              'Setiap kategori memiliki nilai ambang batas minimum.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <ChevronRight size={12} className="text-slate-400 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════
          FIXED BOTTOM CTA — sits above BottomNav (bottom-16)
          BottomNav: fixed bottom-0 z-50 ~64px tall
          CTA:       fixed bottom-16 z-40 → clears BottomNav
      ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-lg px-4 py-3">
        {hasActiveAttempt && activeAttemptId ? (
          <Link href={`/exam/${activeAttemptId}`}>
            <button className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 hover:text-white text-slate-900 font-extrabold py-3 rounded-xl text-sm transition-colors">
              <PlayCircle size={16} />
              Lanjutkan Tryout
            </button>
          </Link>
        ) : (
          <div className="[&_button]:w-full [&_button]:bg-yellow-400 [&_button:hover]:bg-yellow-500 [&_button:hover]:text-white [&_button]:text-slate-900 [&_button]:font-extrabold [&_button]:py-3 [&_button]:rounded-xl [&_button]:border-0 [&_button]:text-sm [&_button]:transition-colors">
            <ExamInstructionsModal packageId={packageId} />
          </div>
        )}
      </div>

    </main>
  );
}
