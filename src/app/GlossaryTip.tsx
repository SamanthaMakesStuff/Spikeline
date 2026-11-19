import { useEffect, useId, useRef, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { GLOSSARY } from '../content/copy';

/**
 * A small “What’s this?” button that opens a short explanation next to it.
 * It stays open until dismissed (button again, Esc, or focus moving away), is available on keyboard and tap, and nothing depends on hover.
 */
export function GlossaryTip({ term, label }: { term: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const entry = GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase());

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); root.current?.querySelector('button')?.focus(); } };
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);

  if (!entry) return null;
  return (
    <span ref={root} style={{ display: 'inline-block' }}>
      <button type="button" className="btn-link glossary-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <CircleHelp size={16} strokeWidth={2} aria-hidden="true" />
        {label ?? `What is ${entry.term.toLowerCase()}?`}
      </button>
      {open && (
        <span id={id} role="group" aria-label={entry.term} className="glossary-pop">
          <strong>{entry.term}.</strong> {entry.meaning}
        </span>
      )}
    </span>
  );
}
