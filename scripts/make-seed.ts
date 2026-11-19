// Builds a realistic example answer set for screenshots and end-to-end tests. Example data only.
import { writeFileSync } from 'node:fs';
import { buildExampleAnswers } from '../src/content/exampleData';
import { emptyState } from '../src/storage/defaults';

const state = emptyState('2026-11-10T10:00:00.000Z');
state.flags = { consented: true, storageNoteSeen: true, finished: ['C1', 'C2'] };
state.aboutYou = { preferredName: 'Alex' };
state.answers = buildExampleAnswers();
writeFileSync(new URL('../e2e/seed.json', import.meta.url), JSON.stringify(state, null, 2));
console.log(`seed written: ${Object.keys(state.answers).length} answers`);
