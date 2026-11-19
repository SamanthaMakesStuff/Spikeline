import { coreItems } from './core';
import { m1Items } from './m1-masking';
import { m2Items } from './m2-interests';
import { m3Items } from './m3-burnout';
import { m4Items } from './m4-eating';
import { m5Items } from './m5-adhd';
import { m6Items } from './m6-hormones';
import { m7Items } from './m7-autonomy';
import type { Item, SectionId } from './types';

export const ITEMS: Item[] = [
  ...coreItems, ...m1Items, ...m2Items, ...m3Items, ...m5Items, ...m4Items, ...m6Items, ...m7Items,
];

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const itemsInSection = (section: SectionId): Item[] => ITEMS.filter((i) => i.section === section);

export * from './types';
