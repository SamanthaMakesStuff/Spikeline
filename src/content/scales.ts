export type Rating = 0 | 1 | 2 | 3 | 4;
export type ScaleKind = 'EASE' | 'COST' | 'HARD' | 'FREQ' | 'LIKE';

export interface ExtraOption { id: string; label: string }

export interface ScaleDef {
  kind: ScaleKind;
  prompt: string;
  labels: [string, string, string, string, string];
  extras: ExtraOption[];
  /** Visual anchor, drawn by AnswerAnchor (decorative). */
  anchor: 'circle' | 'battery' | 'pill' | 'moon';
}

export const EASE_LABELS: ScaleDef['labels'] = ['Very hard or I can’t', 'Hard', 'Manageable with effort', 'Fairly easy', 'Easy, a real strength'];

export const SCALES: Record<ScaleKind, ScaleDef> = {
  EASE: {
    kind: 'EASE',
    prompt: 'On a typical day in the last 3 months, how easy is this for you?',
    labels: EASE_LABELS,
    extras: [{ id: 'na', label: 'Doesn’t apply to my life' }, { id: 'depends', label: 'It depends' }],
    anchor: 'circle',
  },
  COST: {
    kind: 'COST',
    prompt: 'How much energy does it take out of you?',
    labels: ['None', 'A little', 'A moderate amount', 'A lot', 'It wipes me out'],
    extras: [{ id: 'unsure', label: 'Not sure' }],
    anchor: 'battery',
  },
  HARD: {
    kind: 'HARD',
    prompt: 'And on a hard day (tired, stressed, unwell or overloaded)?',
    labels: EASE_LABELS,
    extras: [{ id: 'noHardDays', label: 'I don’t really have hard days' }],
    anchor: 'circle',
  },
  FREQ: {
    kind: 'FREQ',
    prompt: 'In the last 3 months, how often does this happen?',
    labels: ['Never', 'Rarely (about once a month or less)', 'Sometimes (a few times a month)', 'Often (most weeks)', 'Almost always (most days)'],
    extras: [{ id: 'na', label: 'Doesn’t apply to my life' }],
    anchor: 'pill',
  },
  LIKE: {
    kind: 'LIKE',
    prompt: 'How much is this like you?',
    labels: ['Not like me', 'A little like me', 'Somewhat like me', 'Mostly like me', 'Very much like me'],
    extras: [{ id: 'unsure', label: 'Not sure' }],
    anchor: 'moon',
  },
};

export const DEPENDS_TYPICAL_PROMPT = 'Thinking about a typical time, how easy is it?';
export const DEPENDS_TAGS_PROMPT = 'When does it change? Choose all that apply.';
export const DEPENDS_TIP = 'Choose when it changes, then tell us what it’s usually like.';

export const CONTEXT_TAGS = [
  { id: 'work', label: 'Work or study' },
  { id: 'home', label: 'Home' },
  { id: 'known', label: 'With people I know' },
  { id: 'strangers', label: 'With strangers' },
  { id: 'alone', label: 'Alone' },
  { id: 'tired', label: 'When tired' },
  { id: 'interested', label: 'When interested' },
] as const;
export type ContextTag = (typeof CONTEXT_TAGS)[number]['id'];

export const COST_FOLLOW_UP = {
  prompt: 'Does this ever cost you or cause problems?',
  options: [
    { id: 'no', label: 'No' },
    { id: 'sometimes', label: 'Sometimes' },
    { id: 'often', label: 'Often' },
  ],
} as const;

export const LOAD_WORD_BANDS = [
  { max: 24, label: 'A little' },
  { max: 49, label: 'Some' },
  { max: 74, label: 'A lot' },
  { max: 100, label: 'Very much' },
] as const;

/** Words for a rating, used in accessible names and the data table. */
export const easeWord = (r: number) => SCALES.EASE.labels[Math.round(r) as Rating] ?? '';
export const costWord = (r: number) => SCALES.COST.labels[Math.round(r) as Rating] ?? '';
