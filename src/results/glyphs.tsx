import { ArrowDown, Circle, Star } from 'lucide-react';
import { batterySegments } from '../charts/geometry/wheel';
import type { Flag, RelativeLabel } from '../scoring/profile';
import { relWords } from './describe';

/** A small battery glyph: filled segments = energy remaining. Always accompanied by words elsewhere. */
export function BatteryGlyph({ cost, size = 22, label }: { cost?: number; size?: number; label?: string }) {
  const filled = batterySegments(cost);
  return (
    <svg width={size} height={(size * 12) / 22} viewBox="0 0 22 12" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} style={{ flex: 'none' }}>
      <rect x="0.75" y="0.75" width="19" height="10.5" rx="3" style={{ fill: 'var(--bg)', stroke: 'var(--ink)', strokeWidth: 1.5, strokeDasharray: filled === undefined ? '3 2' : undefined }} />
      <rect x="20.5" y="4" width="1.5" height="4" style={{ fill: 'var(--ink)' }} />
      {Array.from({ length: filled ?? 0 }, (_, i) => (
        <rect key={i} x={2.5 + i * 4.2} y="2.5" width="3" height="7" style={{ fill: 'var(--ink)' }} />
      ))}
    </svg>
  );
}

/** Icon plus words, so meaning never relies on colour. */
export function RelativeBadge({ label }: { label?: RelativeLabel }) {
  if (!label) return null;
  const Icon = label === 'strength' ? Star : label === 'stretch' ? ArrowDown : Circle;
  return (
    <span className="badge">
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
      {relWords(label)}
    </span>
  );
}

export function FlagBadges({ flags }: { flags: Flag[] }) {
  return (
    <>
      {flags.includes('costly') && <span className="badge">Manageable but costly</span>}
      {flags.includes('varies') && <span className="badge">Varies on hard days</span>}
    </>
  );
}
