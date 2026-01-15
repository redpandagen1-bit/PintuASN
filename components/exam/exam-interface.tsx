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

  // ⭐ PINDAHKAN KE ATAS - Define currentQuestion SEBELUM useEffect
  const currentQuestion = questions[currentIndex];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // ⭐ FIX: Akses question langsung dari questions array
      const question = questions[currentIndex];
      
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
          const choices = question?.choices || [];
          if (choiceIndex < choices.length) {
            selectAnswer(question.id, choices[choiceIndex].id);
          }
          break;
        case 'f':
          // Toggle flag
          if (question) {
            toggleFlag(question.id);
          }
          break;
        case '?':
          // Show keyboard help
          setShowKeyboardHelp(true);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, prevQuestion, nextQuestion, selectAnswer, toggleFlag]);
  // ⭐ FIX: Hapus currentQuestion dari dependencies, pakai currentIndex & questions

  // ⭐ Auto-save timer setiap 10 detik
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const saveInterval = setInterval(async () => {
      try {
        await fetch('/api/exam/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            timeRemaining: Math.floor(timeLeft * 1000),
          }),
        });
        console.log('Timer auto-saved:', Math.floor(timeLeft));
      } catch (error) {
        console.error('Failed to auto-save timer:', error);
      }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [timeLeft, attemptId]);

  // Save timer saat user keluar
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await fetch('/api/exam/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          timeRemaining: Math.floor(timeLeft * 1000),
        }),
        keepalive: true,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [attemptId, timeLeft]);

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const handleCancel = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan ujian? Progres akan tersimpan.')) {
      return;
    }
    
    try {
      await fetch('/api/exam/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          timeRemaining: Math.floor(timeLeft * 1000),
        }),
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Gagal menyimpan progress');
    }
  };

  const handleSubmit = async () => {
  const toastId = toast.loading('Mengirim ujian...');
  setIsSubmitting(true);

  try {
    // ✅ Convert Map to Array
    const answersArray = Array.from(answers.entries()).map(
      ([questionId, choiceId]) => ({
        questionId,
        choiceId,
      })
    );

    // 🔍 DEBUG: Log data yang akan dikirim
    console.log('📤 Submitting exam:', {
      attemptId,
      answersCount: answersArray.length,
      answers: answersArray
    });

    const response = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        attemptId,
        answers: answersArray
      }),
    });

    // 🔍 DEBUG: Log response
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Submit error:', errorData); // Log error detail
      throw new Error(errorData.error || 'Failed to submit exam');
    }

    const result = await response.json();
    console.log('✅ Submit success:', result);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Langsung ke konten utama
      </a>

      {/* Header - Sticky Top Bar */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Center: Title & Timer */}
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold hidden sm:block">{packageTitle}</h1>
              <div className={cn(
                "flex items-center gap-2 text-lg font-semibold",
                timeLeft < 600 && "text-red-600"
              )}>
                <Clock className="w-5 h-5" />
                <span>{formatTime(Math.floor(timeLeft))}</span>
              </div>
            </div>

            {/* Right: Batal & Submit */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCancel}
                variant="ghost"
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Submit Ujian'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-4xl mx-auto px-6 py-8">
        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          {/* Question Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-gray-600">
                Soal {currentIndex + 1} dari {questions.length}
              </span>
            </div>
            
            <button
              onClick={() => toggleFlag(currentQuestion?.id)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                flaggedQuestions.has(currentQuestion?.id)
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {flaggedQuestions.has(currentQuestion?.id) ? '★ Ditandai' : 'Tandai Soal'}
            </button>
          </div>

          {/* Use existing QuestionDisplay component */}
          <QuestionDisplay
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedAnswer={answers.get(currentQuestion?.id)}
            onAnswerSelect={(choiceId: string) => selectAnswer(currentQuestion.id, choiceId)}
            isFlagged={flaggedQuestions.has(currentQuestion?.id)}
            onToggleFlag={() => toggleFlag(currentQuestion?.id)}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3"
          >
            <ChevronLeft className="w-5 h-5" />
            Sebelumnya
          </Button>

          {isSaving && (
            <div className="text-sm text-gray-600">
              Menyimpan...
            </div>
          )}

          <Button
            onClick={nextQuestion}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800"
          >
            Selanjutnya
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Question Navigation Grid - MOVED TO BOTTOM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Nomor Soal</h3>

          {/* Legend - Compact Version WITHOUT numbers in boxes */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-green-500 bg-green-50" />
              <span className="text-gray-600">Soal Ini</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500" />
              <span className="text-gray-600">Dijawab</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-500" />
              <span className="text-gray-600">Ditandai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200" />
              <span className="text-gray-600">Belum Dijawab</span>
            </div>
          </div>

          {/* Question Grid - Smaller boxes, 10 columns on mobile, 15 on desktop */}
          <div className="grid grid-cols-10 sm:grid-cols-15 gap-2">
            {questions.map((q, index) => {
              const isAnswered = answers.has(q.id);
              const isMarked = flaggedQuestions.has(q.id);
              const isCurrent = index === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(index)}
                  className={cn(
                    "aspect-square rounded flex items-center justify-center text-sm font-medium transition-all",
                    isCurrent && "border-2 border-green-500 bg-green-50 text-green-700 scale-110",
                    !isCurrent && isMarked && "bg-yellow-500 text-white hover:bg-yellow-600",
                    !isCurrent && !isMarked && isAnswered && "bg-blue-500 text-white hover:bg-blue-600",
                    !isCurrent && !isMarked && !isAnswered && "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>

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