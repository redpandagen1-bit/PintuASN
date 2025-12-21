import { useState, useEffect, useRef } from 'react';

export function useExamTimer(initialTimeRemaining: number) {
  const [timeLeft, setTimeLeft] = useState(initialTimeRemaining);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if already expired
    if (initialTimeRemaining <= 0) {
      setIsExpired(true);
      return;
    }

    // Start interval
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount only
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialTimeRemaining]); // ✅ FIXED: Only run once on mount

  return { timeLeft, isExpired };
}
