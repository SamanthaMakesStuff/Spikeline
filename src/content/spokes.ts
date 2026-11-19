import type { Hue, SpokeId } from './items/types';
import { ITEMS } from './items';

export type SpokeGroupId = 'focusDoing' | 'communicating' | 'body' | 'practical';

export interface SpokeDef {
  id: SpokeId;
  n: number;
  label: string;
  group: SpokeGroupId;
  hue: Hue;
}

export const SPOKE_GROUPS: { id: SpokeGroupId; label: string; hue: Hue }[] = [
  { id: 'focusDoing', label: 'Focus and doing', hue: 'teal' },
  { id: 'communicating', label: 'Communicating and connecting', hue: 'plum' },
  { id: 'body', label: 'Body, senses and feelings', hue: 'tomato' },
  { id: 'practical', label: 'Practical skills', hue: 'butter' },
];

const hueOf = (g: SpokeGroupId): Hue => SPOKE_GROUPS.find((x) => x.id === g)!.hue;
const s = (n: number, id: SpokeId, label: string, group: SpokeGroupId): SpokeDef => ({ id, n, label, group, hue: hueOf(group) });

// Fixed order, clockwise from 12 o’clock (brief §8.2).
export const SPOKES: SpokeDef[] = [
  s(1, 'attention', 'Focus', 'focusDoing'),
  s(2, 'starting', 'Getting started and switching', 'focusDoing'),
  s(3, 'planning', 'Planning and time', 'focusDoing'),
  s(4, 'memory', 'Memory and keeping up', 'focusDoing'),
  s(5, 'language', 'Talking and writing', 'communicating'),
  s(6, 'socialEase', 'Social situations', 'communicating'),
  s(7, 'feelings', 'Feelings and calming down', 'body'),
  s(8, 'busyPlaces', 'Busy places', 'body'),
  s(9, 'change', 'Coping with change', 'body'),
  s(10, 'movement', 'Movement and hand skills', 'practical'),
  s(11, 'literacy', 'Reading, spelling and numbers', 'practical'),
];

export const SPOKE_BY_ID = Object.fromEntries(SPOKES.map((x) => [x.id, x])) as Record<SpokeId, SpokeDef>;

/** Items averaged for a spoke come from each item’s `scoresInto.spoke`, so there is one source of truth. */
export const spokeItems = (id: SpokeId) => ITEMS.filter((i) => i.scoresInto?.spoke === id);
