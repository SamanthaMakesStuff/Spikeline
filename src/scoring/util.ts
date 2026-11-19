import type { Answer } from '../storage/schema';
import type { Rating } from '../content/scales';

export type Answers = Record<string, Answer | undefined>;

export const round6 = (n: number) => Math.round(n * 1e6) / 1e6;
export const mean = (xs: number[]): number | undefined =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined;
export const sd = (xs: number[]): number | undefined => {
  const m = mean(xs);
  if (m === undefined) return undefined;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
};

const isRating = (v: unknown): v is Rating => typeof v === 'number';

/** Ease rating 0–4, or undefined when excluded (doesn't apply, depends without a typical rating, skipped). */
export function easeValue(a?: Answer): Rating | undefined {
  if (!a) return undefined;
  if (a.ease === 'depends') return a.dependsTypical;
  return isRating(a.ease) ? a.ease : undefined;
}
export const costValue = (a?: Answer): Rating | undefined => (isRating(a?.cost) ? (a!.cost as Rating) : undefined);
export const hardValue = (a?: Answer): Rating | undefined => (isRating(a?.hard) ? (a!.hard as Rating) : undefined);
export const freqValue = (a?: Answer): Rating | undefined => (isRating(a?.freq) ? (a!.freq as Rating) : undefined);
export const likeValue = (a?: Answer): Rating | undefined => (isRating(a?.like) ? (a!.like as Rating) : undefined);

/** "Doesn't apply to my life" is excluded from n, so it can never drag a domain down or block it from showing. */
export const markedNotApplicable = (a?: Answer) => a?.ease === 'na' || a?.freq === 'na';

/**
 * Show threshold (§7): answered >= ceil(0.6 n) and answered >= min(3, n),
 * where n is the number of scorable items (items marked "doesn't apply" don't count).
 */
export function meetsThreshold(answered: number, n: number): boolean {
  if (n <= 0) return false;
  return answered >= Math.ceil(0.6 * n) && answered >= Math.min(3, n);
}
