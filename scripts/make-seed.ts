// Builds a realistic example answer set for screenshots and end-to-end tests. Example data only.
import { writeFileSync } from 'node:fs';
import { ITEMS } from '../src/content/items';
import { DRIVER_SETS } from '../src/content/drivers';
import { spokeItems, SPOKES } from '../src/content/spokes';
import { emptyState } from '../src/storage/defaults';
import type { Answer } from '../src/storage/schema';

const at = '2026-11-10T10:00:00.000Z';
// Target ease (0–4 scale, fractional) per spoke, cost and hard-day drop.
const TARGET: Record<string, { ease: number; cost: number; drop: number }> = {
  attention: { ease: 2.8, cost: 2, drop: 1.5 },
  starting: { ease: 1.2, cost: 3.5, drop: 1 },
  planning: { ease: 1.8, cost: 3, drop: 1 },
  memory: { ease: 3.2, cost: 1, drop: 0.5 },
  language: { ease: 2.6, cost: 3.2, drop: 0.6 },
  socialEase: { ease: 1.4, cost: 3.8, drop: 0.8 },
  feelings: { ease: 1.8, cost: 3, drop: 1.4 },
  busyPlaces: { ease: 1.0, cost: 4, drop: 1 },
  change: { ease: 1.3, cost: 3, drop: 1 },
  movement: { ease: 2.6, cost: 1, drop: 0 },
  literacy: { ease: 3.4, cost: 1, drop: 0 },
};

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const clamp = (n: number) => Math.max(0, Math.min(4, Math.round(n))) as 0 | 1 | 2 | 3 | 4;

export function buildAnswers(): Record<string, Answer> {
  const answers: Record<string, Answer> = {};
  for (const sp of SPOKES) {
    const t = TARGET[sp.id];
    for (const item of spokeItems(sp.id)) {
      const ease = clamp(t.ease + (rnd() - 0.5) * 1.2);
      const a: Answer = { ease, answeredAt: at };
      if (item.scale === 'EASE+COST') a.cost = clamp(t.cost + (rnd() - 0.5));
      if (item.hardDay) a.hard = clamp(ease - t.drop);
      if (item.driverSet && ease <= 1) {
        const opts = DRIVER_SETS[item.driverSet].options;
        a.drivers = [opts[0].id, opts[2].id];
      }
      answers[item.id] = a;
    }
  }
  for (const item of ITEMS) {
    if (answers[item.id]) continue;
    if (item.scale === 'FREQ') answers[item.id] = { freq: clamp(1 + rnd() * 3), answeredAt: at };
    else if (item.scale === 'EASE' || item.scale === 'EASE+COST') answers[item.id] = { ease: clamp(2 + rnd() * 2), cost: 2, answeredAt: at };
    else if (item.scale === 'LIKE') answers[item.id] = { like: clamp(2 + rnd() * 2), answeredAt: at };
    else if (item.scale === 'LIKE+COSTFU') answers[item.id] = { like: clamp(2 + rnd() * 2), costFollowUp: rnd() > 0.5 ? 'sometimes' : 'often', answeredAt: at };
    else if (item.scale === 'CHECKLIST' && item.options && !item.showIf && item.section !== 'M6') answers[item.id] = { choices: item.options.slice(0, 3).map((o) => o.id), answeredAt: at };
  }
  answers['C2.5'] = { ease: 3, answeredAt: at };
  answers['C14.1'] = { freq: 1, answeredAt: at };
  answers['C7.9'] = { choices: ['sound', 'light', 'touch'], answeredAt: at };
  answers['C13.1'] = { like: 4, costFollowUp: 'sometimes', answeredAt: at };
  answers['C13.3'] = { like: 4, costFollowUp: 'often', answeredAt: at };
  answers['C13.8'] = { like: 3, costFollowUp: 'sometimes', answeredAt: at };
  answers['M2.0'] = { text: 'A long-running fantasy series and old synthesisers', answeredAt: at };
  return answers;
}

const state = emptyState('2026-11-10T10:00:00.000Z');
state.flags = { consented: true, storageNoteSeen: true, finished: ['C1', 'C2'] };
state.aboutYou = { preferredName: 'Alex' };
state.answers = buildAnswers();
writeFileSync(new URL('../e2e/seed.json', import.meta.url), JSON.stringify(state, null, 2));
console.log(`seed written: ${Object.keys(state.answers).length} answers`);
