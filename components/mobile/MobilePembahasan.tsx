'use client';

// components/mobile/MobilePembahasan.tsx
// Mobile-only pembahasan/review — Pathfinder Navy MD3 design

import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewData } from '@/types/database';

// ── Types ─────────────────────────────────────────────────────

type StatusFilter = 'semua' | 'benar' | 'salah' | 'kosong';

interface MobilePembahasanProps {
  reviewData: ReviewData;
}

// ── Constants ─────────────────────────────────────────────────

const FILTER_LABELS: Record<StatusFilter, string> = {
  semua:  'Semua',
  benar:  'Benar',
  salah:  'Salah',
  kosong: 'Kosong',
};

// ── Component ─────────────────────────────────────────────────

export function MobilePembahasan({ reviewData }: MobilePembahasanProps) {
  const [activeIndex, setActiveIndex]     = useState(0);
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('semua');
  const [showExplanation, setShowExplanation] = useState(false);

  const questions = reviewData.questions;

  const questionsWithStatus = useMemo(() => {
    return questions.map(q => {
      let status: 'benar' | 'salah' | 'kosong';
      if (!q.userChoice)           status = 'kosong';
      else if (q.category === 'TKP') status = (q.score ?? 0) >= 4 ? 'benar' : 'salah';
      else                         status = q.isCorrect ? 'benar' : 'salah';
      return { ...q, status };
    });
  }, [questions]);

  const filtered = useMemo(() => {
    if (statusFilter === 'semua') return questionsWithStatus;
    return questionsWithStatus.filter(q => q.status === statusFilter);
  }, [questionsWithStatus, statusFilter]);

  const activeQ = filtered[activeIndex] ?? null;

  // Reset index when filter changes
  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setActiveIndex(0);
    setShowExplanation(false);
  };

  const handlePrev = () => {
    if (activeIndex > 0) { setActiveIndex(i => i - 1); setShowExplanation(false); }
  };
  const handleNext = () => {
    if (activeIndex < filtered.length - 1) { setActiveIndex(i => i + 1); setShowExplanation(false); }
  };

  // Counts for summary
  const counts = useMemo(() => ({
    benar:  questionsWithStatus.filter(q => q.status === 'benar').length,
    salah:  questionsWithStatus.filter(q => q.status === 'salah').length,
    kosong: questionsWithStatus.filter(q => q.status === 'kosong').length,
  }), [questionsWithStatus]);

  return (
    <main className="pb-32 px-6 pt-4">

      {/* ── Question Counter & Status ─────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-label-sm text-md-on-surface-variant/60">Nomor Soal</span>
          <span className="text-2xl font-extrabold text-md-primary"
            style={{ fontFamily: 'var(--font-jakarta)' }}>
            {String(activeIndex + 1).padStart(2, '0')}
            <span className="text-lg font-normal text-md-on-surface-variant">/{filtered.length}</span>
          </span>
        </div>
        {activeQ && (
          <div className={cn(
            'px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider',
            activeQ.status === 'benar'  ? 'bg-emerald-100 text-emerald-700' :
            activeQ.status === 'salah'  ? 'bg-red-100 text-red-600' :
            'bg-md-surface-container text-md-on-surface-variant',
          )}>
            {activeQ.category} — {activeQ.status === 'benar' ? 'Benar' : activeQ.status === 'salah' ? 'Salah' : 'Kosong'}
          </div>
        )}
      </div>

      {/* ── Summary Stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['benar', 'salah', 'kosong'] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => handleFilterChange(s === statusFilter ? 'semua' : s)}
            className={cn(
              'p-3 rounded-xl text-center transition-all active-press',
              statusFilter === s
                ? s === 'benar' ? 'bg-emerald-100' : s === 'salah' ? 'bg-red-100' : 'bg-md-surface-container'
                : 'bg-white shadow-md3-sm',
            )}
          >
            <div className={cn(
              'text-xl font-extrabold',
              s === 'benar' ? 'text-emerald-600' : s === 'salah' ? 'text-red-600' : 'text-md-on-surface-variant',
            )} style={{ fontFamily: 'var(--font-jakarta)' }}>
              {counts[s as keyof typeof counts]}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-md-on-surface-variant">
              {FILTER_LABELS[s]}
            </div>
          </button>
        ))}
      </div>

      {activeQ ? (
        <>
          {/* ── Question Content ────────────────────────────────── */}
          <section className="bg-white p-6 rounded-xl shadow-md3-sm mb-5">
            <p className="leading-relaxed text-md-on-surface font-medium text-[15px]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(activeQ as any).questionText ?? (activeQ as any).question_text ?? 'Soal tidak tersedia'}
            </p>
          </section>

          {/* ── Options ─────────────────────────────────────────── */}
          <div className="space-y-3 mb-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {((activeQ as any).choices ?? []).map((choice: any, idx: number) => {
              const letter      = String.fromCharCode(65 + idx);
              const isUserChoice = choice.id === activeQ.userChoice?.id;
              const isCorrect   = choice.is_correct ?? choice.isCorrect;

              let optionCls = 'flex items-center p-4 rounded-xl gap-4 ';
              let letterCls = 'w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm ';
              let icon      = null;

              if (isCorrect) {
                optionCls += 'bg-emerald-50 outline outline-2 outline-emerald-300/30';
                letterCls += 'bg-emerald-500 text-white';
                icon       = <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />;
              } else if (isUserChoice && !isCorrect) {
                optionCls += 'bg-red-50 outline outline-2 outline-red-300/30';
                letterCls += 'bg-red-500 text-white';
                icon       = <XCircle size={18} className="text-red-500 flex-shrink-0" />;
              } else {
                optionCls += 'bg-md-surface-container-low';
                letterCls += 'bg-white text-md-on-surface-variant';
              }

              return (
                <div key={choice.id ?? idx} className={optionCls}>
                  <div className={letterCls}>{letter}</div>
                  <div className="flex-1 text-md-on-surface font-medium text-sm">
                    {choice.choice_text ?? choice.content ?? `Pilihan ${letter}`}
                  </div>
                  {icon}
                </div>
              );
            })}
          </div>

          {/* ── Explanation ─────────────────────────────────────── */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(activeQ as any).explanation && (
            <div className="bg-md-surface-container-high rounded-xl overflow-hidden mb-6">
              <button
                onClick={() => setShowExplanation(v => !v)}
                className="w-full flex items-center justify-between p-5 text-left bg-md-surface-container-highest/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-md-secondary text-lg">💡</span>
                  <span className="font-bold text-md-on-surface">Pembahasan Soal</span>
                </div>
                {showExplanation
                  ? <ChevronUp size={18} className="text-md-on-surface-variant" />
                  : <ChevronDown size={18} className="text-md-on-surface-variant" />
                }
              </button>
              {showExplanation && (
                <div className="p-5 bg-white">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <p className="text-sm text-md-on-surface-variant leading-relaxed">{(activeQ as any).explanation}</p>
                  <div className="mt-4 p-4 rounded-lg bg-md-surface-container-low border-l-4 border-md-secondary">
                    <span className="block text-label-sm text-md-secondary mb-1">Tips {activeQ.category}</span>
                    <p className="text-xs italic text-md-on-surface">
                      Baca kembali materi {activeQ.category} untuk memperkuat pemahaman.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Question Grid Navigator ─────────────────────────── */}
          <div className="mt-4 mb-6">
            <h3 className="font-bold text-md-on-surface mb-4 px-1">Navigasi Soal</h3>
            <div className="grid grid-cols-6 gap-2">
              {filtered.slice(0, 30).map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveIndex(i); setShowExplanation(false); }}
                  className={cn(
                    'h-10 flex items-center justify-center rounded-lg font-bold text-xs active-press',
                    i === activeIndex
                      ? 'bg-md-secondary text-md-primary outline outline-2 outline-offset-2 outline-md-secondary'
                      : q.status === 'benar'
                      ? 'bg-emerald-500 text-white'
                      : q.status === 'salah'
                      ? 'bg-red-500 text-white'
                      : 'bg-md-surface-container-high text-md-on-surface-variant',
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-md-on-surface-variant text-sm">Tidak ada soal untuk filter ini.</p>
        </div>
      )}

      {/* ── Bottom Navigation ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl px-6 py-4 border-t border-md-outline-variant/10 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={cn(
              'flex items-center gap-1 font-bold py-2 px-3 text-sm active-press',
              activeIndex === 0 ? 'text-md-primary/30' : 'text-md-primary',
            )}
          >
            ← Prev
          </button>
          <span className="text-xs font-semibold text-md-on-surface-variant">
            {activeIndex + 1} / {filtered.length}
          </span>
          <button
            onClick={handleNext}
            disabled={activeIndex >= filtered.length - 1}
            className={cn(
              'flex items-center gap-1 font-bold py-2 px-3 text-sm active-press',
              activeIndex >= filtered.length - 1 ? 'text-md-secondary/30' : 'text-md-secondary',
            )}
          >
            Next →
          </button>
        </div>
      </div>

    </main>
  );
}
