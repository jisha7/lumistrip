/* ============================================
   LumiStrip — useCountdown Hook
   3-2-1 countdown animation logic
   ============================================ */

import { useState, useCallback, useRef } from 'react';

interface CountdownState {
  current: number | null; // 3, 2, 1, null when done
  isActive: boolean;
  isComplete: boolean;
}

interface UseCountdownReturn extends CountdownState {
  start: (from?: number) => void;
  reset: () => void;
}

export function useCountdown(onComplete?: () => void): UseCountdownReturn {
  const [state, setState] = useState<CountdownState>({
    current: null,
    isActive: false,
    isComplete: false,
  });

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const start = useCallback(
    (from: number = 3) => {
      clearTimers();
      setState({ current: from, isActive: true, isComplete: false });

      for (let i = from; i >= 1; i--) {
        const delay = (from - i + 1) * 1000;
        timersRef.current.push(
          setTimeout(() => {
            if (i === 1) {
              setState({ current: null, isActive: false, isComplete: true });
              onComplete?.();
            } else {
              setState((prev) => ({ ...prev, current: i - 1 }));
            }
          }, delay)
        );
      }
    },
    [clearTimers, onComplete]
  );

  const reset = useCallback(() => {
    clearTimers();
    setState({ current: null, isActive: false, isComplete: false });
  }, [clearTimers]);

  return { ...state, start, reset };
}
