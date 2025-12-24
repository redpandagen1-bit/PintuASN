'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
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

  const router = useRouter();
  const hasSubmittedRef = useRef(false);

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const handleSubmit = async () => {
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

      router.push(`/exam/${attemptId}/result`);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal mengirim ujian. Silakan coba lagi.');
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
      {/* Top Bar (sticky) */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <span className={cn(
              "text-lg font-mono font-semibold",
              timeLeft < 600 && "text-red-600"
            )}>
              {formatTime(Math.floor(timeLeft))}
            </span>
          </div>

          {/* Package Title */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-slate-900 truncate max-w-md">
              {packageTitle}
            </h1>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={() => setShowSubmitDialog(true)}
            variant="default"
          >
            Submit Ujian
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
          {/* Left: Question Display */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
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
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Sebelumnya
              </Button>

              {/* Auto-save indicator */}
              {isSaving && (
                <div className="text-sm text-slate-600">
                  Menyimpan...
                </div>
              )}

              <Button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            onNavigate={goToQuestion}
          />
        </div>
      </div>

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
    </div>
  );
}
