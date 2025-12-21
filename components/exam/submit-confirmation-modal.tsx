'use client';

import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface SubmitConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting: boolean;
}

export function SubmitConfirmationModal({
  open,
  onClose,
  onConfirm,
  answeredCount,
  totalQuestions,
  isSubmitting,
}: SubmitConfirmationModalProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Submit Ujian Sekarang?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            <div className="space-y-4">
              {/* Stats Section */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Soal dijawab:</span>
                  <Badge variant="secondary" className="font-semibold">
                    {answeredCount}/{totalQuestions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Soal belum dijawab:</span>
                  <Badge 
                    variant={hasUnanswered ? "destructive" : "secondary"} 
                    className="font-semibold"
                  >
                    {unansweredCount}/{totalQuestions}
                  </Badge>
                </div>
              </div>

              {/* Warning Messages */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
                  <p className="text-slate-700">
                    Setelah submit, Anda tidak bisa mengubah jawaban
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
                  <p className="text-slate-700">
                    Pastikan semua soal sudah dikerjakan dengan baik
                  </p>
                </div>
                {hasUnanswered && (
                  <div className="flex items-start gap-2 mt-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-700 font-medium">
                      Ada {unansweredCount} soal yang belum dijawab!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isSubmitting}
            className="sm:order-1"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className="sm:order-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </span>
            ) : (
              "Ya, Submit Sekarang"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
