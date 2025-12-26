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
import { ChevronLeft, ChevronRight, Clock, HelpCircle } from 'lucide-react';
import { useExamState } from '@/hooks/use-exam-state';
import { useExamTimer } from '@/hooks/use-exam-timer';
import { useAutoSave } from '@/hooks/use-auto-save';
import { QuestionDisplay } from '@/components/exam/question-display';
import { QuestionNavigator } from '@/components/exam/question-navigator';
import { cn } from '@/lib/utils';
import type { QuestionWithChoices } from '@/types/exam';

interface ExamInterfaceProps {
  attemptId: string;
  packageTitle: string;
  questions: QuestionWithChoices[];
  initialAnswers: Record<string, string>;
  timeRemaining: number;
}

export function ExamInterface({ 
  attemptId,
  packageTitle,
  questions,
  initialAnswers,
  timeRemaining
}: ExamInterfaceProps) {
  const { 
    currentIndex, 
    answers, 
    flaggedQuestions,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    selectAnswer,
    toggleFlag
  } = useExamState(questions, initialAnswers);

  const { timeLeft, isExpired } = useExamTimer(timeRemaining);

  const { isSaving } = useAutoSave(attemptId, answers);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const router = useRouter();
  const hasSubmittedRef = useRef(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (currentIndex > 0) {
            prevQuestion();
          }
          break;
        case 'ArrowRight':
          if (currentIndex < questions.length - 1) {
            nextQuestion();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          // Select answer choices 1-5
          const choiceIndex = parseInt(event.key) - 1;
          const choices = currentQuestion?.choices || [];
          if (choiceIndex < choices.length) {
            selectAnswer(currentQuestion.id, choices[choiceIndex].id);
          }
          break;
        case 'f':
          // Toggle flag
          toggleFlag(currentQuestion.id);
          break;
        case '?':
          // Show keyboard help
          setShowKeyboardHelp(true);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length, currentQuestion, prevQuestion, nextQuestion, selectAnswer, toggleFlag]);

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const handleSubmit = async () => {
    const toastId = toast.loading('Mengirim ujian...');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          attemptId,
          answers: Object.fromEntries(answers)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      toast.success('Ujian berhasil dikirim!', { id: toastId });
      router.push(`/exam/${attemptId}/result`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal mengirim ujian. Silakan coba lagi.', { id: toastId });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
  if (isExpired && !hasSubmittedRef.current) {
    hasSubmittedRef.current = true;
    handleSubmit();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isExpired]);

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Langsung ke konten utama
      </a>
      
      {/* Top Bar (sticky) */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" aria-hidden="true" />
            <div 
              className={cn(
                "text-base sm:text-lg font-mono font-semibold",
                timeLeft < 600 && "text-red-600"
              )}
              aria-live="polite"
              aria-atomic="true"
            >
              {formatTime(Math.floor(timeLeft))}
            </div>
          </div>

          {/* Package Title */}
          <div className="hidden md:block">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate max-w-md">
              {packageTitle}
            </h1>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={() => setShowSubmitDialog(true)}
            variant="default"
            size="sm"
            className="min-h-[44px] text-xs sm:text-sm sm:min-h-[44px]"
            aria-label="Kirim ujian"
          >
            Submit Ujian
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
          {/* Left: Question Display */}
          <section className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
            <QuestionDisplay
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              selectedAnswer={answers.get(currentQuestion?.id)}
              onAnswerSelect={(choiceId: string) => selectAnswer(currentQuestion.id, choiceId)}
              isFlagged={flaggedQuestions.has(currentQuestion?.id)}
              onToggleFlag={() => toggleFlag(currentQuestion?.id)}
            />

            {/* Bottom Navigation */}
            <nav className="flex items-center justify-between mt-4 sm:mt-6" aria-label="Navigasi soal">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                size="sm"
                className="min-h-[44px] text-xs sm:text-sm sm:min-h-[44px]"
                aria-label="Soal sebelumnya"
              >
                <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sebelumnya</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              {/* Auto-save indicator */}
              {isSaving && (
                <div 
                  className="text-xs sm:text-sm text-slate-600"
                  role="status"
                  aria-live="polite"
                >
                  Menyimpan...
                </div>
              )}

              <Button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                size="sm"
                className="min-h-[44px] text-xs sm:text-sm sm:min-h-[44px]"
                aria-label="Soal selanjutnya"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
              </Button>
            </nav>
          </section>

          {/* Question Navigator Sidebar */}
          <nav>
            <QuestionNavigator
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              onNavigate={goToQuestion}
            />
          </nav>
        </div>
      </main>

      {/* Mobile Navigator Component */}
      <div className="lg:hidden bg-white border-t border-slate-200 p-4">
        <QuestionNavigator
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onNavigate={goToQuestion}
        />
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan Ujian?</DialogTitle>
            <DialogDescription>
              Pastikan Anda telah menjawab semua soal sebelum mengirim.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Total Soal:</span>
                <p className="font-semibold">{questions.length}</p>
              </div>
              <div>
                <span className="text-slate-600">Terjawab:</span>
                <p className="font-semibold">{answers.size}</p>
              </div>
              <div>
                <span className="text-slate-600">Belum Dijawab:</span>
                <p className="font-semibold text-red-600">
                  {questions.length - answers.size}
                </p>
              </div>
            </div>

            {answers.size < questions.length && (
              <Alert>
                <AlertDescription>
                  Masih ada {questions.length - answers.size} soal yang belum dijawab.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSubmitDialog(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Submit Ujian'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard Help Dialog */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Pintasan Keyboard
            </DialogTitle>
            <DialogDescription>
              Gunakan keyboard untuk navigasi cepat
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 border border-slate-300 rounded">←</kbd>
                <span>Soal sebelumnya</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 border border-slate-300 rounded">→</kbd>
                <span>Soal selanjutnya</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 border border-slate-300 rounded">1-5</kbd>
                <span>Pilih jawaban</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 border border-slate-300 rounded">F</kbd>
                <span>Tandai soal</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowKeyboardHelp(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard Help Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowKeyboardHelp(true)}
        className="fixed bottom-4 right-4 min-h-[44px] bg-white border border-slate-200 shadow-md hover:bg-slate-50"
        aria-label="Bantuan keyboard"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
