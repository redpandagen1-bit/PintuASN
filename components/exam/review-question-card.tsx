'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MathText } from '@/components/ui/math-text';
import { CheckCircle2, XCircle, AlertCircle, Info, ChevronDown, Clock, Lock } from 'lucide-react';
import type { ReviewQuestion, ReviewChoice } from '@/types/database';

interface ReviewQuestionCardProps {
  question: ReviewQuestion & { status?: 'benar' | 'salah' | 'kosong' };
  /** Waktu pengerjaan hanya tampil untuk Platinum; selain itu diblur + dikunci. */
  isPlatinum?: boolean;
  /** Rata-rata waktu per soal pada attempt ini (detik), untuk perbandingan. */
  avgTimeSeconds?: number | null;
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s} dtk`;
  return s === 0 ? `${m} mnt` : `${m} mnt ${s} dtk`;
}

function TimeSpentRow({
  seconds, avgSeconds, isPlatinum,
}: {
  seconds: number | null;
  avgSeconds: number | null;
  isPlatinum: boolean;
}) {
  if (!isPlatinum) {
    return (
      <div className="relative mb-4 rounded-lg border border-purple-200 bg-purple-50/60 px-3 py-2.5 overflow-hidden">
        {/* Konten dummy yang diblur — data asli tidak dikirim ke client */}
        <div className="flex items-center gap-2 blur-[5px] pointer-events-none select-none" aria-hidden>
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600">Waktu Pengerjaan</span>
          <span className="text-sm font-extrabold text-slate-800">1 mnt 24 dtk</span>
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Lebih lama dari rata-rata</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-between gap-2 px-3 bg-white/40">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center flex-shrink-0">
              <Lock className="w-3 h-3 text-white" />
            </span>
            Waktu Pengerjaan
          </span>
          <Link
            href="/beli-paket"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-lg text-[11px] font-bold transition-colors shadow-sm shadow-purple-600/25 flex-shrink-0"
          >
            Buka dengan Platinum →
          </Link>
        </div>
      </div>
    );
  }

  const hasTime = seconds !== null && seconds > 0;
  let compare: { label: string; className: string } | null = null;
  if (hasTime && avgSeconds && avgSeconds > 0) {
    const ratio = seconds! / avgSeconds;
    if (ratio >= 1.5)      compare = { label: 'Lebih lama dari rata-rata', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    else if (ratio <= 0.5) compare = { label: 'Lebih cepat dari rata-rata', className: 'bg-sky-100 text-sky-700 border-sky-200' };
    else                   compare = { label: 'Sesuai rata-rata', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
      <span className="text-xs font-bold text-slate-600">Waktu Pengerjaan</span>
      <span className="text-sm font-extrabold text-slate-800">
        {hasTime ? formatDuration(seconds!) : 'Tidak tercatat'}
      </span>
      {compare && (
        <span
          className={cn('sm:ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border', compare.className)}
          title={`Rata-rata kamu: ${formatDuration(avgSeconds!)} per soal`}
        >
          {compare.label} ({formatDuration(avgSeconds!)})
        </span>
      )}
    </div>
  );
}

export function ReviewQuestionCard({ question, isPlatinum = false, avgTimeSeconds = null }: ReviewQuestionCardProps) {
  const [showDiscussion, setShowDiscussion] = useState(true);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'TWK': return 'bg-sky-100 text-sky-700 border-sky-200';
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

      {/* Waktu pengerjaan — Platinum only */}
      <TimeSpentRow
        seconds={question.timeSpentSeconds}
        avgSeconds={avgTimeSeconds}
        isPlatinum={isPlatinum}
      />

      {/* Question text */}
      <div className="text-slate-800 text-sm md:text-base leading-relaxed mb-5 font-medium">
        <MathText value={question.content} />
      </div>

      {/* Image — pakai <img> biasa agar SVG figural ikut tampil tanpa next/image */}
      {question.image_url && (
        <div className="flex justify-center mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.image_url} alt="Gambar soal"
            className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
            style={{ maxHeight: '240px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Choices — figural (gambar) pakai grid 5 kolom; lainnya tetap bertumpuk */}
      {question.choices.some(c => c.image_url) ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
          {question.choices.map((choice) => {
            const isUserAnswer    = question.userChoice?.id === choice.id;
            const isCorrectAnswer = question.correctChoice?.id === choice.id;
            const isMaxScore      = question.category === 'TKP' && choice.score === 5;
            const highlight = isCorrectAnswer || isMaxScore
              ? 'border-green-400 bg-green-50'
              : (isUserAnswer ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200 bg-white');
            return (
              <div key={choice.id} className={cn('flex flex-col items-center gap-1.5 rounded-lg border-2 p-1.5', highlight)}>
                <div className={getLabelStyling(choice)}>{choice.label}</div>
                <div className="w-full aspect-square flex items-center justify-center bg-white rounded overflow-hidden">
                  {choice.image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={choice.image_url} alt={`Pilihan ${choice.label}`} className="w-full h-full" style={{ objectFit: 'contain' }} />
                  )}
                </div>
                {question.category === 'TKP' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">{choice.score ?? 1}pt</span>
                )}
                {isUserAnswer && (
                  <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded border text-center leading-tight',
                    isCorrectAnswer || isMaxScore ? 'text-green-700 bg-green-100 border-green-200' : 'text-yellow-700 bg-yellow-100 border-yellow-200')}>
                    Jawaban Anda
                  </span>
                )}
                {isCorrectAnswer && !isUserAnswer && question.category !== 'TKP' && (
                  <span className="text-[8px] font-bold px-1 py-0.5 rounded text-green-700 bg-green-100 border border-green-200">Kunci</span>
                )}
                {isMaxScore && !isUserAnswer && question.category === 'TKP' && (
                  <span className="text-[8px] font-bold px-1 py-0.5 rounded text-green-700 bg-green-100 border border-green-200">Maks</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
      <div className="flex flex-col gap-2 mb-5">
        {question.choices.map((choice) => {
          const isUserAnswer    = question.userChoice?.id === choice.id;
          const isCorrectAnswer = question.correctChoice?.id === choice.id;
          const isMaxScore      = question.category === 'TKP' && choice.score === 5;
          return (
            <div key={choice.id} className={getChoiceStyling(choice)}>
              <div className={getLabelStyling(choice)}>{choice.label}</div>
              <div className="flex-1 pt-0.5 space-y-2">
                {choice.image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={choice.image_url}
                    alt={`Pilihan ${choice.label}`}
                    className="max-w-full h-auto rounded border border-slate-200 bg-white"
                    style={{ maxHeight: '140px', objectFit: 'contain' }}
                  />
                )}
                {choice.content && (
                  <p className={cn(
                    'text-xs md:text-sm leading-relaxed',
                    (isUserAnswer || isCorrectAnswer || isMaxScore) ? 'text-slate-800 font-semibold' : 'text-slate-600 font-medium'
                  )}>
                    <MathText value={choice.content} />
                  </p>
                )}
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
      )}

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
              <div className="prose prose-sm max-w-none">
                <MathText value={question.explanation} />
              </div>
              {question.explanation_image_url && (
                <div className="mt-3 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={question.explanation_image_url}
                    alt="Gambar pembahasan"
                    className="max-w-full h-auto rounded-lg border border-slate-200 bg-white shadow-sm"
                    style={{ maxHeight: '260px', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}