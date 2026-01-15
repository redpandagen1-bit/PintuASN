'use client';

import { cn } from '@/lib/utils';
import type { QuestionWithChoices } from '@/types/exam';

interface QuestionNavigatorProps {
  questions: QuestionWithChoices[];
  currentIndex: number;
  answers: Map<string, string>;
  flaggedQuestions: Set<string>;
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onNavigate,
}: QuestionNavigatorProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Header Stats */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Navigasi Soal</h3>
        <div className="text-sm text-slate-600 space-y-1">
          <div>Total Dijawab: {answers.size}/{questions.length}</div>
          <div>Ditandai: {flaggedQuestions.size}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded border-2 border-green-500 bg-green-50 flex items-center justify-center text-xs">
            {currentIndex + 1}
          </div>
          <span>Soal Ini</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center text-xs">
            1
          </div>
          <span>Dijawab</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-yellow-500 text-white flex items-center justify-center text-xs">
            1
          </div>
          <span>Ditandai</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-xs">
            1
          </div>
          <span>Belum Dijawab</span>
        </div>
      </div>

      {/* Question Grid - FULL 110 SOAL */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const isAnswered = answers.has(q.id);
          const isMarked = flaggedQuestions.has(q.id);
          const isCurrent = index === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => onNavigate(index)}
              className={cn(
                "w-full aspect-square rounded flex items-center justify-center text-sm font-medium transition-all",
                isCurrent && "border-2 border-green-500 bg-green-50 text-green-700",
                !isCurrent && isMarked && "bg-yellow-500 text-white hover:bg-yellow-600",
                !isCurrent && !isMarked && isAnswered && "bg-blue-500 text-white hover:bg-blue-600",
                !isCurrent && !isMarked && !isAnswered && "bg-slate-200 text-slate-700 hover:bg-slate-300"
              )}
              aria-label={`Soal ${index + 1}${isAnswered ? ', dijawab' : ''}${isMarked ? ', ditandai' : ''}${isCurrent ? ', soal saat ini' : ''}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
