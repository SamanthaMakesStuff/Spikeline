import { APP_NAME, SHARE_NAME } from '../config';

// All user-facing copy lives in src/content so wording can be edited without touching components.
// Curly quotes and apostrophes throughout. UK English. Reading age about 8–9.

export const NOT_DIAGNOSTIC =
  'This is a self-reflection tool. It is not a diagnosis, and it can’t tell you whether you are autistic or have ADHD. Uneven profiles are common in many conditions, including dyslexia, dyspraxia, long-term illness and mental health difficulties, and in people with no diagnosis. If you mask a lot, some difficulties may look smaller here than they are. If you find feelings hard to identify, emotion questions may be harder to answer. If you’re in a hard period, your answers may reflect that period rather than your usual self.';

export const NOT_DIAGNOSTIC_SHORT = 'Self-reflection, not a diagnosis. Compares me with myself, not with other people.';

export const IPSATIVE_EXPLAINER =
  'Your chart compares you with yourself. It shows where things are easier or harder for you, and what they cost you. It can’t tell you how you compare with other people, and something marked as a relative strength may still be hard for you.';

export const SPIKEPRINT_FOOTER = `${SHARE_NAME} made with ${APP_NAME}. ${NOT_DIAGNOSTIC_SHORT}`;
export const SPIKEPRINT_EXPLAINER = `Your ${SHARE_NAME} is a summary of your profile that you choose what goes into. Only you decide who sees it.`;

export const WELCOME = {
  headline: 'Map your spiky profile',
  subline: `A self-reflection tool for autistic, ADHD and AuDHD adults. Go at your own pace, then share your ${SHARE_NAME} if you want to. Your answers stay on this device.`,
  themeHeading: 'How do you like your colours?',
  howLong: 'The core questions take about 18 to 25 minutes. You can do them in chunks, in any order, and come back later.',
  privacy: 'Your answers stay in this browser. Nothing is sent anywhere.',
};

export const TIMEFRAME_TIP = 'Try to think about the last 3 months, including good weeks and hard weeks, not just your best or worst days.';
export const DEPENDS_TIP_LONG = 'Choose when it changes, then tell us what it’s usually like.';
export const WHY_GENERIC = 'This helps your profile show the whole picture. You can skip it, and it never leaves this device unless you choose to share it.';

export const HARD_PERIOD_NOTE = 'Your profile may reflect a hard period rather than how things usually are. Be gentle with yourself.';
export const MASKING_RESULTS_NOTE = 'If you adjust a lot, some of your profile may look easier than it feels. Look for areas marked “Manageable but costly”.';

export const CONSENT_LABEL = 'I understand this is for self-reflection and is not a diagnosis';

export const GETTING_STARTED_INSIGHT = 'Getting started is much easier with a clear first step or someone alongside you.';

export const STORAGE_NOTE = 'Answers are saved in this browser only. Private browsing, clearing your browser data or using a different device will lose them, so save a backup file now and then.';
export const STORAGE_FAILED = 'We can’t save on this device. Save a backup before you close this page.';
export const BACKUP_EXPLAINER = 'This is your full set of answers, for you to keep. It isn’t your Spikeprint, so don’t send it to other people.';

export const LABELS = {
  strength: 'Relative strength',
  middle: 'Near your middle',
  stretch: 'Stretch area',
  notEnough: 'Not enough answers yet',
} as const;

export const CHART_CAPTION =
  'Further out means easier for you. The solid line is a typical day; the dashed line is a hard day. Batteries show how much energy each area takes. The order of areas is always the same, so you can compare if you answer again later. This compares you with yourself, not with other people.';

export const HARD_DAY_LEGEND_NOTE = 'Areas that don’t usually change day to day aren’t asked about hard days.';
export const LOAD_CAPTION = 'More fill = more of this experience. This is not a measure of ability.';
export const ADHD_INTRO = 'These are shown beside your profile, not mixed into it. Many people without ADHD recognise some of these.';

export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: 'Energy cost', meaning: 'How much a thing takes out of you, even when you can do it.' },
  { term: 'Hard day', meaning: 'A day when you’re tired, stressed, unwell or overloaded.' },
  { term: 'Your middle', meaning: 'The average of your own scores. Everything is compared with this, not with other people.' },
  { term: 'Masking', meaning: 'Adjusting how you come across to fit in or stay safe.' },
  { term: 'Stretch area', meaning: 'An area that is harder for you than your own middle. It doesn’t mean something is wrong.' },
];

// Summary templates (§8.7). `{areas}` is replaced with bold area names. Never use: deficit, impairment, symptom, disorder.
export const SUMMARY = {
  easier: 'Compared with your own middle, things are easier for you in {areas}.',
  stretch: 'Your biggest stretch areas are {areas}.',
  drops: 'On hard days the biggest drops are in {areas}.',
  costlyOne: '{areas} is manageable but costs you a lot of energy.',
  costlyMany: '{areas} are manageable but cost you a lot of energy.',
  drivers: 'Most of the reasons you chose relate to {areas}.',
  empty: 'Answer a few more sections to see your profile.',
};

export const BUTTONS = {
  create: `Create my ${SHARE_NAME}`,
  nextSteps: 'Next steps',
};
