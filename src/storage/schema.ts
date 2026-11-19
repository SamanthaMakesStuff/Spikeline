import { z } from 'zod';
import { SCHEMA_VERSION } from '../config';

const rating = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const answerSchema = z.object({
  ease: z.union([rating, z.literal('na'), z.literal('depends')]).optional(),
  dependsTags: z.array(z.string()).optional(),
  dependsTypical: rating.optional(),
  cost: z.union([rating, z.literal('unsure')]).optional(),
  hard: z.union([rating, z.literal('noHardDays')]).optional(),
  freq: z.union([rating, z.literal('na')]).optional(),
  like: z.union([rating, z.literal('unsure')]).optional(),
  costFollowUp: z.enum(['no', 'sometimes', 'often']).optional(),
  drivers: z.array(z.string()).optional(),
  driverOther: z.string().max(500).optional(),
  choices: z.array(z.string()).optional(),
  choiceOther: z.string().max(500).optional(),
  choice: z.string().optional(),
  text: z.string().max(2000).optional(),
  grid: z.record(z.string(), z.string()).optional(),
  answeredAt: z.string(),
});

export const settingsSchema = z.object({
  colours: z.enum(['bright', 'calm', 'lowstim']),
  background: z.enum(['light', 'dark', 'system']),
  font: z.enum(['default', 'hyperlegible', 'dyslexic', 'system']),
  textSize: z.union([z.literal(100), z.literal(125), z.literal(150), z.literal(175), z.literal(200)]),
  lineSpacing: z.enum(['normal', 'wide']),
  letterSpacing: z.enum(['normal', 'wide']),
  motion: z.enum(['off', 'on']),
  layout: z.enum(['auto', 'one', 'few']),
});

export const aboutYouSchema = z.object({
  preferredName: z.string().max(80).optional(),
  ageBand: z.string().optional(),
  gender: z.string().optional(),
  genderOther: z.string().max(80).optional(),
  diagnoses: z.record(z.string(), z.enum(['diagnosed', 'self', 'exploring'])).optional(),
  diagnosisOther: z.string().max(120).optional(),
  context: z.string().max(200).optional(),
});

export const shareSelectionSchema = z.object({
  sections: z.record(z.string(), z.boolean()),
  name: z.string().max(80).optional(),
});

export const storedStateSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  bankVersion: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  settings: settingsSchema,
  aboutYou: aboutYouSchema,
  optedInModules: z.array(z.enum(['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'])),
  answers: z.record(z.string(), answerSchema),
  reflection: z.object({ whatHelps: z.string().max(4000).optional(), wantPeopleToKnow: z.string().max(4000).optional() }),
  shareDrafts: z.record(z.string(), shareSelectionSchema),
  flags: z.object({
    consented: z.boolean().optional(),
    storageNoteSeen: z.boolean().optional(),
    /** Sections the person has reached the end of (so they show as done even with skipped items). */
    finished: z.array(z.string()).optional(),
    lastSection: z.string().optional(),
    /** True while the answers are the built-in example data. */
    example: z.boolean().optional(),
  }).default({}),
});

export const backupSchema = z.object({
  kind: z.literal('spikeline-backup'),
  state: storedStateSchema,
});

export type Answer = z.infer<typeof answerSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type AboutYou = z.infer<typeof aboutYouSchema>;
export type ShareSelection = z.infer<typeof shareSelectionSchema>;
export type StoredState = z.infer<typeof storedStateSchema>;
export type PresetId = 'work' | 'health' | 'friends' | 'me';
