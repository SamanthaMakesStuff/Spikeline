import type { Section, SectionGroupId, SectionId } from './items/types';

const T3 = 'Thinking about the last 3 months';

export const SECTIONS: Section[] = [
  { id: 'C1', title: 'Focus', group: 'focusDoing', minutes: 2, timeframe: T3 },
  { id: 'C2', title: 'Getting started and switching', group: 'focusDoing', minutes: 2, timeframe: T3 },
  { id: 'C3', title: 'Planning and time', group: 'focusDoing', minutes: 2, timeframe: T3 },
  { id: 'C4', title: 'Memory and keeping up', group: 'focusDoing', minutes: 2, timeframe: T3,
    intro: 'These questions ask how things feel day to day. They are not a memory or speed test.' },
  { id: 'C5', title: 'Talking and writing', group: 'communicating', minutes: 2, timeframe: T3 },
  { id: 'C6', title: 'Social situations', group: 'communicating', minutes: 2, timeframe: T3,
    intro: 'We ask about wanting and about effort separately. They are different things.' },
  { id: 'C7', title: 'Senses', group: 'body', minutes: 3, timeframe: T3 },
  { id: 'C8', title: 'Body signals and naming feelings', group: 'body', minutes: 2, timeframe: T3, sensitive: true,
    intro: 'If you find feelings hard to name, these questions can be harder to answer. That’s OK. “Not sure” is a fine answer.' },
  { id: 'C9', title: 'Overload and calming down', group: 'body', minutes: 2, timeframe: T3, sensitive: true, signpost: true },
  { id: 'C10', title: 'Predictability and change', group: 'body', minutes: 2, timeframe: T3 },
  { id: 'C11', title: 'Movement and hand skills', group: 'practical', minutes: 1, timeframe: T3 },
  { id: 'C12', title: 'Reading, spelling and numbers', group: 'practical', minutes: 2, timeframe: T3 },
  { id: 'C13', title: 'Strengths and thinking style', group: 'strengthsEnergy', minutes: 3, timeframe: T3 },
  { id: 'C14', title: 'Energy and recovery', group: 'strengthsEnergy', minutes: 2, timeframe: T3,
    intro: 'This is a reflection on your energy, not a validated measure.' },
  { id: 'M1', title: 'Masking and fitting in', group: 'recommended', minutes: 4, timeframe: T3, sensitive: true, signpost: true,
    intro: 'Many people adjust how they come across. These questions ask what you do and what it costs you.' },
  { id: 'M2', title: 'Interests', group: 'recommended', minutes: 4, timeframe: T3,
    intro: 'Any interest counts. We never score which interests you have.' },
  { id: 'M3', title: 'Burnout and hard periods', group: 'recommended', minutes: 4, timeframe: 'Thinking about the past 12 months', sensitive: true, signpost: true,
    intro: 'These questions describe hard periods. They are not a diagnosis.' },
  { id: 'M5', title: 'ADHD-linked patterns', group: 'recommended', minutes: 6, timeframe: T3,
    intro: 'These questions are for everyone, whatever diagnosis you have or don’t have. Many people recognise some of them.' },
  { id: 'M4', title: 'Eating and food', group: 'optional', minutes: 2, timeframe: T3, sensitive: true, signpost: true, optIn: true,
    optInBlurb: 'A few questions about food, eating and how senses, routines and feelings affect them. You get a description of patterns, never a score.' },
  { id: 'M6', title: 'Hormones and life stage', group: 'optional', minutes: 3, timeframe: 'Compared with the rest of the time', sensitive: true, optIn: true,
    optInBlurb: 'Some people notice their senses, emotions, focus or energy change with hormones. Would you like to answer a few questions about this?' },
  { id: 'M7', title: 'Autonomy and demands', group: 'optional', minutes: 2, timeframe: T3, sensitive: true, optIn: true,
    optInBlurb: 'A few questions about how being told what to do, or having a choice, affects you. You get a short summary of what helps.' },
];

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<SectionId, Section>;

export interface GroupDef { id: SectionGroupId; title: string; hue?: 'teal' | 'plum' | 'tomato' | 'butter' }
export const GROUPS: GroupDef[] = [
  { id: 'focusDoing', title: 'Focus and doing', hue: 'teal' },
  { id: 'communicating', title: 'Communicating and connecting', hue: 'plum' },
  { id: 'body', title: 'Body, senses and feelings', hue: 'tomato' },
  { id: 'practical', title: 'Practical skills', hue: 'butter' },
  { id: 'strengthsEnergy', title: 'Strengths and energy' },
  { id: 'recommended', title: 'Recommended extras' },
  { id: 'optional', title: 'Optional: choose to add' },
];

export const CORE_GROUPS: SectionGroupId[] = ['focusDoing', 'communicating', 'body', 'practical', 'strengthsEnergy'];

export const sectionsInGroup = (g: SectionGroupId) => SECTIONS.filter((s) => s.group === g);
