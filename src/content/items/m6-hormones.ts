import { checklist, grid } from './helpers';
import type { Item, Option } from './types';

// M6 Hormones and life stage: opt-in only, never inferred. The person chooses what applies.
export const M6_SITUATIONS: { id: string; label: string; during: string }[] = [
  { id: 'cycles', label: 'I have menstrual cycles', during: 'the days before a period' },
  { id: 'pregnancy', label: 'I’m pregnant or had a baby in the last 12 months', during: 'pregnancy or since the birth' },
  { id: 'perimenopause', label: 'I’m in perimenopause or menopause, or think I might be', during: 'perimenopause or menopause' },
  { id: 'gender-affirming', label: 'I take gender-affirming hormones', during: 'since starting or changing hormones' },
  { id: 'contraception-hrt', label: 'I take hormonal contraception or HRT', during: 'since starting or changing contraception or HRT' },
];

export const M6_ROWS: Option[] = [
  { id: 'sensory', label: 'Sensory sensitivity' },
  { id: 'emotional', label: 'Emotional control' },
  { id: 'focus', label: 'Focus and organising' },
  { id: 'social', label: 'Social energy' },
  { id: 'masking', label: 'Ability to mask' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'energy', label: 'Overall energy' },
];

export const M6_COLS: Option[] = [
  { id: 'much-worse', label: 'Much worse' },
  { id: 'a-bit-worse', label: 'A bit worse' },
  { id: 'no-change', label: 'No change' },
  { id: 'better', label: 'Better' },
  { id: 'not-sure', label: 'Not sure' },
];

export const m6Items: Item[] = [
  checklist('M6.0', 'Which of these apply to you?', {
    example: 'Choose all that apply. Only you decide this.',
    options: [
      ...M6_SITUATIONS.map(({ id, label }) => ({ id, label })),
      { id: 'none', label: 'None of these' },
      { id: 'prefer-not-to-say', label: 'Prefer not to say' },
    ],
    scoresInto: { descriptive: 'hormoneEligibility' },
  }),
  ...M6_SITUATIONS.map((s, i) =>
    grid(`M6.${i + 1}`, `Compared with the rest of the time, during ${s.during}, how have these changed?`, {
      gridRows: M6_ROWS,
      gridCols: M6_COLS,
      showIf: { item: 'M6.0', includes: s.id },
      scoresInto: { descriptive: 'hormoneChange' },
    }),
  ),
];
