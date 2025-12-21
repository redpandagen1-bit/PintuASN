import { useState, useEffect, useRef } from 'react';

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
        await fetch('/api/exam/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            answers: Object.fromEntries(currentAnswers),
          }),
        });
        
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
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
