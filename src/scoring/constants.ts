import { ITEM_BY_ID } from '../content/items';

const optionId = (itemId: string, label: string): string => {
  const o = ITEM_BY_ID[itemId]?.options?.find((x) => x.label === label);
  if (!o) throw new Error(`Missing option "${label}" on ${itemId}`);
  return o.id;
};

export const M3_IN_ONE_NOW = optionId('M3.1', 'I’m in one now');
export const M3_ENERGY_MUCH_LOWER = optionId('M3.4', 'Much lower');
export const MED_YES = optionId('M5.MED1', 'Yes');
