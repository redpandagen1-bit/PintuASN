'use client';

// components/mobile/MobilePembahasan.tsx
// Mobile exam review/pembahasan — full-feature, smartphone-optimised

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, BookOpen, Calendar, Award, Flag,
  X, Send, AlignJustify,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReviewQuestionCard } from '@/components/exam/review-question-card';
import type { ReviewData } from '@/types/database';

type StatusFilter = 'semua' | 'benar' | 'salah' | 'kosong';

interface MobilePembahasanProps {
  reviewData: ReviewData;
}

export function MobilePembahasan({ reviewData }: MobilePembahasanProps) {
  const [activeIndex, setActiveIndex]       = useState(0);
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>('semua');
  const [showGrid, setShowGrid]             = useState(false);
  const [reportOpen, setReportOpen]         = useState(false);
  const [reportType, setReportType]         = useState('');
  const [reportNote, setReportNote]         = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone]         = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { questions, attempt } = reviewData;

  // ── Compute status per question ───────────────────────────────
  const questionsWithStatus = useMemo(() => questions.map(q => {
    let status: 'benar' | 'salah' | 'kosong';
    if (!q.userChoice)             status = 'kosong';
    else if (q.category === 'TKP') status = (q.score ?? 0) >= 4 ? 'benar' : 'salah';
    else                           status = q.isCorrect ? 'benar' : 'salah';
    return { ...q, status };
  }), [questions]);

  const filtered = useMemo(() => {
    if (statusFilter === 'semua') return questionsWithStatus;
    return questionsWithStatus.filter(q => q.status === statusFilter);
  }, [questionsWithStatus, statusFilter]);

  const activeQ = filtered[activeIndex] ?? null;

  const counts = useMemo(() => ({
    total:  questionsWithStatus.length,
    benar:  questionsWithStatus.filter(q => q.status === 'benar').length,
    salah:  questionsWithStatus.filter(q => q.status === 'salah').length,
    kosong: questionsWithStatus.filter(q => q.status === 'kosong').length,
  }), [questionsWithStatus]);

  // ── Attempt meta ──────────────────────────────────────────────
  const scoreTWK = attempt.score_twk ?? 0;
  const scoreTIU = attempt.score_tiu ?? 0;
  const scoreTKP = attempt.score_tkp ?? 0;
  const isPassed = scoreTWK >= 65 && scoreTIU >= 80 && scoreTKP >= 166;

  const submittedAt = attempt.submitted_at
    ? new Date(attempt.submitted_at)
    : attempt.started_at ? new Date(attempt.started_at) : null;

  const submittedStr = submittedAt
    ? submittedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  const countByCategory = (cat: string) => questions.filter(q => q.category === cat).length;

  // ── Handlers ──────────────────────────────────────────────────
  const goTo = (i: number) => {
    setActiveIndex(i);
    setShowGrid(false);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setActiveIndex(0);
    setShowGrid(false);
  };

  const handlePrev = () => activeIndex > 0 && goTo(activeIndex - 1);
  const handleNext = () => activeIndex < filtered.length - 1 && goTo(activeIndex + 1);

  // ── Report ────────────────────────────────────────────────────
  const handleReportSubmit = async () => {
    if (!reportType || !activeQ) return;
    setReportSubmitting(true);
    try {
      await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id:       activeQ.id,
          question_position: activeQ.position,
          question_category: activeQ.category,
          attempt_id:        attempt.id,
          package_title:     attempt.packages?.title ?? '',
          report_type:       reportType,
          note:              reportNote,
        }),
      });
      setReportDone(true);
    } catch { /* fail silently */ }
    finally  { setReportSubmitting(false); }
  };

  const closeReport = () => {
    setReportOpen(false);
    setReportType('');
    setReportNote('');
    setReportDone(false);
  };

  // ── Filter options ────────────────────────────────────────────
  const filterOptions = [
    { value: 'semua'  as StatusFilter, label: 'Semua',  count: counts.total,  active: 'bg-slate-800 text-white border-slate-800'  },
    { value: 'benar'  as StatusFilter, label: 'Benar',  count: counts.benar,  active: 'bg-emerald-500 text-white border-emerald-500' },
    { value: 'salah'  as StatusFilter, label: 'Salah',  count: counts.salah,  active: 'bg-red-500 text-white border-red-500'       },
    { value: 'kosong' as StatusFilter, label: 'Kosong', count: counts.kosong, active: 'bg-slate-400 text-white border-slate-400'   },
  ];

  return (
    <>
      {/* ── Report Modal ─────────────────────────────────────────── */}
      {reportOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl shadow-2xl w-full max-w-lg border-t border-slate-200 pb-safe">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-4" />

            <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-500" />
                <span className="font-bold text-slate-800 text-sm">Laporkan Soal</span>
                {activeQ && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                    No.{activeQ.position} · {activeQ.category}
                  </span>
                )}
              </div>
              <button onClick={closeReport} className="p-1.5 rounded-lg bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {reportDone ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Laporan Terkirim!</h3>
                <p className="text-slate-500 text-sm mb-6">Terima kasih, laporan kamu akan kami tinjau segera.</p>
                <button onClick={closeReport}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold">
                  Tutup
                </button>
              </div>
            ) : (
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">Jenis Masalah *</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'soal_salah',      label: '❌ Soal salah / typo'     },
                      { val: 'jawaban_salah',    label: '🔑 Kunci jawaban salah'   },
                      { val: 'pembahasan_salah', label: '📖 Pembahasan keliru'     },
                      { val: 'gambar_rusak',     label: '🖼️ Gambar tidak muncul'  },
                      { val: 'lainnya',          label: '💬 Lainnya'              },
                    ].map(opt => (
                      <button key={opt.val} onClick={() => setReportType(opt.val)}
                        className={cn(
                          'text-left px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all',
                          reportType === opt.val
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-600',
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
                    onChange={e => setReportNote(e.target.value)}
                    placeholder="Jelaskan masalah yang kamu temukan..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none outline-none focus:border-slate-400 bg-slate-50 text-slate-700"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={closeReport}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold">
                    Batal
                  </button>
                  <button onClick={handleReportSubmit} disabled={!reportType || reportSubmitting}
                    className={cn(
                      'flex-1 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all',
                      reportType && !reportSubmitting
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                    )}>
                    {reportSubmitting ? 'Mengirim...' : <><Send className="w-3.5 h-3.5" />Kirim</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Question Grid Bottom Sheet ────────────────────────────── */}
      {showGrid && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowGrid(false)}>
          <div
            className="bg-white rounded-t-3xl shadow-2xl w-full max-h-[70vh] flex flex-col border-t border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-3" />

            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">Navigasi Soal</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">
                  {filtered.length} soal
                </span>
              </div>
              <button onClick={() => setShowGrid(false)} className="p-1.5 rounded-lg bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />Benar</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />Salah</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-slate-200 inline-block" />Kosong</div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-7 gap-1.5">
                {filtered.map((q, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => goTo(idx)}
                      className={cn(
                        'aspect-square rounded-lg text-[11px] font-bold flex items-center justify-center border transition-all',
                        isActive && 'ring-2 ring-yellow-400 ring-offset-1 scale-105 border-transparent',
                        !isActive && q.status === 'benar'  && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        !isActive && q.status === 'salah'  && 'bg-red-50 text-red-700 border-red-200',
                        !isActive && q.status === 'kosong' && 'bg-white text-slate-400 border-slate-200',
                        isActive && q.status === 'benar'   && 'bg-emerald-100 text-emerald-700',
                        isActive && q.status === 'salah'   && 'bg-red-100 text-red-700',
                        isActive && q.status === 'kosong'  && 'bg-slate-100 text-slate-700',
                      )}
                    >
                      {q.position ?? idx + 1}
                    </button>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-sm">Tidak ada soal untuk filter ini.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Scrollable Content ───────────────────────────────── */}
      <main ref={contentRef} className="pb-28 overflow-y-auto">

        {/* ── Hero Header ──────────────────────────────────────────── */}
        <div className="bg-slate-800 px-4 py-4 relative overflow-hidden border-b border-slate-700">
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-[60px] opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

          <div className="relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-3">
              <Link href="/dashboard"
                className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                <ChevronLeft className="w-3.5 h-3.5" />Dashboard
              </Link>
              <span className="text-slate-600 text-xs">·</span>
              <Link href="/history"
                className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                Riwayat
              </Link>
            </div>

            {/* Title + pass/fail */}
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <h1 className="text-base font-bold text-white">
                Pembahasan <span className="text-yellow-400">Tryout</span>
              </h1>
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border',
                isPassed
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/20 border-rose-500/30 text-rose-400',
              )}>
                {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {isPassed ? 'Lulus' : 'Tidak Lulus'}
              </div>
            </div>

            {/* Package + date */}
            <div className="flex items-center gap-2 mb-3">
              <p className="text-slate-400 text-xs flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {attempt.packages?.title ?? 'Tryout SKD CPNS'}
              </p>
              {submittedStr !== '-' && (
                <>
                  <span className="text-slate-600 text-xs">·</span>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {submittedStr}
                  </p>
                </>
              )}
            </div>

            {/* Score chips */}
            <div className="flex gap-2">
              {[
                { label: 'TWK', val: scoreTWK, pass: 65,  soal: countByCategory('TWK') },
                { label: 'TIU', val: scoreTIU, pass: 80,  soal: countByCategory('TIU') },
                { label: 'TKP', val: scoreTKP, pass: 166, soal: countByCategory('TKP') },
              ].map(s => (
                <div key={s.label} className={cn(
                  'flex-1 px-3 py-2 rounded-xl border flex flex-col items-center',
                  s.val >= s.pass
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-700/50 border-slate-600',
                )}>
                  <span className={cn('text-base font-extrabold leading-none', s.val >= s.pass ? 'text-emerald-400' : 'text-white')}>
                    {s.val}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{s.label}</span>
                  <span className="text-[9px] text-slate-500">{s.soal} soal</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter Pills ─────────────────────────────────────────── */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-slate-100 bg-white sticky top-0 z-10">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex-shrink-0',
                statusFilter === opt.value
                  ? opt.active
                  : 'bg-white text-slate-600 border-slate-200',
              )}
            >
              {opt.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none',
                statusFilter === opt.value ? 'bg-white/20' : 'bg-slate-100 text-slate-500',
              )}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Question Content ─────────────────────────────────────── */}
        <div className="px-4 pt-4">
          {activeQ ? (
            <>
              {/* Position badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Soal {activeQ.position ?? activeIndex + 1} / {filtered.length}
                  </span>
                  <span className={cn(
                    'text-[10px] font-extrabold px-2 py-1 rounded-lg uppercase tracking-wide',
                    activeQ.category === 'TWK' ? 'bg-sky-100 text-sky-700'
                    : activeQ.category === 'TIU' ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-violet-100 text-violet-700',
                  )}>
                    {activeQ.category}
                  </span>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-1 rounded-lg',
                    activeQ.status === 'benar'  ? 'bg-emerald-50 text-emerald-600'
                    : activeQ.status === 'salah' ? 'bg-red-50 text-red-600'
                    : 'bg-slate-100 text-slate-500',
                  )}>
                    {activeQ.status === 'benar' ? '✓ Benar' : activeQ.status === 'salah' ? '✗ Salah' : '— Kosong'}
                  </span>
                </div>

                {/* Report button */}
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-red-200 text-red-500 text-[11px] font-bold"
                >
                  <Flag className="w-3 h-3" />Lapor
                </button>
              </div>

              {/* ReviewQuestionCard — same as desktop */}
              <ReviewQuestionCard question={activeQ} />
            </>
          ) : (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-slate-300" />
              <p className="text-slate-400 text-sm font-medium">Tidak ada soal untuk filter ini.</p>
              <button
                onClick={() => handleFilterChange('semua')}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold"
              >
                Tampilkan Semua
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Fixed Bottom Nav — Prev / Counter / Grid / Next ──────── */}
      {/* No BottomNav on review page, so fixed bottom-0 is safe */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-lg">
        <div className="flex items-center px-4 py-3 gap-3">

          {/* Prev */}
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={cn(
              'flex items-center gap-1 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all flex-shrink-0',
              activeIndex === 0
                ? 'border-slate-100 text-slate-300 bg-white'
                : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50',
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          {/* Counter + Grid button */}
          <button
            onClick={() => setShowGrid(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold"
          >
            <AlignJustify className="w-4 h-4" />
            <span>{activeIndex + 1} / {filtered.length}</span>
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={activeIndex >= filtered.length - 1}
            className={cn(
              'flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0',
              activeIndex >= filtered.length - 1
                ? 'bg-yellow-100 text-yellow-300'
                : 'bg-yellow-400 text-slate-900 hover:bg-yellow-300',
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
