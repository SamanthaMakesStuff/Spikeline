import type { Hue } from '../../content/items/types';

interface Props {
  /** y values 0–100 (higher = easier). */
  values: number[];
  hues: Hue[];
  width?: number;
  height?: number;
  title?: string;
}

/** The Spikeline motif: an ink polyline with disc vertices. Always real data or labelled as an example. */
export function ProfileLine({ values, hues, width = 360, height = 96, title }: Props) {
  const pad = 16;
  const step = (width - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, pad + ((100 - v) / 100) * (height - pad * 2)] as const);
  const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={{ display: 'block', maxWidth: '100%', height: 'auto' }}>
      <polyline points={poly} style={{ fill: 'none', stroke: 'var(--bg)', strokeWidth: 10, strokeLinejoin: 'miter' }} />
      <polyline points={poly} style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 4, strokeLinejoin: 'miter' }} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9} style={{ fill: `var(--${hues[i]})`, stroke: 'var(--outline)', strokeWidth: 2 }} />
      ))}
    </svg>
  );
}
