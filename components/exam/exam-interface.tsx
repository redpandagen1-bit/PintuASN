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

  const { isSaving } = useAutoSave(attemptId, answers);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showLegendDialog, setShowLegendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showNavigatorSheet, setShowNavigatorSheet] = useState(false);
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');

  const router = useRouter();
  const hasSubmittedRef = useRef(false);
  const currentQuestion = questions[currentIndex];

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
      router.push('/dashboard');
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
      const answersArray = Array.from(answers.entries()).map(([questionId, choiceId]) => ({
        questionId,
        choiceId,
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
      router.push(`/exam/${attemptId}/result`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal mengirim ujian. Silakan coba lagi.', { id: toastId });
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (choiceId: string) => {
    selectAnswer(currentQuestion.id, choiceId);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => nextQuestion(), 400);
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
    TWK: 'bg-blue-100 text-blue-700 border-blue-200',
    TIU: 'bg-green-100 text-green-700 border-green-200',
    TKP: 'bg-purple-100 text-purple-700 border-purple-200',
  }[currentQuestion?.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* ── MOBILE HEADER (hidden md+) ─────────────────────────────── */}
      <header className="flex md:hidden flex-shrink-0 bg-slate-800 items-center px-3 gap-2 h-14 z-10">
        {/* Cancel */}
        <button
          onClick={handleCancel}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-700/60 hover:bg-slate-700 transition"
          aria-label="Batalkan ujian"
        >
          <X size={16} className="text-slate-300" />
        </button>

        {/* Soal counter + category */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0',
            categoryColor,
          )}>
            {currentQuestion?.category}
          </span>
          <span className="text-sm font-semibold text-slate-200 truncate">
            Soal {currentIndex + 1}
            <span className="text-slate-400 font-normal"> / {questions.length}</span>
          </span>
        </div>

        {/* Flag */}
        <button
          onClick={() => toggleFlag(currentQuestion?.id)}
          aria-label={isFlagged ? 'Hapus tandai' : 'Tandai soal'}
          className={cn(
            'w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition',
            isFlagged
              ? 'bg-yellow-400/20 text-yellow-400'
              : 'bg-slate-700/60 text-slate-400 hover:text-yellow-400'
          )}
        >
          {isFlagged ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>

        {/* Timer */}
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-sm flex-shrink-0',
          isTimeWarning
            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
            : 'bg-slate-700/60 text-slate-100'
        )}>
          <Clock size={13} className={isTimeWarning ? 'animate-pulse' : ''} />
          <span>{formatTime(Math.floor(timeLeft))}</span>
        </div>
      </header>

      {/* ── DESKTOP HEADER (hidden mobile) ─────────────────────────── */}
      <header className="hidden md:flex flex-shrink-0 bg-slate-800 border-b border-slate-700 z-10">
        <div className="flex items-center justify-between px-6 py-3.5 w-full">
          <h1 className="text-sm font-semibold text-slate-100 truncate max-w-xs">
            {packageTitle}
          </h1>
          <div className={cn(
            'flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono font-bold text-base',
            isTimeWarning
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-slate-700 text-slate-100 border border-slate-600'
          )}>
            <Clock className="w-4 h-4" />
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

            {/* Question meta — desktop only (mobile shows in header) */}
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
            </div>

            {/* Question text */}
            {currentQuestion?.content && (
              <p className={cn(
                'text-slate-900 font-medium mb-5',
                textSize === 'sm' && 'text-sm leading-7',
                textSize === 'md' && 'text-base leading-7',
                textSize === 'lg' && 'text-lg leading-8',
              )}>
                {currentQuestion.content}
              </p>
            )}

            {/* Question image */}
            {currentQuestion?.image_url && (
              <div className="mb-6">
                <img
                  src={currentQuestion.image_url}
                  alt="Gambar soal"
                  className="max-w-full h-auto rounded-xl border border-slate-200 shadow-sm"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Answer choices — fully clickable on all screen sizes */}
            <div className="space-y-2 pb-4 md:pb-0">
              {currentQuestion?.choices.map((choice, idx) => {
                const isSelected = selectedAnswer === choice.id;
                const choiceImageUrl = (choice as any).image_url as string | undefined;
                const hasText = !!choice.content;
                const hasImage = !!choiceImageUrl;

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswerSelect(choice.id)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left active:scale-[0.99]',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:bg-slate-50'
                    )}
                  >
                    <span className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2',
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    )}>
                      {ANSWER_LABELS[idx]}
                    </span>

                    {/* Choice content */}
                    <div className="flex flex-col gap-2 flex-1">
                      {hasImage && (
                        <img
                          src={choiceImageUrl}
                          alt={`Pilihan ${ANSWER_LABELS[idx]}`}
                          className="max-w-full h-auto rounded-lg border border-slate-200"
                          style={{ maxHeight: '160px', objectFit: 'contain' }}
                        />
                      )}
                      {hasText && (
                        <span className={cn(
                          'leading-snug font-normal',
                          textSize === 'sm' && 'text-xs',
                          textSize === 'md' && 'text-sm',
                          textSize === 'lg' && 'text-base',
                          isSelected ? 'text-blue-900' : 'text-slate-900'
                        )}>
                          {choice.content}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </main>

        {/* ── DESKTOP SIDEBAR ─────────────────────────────────────── */}
        <aside className="hidden md:flex flex-shrink-0 w-60 bg-white border-l border-slate-200 flex-col overflow-hidden shadow-sm">

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
                          ? 'bg-blue-500 text-white border-blue-500 shadow scale-105'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Action buttons */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Aksi
              </p>
              <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                <button
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  title="Sebelumnya (←)"
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center border-2 transition-all',
                    currentIndex === 0
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={currentIndex === questions.length - 1}
                  title="Selanjutnya (→)"
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center border-2 transition-all',
                    currentIndex === questions.length - 1
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleFlag(currentQuestion?.id)}
                  title={isFlagged ? 'Hapus Tandai (F)' : 'Tandai Soal (F)'}
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center border-2 transition-all',
                    isFlagged
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                      : 'border-slate-200 text-slate-500 hover:border-yellow-300 hover:text-yellow-600 hover:bg-yellow-50'
                  )}
                >
                  {isFlagged ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCancel}
                  title="Batalkan Ujian"
                  className="aspect-square rounded-lg flex items-center justify-center border-2 border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-all disabled:opacity-40"
              >
                {isSubmitting ? 'Mengirim...' : 'Submit Ujian'}
              </button>
            </div>

            <div className="border-t border-slate-100" />

            <button
              onClick={() => setShowLegendDialog(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all"
            >
              <span className="font-semibold">Keterangan Warna</span>
              <Info className="w-3.5 h-3.5" />
            </button>

            <div className="border-t border-slate-100" />

            {/* Text size selector */}
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
                      isCurrent && 'border-2 border-blue-500 bg-blue-50 text-blue-700',
                      !isCurrent && isMarked && 'bg-yellow-400 text-white hover:bg-yellow-500',
                      !isCurrent && !isMarked && isAnswered && 'bg-blue-500 text-white hover:bg-blue-600',
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
        {/* Prev */}
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className={cn(
            'w-11 h-11 flex items-center justify-center rounded-xl border-2 flex-shrink-0 transition-all',
            currentIndex === 0
              ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 active:scale-95'
          )}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Navigator trigger — center */}
        <button
          onClick={() => setShowNavigatorSheet(true)}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-800 text-white text-sm font-semibold active:scale-[0.98] transition-all"
        >
          <LayoutGrid size={15} />
          <span>
            <span className="text-blue-300 font-bold">{answers.size}</span>
            <span className="text-slate-400"> / {questions.length}</span>
            <span className="ml-1">dijawab</span>
          </span>
        </button>

        {/* Next */}
        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
          className={cn(
            'w-11 h-11 flex items-center justify-center rounded-xl border-2 flex-shrink-0 transition-all',
            currentIndex === questions.length - 1
              ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 active:scale-95'
          )}
        >
          <ChevronRight size={20} />
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
              { cls: 'border-2 border-blue-500 bg-blue-50', label: 'Soal yang sedang dibuka' },
              { cls: 'bg-blue-500', label: 'Sudah dijawab' },
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
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengirim...</> : 'Submit Ujian'}
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
