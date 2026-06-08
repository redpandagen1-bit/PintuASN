import { useState, useEffect, useRef } from 'react';

/**
 * Timer ujian berbasis JAM DINDING (wall-clock).
 *
 * Alih-alih mengurangi counter per "tick" (yang ikut melambat/membeku saat
 * browser men-throttle setInterval di tab background), sisa waktu dihitung dari
 * selisih `endAt - Date.now()`. Jadi waktu TERUS berjalan walau tab tidak aktif,
 * dan langsung tersinkron ulang saat tab kembali fokus — meniru perilaku timer
 * server pada CAT SKD asli.
 */
export function useExamTimer(initialTimeRemaining: number) {
  const [timeLeft, setTimeLeft] = useState(initialTimeRemaining);
  const [isExpired, setIsExpired] = useState(initialTimeRemaining <= 0);
  const endAtRef = useRef<number>(0);

  useEffect(() => {
    if (initialTimeRemaining <= 0) {
      setTimeLeft(0);
      setIsExpired(true);
      return;
    }

    // Target waktu selesai (timestamp absolut) ditetapkan sekali saat mount.
    endAtRef.current = Date.now() + initialTimeRemaining * 1000;

    const tick = (): boolean => {
      const remaining = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setIsExpired(true);
        return false; // waktu habis → hentikan interval
      }
      return true;
    };

    // Hitung langsung sekali, lalu setiap detik.
    tick();
    const interval = setInterval(() => {
      if (!tick()) clearInterval(interval);
    }, 1000);

    // Saat tab kembali terlihat/fokus, sinkron ulang seketika
    // (jangan menunggu tick berikutnya yang mungkin tertunda).
    const resync = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', resync);
    window.addEventListener('focus', resync);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', resync);
      window.removeEventListener('focus', resync);
    };
  }, [initialTimeRemaining]);

  return { timeLeft, isExpired };
}
