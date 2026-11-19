// Visual anchors for answer options. Decorative only (aria-hidden): the words carry the meaning.
import type { ScaleDef } from '../../content/scales';

const common = { width: 26, height: 26, viewBox: '0 0 24 24', 'aria-hidden': true, className: 'anchor', focusable: false } as const;
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** A circle filling in quarters: 0 = empty ring … 4 = full disc. */
export function CircleAnchor({ level }: { level: number }) {
  const theta = (level * Math.PI) / 2;
  const x = 12 + 9 * Math.sin(theta);
  const y = 12 - 9 * Math.cos(theta);
  return (
    <svg {...common}>
      {level >= 4 ? <circle cx="12" cy="12" r="9" style={{ fill: 'currentColor' }} /> : level > 0 && (
        <path d={`M12 12 L12 3 A9 9 0 ${level > 2 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`} style={{ fill: 'currentColor' }} />
      )}
      <circle cx="12" cy="12" r="9" style={stroke} />
    </svg>
  );
}

/** A 4-segment battery that empties as cost rises: 0 = full, 4 = empty. */
export function BatteryAnchor({ level }: { level: number }) {
  const full = 4 - level;
  return (
    <svg {...common}>
      <rect x="2" y="7" width="17" height="10" rx="2.5" style={stroke} />
      <path d="M21.5 10.5v3" style={stroke} />
      {Array.from({ length: full }, (_, i) => (
        <rect key={i} x={4 + i * 3.7} y="9" width="2.6" height="6" style={{ fill: 'currentColor' }} />
      ))}
    </svg>
  );
}

/** A horizontal pill filling from the left as frequency rises. */
export function PillAnchor({ level }: { level: number }) {
  const w = 18 * (level / 4);
  return (
    <svg {...common}>
      <rect x="2" y="8" width="20" height="8" rx="4" style={stroke} />
      {level > 0 && <rect x="3" y="9" width={Math.max(w, 6)} height="6" rx="3" style={{ fill: 'currentColor' }} />}
    </svg>
  );
}

/** A moon waxing from nothing to full. */
export function MoonAnchor({ level }: { level: number }) {
  const lit =
    level === 1 ? 'M12 3 A9 9 0 0 1 12 21 A5 9 0 0 0 12 3 Z'
    : level === 2 ? 'M12 3 A9 9 0 0 1 12 21 L12 3 Z'
    : level === 3 ? 'M12 3 A9 9 0 0 1 12 21 A5 9 0 0 1 12 3 Z'
    : '';
  return (
    <svg {...common}>
      {level >= 4 ? <circle cx="12" cy="12" r="9" style={{ fill: 'currentColor' }} /> : lit && <path d={lit} style={{ fill: 'currentColor' }} />}
      <circle cx="12" cy="12" r="9" style={stroke} />
    </svg>
  );
}

export function Anchor({ kind, level }: { kind: ScaleDef['anchor']; level: number }) {
  switch (kind) {
    case 'circle': return <CircleAnchor level={level} />;
    case 'battery': return <BatteryAnchor level={level} />;
    case 'pill': return <PillAnchor level={level} />;
    case 'moon': return <MoonAnchor level={level} />;
  }
}
