import { useState, useCallback } from 'react';

export function useExamState(
  questions: any[],
  initialAnswers: Record<string, string>
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(
    new Map(Object.entries(initialAnswers))
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    goToQuestion(currentIndex + 1);
  }, [currentIndex, goToQuestion]);

  const prevQuestion = useCallback(() => {
    goToQuestion(currentIndex - 1);
  }, [currentIndex, goToQuestion]);

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
  };
}
