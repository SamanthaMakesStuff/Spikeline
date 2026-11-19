import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Brief §14: never use “screen”, “assess”, “diagnose” (the verb; a person’s own “diagnoses” are fine), “test for” or “likelihood” in UI copy, so the app stays on the
// self-reflection side of the line. This reads every component’s text. Allowed: “screen reader”, “screen” for a
// device screen, and the Next steps page, which has to name the NHS and workplace assessments people can ask for.
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(f) && !/\.test\./.test(f) ? [p] : [];
  });

const banned = /\b(diagnose|diagnosing|assess(?:es|ed|ing|ment)?|likelihood|test for|screening|screen for)\b/i;

describe('copy lint over components', () => {
  it('keeps clear of words that make medical-device claims', () => {
    const hits: string[] = [];
    for (const file of walk('src')) {
      if (file.endsWith('pages/Info.tsx')) continue; // Next steps talks about NHS and workplace assessments by name
      const text = readFileSync(file, 'utf8');
      // Look at JSX text and string literals, not identifiers or comments.
      const visible = text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const m of visible.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])+)\1|>([^<>{}\n]+)</g)) {
        const s = m[2] ?? m[3] ?? '';
        if (banned.test(s)) hits.push(`${file}: ${s.trim().slice(0, 60)}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('never labels a person spiky or flat, or uses RSD or PDA, anywhere in the UI', () => {
    for (const file of walk('src')) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/\bRSD\b|\bPDA\b|you are spiky|you’re spiky|how spiky|you are flat/i);
    }
  });
});
