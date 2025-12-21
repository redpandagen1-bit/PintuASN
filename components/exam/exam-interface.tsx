'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Clock, Flag, CheckCircle2 } from 'lucide-react';
import { useExamState } from '@/hooks/use-exam-state';
import { useExamTimer } from '@/hooks/use-exam-timer';
import { useAutoSave } from '@/hooks/use-auto-save';
import { cn } from '@/lib/utils';

interface ExamInterfaceProps {
  attemptId: string;
  packageTitle: string;
  questions: Array<{
    id: string;
    position: number;
    questions: {
      id: string;
      category: string;
      content: string;
      image_url?: string;
      choices: Array<{
        id: string;
        label: string;
        content: string;
      }>;
    };
  }>;
  initialAnswers: Record<string, string>;
  startedAt: string;
  timeRemaining: number;
}

export function ExamInterface({ 
  attemptId,
  packageTitle,
  questions,
  initialAnswers,
  startedAt,
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

  const { isSaving, lastSaved } = useAutoSave(attemptId, answers);

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

  const currentQuestion = questions[currentIndex]?.questions;

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
            {/* Question Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {currentQuestion?.category}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      Soal {currentIndex + 1} dari {questions.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion?.id)}
                    className={cn(
                      flaggedQuestions.has(currentQuestion?.id) && "text-orange-600"
                    )}
                  >
                    <Flag className={cn(
                      "h-4 w-4",
                      flaggedQuestions.has(currentQuestion?.id) && "fill-current"
                    )} />
                  </Button>
                </div>

                {/* Question Image (if exists) */}
                {currentQuestion?.image_url && (
                  <div className="mb-4">
                    <img 
                      src={currentQuestion.image_url} 
                      alt="Question image"
                      className="max-w-full h-auto rounded-lg border border-slate-200"
                    />
                  </div>
                )}

                {/* Question Text */}
                <div className="text-lg font-medium text-slate-900 mb-6">
                  {currentQuestion?.content}
                </div>

                {/* Choices */}
                <div className="space-y-3">
                  {currentQuestion?.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => selectAnswer(currentQuestion.id, choice.id)}
                      className={cn(
                        "w-full p-4 text-left rounded-lg border-2 transition-colors flex items-center gap-3",
                        answers.get(currentQuestion.id) === choice.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <span className="font-semibold text-slate-700">
                        {choice.label}.
                      </span>
                      <span className="text-slate-900">
                        {choice.content}
                      </span>
                      {answers.get(currentQuestion.id) === choice.id && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

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

          {/* Right: Navigator Sidebar (hidden on mobile) */}
          <div className="hidden lg:block w-80 p-6 border-l border-slate-200 overflow-y-auto bg-white">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Navigasi Soal
              </h2>
              
              <div className="grid grid-cols-10 gap-2">
                {questions.map((q, index) => {
                  const questionId = q.questions.id;
                  const isAnswered = answers.has(questionId);
                  const isFlagged = flaggedQuestions.has(questionId);
                  const isCurrent = index === currentIndex;

                  return (
                    <button
                      key={questionId}
                      onClick={() => goToQuestion(index)}
                      className={cn(
                        "relative aspect-square rounded-lg border-2 font-semibold transition-colors text-sm",
                        isCurrent && "border-blue-600 bg-blue-600 text-white",
                        !isCurrent && isAnswered && "border-green-600 bg-green-50 text-green-700",
                        !isCurrent && !isAnswered && "border-slate-300 bg-white text-slate-600"
                      )}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="absolute -top-1 -right-1 h-3 w-3 text-orange-600 fill-current" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-600 border border-blue-600"></div>
                  <span className="text-slate-700">Soal Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-50 border border-green-600"></div>
                  <span className="text-slate-700">Sudah Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white border border-slate-300"></div>
                  <span className="text-slate-700">Belum Dijawab</span>
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-slate-200">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dijawab:</span>
                    <span className="font-medium">{answers.size}/{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ditandai:</span>
                    <span className="font-medium">{flaggedQuestions.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigator (bottom sheet) */}
      <div className="lg:hidden bg-white border-t border-slate-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Navigasi Soal
            </h3>
            <div className="text-xs text-slate-600">
              Dijawab: {answers.size}/{questions.length}
            </div>
          </div>
          
          <div className="grid grid-cols-10 gap-1 mb-3">
            {questions.map((q, index) => {
              const questionId = q.questions.id;
              const isAnswered = answers.has(questionId);
              const isFlagged = flaggedQuestions.has(questionId);
              const isCurrent = index === currentIndex;

              return (
                <button
                  key={questionId}
                  onClick={() => goToQuestion(index)}
                  className={cn(
                    "relative aspect-square rounded border text-xs font-medium",
                    isCurrent && "border-blue-600 bg-blue-600 text-white",
                    !isCurrent && isAnswered && "border-green-600 bg-green-50 text-green-700",
                    !isCurrent && !isAnswered && "border-slate-300 bg-white text-slate-600"
                  )}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="absolute -top-1 -right-1 h-2 w-2 text-orange-600 fill-current" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-600 border border-blue-600"></div>
              <span>Aktif</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-50 border border-green-600"></div>
              <span>Dijawab</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-white border border-slate-300"></div>
              <span>Belum</span>
            </div>
          </div>
        </div>
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
