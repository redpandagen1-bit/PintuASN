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
      default:    return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getChoiceStyling = (choice: ReviewChoice) => {
    const isUserAnswer    = question.userChoice?.id === choice.id;
    const isCorrectAnswer = question.correctChoice?.id === choice.id;
    const isMaxScore      = question.category === 'TKP' && choice.score === 5;
    let base = 'p-3 rounded-lg border-2 flex items-start gap-3 transition-all';
    if (question.category === 'TKP') {
      if (isUserAnswer)   base += ' bg-yellow-50 border-yellow-300 shadow-sm';
      else if (isMaxScore) base += ' bg-green-50 border-green-400 shadow-sm';
      else base += ' border-slate-200 bg-white';
    } else {
      if (isUserAnswer && isCorrectAnswer)  base += ' bg-green-50 border-green-400 shadow-sm';
      else if (isUserAnswer && !isCorrectAnswer) base += ' bg-red-50 border-red-300 shadow-sm';
      else if (isCorrectAnswer) base += ' bg-green-50 border-green-400 shadow-sm';
      else base += ' border-slate-200 bg-white';
    }
    return base;
  };

  const getLabelStyling = (choice: ReviewChoice) => {
    const isUserAnswer    = question.userChoice?.id === choice.id;
    const isCorrectAnswer = question.correctChoice?.id === choice.id;
    const isMaxScore      = question.category === 'TKP' && choice.score === 5;
    let base = 'w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0';
    if (question.category === 'TKP') {
      if (isUserAnswer)    base += ' bg-yellow-400 text-slate-900';
      else if (isMaxScore) base += ' bg-green-500 text-white';
      else base += ' bg-slate-100 text-slate-600 border border-slate-200';
    } else {
      if (isUserAnswer && isCorrectAnswer)       base += ' bg-green-500 text-white';
      else if (isUserAnswer && !isCorrectAnswer) base += ' bg-red-500 text-white';
      else if (isCorrectAnswer) base += ' bg-green-500 text-white';
      else base += ' bg-slate-100 text-slate-600 border border-slate-200';
    }
    return base;
  };

  const statusBadge = () => {
    if (question.category === 'TKP') {
      return (
        <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-xs font-bold">
          Poin: {question.score ?? 0}/5
        </div>
      );
    }
    if (question.isCorrect) return (
      <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 text-xs font-bold">
        <CheckCircle2 className="w-3 h-3" /> Benar
      </div>
    );
    if (question.userChoice) return (
      <div className="flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 text-xs font-bold">
        <XCircle className="w-3 h-3" /> Salah
      </div>
    );
    return (
      <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-xs font-bold">
        <AlertCircle className="w-3 h-3" /> Kosong
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded-md text-xs font-bold border', getCategoryBadge(question.category))}>
            {question.category}
          </span>
          <span className="text-sm font-bold text-slate-800">Soal {question.position}</span>
        </div>
        <div className="flex items-center gap-2">
          {question.isFlagged && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-300 text-orange-600 bg-orange-50">
              Ditandai
            </span>
          )}
          {statusBadge()}
        </div>
      </div>

      {/* Question text */}
      <div className="text-slate-800 text-sm md:text-base leading-relaxed mb-5 font-medium">
        {question.content}
      </div>

      {/* Image */}
      {question.image_url && (
        <div className="flex justify-center mb-4">
          <Image
            src={question.image_url} alt="Gambar soal"
            width={500} height={250}
            className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
            style={{ maxHeight: '240px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Choices */}
      <div className="flex flex-col gap-2 mb-5">
        {question.choices.map((choice) => {
          const isUserAnswer    = question.userChoice?.id === choice.id;
          const isCorrectAnswer = question.correctChoice?.id === choice.id;
          const isMaxScore      = question.category === 'TKP' && choice.score === 5;
          return (
            <div key={choice.id} className={getChoiceStyling(choice)}>
              <div className={getLabelStyling(choice)}>{choice.label}</div>
              <div className="flex-1 pt-0.5">
                <p className={cn(
                  'text-xs md:text-sm leading-relaxed',
                  (isUserAnswer || isCorrectAnswer || isMaxScore) ? 'text-slate-800 font-semibold' : 'text-slate-600 font-medium'
                )}>
                  {choice.content}
                </p>
              </div>
              <div className="flex flex-col gap-1 items-end flex-shrink-0 pt-0.5">
                {question.category === 'TKP' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                    {choice.score ?? 1}pt
                  </span>
                )}
                {isUserAnswer && (
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                    isCorrectAnswer || isMaxScore
                      ? 'text-green-700 bg-green-100 border-green-200'
                      : 'text-yellow-700 bg-yellow-100 border-yellow-200'
                  )}>
                    Jawaban Anda
                  </span>
                )}
                {isCorrectAnswer && !isUserAnswer && question.category !== 'TKP' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-green-700 bg-green-100 border border-green-200">
                    Kunci
                  </span>
                )}
                {isMaxScore && !isUserAnswer && question.category === 'TKP' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-green-700 bg-green-100 border border-green-200">
                    Maks
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Discussion */}
      {question.explanation && (
        <div className="border-t border-slate-100 pt-4">
          <button onClick={() => setShowDiscussion(!showDiscussion)}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold mb-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors w-full">
            <Info className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
            <span className="flex-1 text-left text-xs md:text-sm">Pembahasan Soal</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform text-slate-400', showDiscussion && 'rotate-180')} />
          </button>
          {showDiscussion && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs md:text-sm text-slate-700 leading-relaxed">
              {question.topic && (
                <span className="inline-block mb-2 px-2.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wide">
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