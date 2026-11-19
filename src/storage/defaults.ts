import { BANK_VERSION, SCHEMA_VERSION } from '../config';
import type { Settings, StoredState } from './schema';

export const DEFAULT_SETTINGS: Settings = {
  colours: 'bright',
  background: 'system',
  font: 'default',
  textSize: 100,
  lineSpacing: 'normal',
  letterSpacing: 'normal',
  motion: 'off',
  layout: 'auto',
};

export function emptyState(now = new Date().toISOString()): StoredState {
  return {
    schemaVersion: SCHEMA_VERSION,
    bankVersion: BANK_VERSION,
    createdAt: now,
    updatedAt: now,
    settings: { ...DEFAULT_SETTINGS },
    aboutYou: {},
    optedInModules: [],
    answers: {},
    reflection: {},
    shareDrafts: {},
    flags: {},
  };
}
