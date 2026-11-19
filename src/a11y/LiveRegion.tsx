import { useEffect, useState } from 'react';
import { registerAnnouncer } from './announce';

/** One polite live region for the whole app. Messages are replaced, not stacked. */
export function LiveRegion() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    registerAnnouncer((m) => {
      setMessage('');
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(m), 50);
    });
    return () => {
      clearTimeout(timer);
      registerAnnouncer(null);
    };
  }, []);
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
