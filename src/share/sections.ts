import { SHARE_NAME } from '../config';

export type PresetId = 'work' | 'health' | 'friends' | 'me';

export type SectionKey =
  | 'wheel' | 'summary' | 'stretch'
  | 'strengths'
  | 'load' | 'drivers' | 'energy'
  | 'adhd' | 'masking' | 'burnout' | 'interests' | 'adjustments' | 'eating' | 'hormones' | 'autonomy' | 'medication'
  | 'diagnoses'
  | 'whatHelps' | 'wantPeopleToKnow';

export type SectionGroup = 'Profile' | 'Strengths' | 'What you carry' | 'Extras' | 'About you' | 'Notes';

export interface SectionDef { key: SectionKey; label: string; group: SectionGroup; sensitive?: boolean }

export const SENSITIVE_HINT = 'This is personal health information. Only include it if you’re comfortable.';

export const SECTION_DEFS: SectionDef[] = [
  { key: 'wheel', label: 'Profile wheel', group: 'Profile' },
  { key: 'summary', label: 'Profile at a glance (summary)', group: 'Profile' },
  { key: 'stretch', label: 'Stretch and variable areas', group: 'Profile' },
  { key: 'strengths', label: 'Strengths', group: 'Strengths' },
  { key: 'load', label: 'What you carry (sensory, overload, routine)', group: 'What you carry' },
  { key: 'drivers', label: 'What gets in the way (summary)', group: 'What you carry' },
  { key: 'energy', label: 'What drains and recharges you', group: 'What you carry' },
  { key: 'adhd', label: 'Patterns often linked with ADHD', group: 'Extras' },
  { key: 'masking', label: 'Adjusting how I come across', group: 'Extras' },
  { key: 'burnout', label: 'Hard periods', group: 'Extras' },
  { key: 'interests', label: 'Interests', group: 'Extras' },
  { key: 'adjustments', label: 'Ideas that might help', group: 'Extras' },
  { key: 'eating', label: 'Eating and food', group: 'Extras', sensitive: true },
  { key: 'hormones', label: 'Hormones and life stage', group: 'Extras', sensitive: true },
  { key: 'autonomy', label: 'Autonomy and demands', group: 'Extras', sensitive: true },
  { key: 'medication', label: 'Medication', group: 'Extras', sensitive: true },
  { key: 'diagnoses', label: 'Diagnoses', group: 'About you', sensitive: true },
  { key: 'whatHelps', label: 'What helps me', group: 'Notes' },
  { key: 'wantPeopleToKnow', label: 'What I’d like people to know', group: 'Notes' },
];

export const SECTION_GROUPS: SectionGroup[] = ['Profile', 'Strengths', 'What you carry', 'Extras', 'About you', 'Notes'];
export const SENSITIVE_KEYS = SECTION_DEFS.filter((s) => s.sensitive).map((s) => s.key);

export interface PresetDef {
  id: PresetId;
  label: string;
  blurb: string;
  /** Heading on the output, below the "Spikeprint" wordmark. */
  title: string;
  /** Work uses workplace phrasing for ideas; the others use everyday phrasing. */
  mode: 'work' | 'everyday';
  defaults: SectionKey[];
}

const ALL = SECTION_DEFS.map((s) => s.key);

export const PRESETS: PresetDef[] = [
  {
    id: 'work', label: 'Work or Access to Work', mode: 'work',
    blurb: 'Workplace needs: focus, organisation, communication, senses, routines and energy.',
    title: 'My working profile and what helps',
    defaults: ['wheel', 'summary', 'stretch', 'strengths', 'drivers', 'energy', 'adjustments', 'wantPeopleToKnow'],
  },
  {
    id: 'health', label: 'Health professional', mode: 'everyday',
    blurb: 'Clear and factual notes for an appointment.',
    title: 'My profile: notes for my appointment',
    defaults: ['wheel', 'summary', 'stretch', 'strengths', 'load', 'drivers', 'energy', 'adhd', 'masking', 'burnout', 'interests', 'adjustments', 'whatHelps', 'wantPeopleToKnow'],
  },
  {
    id: 'friends', label: 'Friends and family', mode: 'everyday',
    blurb: 'Warm and personal: how you work best.',
    title: 'How I work best',
    defaults: ['wheel', 'strengths', 'energy', 'adjustments', 'whatHelps', 'wantPeopleToKnow'],
  },
  {
    id: 'me', label: 'Just me', mode: 'everyday',
    blurb: 'Everything, for your own records.',
    title: 'My profile',
    defaults: ALL,
  },
];

export const PRESET_BY_ID = Object.fromEntries(PRESETS.map((p) => [p.id, p])) as Record<PresetId, PresetDef>;

export function defaultSelection(preset: PresetId): Record<SectionKey, boolean> {
  const on = new Set(PRESET_BY_ID[preset].defaults);
  return Object.fromEntries(ALL.map((k) => [k, on.has(k)])) as Record<SectionKey, boolean>;
}

/** Wordmark line at the top of every output. */
export const WORDMARK = SHARE_NAME;

/** Safe file name: strip anything that isn't safe in a file name. */
export function spikeprintFileName(name: string | undefined, ext: 'pdf' | 'png', date: string, suffix = ''): string {
  const safe = (name ?? '').normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return `${SHARE_NAME}${safe ? `-${safe}` : ''}-${date}${suffix}.${ext}`;
}
