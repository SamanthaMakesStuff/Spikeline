import type { Hue } from '../content/items/types';

interface Props { fraction: number; hue?: Hue; size?: number; done?: boolean; strokeWidth?: number }

/** Progress ring: decorative (the row carries the status in words). */
export function ProgressRing({ fraction, hue, size = 36, done, strokeWidth = 5 }: Props) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const track = hue ? `var(--${hue}-band-2)` : 'var(--hatch)';
  const fill = hue ? `var(--${hue}-ink)` : 'var(--ink)';
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="18" cy="18" r={r} style={{ fill: 'none', stroke: track, strokeWidth }} />
      {fraction > 0 && (
        <circle cx="18" cy="18" r={r} transform="rotate(-90 18 18)" strokeDasharray={`${(c * Math.min(1, fraction)).toFixed(1)} ${c.toFixed(1)}`}
          style={{ fill: 'none', stroke: fill, strokeWidth, strokeLinecap: 'round' }} />
      )}
      {done && <path d="M12 18l4 4 8-9" style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }} />}
    </svg>
  );
}
