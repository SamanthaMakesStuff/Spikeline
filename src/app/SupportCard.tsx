import { LifeBuoy } from 'lucide-react';
import { SUPPORT_INLINE, SUPPORT_SERVICES } from '../content/signposting';
import { useUI } from './ui';

/** Compact inline support card for sensitive sections. */
export function SupportCard({ variant = 'general' }: { variant?: 'general' | 'eating' | 'eatingProminent' }) {
  const openSupport = useUI((s) => s.openSupport);
  const copy = SUPPORT_INLINE[variant];
  const beat = SUPPORT_SERVICES.find((s) => s.id === 'beat')!;
  const showBeat = variant !== 'general';
  return (
    <aside className={`support-inline${variant === 'eatingProminent' ? ' prominent' : ''}`} aria-label={copy.title}>
      <LifeBuoy size={22} strokeWidth={2} aria-hidden="true" />
      <div className="stack-sm" style={{ flex: '1 1 14rem' }}>
        <p style={{ fontWeight: 600 }}>{copy.title}</p>
        <p className="small">{copy.body}</p>
        {showBeat && (
          <p className="small cluster">
            {beat.phone!.map((p) => <a key={p.tel} className="tel" href={`tel:${p.tel}`}>{p.label}</a>)}
          </p>
        )}
      </div>
      <button type="button" className="btn" onClick={openSupport}>Support now</button>
    </aside>
  );
}
