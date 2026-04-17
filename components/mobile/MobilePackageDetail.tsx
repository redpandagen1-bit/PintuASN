'use client';

// components/mobile/MobilePackageDetail.tsx
// Mobile-only package detail page — Pathfinder Navy MD3 design

import Link from 'next/link';
import { ArrowLeft, BookOpen, BrainCircuit, Users, Target, Clock, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExamInstructionsModal } from '@/components/exam/exam-instructions-modal';

// ── Types ─────────────────────────────────────────────────────

interface PackageDetailProps {
  packageId:    string;
  title:        string;
  description?: string | null;
  difficulty:   string;
  tier?:        string | null;
  hasActiveAttempt: boolean;
  activeAttemptId?: string | null;
}

// ── Helpers ───────────────────────────────────────────────────

function getDifficultyConfig(difficulty: string) {
  switch (difficulty) {
    case 'easy':   return { label: 'Mudah', dotCls: 'bg-emerald-500', textCls: 'text-emerald-600', bgCls: 'bg-emerald-100' };
    case 'hard':   return { label: 'Sulit',  dotCls: 'bg-md-error',   textCls: 'text-md-error',   bgCls: 'bg-red-100'     };
    default:       return { label: 'Sedang', dotCls: 'bg-md-secondary', textCls: 'text-md-secondary', bgCls: 'bg-md-secondary-container' };
  }
}

const TOTAL_QUESTIONS = 110;
const DISTRIBUTION    = { twk: 30, tiu: 35, tkp: 45 };
const PASSING_GRADE   = { twk: 65, tiu: 80, tkp: 166 };

// ── Component ─────────────────────────────────────────────────

export function MobilePackageDetail({
  packageId,
  title,
  description,
  difficulty,
  tier,
  hasActiveAttempt,
  activeAttemptId,
}: PackageDetailProps) {
  const diff = getDifficultyConfig(difficulty);

  const tierBadge = tier === 'premium'
    ? { label: 'PREMIUM',  cls: 'bg-amber-100 text-amber-700' }
    : tier === 'platinum'
    ? { label: 'PLATINUM', cls: 'bg-purple-100 text-purple-700' }
    : { label: 'GRATIS',   cls: 'bg-emerald-100 text-emerald-700' };

  return (
    <main className="pb-36 px-5 pt-2">

      {/* ── Back ──────────────────────────────────────────────── */}
      <Link
        href="/daftar-tryout"
        className="inline-flex items-center gap-2 text-md-on-surface-variant text-sm mb-6 active-press"
      >
        <ArrowLeft size={16} /> Kembali
      </Link>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-md-primary rounded-3xl p-6 text-white overflow-hidden mb-6 shadow-md3-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-md-secondary opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className={cn('text-[10px] font-bold px-3 py-1 rounded-full', diff.bgCls, diff.textCls)}>
              {diff.label}
            </span>
            <span className={cn('text-[10px] font-bold px-3 py-1 rounded-full', tierBadge.cls)}>
              {tierBadge.label}
            </span>
            <span className="text-white/50 text-xs ml-auto">SKD CPNS</span>
          </div>

          <h1 className="text-2xl font-extrabold leading-tight mb-3"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {title}
          </h1>

          {description && (
            <p className="text-white/70 text-sm leading-relaxed">{description}</p>
          )}
        </div>
      </section>

      {/* ── Quick Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md3-sm">
          <div className="w-10 h-10 rounded-xl bg-md-surface-container-low flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-md-primary" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
              {TOTAL_QUESTIONS}
            </p>
            <p className="text-[10px] font-bold text-md-on-surface-variant uppercase tracking-wide">Total Soal</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md3-sm">
          <div className="w-10 h-10 rounded-xl bg-md-surface-container-low flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-md-secondary" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
              100
            </p>
            <p className="text-[10px] font-bold text-md-on-surface-variant uppercase tracking-wide">Menit</p>
          </div>
        </div>
      </div>

      {/* ── Warning ───────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800 text-xs font-medium leading-relaxed">
          Semua kategori harus memenuhi nilai ambang batas. Pastikan koneksi internet stabil sebelum memulai.
        </p>
      </div>

      {/* ── Passing Grade ─────────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-md3-sm overflow-hidden mb-6">
        <div className="border-b border-md-outline-variant/10 bg-md-surface-container-low/50 px-5 py-4 flex items-center gap-2">
          <Target size={16} className="text-md-secondary" />
          <h2 className="font-bold text-md-on-surface text-sm">Target Passing Grade</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: 'TWK', label: 'Tes Wawasan Kebangsaan',    value: PASSING_GRADE.twk, icon: <BookOpen size={15} />,    cls: 'bg-blue-50 text-blue-600'   },
            { key: 'TIU', label: 'Tes Intelegensia Umum',     value: PASSING_GRADE.tiu, icon: <BrainCircuit size={15} />, cls: 'bg-emerald-50 text-emerald-600' },
            { key: 'TKP', label: 'Tes Karakteristik Pribadi', value: PASSING_GRADE.tkp, icon: <Users size={15} />,        cls: 'bg-purple-50 text-purple-600' },
          ].map((item, i) => (
            <div key={item.key}>
              {i > 0 && <div className="h-px bg-md-outline-variant/10 mb-4" />}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', item.cls)}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-md-on-surface">{item.key}</p>
                    <p className="text-xs text-md-on-surface-variant">{item.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-md-on-surface-variant mb-0.5">Nilai Minimal</p>
                  <p className="text-xl font-extrabold text-md-primary" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    ≥ {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Distribusi Soal ───────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-md3-sm overflow-hidden mb-6">
        <div className="border-b border-md-outline-variant/10 bg-md-surface-container-low/50 px-5 py-4 flex items-center gap-2">
          <FileText size={16} className="text-md-on-surface-variant" />
          <h2 className="font-bold text-md-on-surface text-sm">Distribusi Jumlah Soal</h2>
        </div>
        <div className="p-5">
          {/* Bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-5">
            <div className="bg-indigo-500" style={{ width: `${(DISTRIBUTION.twk / TOTAL_QUESTIONS) * 100}%` }} />
            <div className="bg-emerald-500" style={{ width: `${(DISTRIBUTION.tiu / TOTAL_QUESTIONS) * 100}%` }} />
            <div className="bg-purple-500"  style={{ width: `${(DISTRIBUTION.tkp / TOTAL_QUESTIONS) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'TWK', count: DISTRIBUTION.twk, dot: 'bg-indigo-500' },
              { label: 'TIU', count: DISTRIBUTION.tiu, dot: 'bg-emerald-500' },
              { label: 'TKP', count: DISTRIBUTION.tkp, dot: 'bg-purple-500'  },
            ].map(item => (
              <div key={item.label} className="bg-md-surface-container-low rounded-xl p-3 text-center">
                <div className={cn('w-2 h-2 rounded-full mx-auto mb-2', item.dot)} />
                <p className="text-2xl font-extrabold text-md-primary leading-none mb-1"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {item.count}
                </p>
                <p className="text-[10px] font-bold text-md-on-surface-variant uppercase tracking-wide">
                  Soal {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fixed Bottom CTA ──────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full p-5 bg-white/80 backdrop-blur-xl border-t border-md-outline-variant/10 z-40">
        <div className="max-w-md mx-auto">
          {hasActiveAttempt && activeAttemptId ? (
            <Link href={`/exam/${activeAttemptId}`}>
              <button className="w-full bg-md-secondary-container text-md-primary font-extrabold py-4 rounded-2xl text-sm active-press"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                Lanjutkan Tryout
              </button>
            </Link>
          ) : (
            <div className="[&_button]:w-full [&_button]:bg-md-primary [&_button]:text-white [&_button]:font-extrabold [&_button]:py-4 [&_button]:rounded-2xl [&_button]:text-sm [&_button]:border-0">
              <ExamInstructionsModal packageId={packageId} />
            </div>
          )}
        </div>
      </div>

    </main>
  );
}
