'use client';

import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionWithChoices } from '@/types/exam';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionWithChoices[];
  answers: Map<string, string>;
  flaggedQuestions: Set<string>;
  currentIndex: number;
  goToQuestion: (index: number) => void;
  textSize: 'sm' | 'md' | 'lg';
  setTextSize: (size: 'sm' | 'md' | 'lg') => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const LEGEND = [
  { cls: 'border-2 border-blue-500 bg-blue-50', label: 'Soal aktif' },
  { cls: 'bg-blue-500', label: 'Sudah dijawab' },
  { cls: 'bg-yellow-400', label: 'Ditandai review' },
  { cls: 'bg-slate-100 border border-slate-300', label: 'Belum dijawab' },
];

export function QuestionNavigatorSheet({
  isOpen,
  onClose,
  questions,
  answers,
  flaggedQuestions,
  currentIndex,
  goToQuestion,
  textSize,
  setTextSize,
  onSubmit,
  isSubmitting,
}: Props) {
  if (!isOpen) return null;

  const answeredCount = answers.size;
  const totalCount = questions.length;
  const unanswered = totalCount - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl">

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-900 text-sm">Navigasi Soal</p>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className="text-blue-600 font-semibold">{answeredCount}</span>
              <span> / {totalCount} terjawab</span>
              {unanswered > 0 && (
                <span className="text-red-500 ml-1">· {unanswered} belum</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Question grid */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-8 gap-1.5">
              {questions.map((q, index) => {
                const isAnswered = answers.has(q.id);
                const isMarked = flaggedQuestions.has(q.id);
                const isCurrent = index === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => { goToQuestion(index); onClose(); }}
                    aria-label={`Soal ${index + 1}`}
                    className={cn(
                      'aspect-square rounded-lg text-[11px] font-semibold transition-all active:scale-95',
                      isCurrent && 'border-2 border-blue-500 bg-blue-50 text-blue-700',
                      !isCurrent && isMarked && 'bg-yellow-400 text-white',
                      !isCurrent && !isMarked && isAnswered && 'bg-blue-500 text-white',
                      !isCurrent && !isMarked && !isAnswered && 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 pb-3 border-t border-slate-100 pt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Keterangan</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {LEGEND.map(({ cls, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn('w-5 h-5 rounded flex-shrink-0', cls)} />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Text size */}
          <div className="px-4 pb-3 border-t border-slate-100 pt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ukuran Teks</p>
            <div className="grid grid-cols-3 gap-2">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-semibold border-2 transition-all',
                    textSize === size
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  )}
                >
                  {size === 'sm' ? 'Kecil' : size === 'md' ? 'Sedang' : 'Besar'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — submit */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 pb-safe">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-bold disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {isSubmitting
              ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" />Mengirim...</span>
              : 'Submit Ujian'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
