import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  id: string;
}

/** Native <dialog>: focus is trapped, Esc closes it, and focus returns to the opener. */
export function Dialog({ open, onClose, title, children, id }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close();
      else d.removeAttribute('open');
      (opener.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={`${id}-title`}
      onClose={onClose}
    >
      {open && (
        <div className="dialog-body">
          <div className="dialog-head">
            <h2 id={`${id}-title`}>{title}</h2>
            <button type="button" className="btn" onClick={onClose} aria-label="Close">
              <X size={20} strokeWidth={2} aria-hidden="true" />
              Close
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
