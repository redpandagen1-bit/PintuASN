'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Info, ChevronDown } from 'lucide-react';
import type { ReviewQuestion, ReviewChoice } from '@/types/database';
import Image from 'next/image';

interface ReviewQuestionCardProps {
  question: ReviewQuestion & { status?: 'benar' | 'salah' | 'kosong' };
}

export function ReviewQuestionCard({ question }: ReviewQuestionCardProps) {
  const [showDiscussion, setShowDiscussion] = useState(true);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'TWK': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TIU': return 'bg-green-100 text-green-700 border-green-200';
      case 'TKP': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getChoiceStyling = (choice: ReviewChoice) => {
    const isUserAnswer = question.userChoice?.id === choice.id;
    const isCorrectAnswer = question.correctChoice?.id === choice.id;
    const isMaxScore = question.category === 'TKP' && choice.score === 5;

    let base = 'p-4 rounded-xl border-2 flex items-start gap-4 transition-all';

    if (question.category === 'TKP') {
      if (isUserAnswer) base += ' bg-yellow-50 border-yellow-300 shadow-sm';
      else if (isMaxScore) base += ' bg-green-50 border-green-400 shadow-sm';
      else base += ' border-slate-200 bg-white';
    } else {
      if (isUserAnswer && isCorrectAnswer) base += ' bg-green-50 border-green-400 shadow-sm';
      else if (isUserAnswer && !isCorrectAnswer) base += ' bg-red-50 border-red-300 shadow-sm';
      else if (isCorrectAnswer) base += ' bg-green-50 border-green-400 shadow-sm';
      else base += ' border-slate-200 bg-white';
    }

    return base;
  };

  const getLabelStyling = (choice: ReviewChoice) => {
    const isUserAnswer = question.userChoice?.id === choice.id;
    const isCorrectAnswer = question.correctChoice?.id === choice.id;
    const isMaxScore = question.category === 'TKP' && choice.score === 5;

    let base = 'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0';

    if (question.category === 'TKP') {
      if (isUserAnswer) base += ' bg-yellow-400 text-slate-900';
      else if (isMaxScore) base += ' bg-green-500 text-white';
      else base += ' bg-slate-100 text-slate-600 border border-slate-200';
    } else {
      if (isUserAnswer && isCorrectAnswer) base += ' bg-green-500 text-white';
      else if (isUserAnswer && !isCorrectAnswer) base += ' bg-red-500 text-white';
      else if (isCorrectAnswer) base += ' bg-green-500 text-white';
      else base += ' bg-slate-100 text-slate-600 border border-slate-200';
    }

    return base;
  };

  const statusBadge = () => {
    if (question.category === 'TKP') {
      return (
        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-bold">
          <span>Poin: {question.score ?? 0}/5</span>
        </div>
      );
    }
    if (question.isCorrect) {
      return (
        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 text-sm font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4" /> Benar
        </div>
      );
    }
    if (question.userChoice) {
      return (
        <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 text-sm font-bold shadow-sm">
          <XCircle className="w-4 h-4" /> Salah
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-bold shadow-sm">
        <AlertCircle className="w-4 h-4" /> Kosong
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

      {/* Question header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className={cn(
            'px-3 py-1 rounded-lg text-sm font-bold border shadow-sm',
            getCategoryBadge(question.category)
          )}>
            {question.category}
          </span>
          <span className="text-lg font-bold text-slate-800">
            Soal {question.position}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {question.isFlagged && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-orange-300 text-orange-600 bg-orange-50">
              Ditandai
            </span>
          )}
          {statusBadge()}
        </div>
      </div>

      {/* Question text */}
      <div className="text-slate-800 text-base md:text-lg leading-relaxed mb-8 font-medium">
        {question.content}
      </div>

      {/* Question image */}
      {question.image_url && (
        <div className="flex justify-center mb-6">
          <Image
            src={question.image_url}
            alt="Gambar soal"
            width={600}
            height={300}
            className="max-w-full h-auto rounded-xl border border-slate-200 shadow-sm"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Answer choices */}
      <div className="flex flex-col gap-3 mb-8">
        {question.choices.map((choice) => {
          const isUserAnswer = question.userChoice?.id === choice.id;
          const isCorrectAnswer = question.correctChoice?.id === choice.id;
          const isMaxScore = question.category === 'TKP' && choice.score === 5;

          return (
            <div key={choice.id} className={getChoiceStyling(choice)}>
              <div className={getLabelStyling(choice)}>{choice.label}</div>
              <div className="flex-1 pt-0.5">
                <p className={cn(
                  'text-sm md:text-base leading-relaxed',
                  (isUserAnswer || isCorrectAnswer || isMaxScore) ? 'text-slate-800 font-semibold' : 'text-slate-600 font-medium'
                )}>
                  {choice.content}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 items-end flex-shrink-0 pt-0.5">
                {question.category === 'TKP' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                    {choice.score ?? 1} poin
                  </span>
                )}
                {isUserAnswer && (
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                    isCorrectAnswer || isMaxScore
                      ? 'text-green-700 bg-green-100 border-green-200'
                      : 'text-yellow-700 bg-yellow-100 border-yellow-200'
                  )}>
                    Jawaban Anda
                  </span>
                )}
                {isCorrectAnswer && !isUserAnswer && question.category !== 'TKP' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-green-700 bg-green-100 border border-green-200">
                    Kunci Jawaban
                  </span>
                )}
                {isMaxScore && !isUserAnswer && question.category === 'TKP' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-green-700 bg-green-100 border border-green-200">
                    Poin Maks
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Discussion */}
      {question.explanation && (
        <div className="border-t border-slate-100 pt-6">
          <button
            onClick={() => setShowDiscussion(!showDiscussion)}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold mb-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors w-full"
          >
            <Info className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span className="flex-1 text-left text-sm md:text-base">Pembahasan Soal</span>
            <ChevronDown className={cn('w-4 h-4 transition-transform text-slate-400', showDiscussion && 'rotate-180')} />
          </button>

          {showDiscussion && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm md:text-base text-slate-700 leading-relaxed shadow-inner">
              {question.topic && (
                <span className="inline-block mb-3 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {question.topic}
                </span>
              )}
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: question.explanation.replace(/\n/g, '<br />') }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}