import { describe, expect, it } from 'vitest';
import { batterySegments, easePoint, easeRadius, outlinePath, runsOf, spokeAngle, wheelGeometry, wedgeStart } from './wheel';

describe('wheel geometry', () => {
  const g = wheelGeometry(560);

  it('matches the design: R = 0.34 × size and hub = 0.2 R', () => {
    expect(g.R).toBeCloseTo(190.4, 1);
    expect(g.r0).toBeCloseTo(38.08, 1);
  });

  it('starts the first wedge at 12 o’clock and puts spokes at wedge centres', () => {
    expect(wedgeStart(g, 0)).toBe(-90);
    expect(spokeAngle(g, 0)).toBeCloseTo(-90 + 360 / 22, 5);
  });

  it('maps ease linearly from the hub to the rim', () => {
    expect(easeRadius(g, 0)).toBeCloseTo(g.r0, 5);
    expect(easeRadius(g, 100)).toBeCloseTo(g.R, 5);
    expect(easeRadius(g, 50)).toBeCloseTo((g.r0 + g.R) / 2, 5);
  });

  it('reproduces the first spoke point in the design mock at ease 70', () => {
    const p = easePoint(g, 0, 70);
    expect(p.x).toBeCloseTo(320.8, 0);
    expect(p.y).toBeCloseTo(141.2, 0);
  });
});

describe('outline runs', () => {
  it('closes a fully shown outline', () => {
    const r = runsOf(Array(11).fill(true));
    expect(r).toHaveLength(1);
    expect(r[0].closed).toBe(true);
  });

  it('breaks the outline at spokes without enough answers instead of pulling to the centre', () => {
    const present = [true, true, false, true, true, true, true, true, true, true, true];
    const r = runsOf(present);
    expect(r).toHaveLength(1);
    expect(r[0].closed).toBe(false);
    // Wraps around index 0: 3…10 then 0, 1.
    expect(r[0].indices).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 0, 1]);
  });

  it('produces separate runs for separate gaps', () => {
    const r = runsOf([true, false, true, false]);
    expect(r.map((x) => x.indices)).toEqual([[2], [0]]);
  });

  it('writes open paths with no Z when a point is missing', () => {
    const d = outlinePath([{ x: 1, y: 1 }, null, { x: 3, y: 3 }]);
    expect(d).not.toContain('Z');
    expect(d.match(/M/g)).toHaveLength(1); // wraps: 2 then 0 form one run
  });

  it('draws nothing when no spokes are shown', () => {
    expect(outlinePath([null, null])).toBe('');
  });
});

describe('battery', () => {
  it('shows remaining energy: high cost looks nearly empty', () => {
    expect(batterySegments(0)).toBe(4);
    expect(batterySegments(25)).toBe(3);
    expect(batterySegments(100)).toBe(0);
    expect(batterySegments(undefined)).toBeUndefined();
  });
});
