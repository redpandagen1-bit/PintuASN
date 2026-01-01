import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useAutoSave(
  attemptId: string,
  answers: Map<string, string>
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef(answers);

  // Keep answersRef in sync
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    // Start interval that runs every 60 seconds
    intervalRef.current = setInterval(async () => {
      const currentAnswers = answersRef.current;
      
      if (currentAnswers.size === 0) return;

      setIsSaving(true);
      
      try {
        // ✅ Convert Map to Array format yang diexpect API
        const answersArray = Array.from(currentAnswers.entries()).map(
          ([questionId, choiceId]) => ({
            questionId,
            choiceId,
          })
        );

        const response = await fetch('/api/exam/save', { // ← Fix path
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            answers: answersArray, // ← Now it's an array
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Gagal menyimpan jawaban');
        }
        
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error('Gagal menyimpan jawaban secara otomatis');
      } finally {
        setIsSaving(false);
      }
    }, 60000); // ✅ FIXED: Interval runs continuously

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [attemptId]); // ✅ FIXED: Only depend on attemptId

  return { isSaving, lastSaved };
}
