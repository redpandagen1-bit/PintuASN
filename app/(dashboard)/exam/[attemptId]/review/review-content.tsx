'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewData, ReviewFilter } from '@/types/database';
import { ReviewQuestionCard } from '@/components/exam/review-question-card';

type StatusFilter = 'semua' | 'benar' | 'salah' | 'kosong';

export default function ReviewContent({ reviewData }: { reviewData: ReviewData }) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');
  const mainRef = useRef<HTMLDivElement>(null);

  const questions = reviewData.questions;

  // Compute status for each question
  const questionsWithStatus = useMemo(() => {
    return questions.map((q) => {
      let status: 'benar' | 'salah' | 'kosong';
      if (!q.userChoice) {
        status = 'kosong';
      } else if (q.category === 'TKP') {
        status = (q.score ?? 0) >= 4 ? 'benar' : 'salah';
      } else {
        status = q.isCorrect ? 'benar' : 'salah';
      }
      return { ...q, status };
    });
  }, [questions]);

  // Filter by status
  const filteredQuestions = useMemo(() => {
    if (statusFilter === 'semua') return questionsWithStatus;
    return questionsWithStatus.filter((q) => q.status === statusFilter);
  }, [questionsWithStatus, statusFilter]);

  // When filter changes, reset to first question in filtered list
  useEffect(() => {
    setActiveQuestionIndex(0);
  }, [statusFilter]);

  const activeQuestion = filteredQuestions[activeQuestionIndex] ?? null;

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (activeQuestionIndex < filteredQuestions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Stats
  const totalBenar = questionsWithStatus.filter((q) => q.status === 'benar').length;
  const totalSalah = questionsWithStatus.filter((q) => q.status === 'salah').length;
  const totalKosong = questionsWithStatus.filter((q) => q.status === 'kosong').length;

  // Time info
  const attempt = reviewData.attempt;
  const startedAt = attempt.started_at ? new Date(attempt.started_at) : null;
  const submittedAt = attempt.submitted_at
    ? new Date(attempt.submitted_at)
    : attempt.started_at
    ? new Date(attempt.started_at)
    : null;

  const durationMinutes =
    startedAt && submittedAt
      ? Math.round((submittedAt.getTime() - startedAt.getTime()) / 60000)
      : null;

  const submittedDateStr = submittedAt
    ? submittedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  const submittedTimeStr = submittedAt
    ? submittedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : null;

  const countByCategory = (cat: string) => questions.filter((q) => q.category === cat).length;

  // Score & status from attempt
  const totalScore = attempt.total_score ?? 0;
  const scoreTWK = attempt.score_twk ?? 0;
  const scoreTIU = attempt.score_tiu ?? 0;
  const scoreTKP = attempt.score_tkp ?? 0;

  // Passing grades (SKD standard)
  const TWK_PASS = 65;
  const TIU_PASS = 80;
  const TKP_PASS = 166;
  const isPassed = scoreTWK >= TWK_PASS && scoreTIU >= TIU_PASS && scoreTKP >= TKP_PASS;

  const filterOptions: { value: StatusFilter; label: string; count: number; color: string }[] = [
    { value: 'semua', label: 'Semua', count: questionsWithStatus.length, color: 'bg-slate-800 text-white' },
    { value: 'benar', label: 'Benar', count: totalBenar, color: 'bg-green-500 text-white' },
    { value: 'salah', label: 'Salah', count: totalSalah, color: 'bg-red-500 text-white' },
    { value: 'kosong', label: 'Kosong', count: totalKosong, color: 'bg-slate-400 text-white' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden text-slate-800">

      {/* ── SCROLLABLE BODY ─────────────────────────────────────────────── */}
      <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">

          {/* ── HERO BANNER ─────────────────────────────────────────────── */}
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-xl border border-slate-700">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-[60px] opacity-20 translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

              {/* Left info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-yellow-400 transition-colors text-sm font-bold group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Dashboard
                  </Link>
                  <span className="text-slate-600 text-sm">·</span>
                  <Link
                    href="/history"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-yellow-400 transition-colors text-sm font-bold group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Riwayat
                  </Link>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-400/10 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Pembahasan <span className="text-yellow-400">Soal Tryout</span>
                  </h2>
                </div>

                <p className="text-slate-300 text-sm flex items-center gap-2 font-medium mb-3">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {attempt.packages?.title || 'Tryout SKD CPNS'}
                </p>

                {/* Date + Status badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{submittedDateStr}{submittedTimeStr ? ` • ${submittedTimeStr} WIB` : ''}</span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
                    isPassed
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isPassed ? 'Lulus' : 'Tidak Lulus'}
                  </div>
                </div>
              </div>

              {/* Score cards — Total + TWK + TIU + TKP */}
              <div className="flex flex-wrap gap-3 md:gap-4">
                {/* Soal count cards */}
                <div className="bg-slate-700/50 backdrop-blur-sm px-5 py-3 md:px-6 md:py-4 rounded-xl border border-slate-600 shadow-sm flex flex-col items-center min-w-[90px] md:min-w-[110px]">
                  <span className="text-2xl md:text-3xl font-bold text-white mb-1">{countByCategory('TWK')}</span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Soal TWK</span>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 px-5 py-3 md:px-6 md:py-4 rounded-xl shadow-lg shadow-yellow-400/20 flex flex-col items-center min-w-[90px] md:min-w-[110px] lg:-translate-y-2 border border-yellow-300">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{countByCategory('TIU')}</span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">Soal TIU</span>
                </div>
                <div className="bg-slate-700/50 backdrop-blur-sm px-5 py-3 md:px-6 md:py-4 rounded-xl border border-slate-600 shadow-sm flex flex-col items-center min-w-[90px] md:min-w-[110px]">
                  <span className="text-2xl md:text-3xl font-bold text-white mb-1">{countByCategory('TKP')}</span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Soal TKP</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── TWO COLUMN LAYOUT ───────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── LEFT: ACTIVE QUESTION ─────────────────────────────── */}
            <div className="flex-1 flex flex-col gap-4 w-full min-w-0">

              {activeQuestion ? (
                <>
                  {/* Question card — reuse existing ReviewQuestionCard */}
                  <ReviewQuestionCard question={activeQuestion} />

                  {/* Prev / Next */}
                  <div className="flex items-center justify-between pb-8 lg:pb-4">
                    <button
                      onClick={handlePrev}
                      disabled={activeQuestionIndex === 0}
                      className="px-5 py-3 md:px-6 md:py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center shadow-sm transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Sebelumnya</span>
                    </button>
                    <span className="text-sm text-slate-500 font-medium">
                      {activeQuestionIndex + 1} / {filteredQuestions.length}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={activeQuestionIndex === filteredQuestions.length - 1}
                      className="px-5 py-3 md:px-6 md:py-3.5 rounded-xl bg-yellow-400 border border-yellow-500 text-slate-900 font-bold hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center shadow-sm transition-all shadow-yellow-400/20"
                    >
                      <span className="hidden md:inline">Selanjutnya</span>
                      <ChevronRight className="w-4 h-4 md:ml-2" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                  <p className="text-slate-400 font-medium mb-4">
                    Tidak ada soal yang sesuai dengan filter ini.
                  </p>
                  <button
                    onClick={() => setStatusFilter('semua')}
                    className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
                  >
                    Tampilkan Semua Soal
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: FILTER + NAV GRID ──────────────────────────── */}
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-4">

              {/* Status Filter */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                  Filter Status
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all border-2',
                        statusFilter === opt.value
                          ? `${opt.color} border-transparent shadow-md`
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <span>{opt.label}</span>
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded-md font-black',
                        statusFilter === opt.value ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                      )}>
                        {opt.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Grid */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col lg:max-h-[calc(100vh-300px)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Nomor Soal</h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    {filteredQuestions.length} Soal
                  </span>
                </div>

                {/* Scrollable grid */}
                <div className="overflow-y-auto flex-1 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                  <div className="grid grid-cols-5 gap-1.5">
                    {filteredQuestions.map((q, idx) => {
                      const isActive = idx === activeQuestionIndex;
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setActiveQuestionIndex(idx);
                            mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          title={`${q.category} - ${q.status}`}
                          className={cn(
                            'aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all border-2',
                            isActive && 'ring-2 ring-yellow-400 ring-offset-1 border-transparent shadow-sm scale-105',
                            !isActive && q.status === 'benar' && 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
                            !isActive && q.status === 'salah' && 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
                            !isActive && q.status === 'kosong' && 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
                            isActive && q.status === 'benar' && 'bg-green-50 text-green-700',
                            isActive && q.status === 'salah' && 'bg-red-50 text-red-700',
                            isActive && q.status === 'kosong' && 'bg-white text-slate-600',
                          )}
                        >
                          {q.position ?? idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {filteredQuestions.length === 0 && (
                    <p className="text-center py-8 text-slate-400 text-sm">Tidak ada soal.</p>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Benar
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500" />
                    Salah
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                    Kosong
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}