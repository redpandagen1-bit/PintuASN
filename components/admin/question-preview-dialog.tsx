'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface QuestionPreviewDialogProps {
  question: any;
  onClose: () => void;
}

export function QuestionPreviewDialog({ question, onClose }: QuestionPreviewDialogProps) {
  const isTKP = question.category === 'TKP';
  const correctChoice = question.choices?.find((c: any) => c.is_answer);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Badge variant={
              question.category === 'TWK' ? 'default' :
              question.category === 'TIU' ? 'secondary' :
              'outline'
            }>
              {question.category}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {question.difficulty}
            </Badge>
            <DialogTitle className="flex-1">Preview Soal</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Question */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Pertanyaan:</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{question.content}</p>
            {question.image_url && (
              <img
                src={question.image_url}
                alt="Question"
                className="mt-4 rounded-lg max-w-full"
              />
            )}
          </div>

          {/* Choices */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Pilihan Jawaban:</h3>
            <div className="space-y-3">
              {question.choices?.map((choice: any) => (
                <div
                  key={choice.id}
                  className={`p-3 rounded-lg border-2 ${
                    choice.is_answer
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-slate-900 shrink-0">
                      {choice.label}.
                    </span>
                    <p className="flex-1 text-slate-700">{choice.content}</p>
                    {choice.is_answer && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    )}
                    {isTKP && (
                      <Badge variant="outline" className="shrink-0">
                        Skor: {choice.score}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Pembahasan:</h3>
              <p className="text-blue-800 whitespace-pre-wrap">{question.explanation}</p>
            </div>
          )}

          {/* Answer Summary */}
          {!isTKP && correctChoice && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">
                Jawaban Benar: <span className="text-lg font-bold">{correctChoice.label}</span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}