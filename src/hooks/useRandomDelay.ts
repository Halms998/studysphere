import { useEffect, useRef } from 'react';

// Single Responsibility (SRP): encapsulates the random-delay scheduling
// concern in a dedicated hook so components don't mix timing/scheduling
// logic with rendering and game flow. This keeps components focused on UI
// while the hook manages starting and canceling the randomized timeout.
export default function useRandomDelay(callback: () => void, min = 800, max = 2200) {
  const timeoutRef = useRef<number | null>(null);

  function start() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const delay = min + Math.floor(Math.random() * (max - min + 1));
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      callback();
    }, delay) as unknown as number;
  }

  function cancel() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    return () => cancel();
  }, []);

  return { start, cancel } as const;
}
