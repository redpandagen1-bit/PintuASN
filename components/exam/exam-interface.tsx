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
} from 'lucide-react';
import { useExamState } from '@/hooks/use-exam-state';
import { useExamTimer } from '@/hooks/use-exam-timer';
import { useAutoSave } from '@/hooks/use-auto-save';
import { cn } from '@/lib/utils';
import type { QuestionWithChoices } from '@/types/exam';

interface ExamInterfaceProps {
  attemptId: string;
  packageTitle: string;
  questions: QuestionWithChoices[];
  initialAnswers: Record<string, string>;
  timeRemaining: number;
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
  } = useExamState(questions, initialAnswers);

  const { timeLeft, isExpired } = useExamTimer(timeRemaining);
  const { isSaving } = useAutoSave(attemptId, answers);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showLegendDialog, setShowLegendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const router = useRouter();
  const hasSubmittedRef = useRef(false);
  const currentQuestion = questions[currentIndex];

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

  // Auto-save timer setiap 10s
  useEffect(() => {
    if (timeLeft <= 0) return;
    const saveInterval = setInterval(async () => {
      try {
        await fetch('/api/exam/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId, timeRemaining: Math.floor(timeLeft * 1000) }),
        });
      } catch (error) {
        console.error('Failed to auto-save timer:', error);
      }
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [timeLeft, attemptId]);

  // RESTORED: beforeunload → save progress (bukan cancel)
  // Refresh / close tab = progress tersimpan dan bisa dilanjutkan
  // Cancel permanen hanya via tombol X (manual)
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        '/api/exam/save-progress',
        JSON.stringify({ attemptId, timeRemaining: Math.floor(timeLeft * 1000) }),
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

  // Tombol X → dialog konfirmasi → cancel permanen (tidak bisa dilanjutkan)
  const handleCancel = () => setShowCancelDialog(true);

  const confirmCancel = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch('/api/exam/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });
      if (!response.ok) throw new Error('Gagal membatalkan ujian');
      router.push('/dashboard');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Gagal membatalkan ujian. Silakan coba lagi.');
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleSubmit = async () => {
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
      router.push(`/exam/${attemptId}/result`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal mengirim ujian. Silakan coba lagi.', { id: toastId });
      setIsSubmitting(false);
    }
  };

  // Jawaban hanya bisa dipilih dari tombol A-E di sidebar
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
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-slate-800 border-b border-slate-700 z-10">
        <div className="flex items-center justify-between px-6 py-3.5">
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

        {/* ── LEFT: QUESTION AREA ─────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6 px-6">

            {/* Question meta */}
            <div className="flex items-center gap-3 mb-4">
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
              <p className="text-sm leading-6 text-slate-800 font-normal mb-5">
                {currentQuestion.content}
              </p>
            )}

            {/* Question image */}
            {currentQuestion?.image_url && (
              <div className="mb-5">
                <img
                  src={currentQuestion.image_url}
                  alt="Gambar soal"
                  className="max-w-full h-auto rounded-xl border border-slate-200 shadow-sm"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Answer choices — display only, tidak bisa diklik */}
            <div className="space-y-2">
              {currentQuestion?.choices.map((choice, idx) => {
                const isSelected = selectedAnswer === choice.id;
                const choiceImageUrl = (choice as any).image_url as string | undefined;
                const hasText = !!choice.content;
                const hasImage = !!choiceImageUrl;

                return (
                  <div
                    key={choice.id}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 min-h-[52px] rounded-xl border-2 select-none pointer-events-none',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 bg-white shadow-sm'
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
                    <div className="flex flex-col gap-1 flex-1">
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
                          'text-sm leading-snug font-normal',
                          isSelected ? 'text-blue-900' : 'text-slate-600'
                        )}>
                          {choice.content}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </main>

        {/* ── RIGHT: NAVIGATION PANEL ────────────────────────────── */}
        <aside className="flex-shrink-0 w-60 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* Answer buttons A–E */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Aksi
              </p>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all"
            >
              <span className="font-semibold">Keterangan Warna</span>
              <Info className="w-3.5 h-3.5" />
            </button>

            <div className="border-t border-slate-100" />

            {/* Question grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Navigasi Soal
                </p>
                <span className="text-[10px] text-slate-400 font-medium">
                  {answers.size}/{questions.length}
                </span>
              </div>
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

          </div>

          <div className="flex-shrink-0 border-t border-slate-100 px-4 py-3">
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