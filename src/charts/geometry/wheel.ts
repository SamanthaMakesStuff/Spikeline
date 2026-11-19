// Pure geometry for the profile wheel. Shared by the on-screen SVG, the PDF and the PNG, so they always match.

export const SPOKE_COUNT = 11;
export const BAND_COUNT = 4;

export interface WheelGeometry {
  size: number;
  cx: number;
  cy: number;
  /** Outer radius (ease 100). */
  R: number;
  /** Inner hub radius (ease 0). */
  r0: number;
  wedge: number;
}

export interface Point { x: number; y: number }

export function wheelGeometry(size = 560, n = SPOKE_COUNT): WheelGeometry {
  const R = size * 0.34;
  return { size, cx: size / 2, cy: size / 2, R, r0: R * 0.2, wedge: 360 / n };
}

export const toRad = (deg: number) => (deg * Math.PI) / 180;

export function polar(g: WheelGeometry, r: number, deg: number): Point {
  return { x: g.cx + r * Math.cos(toRad(deg)), y: g.cy + r * Math.sin(toRad(deg)) };
}

/** Wedge i starts at 12 o’clock and runs clockwise. */
export const wedgeStart = (g: WheelGeometry, i: number) => -90 + i * g.wedge;
export const wedgeEnd = (g: WheelGeometry, i: number) => wedgeStart(g, i) + g.wedge;
/** Spokes sit at wedge centres, so labels and markers sit in the middle of each wedge. */
export const spokeAngle = (g: WheelGeometry, i: number) => wedgeStart(g, i) + g.wedge / 2;

/** Linear radial scale: ease 0 → hub radius, ease 100 → outer radius. */
export const easeRadius = (g: WheelGeometry, ease: number) => g.r0 + (g.R - g.r0) * (Math.max(0, Math.min(100, ease)) / 100);

export const easePoint = (g: WheelGeometry, i: number, ease: number): Point => polar(g, easeRadius(g, ease), spokeAngle(g, i));

const f = (n: number) => n.toFixed(1);

/** An annular wedge between two radii and two angles. */
export function annularWedge(g: WheelGeometry, r1: number, r2: number, a1: number, a2: number): string {
  const p1 = polar(g, r2, a1);
  const p2 = polar(g, r2, a2);
  const p3 = polar(g, r1, a2);
  const p4 = polar(g, r1, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${f(p1.x)} ${f(p1.y)}A${f(r2)} ${f(r2)} 0 ${large} 1 ${f(p2.x)} ${f(p2.y)}L${f(p3.x)} ${f(p3.y)}A${f(r1)} ${f(r1)} 0 ${large} 0 ${f(p4.x)} ${f(p4.y)}Z`;
}

/** One of the four concentric bands (0–25, 25–50, 50–75, 75–100) of wedge i. */
export function bandPath(g: WheelGeometry, i: number, band: number): string {
  const r1 = g.r0 + ((g.R - g.r0) * band) / BAND_COUNT;
  const r2 = g.r0 + ((g.R - g.r0) * (band + 1)) / BAND_COUNT;
  return annularWedge(g, r1, r2, wedgeStart(g, i), wedgeEnd(g, i));
}

export const wedgePath = (g: WheelGeometry, i: number) => annularWedge(g, g.r0, g.R, wedgeStart(g, i), wedgeEnd(g, i));

/** Runs of consecutive spokes (wrapping around the circle) that have a value. A fully shown wheel is one closed run. */
export function runsOf(present: boolean[]): { indices: number[]; closed: boolean }[] {
  const n = present.length;
  if (n === 0 || !present.some(Boolean)) return [];
  if (present.every(Boolean)) return [{ indices: present.map((_, i) => i), closed: true }];
  // Start just after a gap so runs don't split across index 0.
  const gap = present.findIndex((p) => !p);
  const runs: { indices: number[]; closed: boolean }[] = [];
  let cur: number[] = [];
  for (let k = 1; k <= n; k++) {
    const i = (gap + k) % n;
    if (present[i]) cur.push(i);
    else if (cur.length) {
      runs.push({ indices: cur, closed: false });
      cur = [];
    }
  }
  if (cur.length) runs.push({ indices: cur, closed: false });
  return runs;
}

/** SVG path data through the given points, breaking where a value is missing. Never pulled to the centre. */
export function outlinePath(points: (Point | null)[]): string {
  const runs = runsOf(points.map((p) => p !== null));
  return runs
    .map(({ indices, closed }) => {
      const d = indices.map((i, k) => `${k === 0 ? 'M' : 'L'}${f(points[i]!.x)} ${f(points[i]!.y)}`).join('');
      return closed ? `${d}Z` : d;
    })
    .join('');
}

/** Number of filled battery segments for a cost score (0–100). Filled = energy remaining, so high cost looks nearly empty. */
export function batterySegments(cost: number | undefined): number | undefined {
  if (cost === undefined) return undefined;
  return 4 - Math.round(Math.max(0, Math.min(100, cost)) / 25);
}

/** Boundaries between colour groups: wedge indexes where a new group starts. */
export function groupBoundaries(groupOf: string[]): number[] {
  return groupOf.map((gr, i) => (i > 0 && gr !== groupOf[i - 1] ? i : -1)).filter((i) => i >= 0);
}
