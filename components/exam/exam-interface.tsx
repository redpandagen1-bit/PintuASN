'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  X,
  Loader2,
  Info,
  LayoutGrid,
  Check,
  Flag,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useExamState } from '@/hooks/use-exam-state';
import { useExamTimer } from '@/hooks/use-exam-timer';
import { useAutoSave } from '@/hooks/use-auto-save';
import { QuestionNavigatorSheet } from '@/components/exam/QuestionNavigatorSheet';
import { cn } from '@/lib/utils';
import type { QuestionWithChoices } from '@/types/exam';

interface ExamInterfaceProps {
  attemptId: string;
  packageTitle: string;
  questions: QuestionWithChoices[];
  initialAnswers: Record<string, string>;
  timeRemaining: number;
  startedAt?: string;
}

const ANSWER_LABELS = ['A', 'B', 'C', 'D', 'E'];

export function ExamInterface({
  attemptId,
  packageTitle,
  questions,
  initialAnswers,
  timeRemaining,
}: ExamInterfaceProps) {
  const {
    currentIndex,
    answers,
    flaggedQuestions,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    selectAnswer,
    toggleFlag,
    clearSavedPosition,
  } = useExamState(questions, initialAnswers, attemptId);

  const { timeLeft, isExpired } = useExamTimer(timeRemaining);

  const { isSaving, saveFailed } = useAutoSave(attemptId, answers);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showLegendDialog, setShowLegendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showNavigatorSheet, setShowNavigatorSheet] = useState(false);
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');

  // ── Laporkan soal (sama seperti halaman pembahasan) ──────────────────────
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const closeReport = () => {
    setReportOpen(false);
    setReportType('');
    setReportNote('');
    setReportDone(false);
  };

  const router = useRouter();
  const hasSubmittedRef = useRef(false);
  const currentQuestion = questions[currentIndex];

  // ── Pencatatan waktu per soal (akumulasi detik tiap soal) ───────────────
  // Murni hitung selisih Date.now() saat pindah soal — tanpa timer/loop.
  const timeSpentRef = useRef<Map<string, number>>(new Map());
  const qStartRef = useRef<number>(Date.now());
  const prevIndexRef = useRef<number>(currentIndex);

  // Akumulasi waktu soal sebelumnya saat berpindah soal
  useEffect(() => {
    const now = Date.now();
    const prevQ = questions[prevIndexRef.current];
    if (prevQ) {
      const delta = Math.round((now - qStartRef.current) / 1000);
      if (delta > 0 && delta < 3600) {
        timeSpentRef.current.set(prevQ.id, (timeSpentRef.current.get(prevQ.id) || 0) + delta);
      }
    }
    qStartRef.current = now;
    prevIndexRef.current = currentIndex;
  }, [currentIndex, questions]);

  // Flush waktu soal yang sedang dibuka (dipanggil sebelum submit)
  const flushCurrentQuestionTime = () => {
    const now = Date.now();
    const curQ = questions[prevIndexRef.current];
    if (curQ) {
      const delta = Math.round((now - qStartRef.current) / 1000);
      if (delta > 0 && delta < 3600) {
        timeSpentRef.current.set(curQ.id, (timeSpentRef.current.get(curQ.id) || 0) + delta);
      }
    }
    qStartRef.current = now;
  };

  // ── #5: Peringatkan saat jawaban gagal tersimpan (sesi/koneksi) ──────────
  const prevSaveFailedRef = useRef(false);
  useEffect(() => {
    if (saveFailed && !prevSaveFailedRef.current) {
      toast.error(
        'Jawaban gagal tersimpan otomatis. Periksa koneksi internet & jangan tutup tab. Jika berlanjut, sesi mungkin perlu login ulang.',
        { id: 'autosave-failed', duration: 6000 }
      );
    }
    if (!saveFailed && prevSaveFailedRef.current) {
      toast.success('Jawaban kembali tersimpan.', { id: 'autosave-failed', duration: 2500 });
    }
    prevSaveFailedRef.current = saveFailed;
  }, [saveFailed]);

  // ── #6: Deteksi ujian dibuka di banyak tab → peringatkan (cegah saling timpa) ──
  const multiTabWarnedRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(`exam-tab-${attemptId}`);
    const warn = () => {
      if (multiTabWarnedRef.current) return;
      multiTabWarnedRef.current = true;
      toast.error(
        'Ujian ini sedang terbuka di tab/perangkat lain. Gunakan SATU tab saja — jawaban bisa saling menimpa.',
        { id: 'multi-tab', duration: 8000 }
      );
    };
    channel.onmessage = (e) => {
      if (e.data === 'ping') channel.postMessage('pong'); // beritahu tab baru bahwa tab ini aktif
      if (e.data === 'ping' || e.data === 'pong') warn();
    };
    channel.postMessage('ping'); // sapa tab lain saat mount
    return () => channel.close();
  }, [attemptId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const question = questions[currentIndex];
      switch (event.key) {
        case 'ArrowLeft':
          if (currentIndex > 0) prevQuestion();
          break;
        case 'ArrowRight':
          if (currentIndex < questions.length - 1) nextQuestion();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5': {
          const choiceIndex = parseInt(event.key) - 1;
          const choices = question?.choices || [];
          if (choiceIndex < choices.length) selectAnswer(question.id, choices[choiceIndex].id);
          break;
        }
        case 'f':
          if (question) toggleFlag(question.id);
          break;
        case '?':
          setShowKeyboardHelp(true);
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, prevQuestion, nextQuestion, selectAnswer, toggleFlag]);

  // Auto-save timer (hanya timeRemaining) setiap 10 detik
  useEffect(() => {
    if (timeLeft <= 0) return;
    const saveInterval = setInterval(async () => {
  try {
    const res = await fetch('/api/exam/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, timeRemaining: Math.floor(timeLeft * 1000) }),
    });
    // 401 = token expired karena jaringan putus, silent fail saja
    // jangan throw agar tidak spam console error
    if (!res.ok && res.status !== 401) {
      console.warn('Save-progress failed:', res.status);
    }
  } catch {
    // network error (offline), silent fail
  }
}, 10000);
    return () => clearInterval(saveInterval);
  }, [timeLeft, attemptId]);

  // beforeunload: save timeRemaining via sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        '/api/exam/save-progress',
        new Blob(
          [JSON.stringify({ attemptId, timeRemaining: Math.floor(timeLeft * 1000) })],
          { type: 'application/json' }
        )
      );
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [attemptId, timeLeft]);

  // bfcache guard (PWA/mobile): jika halaman exam dipulihkan dari back-forward
  // cache, server-side redirect (status completed -> result) TIDAK ikut jalan.
  // Paksa reload supaya guard di server bekerja & state tidak basi.
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const handleCancel = () => setShowCancelDialog(true);

  const confirmCancel = async () => {
    setIsCancelling(true);
    try {
      hasSubmittedRef.current = true;
      const response = await fetch('/api/exam/abandon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });
      if (!response.ok) throw new Error('Gagal membatalkan ujian');
      clearSavedPosition();
      router.replace('/dashboard');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Gagal membatalkan ujian. Silakan coba lagi.');
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleSubmit = async () => {
    hasSubmittedRef.current = true;
    const toastId = toast.loading('Mengirim ujian...');
    setIsSubmitting(true);
    try {
      flushCurrentQuestionTime();
      const answersArray = Array.from(answers.entries()).map(([questionId, choiceId]) => ({
        questionId,
        choiceId,
        timeSpent: timeSpentRef.current.get(questionId) || 0,
      }));
      const response = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers: answersArray }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit exam');
      }
      toast.success('Ujian berhasil dikirim!', { id: toastId });
      clearSavedPosition();
      // replace (bukan push) supaya halaman exam keluar dari history —
      // tombol "kembali" dari result tidak balik ke exam yang sudah selesai.
      router.replace(`/exam/${attemptId}/result`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal mengirim ujian. Silakan coba lagi.', { id: toastId });
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (choiceId: string) => {
    selectAnswer(currentQuestion.id, choiceId);
  };

  const handleReportSubmit = async () => {
    if (!reportType || !currentQuestion) return;
    setReportSubmitting(true);
    try {
      await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          question_position: currentIndex + 1,
          question_category: currentQuestion.category,
          attempt_id: attemptId,
          package_title: packageTitle,
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

  useEffect(() => {
    if (isExpired && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  const isTimeWarning = timeLeft < 600;
  const isFlagged = flaggedQuestions.has(currentQuestion?.id);
  const selectedAnswer = answers.get(currentQuestion?.id);

  const categoryColor = {
    TWK: 'bg-sky-100 text-sky-700 border-sky-200',
    TIU: 'bg-green-100 text-green-700 border-green-200',
    TKP: 'bg-purple-100 text-purple-700 border-purple-200',
  }[currentQuestion?.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="flex flex-col h-dvh bg-white overflow-hidden">

      {/* ── REPORT MODAL (Laporkan Soal) ───────────────────────────── */}
      {reportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-500" />
                <span className="font-bold text-slate-800 text-sm">Laporkan Soal</span>
                {currentQuestion && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                    No. {currentIndex + 1} · {currentQuestion.category}
                  </span>
                )}
              </div>
              <button onClick={closeReport} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            {reportDone ? (
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
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">Jenis Masalah *</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'soal_salah',       label: '❌ Soal salah / typo' },
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
                      'flex-1 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all',
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

      {/* ── MOBILE HEADER (hidden md+) — judul paket + timer ───────── */}
      <header className="flex md:hidden flex-shrink-0 bg-slate-800 items-center px-4 gap-2 h-14 z-10">
        <h1 className="flex-1 min-w-0 text-sm font-bold text-white truncate">
          {packageTitle}
        </h1>

        {/* Timer */}
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-base flex-shrink-0',
          isTimeWarning
            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
            : 'bg-slate-700/60 text-white'
        )}>
          <Clock size={15} className={isTimeWarning ? 'animate-pulse' : ''} />
          <span>{formatTime(Math.floor(timeLeft))}</span>
        </div>
      </header>

      {/* ── DESKTOP HEADER (hidden mobile) ─────────────────────────── */}
      <header className="hidden md:flex flex-shrink-0 bg-slate-800 border-b border-slate-700 z-10">
        <div className="flex items-center justify-between px-6 py-3.5 w-full">
          <h1 className="text-xl font-bold text-white truncate max-w-sm">
            {packageTitle}
          </h1>
          <div className={cn(
            'flex items-center gap-2.5 px-5 py-2 rounded-xl font-mono font-bold text-2xl tracking-wide',
            isTimeWarning
              ? 'bg-red-500/20 text-red-300 border-2 border-red-500/50'
              : 'bg-slate-700 text-white border-2 border-slate-600'
          )}>
            <Clock className={cn('w-5 h-5', isTimeWarning && 'animate-pulse')} />
            <span>{formatTime(Math.floor(timeLeft))}</span>
            {isTimeWarning && (
              <span className="text-xs font-semibold text-red-300 animate-pulse ml-1">Segera Habis!</span>
            )}
          </div>
          <div className="w-32 flex justify-end">
            {isSaving && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Menyimpan...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── QUESTION AREA ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto py-4 px-4 md:py-6 md:px-8">

            {/* Meta + aksi — MOBILE (di atas soal): counter, tandai, laporkan, batal, selesai */}
            <div className="flex md:hidden items-center gap-1.5 mb-4">
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0',
                categoryColor
              )}>
                {currentQuestion?.category}
              </span>
              <span className="text-xs font-semibold text-slate-600 flex-1 min-w-0 truncate">
                Soal {currentIndex + 1}<span className="text-slate-400 font-normal"> / {questions.length}</span>
              </span>
              <button
                onClick={() => toggleFlag(currentQuestion?.id)}
                aria-label={isFlagged ? 'Hapus tandai' : 'Tandai soal'}
                className={cn(
                  'w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border transition',
                  isFlagged ? 'bg-yellow-50 border-yellow-300 text-yellow-600' : 'border-slate-200 text-slate-400'
                )}
              >
                {isFlagged ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              </button>
              <button
                onClick={() => setReportOpen(true)}
                aria-label="Laporkan soal"
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 transition"
              >
                <Flag size={15} />
              </button>
              <button
                onClick={handleCancel}
                className="px-2.5 h-8 flex-shrink-0 rounded-lg border-2 border-red-200 text-red-600 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => setShowSubmitDialog(true)}
                className="px-2.5 h-8 flex-shrink-0 rounded-lg bg-slate-800 text-yellow-400 text-xs font-bold"
              >
                Selesai
              </button>
            </div>

            {/* Meta + tandai — DESKTOP */}
            <div className="hidden md:flex items-center gap-3 mb-6">
              <span className={cn(
                'text-xs font-bold px-3 py-1 rounded-full border tracking-wide',
                categoryColor
              )}>
                {currentQuestion?.category}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                Soal {currentIndex + 1}
                <span className="text-slate-400"> / {questions.length}</span>
              </span>
              <button
                onClick={() => toggleFlag(currentQuestion?.id)}
                title={isFlagged ? 'Hapus Tandai (F)' : 'Tandai Soal (F)'}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-lg border-2 transition-all',
                  isFlagged
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-600'
                    : 'border-slate-200 text-slate-400 hover:border-yellow-300 hover:text-yellow-600'
                )}
              >
                {isFlagged ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>

            {/* Question text */}
            {currentQuestion?.content && (
              <p
                className={cn(
                  'text-slate-800 font-normal mb-5',
                  textSize === 'sm' && 'text-sm leading-6',
                  textSize === 'md' && 'text-base leading-7',
                  textSize === 'lg' && 'text-lg leading-8',
                )}
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                {currentQuestion.content}
              </p>
            )}

            {/* Question image — kotak ternormalisasi (ramah SVG figural, ukuran tak ikut file) */}
            {currentQuestion?.image_url && (
              <div className="mb-6 flex justify-center">
                <img
                  src={currentQuestion.image_url}
                  alt="Gambar soal"
                  className="rounded-xl border border-slate-200 bg-white shadow-sm p-3"
                  style={{ width: '100%', maxWidth: 560, height: 'auto', maxHeight: 380, objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Pemisah + label area jawaban */}
            <div className="border-t border-slate-100 pt-5 mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pilih jawaban
              </p>
            </div>

            {/* Answer choices — figural (gambar) pakai grid 5 kolom seragam; teks tetap bertumpuk */}
            {currentQuestion?.choices.some(c => !!(c as any).image_url) ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 pb-4 md:pb-0">
                {currentQuestion?.choices.map((choice, idx) => {
                  const isSelected = selectedAnswer === choice.id;
                  const choiceImageUrl = (choice as any).image_url as string | undefined;
                  const choiceLabel = choice.label ?? ANSWER_LABELS[idx];
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswerSelect(choice.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border-2 p-1.5 sm:p-2 transition-all duration-150 active:scale-[0.97]',
                        isSelected
                          ? 'border-sky-500 bg-sky-50 shadow-sm'
                          : 'border-slate-200 bg-white shadow-sm hover:border-sky-300 hover:bg-slate-50'
                      )}
                    >
                      <span className={cn(
                        'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2',
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      )}>
                        {choiceLabel}
                      </span>
                      <div className="w-full aspect-square flex items-center justify-center bg-white rounded-lg overflow-hidden">
                        {choiceImageUrl && (
                          <img
                            src={choiceImageUrl}
                            alt={`Pilihan ${choiceLabel}`}
                            className="w-full h-full"
                            style={{ objectFit: 'contain' }}
                          />
                        )}
                      </div>
                      {choice.content && (
                        <span className="text-[10px] leading-tight text-center text-slate-600 line-clamp-2">
                          {choice.content}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 pb-4 md:pb-0">
                {currentQuestion?.choices.map((choice, idx) => {
                  const isSelected = selectedAnswer === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswerSelect(choice.id)}
                      className={cn(
                        'w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border-2 transition-all duration-150 text-left active:scale-[0.99]',
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-200'
                          : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50'
                      )}
                    >
                      <span className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'bg-white text-slate-500 border-slate-300'
                      )}>
                        {choice.label ?? ANSWER_LABELS[idx]}
                      </span>
                      <span
                        className={cn(
                          'flex-1 leading-relaxed',
                          textSize === 'sm' && 'text-xs',
                          textSize === 'md' && 'text-sm',
                          textSize === 'lg' && 'text-base',
                          isSelected ? 'text-sky-900 font-medium' : 'text-slate-700'
                        )}
                        style={{ fontFamily: 'var(--font-jakarta)' }}
                      >
                        {choice.content}
                      </span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-sky-500 flex-shrink-0" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigasi bawah pilihan — DESKTOP: Sebelumnya | Laporkan | Selanjutnya */}
            <div className="hidden md:flex items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-100">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                  currentIndex === 0
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                )}
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <Flag className="w-4 h-4" /> Laporkan
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                  currentIndex === questions.length - 1
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                )}
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </main>

        {/* ── DESKTOP SIDEBAR ─────────────────────────────────────── */}
        <aside className="hidden md:flex flex-shrink-0 w-72 bg-white border-l border-slate-200 flex-col overflow-hidden shadow-sm">

          {/* Fixed top controls — tidak ikut scroll */}
          <div className="flex-shrink-0 p-4 space-y-3">

            {/* Answer buttons A–E */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Pilih Jawaban
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {ANSWER_LABELS.map((label, idx) => {
                  const choice = currentQuestion?.choices[idx];
                  if (!choice) return null;
                  const isSelected = selectedAnswer === choice.id;
                  return (
                    <button
                      key={label}
                      onClick={() => handleAnswerSelect(choice.id)}
                      className={cn(
                        'aspect-square rounded-lg text-sm font-bold border-2 transition-all duration-150',
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-500 shadow scale-105'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigasi soal (ikon) — di bawah Pilih Jawaban */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                title="Sebelumnya (←)"
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-xs font-semibold transition-all',
                  currentIndex === 0
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                )}
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                title="Selanjutnya (→)"
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-xs font-semibold transition-all',
                  currentIndex === questions.length - 1
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                )}
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="border-t border-slate-100" />

            {/* Sudah selesai? — Batal + Selesai sejajar */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Sudah selesai?
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="py-2.5 rounded-lg border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-40"
                >
                  Batal
                </button>
                <button
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={isSubmitting}
                  className="py-2.5 rounded-lg bg-slate-800 text-yellow-400 text-sm font-bold hover:bg-slate-700 transition-all disabled:opacity-40 shadow-sm"
                >
                  {isSubmitting ? 'Mengirim...' : 'Selesai'}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Ukuran Teks (sebelum Keterangan Warna) */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Ukuran Teks
              </p>
              <div className="grid grid-cols-3 gap-1">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={cn(
                      'py-1 rounded-lg text-xs font-semibold border-2 transition-all',
                      textSize === size
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
                    )}
                  >
                    {size === 'sm' ? 'Kecil' : size === 'md' ? 'Sedang' : 'Besar'}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Keterangan Warna (setelah Ukuran Teks) */}
            <button
              onClick={() => setShowLegendDialog(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all"
            >
              <span className="font-semibold">Keterangan Warna</span>
              <Info className="w-3.5 h-3.5" />
            </button>

            <div className="border-t border-slate-100" />

            {/* Navigation header — fixed, tidak ikut scroll */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Navigasi Soal
              </p>
              <span className="text-[10px] text-slate-400 font-medium">
                {answers.size}/{questions.length}
              </span>
            </div>
          </div>

          {/* Scrollable question grid — HANYA grid nomor soal yang scroll */}
          <div className="flex-1 overflow-y-auto px-4 pb-3">
            <div className="grid grid-cols-6 gap-1">
              {questions.map((q, index) => {
                const isAnswered = answers.has(q.id);
                const isMarked = flaggedQuestions.has(q.id);
                const isCurrent = index === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    aria-label={`Soal ${index + 1}${isAnswered ? ', dijawab' : ''}${isMarked ? ', ditandai' : ''}${isCurrent ? ', aktif' : ''}`}
                    className={cn(
                      'aspect-square rounded text-[11px] font-semibold transition-all',
                      isCurrent && 'border-2 border-sky-500 bg-sky-50 text-sky-700',
                      !isCurrent && isMarked && 'bg-yellow-400 text-white hover:bg-yellow-500',
                      !isCurrent && !isMarked && isAnswered && 'bg-sky-500 text-white hover:bg-sky-600',
                      !isCurrent && !isMarked && !isAnswered && 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-slate-100 px-4 py-2">
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors py-1 rounded hover:bg-slate-50"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Pintasan Keyboard</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ── CANCEL DIALOG ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Batalkan Ujian?</DialogTitle>
            <DialogDescription>
              Ujian akan dibatalkan dan <strong>tidak bisa dilanjutkan</strong>.
              Jika ingin mencoba lagi, Anda harus memulai dari awal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Lanjutkan Ujian
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={isCancelling}
            >
              {isCancelling
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Membatalkan...</>
                : 'Ya, Batalkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MOBILE BOTTOM BAR (hidden md+) ──────────────────────────── */}
      <div className="flex md:hidden flex-shrink-0 bg-white border-t border-slate-200 items-center px-3 py-2 gap-2 pb-safe">
        {/* Sebelumnya — kompak, dengan teks */}
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className={cn(
            'flex-shrink-0 h-11 px-3 flex items-center justify-center gap-1 rounded-xl border-2 text-xs font-semibold transition-all',
            currentIndex === 0
              ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 active:scale-[0.98]'
          )}
        >
          <ChevronLeft size={16} /> Sebelumnya
        </button>

        {/* Navigator trigger — slate, dominan di tengah */}
        <button
          onClick={() => setShowNavigatorSheet(true)}
          className="flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-800 text-white text-base font-semibold active:scale-[0.98] transition-all"
        >
          <LayoutGrid size={18} />
          <span>
            <span className="text-yellow-400 font-bold">{answers.size}</span>
            <span className="text-slate-400">/{questions.length}</span>
          </span>
        </button>

        {/* Selanjutnya — kompak, dengan teks */}
        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
          className={cn(
            'flex-shrink-0 h-11 px-3 flex items-center justify-center gap-1 rounded-xl border-2 text-xs font-semibold transition-all',
            currentIndex === questions.length - 1
              ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 active:scale-[0.98]'
          )}
        >
          Selanjutnya <ChevronRight size={16} />
        </button>
      </div>

      {/* ── QUESTION NAVIGATOR SHEET (mobile) ───────────────────────── */}
      <QuestionNavigatorSheet
        isOpen={showNavigatorSheet}
        onClose={() => setShowNavigatorSheet(false)}
        questions={questions}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        currentIndex={currentIndex}
        goToQuestion={goToQuestion}
        textSize={textSize}
        setTextSize={setTextSize}
        onSubmit={() => { setShowNavigatorSheet(false); setShowSubmitDialog(true); }}
        isSubmitting={isSubmitting}
      />

      {/* ── LEGEND DIALOG ── */}
      <Dialog open={showLegendDialog} onOpenChange={setShowLegendDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Keterangan Warna</DialogTitle>
            <DialogDescription>Status setiap nomor soal di panel navigasi</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {[
              { cls: 'border-2 border-sky-500 bg-sky-50', label: 'Soal yang sedang dibuka' },
              { cls: 'bg-sky-500', label: 'Sudah dijawab' },
              { cls: 'bg-yellow-400', label: 'Ditandai untuk review' },
              { cls: 'bg-slate-100 border border-slate-300', label: 'Belum dijawab' },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={cn('w-7 h-7 rounded flex-shrink-0', cls)} />
                <span className="text-sm text-slate-700">{label}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLegendDialog(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SUBMIT DIALOG ── */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan Ujian?</DialogTitle>
            <DialogDescription>Pastikan Anda telah menjawab semua soal sebelum mengirim.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Total Soal</span><p className="font-semibold text-slate-900">{questions.length}</p></div>
              <div><span className="text-slate-500">Terjawab</span><p className="font-semibold text-slate-900">{answers.size}</p></div>
              <div><span className="text-slate-500">Belum Dijawab</span><p className="font-semibold text-red-500">{questions.length - answers.size}</p></div>
              <div><span className="text-slate-500">Ditandai</span><p className="font-semibold text-yellow-600">{flaggedQuestions.size}</p></div>
            </div>
            {answers.size < questions.length && (
              <Alert><AlertDescription>Masih ada {questions.length - answers.size} soal yang belum dijawab.</AlertDescription></Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} disabled={isSubmitting}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengirim...</> : 'Ya, Selesai'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── KEYBOARD HELP DIALOG ── */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><HelpCircle className="h-4 w-4" />Pintasan Keyboard</DialogTitle>
            <DialogDescription>Navigasi cepat tanpa mouse</DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5">
            {[
              { key: '←', desc: 'Soal sebelumnya' },
              { key: '→', desc: 'Soal selanjutnya' },
              { key: '1 – 5', desc: 'Pilih jawaban A – E' },
              { key: 'F', desc: 'Tandai / hapus tandai soal' },
              { key: '?', desc: 'Tampilkan bantuan ini' },
            ].map(({ key, desc }) => (
              <div key={key} className="flex items-center gap-3 text-sm">
                <kbd className="px-2.5 py-1 font-mono text-xs bg-slate-100 border border-slate-300 rounded-md min-w-[44px] text-center">{key}</kbd>
                <span className="text-slate-600">{desc}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowKeyboardHelp(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
