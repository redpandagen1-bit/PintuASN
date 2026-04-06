import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoSave(
  attemptId: string,
  answers: Map<string, string>
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef(answers);
  const isSavingRef = useRef(false);

  // Keep answersRef selalu sync dengan answers terbaru
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Fungsi save ke /api/exam/save — bisa dipanggil kapan saja
  const saveAnswers = useCallback(async (answersToSave: Map<string, string>) => {
    if (answersToSave.size === 0) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const answersArray = Array.from(answersToSave.entries()).map(
        ([questionId, choiceId]) => ({ questionId, choiceId })
      );

      const response = await fetch('/api/exam/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers: answersArray }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menyimpan jawaban');
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Tidak toast di sini — silent fail untuk auto-save background
      // User tidak perlu tahu setiap kali auto-save gagal
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [attemptId]);

  // Per-answer debounce save: setiap kali answers berubah,
  // tunggu 1.5 detik baru save. Ini mencegah spam request saat user
  // cepat ganti jawaban.
  useEffect(() => {
    if (answers.size === 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      saveAnswers(answersRef.current);
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [answers, saveAnswers]);

  // beforeunload: kirim SEMUA jawaban via sendBeacon sebagai safety net
  // sendBeacon guaranteed delivery meski tab ditutup/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentAnswers = answersRef.current;
      if (currentAnswers.size === 0) return;

      const answersArray = Array.from(currentAnswers.entries()).map(
        ([questionId, choiceId]) => ({ questionId, choiceId })
      );

      const payload = JSON.stringify({ attemptId, answers: answersArray });

      // sendBeacon: fire-and-forget, tidak blocking, guaranteed delivery
      navigator.sendBeacon(
        '/api/exam/save',
        new Blob([payload], { type: 'application/json' })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [attemptId]); // hanya depend on attemptId, answers diambil dari ref

  return { isSaving, lastSaved };
}