import { useCallback, useState } from 'react';
import { announce } from '../a11y/announce';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** “Making your PDF…” shows only after 150ms, stays for at least 300ms once shown, and is announced politely. */
export function useBusy() {
  const [label, setLabel] = useState('');
  const run = useCallback(async <T,>(message: string, fn: () => Promise<T>): Promise<T> => {
    let shownAt = 0;
    const timer = setTimeout(() => {
      shownAt = Date.now();
      setLabel(message);
      announce(message);
    }, 150);
    try {
      return await fn();
    } finally {
      clearTimeout(timer);
      if (shownAt) await sleep(Math.max(0, 300 - (Date.now() - shownAt)));
      setLabel('');
    }
  }, []);
  return { label, run };
}
