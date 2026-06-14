'use client';

// ============================================================
// components/materi/module-reader.tsx
//
// Reader materi multi-halaman dengan alur anti-nyontek:
//   Halaman (materi + "Info Penting" dropdown di bawah)
//     → [Selanjutnya] → Kuis halaman itu (materi disembunyikan total)
//       → [Lanjutkan] → halaman berikutnya
//   Halaman terakhir → kuis → [Lanjutkan ke sub-bab berikutnya]
//
// Dipakai bersama oleh desktop (materi-client) & mobile (MobileMateri).
// ============================================================

import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, Info, HelpCircle, Check, X,
} from 'lucide-react';
import { ModuleContent } from '@/components/materi/module-content';
import { MathText }      from '@/components/ui/math-text';
import type { QuizItem } from '@/components/materi/module-quiz';
import { getPages, type MaterialModule } from '@/app/(dashboard)/materi/shared';

// ── Info Penting (dropdown) ─────────────────────────────────────
function InfoPenting({ body }: { body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-amber-800 text-sm font-bold">
          <Info size={16} /> Info Penting
        </span>
        <ChevronRight size={16} className={`text-amber-700 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 -mt-1">
          <div className="text-amber-900 text-[13px] leading-6 [&_strong]:font-bold">
            <ModuleContent body={body} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Kuis ────────────────────────────────────────────────────────
function ReaderQuiz({
  items, onAllAnswered,
}: {
  items: QuizItem[];
  onAllAnswered: (done: boolean) => void;
}) {
  const [picked, setPicked] = useState<Record<number, number>>({});

  useEffect(() => {
    onAllAnswered(Object.keys(picked).length >= items.length);
  }, [picked, items.length, onAllAnswered]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-sky-700">
        <HelpCircle size={18} />
        <h3 className="text-base font-bold">Kuis</h3>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, qi) => {
          const sel = picked[qi];
          const answered = sel !== undefined;
          return (
            <div key={qi} className="rounded-xl border border-slate-200 p-4">
              <p className="flex items-start gap-2 text-sm font-semibold text-slate-800 mb-3">
                <span className="text-slate-400">{qi + 1}.</span>
                <MathText value={item.question} />
              </p>
              <div className="flex flex-col gap-2">
                {item.choices.map((choice, ci) => {
                  const isCorrect = ci === item.answer;
                  const isPicked  = ci === sel;
                  let cls = 'border-slate-200 hover:border-slate-300';
                  if (answered && isCorrect)          cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                  else if (answered && isPicked)      cls = 'border-rose-300 bg-rose-50 text-rose-700';
                  else if (answered)                  cls = 'border-slate-200 opacity-60';
                  return (
                    <button key={ci} type="button" disabled={answered}
                      onClick={() => setPicked(p => ({ ...p, [qi]: ci }))}
                      className={`flex items-center justify-between gap-2 text-left text-sm px-3.5 py-2.5 rounded-lg border transition-all ${cls} ${answered ? 'cursor-default' : 'cursor-pointer'}`}>
                      <span><MathText value={choice} /></span>
                      {answered && isCorrect && <Check size={16} className="text-emerald-600 flex-shrink-0" />}
                      {answered && isPicked && !isCorrect && <X size={16} className="text-rose-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {answered && item.explanation && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-600">Pembahasan: </span>
                  <MathText value={item.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Reader utama ────────────────────────────────────────────────
export function ModuleReader({
  module, onBack, onComplete,
}: {
  module:     MaterialModule;
  onBack:     () => void;          // kembali ke daftar sub-topik
  onComplete: () => void;          // selesai → lanjut ke sub-bab berikutnya
}) {
  const pages = getPages(module);
  const [pageIdx, setPageIdx] = useState(0);
  const [phase,   setPhase]   = useState<'content' | 'quiz'>('content');
  const [quizDone, setQuizDone] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const page    = pages[pageIdx];
  const isLast  = pageIdx === pages.length - 1;
  const hasQuiz = Array.isArray(page.quiz) && page.quiz.length > 0;

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pageIdx, phase]);

  const goNextPageOrFinish = () => {
    if (isLast) { onComplete(); return; }
    setPageIdx(i => i + 1);
    setPhase('content');
    setQuizDone(false);
  };

  // Tombol di fase materi
  const onContentNext = () => {
    if (hasQuiz) { setPhase('quiz'); setQuizDone(false); }
    else goNextPageOrFinish();
  };

  const finalLabel = 'Lanjutkan ke sub-bab berikutnya';

  return (
    <div ref={topRef} className="scroll-mt-4 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Judul (slate-800) */}
      <div className="bg-slate-800 px-5 md:px-6 pt-5 pb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <button onClick={onBack}
          className="relative z-10 flex items-center gap-1 text-slate-300 hover:text-white text-xs font-medium mb-3">
          <ChevronLeft size={15} /> {module.topic}
        </button>
        <p className="relative z-10 text-yellow-400 text-[11px] font-bold uppercase tracking-wide mb-1">
          Halaman {pageIdx + 1} dari {pages.length}
        </p>
        <h1 className="relative z-10 text-xl md:text-2xl font-extrabold text-white leading-tight">
          {module.title}
        </h1>
        {/* progress halaman */}
        <div className="relative z-10 flex gap-1.5 mt-4">
          {pages.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < pageIdx ? 'bg-yellow-400' : i === pageIdx ? 'bg-yellow-400/60' : 'bg-slate-600'}`} />
          ))}
        </div>
      </div>

      {/* Materi */}
      <div className="bg-white px-5 md:px-6 py-5 md:py-6">
        {phase === 'content' ? (
          <>
            <ModuleContent body={page.content} />
            {page.info && <InfoPenting body={page.info} />}

            <div className="flex gap-2 mt-6 pt-5 border-t border-slate-100">
              {pageIdx > 0 && (
                <button onClick={() => { setPageIdx(i => i - 1); setPhase('content'); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  <ChevronLeft size={15} /> Sebelumnya
                </button>
              )}
              <button onClick={onContentNext}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-yellow-400 text-sm font-bold hover:bg-slate-700">
                {hasQuiz
                  ? <>Selanjutnya <ArrowRight size={15} /></>
                  : isLast
                  ? <>{finalLabel} <ArrowRight size={15} /></>
                  : <>Selanjutnya <ArrowRight size={15} /></>}
              </button>
            </div>
          </>
        ) : (
          <>
            <ReaderQuiz items={page.quiz as QuizItem[]} onAllAnswered={setQuizDone} />

            <div className="flex mt-6 pt-5 border-t border-slate-100">
              <button onClick={goNextPageOrFinish} disabled={!quizDone}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-yellow-400 text-sm font-bold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                {isLast
                  ? <>{finalLabel} <ArrowRight size={15} /></>
                  : <>Lanjutkan <ArrowRight size={15} /></>}
                {isLast && <CheckCircle2 size={15} />}
              </button>
            </div>
            {!quizDone && (
              <p className="text-center text-xs text-slate-400 mt-2">Jawab semua soal untuk melanjutkan.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
