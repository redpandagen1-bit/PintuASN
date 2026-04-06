import { useState, useCallback, useEffect } from 'react';
import type { QuestionWithChoices } from '@/types/exam';

export function useExamState(
  questions: QuestionWithChoices[],
  initialAnswers: Record<string, string>,
  attemptId?: string
) {
  // Restore posisi soal dari localStorage jika ada
  // Key unik per attempt sehingga tidak bentrok antar sesi
  const storageKey = attemptId ? `exam-position-${attemptId}` : null;

  const getInitialIndex = () => {
    if (!storageKey || typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        // Pastikan index masih valid untuk jumlah soal saat ini
        if (!isNaN(parsed) && parsed >= 0 && parsed < questions.length) {
          return parsed;
        }
      }
    } catch {
      // localStorage bisa gagal di beberapa environment (private mode, dll)
    }
    return 0;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(getInitialIndex);
  const [answers, setAnswers] = useState<Map<string, string>>(
    new Map(Object.entries(initialAnswers))
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );

  // Simpan currentIndex ke localStorage setiap kali berubah
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      localStorage.setItem(storageKey, String(currentIndex));
    } catch {
      // Silent fail
    }
  }, [currentIndex, storageKey]);

  // Bersihkan localStorage saat attempt selesai (cleanup)
  // Dipanggil dari luar jika diperlukan
  const clearSavedPosition = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Silent fail
    }
  }, [storageKey]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      return next < questions.length ? next : prev;
    });
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev - 1;
      return next >= 0 ? next : prev;
    });
  }, []);

  const selectAnswer = useCallback((questionId: string, choiceId: string) => {
    setAnswers(prev => new Map(prev).set(questionId, choiceId));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  return {
    currentIndex,
    answers,
    flaggedQuestions,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    selectAnswer,
    toggleFlag,
    clearSavedPosition,
  };
}