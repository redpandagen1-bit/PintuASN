'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, AlertCircle, Award, Calendar, Flag, X, Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewData } from '@/types/database';
import { ReviewQuestionCard } from '@/components/exam/review-question-card';

type StatusFilter = 'semua' | 'benar' | 'salah' | 'kosong';

export default function ReviewContent({ reviewData }: { reviewData: ReviewData }) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');
  const mainRef = useRef<HTMLDivElement>(null);

  // Report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const questions = reviewData.questions;

  const questionsWithStatus = useMemo(() => {
    return questions.map((q) => {
      let status: 'benar' | 'salah' | 'kosong';
      if (!q.userChoice) status = 'kosong';
      else if (q.category === 'TKP') status = (q.score ?? 0) >= 4 ? 'benar' : 'salah';
      else status = q.isCorrect ? 'benar' : 'salah';
      return { ...q, status };
    });
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (statusFilter === 'semua') return questionsWithStatus;
    return questionsWithStatus.filter((q) => q.status === statusFilter);
  }, [questionsWithStatus, statusFilter]);

  useEffect(() => { setActiveQuestionIndex(0); }, [statusFilter]);

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

  const totalBenar  = questionsWithStatus.filter((q) => q.status === 'benar').length;
  const totalSalah  = questionsWithStatus.filter((q) => q.status === 'salah').length;
  const totalKosong = questionsWithStatus.filter((q) => q.status === 'kosong').length;

  const attempt = reviewData.attempt;
  const startedAt   = attempt.started_at   ? new Date(attempt.started_at)   : null;
  const submittedAt = attempt.submitted_at  ? new Date(attempt.submitted_at) : startedAt;

  const submittedDateStr = submittedAt
    ? submittedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';
  const submittedTimeStr = submittedAt
    ? submittedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : null;

  const countByCategory = (cat: string) => questions.filter((q) => q.category === cat).length;

  const scoreTWK = attempt.score_twk ?? 0;
  const scoreTIU = attempt.score_tiu ?? 0;
  const scoreTKP = attempt.score_tkp ?? 0;
  const isPassed = scoreTWK >= 65 && scoreTIU >= 80 && scoreTKP >= 166;

  const filterOptions = [
    { value: 'semua'  as StatusFilter, label: 'Semua',  count: questionsWithStatus.length, color: 'bg-slate-800 text-white' },
    { value: 'benar'  as StatusFilter, label: 'Benar',  count: totalBenar,  color: 'bg-green-500 text-white' },
    { value: 'salah'  as StatusFilter, label: 'Salah',  count: totalSalah,  color: 'bg-red-500 text-white' },
    { value: 'kosong' as StatusFilter, label: 'Kosong', count: totalKosong, color: 'bg-slate-400 text-white' },
  ];

  // Submit report
  const handleReportSubmit = async () => {
    if (!reportType || !activeQuestion) return;
    setReportSubmitting(true);
    try {
      await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: activeQuestion.id,
          question_position: activeQuestion.position,
          question_category: activeQuestion.category,
          attempt_id: attempt.id,
          package_title: attempt.packages?.title ?? '',
          report_type: reportType,
          note: reportNote,
        }),
      });
      setReportDone(true);
    } catch {
      // fail silently
    } finally {
      setReportSubmitting(false);
    }
  };

  const closeReport = () => {
    setReportOpen(false);
    setReportType('');
    setReportNote('');
    setReportDone(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden text-slate-800">

      {/* ── REPORT MODAL ──────────────────────────────────────────────── */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-500" />
                <span className="font-bold text-slate-800 text-sm">Laporkan Soal</span>
                {activeQuestion && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                    No. {activeQuestion.position} · {activeQuestion.category}
                  </span>
                )}
              </div>
              <button onClick={closeReport} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {reportDone ? (
              /* Success state */
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Laporan Terkirim!</h3>
                <p className="text-slate-500 text-sm mb-6">Terima kasih, laporan kamu akan kami tinjau segera.</p>
                <button onClick={closeReport}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
                  Tutup
                </button>
              </div>
            ) : (
              /* Form */
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">Jenis Masalah *</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'soal_salah',      label: '❌ Soal salah / typo' },
                      { val: 'jawaban_salah',    label: '🔑 Kunci jawaban salah' },
                      { val: 'pembahasan_salah', label: '📖 Pembahasan keliru' },
                      { val: 'gambar_rusak',     label: '🖼️ Gambar tidak muncul' },
                      { val: 'lainnya',          label: '💬 Lainnya' },
                    ].map((opt) => (
                      <button key={opt.val} onClick={() => setReportType(opt.val)}
                        className={cn(
                          'text-left px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all',
                          reportType === opt.val
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        )}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Keterangan Tambahan</p>
                  <textarea
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="Jelaskan masalah yang kamu temukan..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none outline-none focus:border-slate-400 bg-slate-50 text-slate-700"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={closeReport}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                    Batal
                  </button>
                  <button onClick={handleReportSubmit} disabled={!reportType || reportSubmitting}
                    className={cn(
                      'flex-2 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all flex-1',
                      reportType && !reportSubmitting
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    )}>
                    {reportSubmitting ? 'Mengirim...' : <><Send className="w-3.5 h-3.5" />Kirim Laporan</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SCROLLABLE BODY ─────────────────────────────────────────────── */}
      <main ref={mainRef} className="flex-1 overflow-y-auto p-3 md:p-5">
        <div className="max-w-7xl mx-auto w-full">

          {/* ── HERO BANNER — diperkecil ─────────────────────────────── */}
          <div className="bg-slate-800 rounded-xl px-5 py-4 mb-4 relative overflow-hidden shadow-lg border border-slate-700">
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400 rounded-full mix-blend-multiply filter blur-[70px] opacity-25 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Left */}
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-2">
                  <Link href="/dashboard" className="flex items-center gap-1 text-slate-400 hover:text-yellow-400 transition-colors text-xs font-bold group">
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />Dashboard
                  </Link>
                  <span className="text-slate-600 text-xs">·</span>
                  <Link href="/history" className="flex items-center gap-1 text-slate-400 hover:text-yellow-400 transition-colors text-xs font-bold group">
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />Riwayat
                  </Link>
                </div>

                {/* Title row */}
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <h2 className="text-base font-bold text-white">
                    Pembahasan <span className="text-yellow-400">Tryout</span>
                  </h2>
                  <div className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border',
                    isPassed ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                              : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                  )}>
                    {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {isPassed ? 'Lulus' : 'Tidak Lulus'}
                  </div>
                </div>

                {/* Subtitle */}
                <div className="flex items-center gap-3">
                  <p className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                    <BookOpen className="w-3 h-3" />
                    {attempt.packages?.title || 'Tryout SKD CPNS'}
                  </p>
                  <span className="text-slate-600 text-xs">·</span>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {submittedDateStr}{submittedTimeStr ? ` · ${submittedTimeStr}` : ''}
                  </p>
                </div>
              </div>

              {/* Score chips */}
              <div className="flex gap-2">
                {[
                  { label: 'TWK', val: scoreTWK, pass: 65,  soal: countByCategory('TWK') },
                  { label: 'TIU', val: scoreTIU, pass: 80,  soal: countByCategory('TIU') },
                  { label: 'TKP', val: scoreTKP, pass: 166, soal: countByCategory('TKP') },
                ].map((s) => (
                  <div key={s.label} className={cn(
                    'px-3 py-2 rounded-lg border flex flex-col items-center min-w-[72px]',
                    s.val >= s.pass
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-700/50 border-slate-600'
                  )}>
                    <span className={cn('text-lg font-bold', s.val >= s.pass ? 'text-emerald-400' : 'text-white')}>
                      {s.val}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</span>
                    <span className="text-[9px] text-slate-500">{s.soal} soal</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── TWO COLUMN LAYOUT ───────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-4 items-start">

            {/* ── LEFT: ACTIVE QUESTION ─────────────────────────────── */}
            <div className="flex-1 flex flex-col gap-3 w-full min-w-0">
              {activeQuestion ? (
                <>
                  <ReviewQuestionCard question={activeQuestion} />

                  {/* Nav + Report row */}
                  <div className="flex items-center justify-between pb-4 lg:pb-2">
                    <button onClick={handlePrev} disabled={activeQuestionIndex === 0}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm transition-all">
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden md:inline">Sebelumnya</span>
                    </button>

                    <div className="flex items-center gap-3">
                      {/* Laporkan button */}
                      <button onClick={() => setReportOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all shadow-sm">
                        <Flag className="w-3.5 h-3.5" />
                        Laporkan
                      </button>
                      <span className="text-sm text-slate-500 font-medium">
                        {activeQuestionIndex + 1} / {filteredQuestions.length}
                      </span>
                    </div>

                    <button onClick={handleNext} disabled={activeQuestionIndex === filteredQuestions.length - 1}
                      className="px-4 py-2 rounded-xl bg-yellow-400 border border-yellow-500 text-slate-900 text-sm font-bold hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm transition-all">
                      <span className="hidden md:inline">Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
                  <p className="text-slate-400 font-medium text-sm mb-4">Tidak ada soal yang sesuai filter ini.</p>
                  <button onClick={() => setStatusFilter('semua')}
                    className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
                    Tampilkan Semua
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: FILTER + NAV GRID ──────────────────────────── */}
            <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-3 lg:sticky lg:top-3">

              {/* Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Filter Status</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {filterOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-all border-2',
                        statusFilter === opt.value
                          ? `${opt.color} border-transparent shadow-sm`
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}>
                      <span>{opt.label}</span>
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded font-black',
                        statusFilter === opt.value ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                      )}>
                        {opt.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nav Grid */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col lg:max-h-[calc(100vh-280px)]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-700">Nomor Soal</h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {filteredQuestions.length} Soal
                  </span>
                </div>

                <div className="overflow-y-auto flex-1 pr-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                  <div className="grid grid-cols-6 gap-1">
                    {filteredQuestions.map((q, idx) => {
                      const isActive = idx === activeQuestionIndex;
                      return (
                        <button key={q.id} onClick={() => {
                            setActiveQuestionIndex(idx);
                            mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          title={`${q.category} - ${q.status}`}
                          className={cn(
                            'aspect-square rounded-md text-[10px] font-bold flex items-center justify-center transition-all border',
                            isActive && 'ring-2 ring-yellow-400 ring-offset-1 border-transparent scale-105',
                            !isActive && q.status === 'benar'  && 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
                            !isActive && q.status === 'salah'  && 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
                            !isActive && q.status === 'kosong' && 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50',
                            isActive  && q.status === 'benar'  && 'bg-green-50 text-green-700',
                            isActive  && q.status === 'salah'  && 'bg-red-50 text-red-700',
                            isActive  && q.status === 'kosong' && 'bg-white text-slate-600',
                          )}>
                          {q.position ?? idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  {filteredQuestions.length === 0 && (
                    <p className="text-center py-6 text-slate-400 text-xs">Tidak ada soal.</p>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-green-500" />Benar</div>
                  <div className="flex items-center gap-1"><XCircle className="w-2.5 h-2.5 text-red-500" />Salah</div>
                  <div className="flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5 text-slate-400" />Kosong</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}