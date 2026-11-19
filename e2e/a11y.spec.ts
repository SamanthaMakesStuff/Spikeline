import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
const themes = ['bright-light', 'bright-dark', 'calm-light', 'calm-dark', 'lowstim-light', 'lowstim-dark'];
const routes = ['/', '/how-it-works', '/about-you', '/hub', '/q/C1/1', '/q/C2/1', '/q/C13/1', '/q/M6/1', '/reflection', '/results', '/results/area/planning', '/settings', '/support', '/next-steps', '/about-this-tool', '/privacy'];

for (const theme of themes) {
  const [colours, background] = theme.split('-');
  test.describe(theme, () => {
    for (const route of routes) {
      test(`axe: ${route}`, async ({ page }) => {
        const state = { ...seed, settings: { ...seed.settings, colours, background } };
        await page.addInitScript((s) => localStorage.setItem('spikeline:v1', JSON.stringify(s)), state);
        await page.goto(`/#${route}`);
        await page.waitForTimeout(150);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
      });
    }
  });
}
