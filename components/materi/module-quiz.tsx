'use client';

// ============================================================
// components/materi/module-quiz.tsx
// Mini-quiz "Cek Pemahaman" di akhir sub-topik modul.
// Soal pilihan ganda ringan — bukan untuk skor, hanya cek pemahaman.
// ============================================================

import { useState } from 'react';
import { HelpCircle, Check, X } from 'lucide-react';
import { MathText } from '@/components/ui/math-text';

export interface QuizItem {
  question:     string;
  choices:      string[];
  answer:       number;   // index jawaban benar (0-based)
  explanation?: string;
}

function QuizCard({ item, index }: { item: QuizItem; index: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="flex items-start gap-2 text-sm font-semibold text-slate-800 mb-3">
        <span className="text-slate-400">{index + 1}.</span>
        <MathText value={item.question} />
      </p>
      <div className="flex flex-col gap-2">
        {item.choices.map((choice, i) => {
          const isCorrect = i === item.answer;
          const isPicked  = i === picked;
          let cls = 'border-slate-200 hover:border-slate-300';
          if (answered && isCorrect)            cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
          else if (answered && isPicked)        cls = 'border-rose-300 bg-rose-50 text-rose-700';
          else if (answered)                    cls = 'border-slate-200 opacity-60';
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`flex items-center justify-between gap-2 text-left text-sm px-3.5 py-2.5 rounded-lg border transition-all ${cls} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
            >
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
}

export function ModuleQuiz({ items }: { items: QuizItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3 text-sky-700">
        <HelpCircle size={18} />
        <h3 className="text-base font-bold">Cek Pemahaman</h3>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => <QuizCard key={i} item={item} index={i} />)}
      </div>
    </div>
  );
}
