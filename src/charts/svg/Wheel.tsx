import { useEffect, useId, useRef, useState } from 'react';
import { BAND_COUNT, bandPath, easePoint, easeRadius, groupBoundaries, outlinePath, polar, spokeAngle, wedgePath, wedgeStart, wheelGeometry } from '../geometry/wheel';
import type { Profile } from '../../scoring/profile';
import { SPOKE_BY_ID } from '../../content/spokes';
import { describeSpoke } from '../../results/describe';
import { batterySegments } from '../geometry/wheel';
import { RELATIVE_THRESHOLD } from '../../config';

export interface WheelLayers { typical: boolean; hard: boolean; cost: boolean; middle: boolean; band: boolean }
export const DEFAULT_LAYERS: WheelLayers = { typical: true, hard: true, cost: true, middle: true, band: false };

interface Props {
  profile: Profile;
  layers?: WheelLayers;
  size?: number;
  /** Interactive wedges (screen). Off for exports. */
  onOpen?: (spokeId: string) => void;
  title?: string;
  desc?: string;
}

/** Two concentric circles, filled with the even-odd rule to make a ring. */
function ringPath(cx: number, cy: number, rOut: number, rIn: number): string {
  const circle = (r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  return circle(rOut) + circle(rIn);
}

const hueOf = (id: string) => SPOKE_BY_ID[id as keyof typeof SPOKE_BY_ID].hue;

export function Wheel({ profile, layers = DEFAULT_LAYERS, size = 560, onOpen, title = 'Your profile wheel', desc = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  const g = wheelGeometry(size);
  const { spokes, middle } = profile;
  const interactive = !!onOpen;
  const refs = useRef<(SVGGElement | null)[]>([]);
  const [active, setActive] = useState<{ i: number } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Popover: dismissible with Esc.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);
  useEffect(() => () => { clearTimeout(hoverTimer.current); clearTimeout(hideTimer.current); }, []);

  const boundaries = groupBoundaries(spokes.map((s) => SPOKE_BY_ID[s.spokeId].group));
  const typicalPts = spokes.map((s, i) => (s.ease === undefined ? null : easePoint(g, i, s.ease)));
  const hardPts = spokes.map((s, i) => (s.ease === undefined ? null : easePoint(g, i, s.hard !== undefined && s.fluctuation !== undefined ? s.hard : s.ease)));
  const middleR = middle === undefined ? undefined : easeRadius(g, middle);

  const move = (from: number, delta: number) => {
    const n = spokes.length;
    const to = (from + delta + n) % n;
    refs.current[to]?.focus();
  };

  const popSpoke = active ? spokes[active.i] : undefined;
  const popPos = active ? polar(g, (g.R + g.r0) / 2, spokeAngle(g, active.i)) : undefined;

  return (
    <div style={{ position: 'relative' }}>
      <svg className="wheel-svg" viewBox={`0 0 ${size} ${size}`} role="group" aria-labelledby={`${uid}-t`} aria-describedby={`${uid}-d`}>
        <title id={`${uid}-t`}>{title}</title>
        <desc id={`${uid}-d`}>{desc || 'Further out means easier. Each wedge is one area of your profile.'}</desc>
        <defs>
          <pattern id={`${uid}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" style={{ fill: 'var(--hatch)' }} />
            <line x1="0" y1="0" x2="0" y2="8" style={{ stroke: 'var(--ink-muted)', strokeWidth: 1.5 }} />
          </pattern>
        </defs>

        {spokes.map((s, i) => {
          const hue = hueOf(s.spokeId);
          const shown = s.ease !== undefined;
          const label = `${s.num}. ${describeSpoke(s)}${interactive ? ' Open details.' : ''}`;
          const wedge = (
            <>
              {shown
                ? Array.from({ length: BAND_COUNT }, (_, k) => <path key={k} d={bandPath(g, i, k)} style={{ fill: `var(--${hue}-band-${k + 1})`, stroke: 'var(--bg)', strokeWidth: 1.5 }} />)
                : <path d={wedgePath(g, i)} style={{ fill: `url(#${uid}-hatch)`, stroke: 'var(--bg)', strokeWidth: 1.5 }} />}
              <path className="wedge-ring" d={wedgePath(g, i)} style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 4 }} />
            </>
          );
          return interactive ? (
            <g
              key={s.spokeId}
              ref={(el) => { refs.current[i] = el; }}
              className="wedge"
              role="button"
              tabIndex={0}
              aria-label={label}
              style={{ cursor: 'pointer' }}
              onClick={() => onOpen?.(s.spokeId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(s.spokeId); }
                else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i, 1); }
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i, -1); }
              }}
              onFocus={() => { clearTimeout(hideTimer.current); setActive({ i }); }}
              onBlur={(e) => {
                const next = e.relatedTarget as Element | null;
                if (next && next.closest('[data-wheel-popover]')) return;
                setActive((a) => (a?.i === i ? null : a));
              }}
              onMouseEnter={() => { clearTimeout(hideTimer.current); clearTimeout(hoverTimer.current); hoverTimer.current = setTimeout(() => setActive({ i }), 800); }}
              onMouseLeave={() => { clearTimeout(hoverTimer.current); hideTimer.current = setTimeout(() => setActive((a) => (a?.i === i ? null : a)), 300); }}
            >
              {wedge}
            </g>
          ) : (
            <g key={s.spokeId} role="img" aria-label={describeSpoke(s)}>{wedge}</g>
          );
        })}

        {/* Group gaps */}
        {boundaries.map((i) => {
          const a = polar(g, g.r0, wedgeStart(g, i));
          const b = polar(g, g.R, wedgeStart(g, i));
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: 'var(--bg)', strokeWidth: 3 }} />;
        })}
        {(() => { const a = polar(g, g.r0, wedgeStart(g, 0)); const b = polar(g, g.R, wedgeStart(g, 0)); return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: 'var(--bg)', strokeWidth: 3 }} />; })()}

        <circle cx={g.cx} cy={g.cy} r={g.R} style={{ fill: 'none', stroke: 'var(--outline)', strokeWidth: 2 }} />
        <circle cx={g.cx} cy={g.cy} r={g.r0} style={{ fill: 'var(--bg)', stroke: 'var(--outline)', strokeWidth: 2 }} />

        {layers.band && middle !== undefined && (
          <path
            fillRule="evenodd"
            d={ringPath(g.cx, g.cy, easeRadius(g, Math.min(100, middle + RELATIVE_THRESHOLD)), easeRadius(g, Math.max(0, middle - RELATIVE_THRESHOLD)))}
            style={{ fill: 'var(--ink)', fillOpacity: 0.12, pointerEvents: 'none' }}
          />
        )}

        {layers.middle && middleR !== undefined && (
          <>
            <circle cx={g.cx} cy={g.cy} r={middleR} style={{ fill: 'none', stroke: 'var(--ink-muted)', strokeWidth: 1.5, strokeDasharray: '2 4', pointerEvents: 'none' }} />
            <text x={g.cx + 6} y={g.cy - middleR - 6} style={{ font: '500 14px var(--font-sans)', fill: 'var(--ink-muted)', paintOrder: 'stroke', stroke: 'var(--bg)', strokeWidth: 4, strokeLinejoin: 'round' }}>your middle</text>
          </>
        )}

        <g style={{ pointerEvents: 'none' }}>
          {layers.hard && (
            <>
              <path d={outlinePath(hardPts)} style={{ fill: 'none', stroke: 'var(--bg)', strokeWidth: 5, strokeLinejoin: 'miter' }} />
              <path d={outlinePath(hardPts)} style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 2, strokeDasharray: '6 4', strokeLinejoin: 'miter' }} />
              {spokes.map((s, i) => s.hard !== undefined && s.fluctuation !== undefined && hardPts[i] && (
                <circle key={s.spokeId} cx={hardPts[i]!.x} cy={hardPts[i]!.y} r={4.5} style={{ fill: 'var(--bg)', stroke: 'var(--ink)', strokeWidth: 2 }} />
              ))}
            </>
          )}
          {layers.typical && (
            <>
              <path d={outlinePath(typicalPts)} style={{ fill: 'none', stroke: 'var(--bg)', strokeWidth: 6, strokeLinejoin: 'miter' }} />
              <path d={outlinePath(typicalPts)} style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 3, strokeLinejoin: 'miter' }} />
              {typicalPts.map((p, i) => p && <circle key={spokes[i].spokeId} cx={p.x} cy={p.y} r={5} style={{ fill: 'var(--ink)' }} />)}
            </>
          )}
        </g>

        {spokes.map((s, i) => {
          const a = spokeAngle(g, i);
          const bp = polar(g, g.R + 22, a);
          const np = polar(g, g.R + 56, a);
          const filled = batterySegments(s.cost);
          const hue = hueOf(s.spokeId);
          return (
            <g key={s.spokeId} style={{ pointerEvents: 'none' }}>
              {layers.cost && s.ease !== undefined && (
                <g transform={`translate(${(bp.x - 10).toFixed(1)} ${(bp.y - 6).toFixed(1)})`}>
                  <rect width="20" height="12" rx="3" style={{ fill: 'var(--bg)', stroke: 'var(--ink)', strokeWidth: 1.5, strokeDasharray: filled === undefined ? '3 2' : undefined }} />
                  <rect x="20.5" y="4" width="2" height="4" style={{ fill: 'var(--ink)' }} />
                  {Array.from({ length: filled ?? 0 }, (_, k) => <rect key={k} x={2 + k * 4.5} y="2" width="3.2" height="8" style={{ fill: 'var(--ink)' }} />)}
                </g>
              )}
              <circle cx={np.x} cy={np.y} r={14} style={{ fill: `var(--${hue}-strong)`, stroke: 'var(--outline)', strokeWidth: 1.5 }} />
              <text x={np.x} y={np.y} textAnchor="middle" dominantBaseline="central" style={{ font: '600 14px var(--font-sans)', fill: 'var(--on-strong)', fontVariantNumeric: 'tabular-nums' }}>{s.num}</text>
            </g>
          );
        })}
      </svg>

      {interactive && popSpoke && popPos && (
        <div
          data-wheel-popover
          role="group"
          aria-label={`${popSpoke.label} summary`}
          className="panel stack-sm"
          style={{ position: 'absolute', left: `${(popPos.x / size) * 100}%`, top: `${(popPos.y / size) * 100}%`, transform: 'translate(-50%, -105%)', zIndex: 'var(--z-popover)', width: 'min(17rem, 80%)', padding: 'var(--space-3) var(--space-4)', boxShadow: 'var(--shadow-offset)' }}
          onMouseEnter={() => clearTimeout(hideTimer.current)}
          onMouseLeave={() => { hideTimer.current = setTimeout(() => setActive(null), 300); }}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null) && !(e.relatedTarget as Element | null)?.closest?.('.wedge')) setActive(null); }}
        >
          <p className="small" style={{ fontWeight: 600 }}>{popSpoke.num}. {popSpoke.label}</p>
          <p className="small">{describeSpoke(popSpoke).replace(/^[^:]+: /, '')}</p>
          <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => onOpen?.(popSpoke.spokeId)}>Open details</button>
          <p className="small muted">Press Esc to close.</p>
        </div>
      )}
    </div>
  );
}
