import type { Item, SectionId } from './types';

type Extra = Partial<Omit<Item, 'id' | 'section' | 'text' | 'scale'>>;
const sec = (id: string) => id.split('.')[0] as SectionId;
const make = (scale: Item['scale']) => (id: string, text: string, extra: Extra = {}): Item => ({
  id, section: sec(id), text, scale, ...extra,
});

/** Ease + energy cost (hard-day rating when `hardDay: true`). */
export const easeCost = make('EASE+COST');
export const ease = make('EASE');
export const freq = make('FREQ');
export const like = make('LIKE');
export const strengthItem = make('LIKE+COSTFU');
export const checklist = make('CHECKLIST');
export const categorical = make('CATEGORICAL');
export const textItem = make('TEXT');
export const grid = make('GRID');

const slug = (label: string) =>
  label.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Options with stable IDs made from their labels. */
export const opts = (...labels: string[]): { id: string; label: string }[] =>
  labels.map((label) => ({ id: slug(label), label }));
