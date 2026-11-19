// Screenshots of Welcome, a question, the hub and results in all six themes. Usage: node scripts/shots.mjs [outDir] [baseUrl]
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const out = process.argv[2] ?? 'screenshots';
const base = process.argv[3] ?? 'http://localhost:4173/';
mkdirSync(out, { recursive: true });
const seed = JSON.parse(readFileSync(new URL('../e2e/seed.json', import.meta.url), 'utf8'));
const themes = ['bright-light', 'bright-dark', 'calm-light', 'calm-dark', 'lowstim-light', 'lowstim-dark'];
const pages = [
  { name: 'welcome', hash: '#/', seeded: false },
  { name: 'question', hash: '#/q/C2/3', seeded: true },
  { name: 'hub', hash: '#/hub', seeded: true },
  { name: 'results', hash: '#/results', seeded: true },
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
for (const theme of themes) {
  const [colours, mode] = theme.split('-');
  for (const p of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    const state = p.seeded ? { ...seed, settings: { ...seed.settings, colours, background: mode } } : { ...seed, answers: {}, flags: {}, settings: { ...seed.settings, colours, background: mode } };
    await ctx.addInitScript((s) => { if (!localStorage.getItem('spikeline:v1')) localStorage.setItem('spikeline:v1', JSON.stringify(s)); }, p.seeded ? state : { ...state });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('PAGE ERROR', theme, p.name, e.message));
    await page.goto(base + p.hash);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}/${p.name}-${theme}.png`, fullPage: p.name === 'results' });
    await ctx.close();
  }
}
await browser.close();
console.log('done');
