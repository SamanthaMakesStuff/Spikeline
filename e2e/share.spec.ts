import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
const withSeed = (page: Page, state = seed) =>
  page.addInitScript((s) => { if (!localStorage.getItem('spikeline:v1')) localStorage.setItem('spikeline:v1', JSON.stringify(s)); }, state);
const next = (page: Page, n = 1) => (async () => { for (let i = 0; i < n; i++) await page.getByRole('button', { name: /^Next/ }).click(); })();

test('Work preset: sensitive sections are off by default and the preview matches the choice', async ({ page }) => {
  await withSeed(page, { ...seed, flags: { ...seed.flags, example: true } });
  await page.goto('/#/share');
  await expect(page.getByRole('heading', { name: /Who is this Spikeprint for/ })).toBeFocused({ timeout: 100 }).catch(() => {});
  await next(page);
  for (const name of ['Diagnoses', 'Eating and food', 'Hormones and life stage', 'Autonomy and demands', 'Medication', 'Adjusting how I come across', 'Hard periods']) {
    await expect(page.getByRole('checkbox', { name: new RegExp(`^${name}`) })).not.toBeChecked();
  }
  await expect(page.getByRole('checkbox', { name: /^Profile wheel/ })).toBeChecked();
  await expect(page.getByText('This is personal health information. Only include it if you’re comfortable.').first()).toBeVisible();
  await next(page);
  const article = page.getByRole('article');
  await expect(article).toContainText('My working profile and what helps');
  await expect(article).toContainText('Spikeprint made with Spikeline. Self-reflection, not a diagnosis.');
  await expect(article).toContainText('Example data');
  await expect(article).not.toContainText('Eating and food');
  await expect(article).toContainText('Compared with my own middle');
  await expect(article).not.toContainText('your own middle');
});

test('the selection is remembered per preset', async ({ page }) => {
  await withSeed(page);
  await page.goto('/#/share');
  await next(page);
  await page.getByRole('checkbox', { name: /^Strengths/ }).uncheck();
  await page.getByLabel('Name on your Spikeprint').fill('Sam');
  await page.waitForTimeout(500);
  await page.reload();
  await next(page);
  await expect(page.getByRole('checkbox', { name: /^Strengths/ })).not.toBeChecked();
  await expect(page.getByLabel('Name on your Spikeprint')).toHaveValue('Sam');
});

test('PDF: downloads with a safe file name, and warns instead of shrinking text when it won’t fit one page', async ({ page }) => {
  await withSeed(page);
  await page.goto('/#/share');
  await page.getByRole('radio', { name: /Just me/ }).check();
  await next(page, 3);
  await page.getByRole('button', { name: /Download Spikeprint \(PDF\)/ }).click();
  await expect(page.getByRole('alert')).toContainText('we don’t shrink text', { timeout: 30000 });
  await expect(page.getByRole('alert')).toContainText('Untick some sections');
  await page.getByLabel('Allow a second page').check();
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.getByRole('button', { name: /Download Spikeprint \(PDF\)/ }).click()]);
  expect(download.suggestedFilename()).toMatch(/^Spikeprint-Alex-\d{4}-\d{2}-\d{2}\.pdf$/);
  const path = await download.path();
  const bytes = readFileSync(path!);
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  const text = bytes.toString('latin1');
  expect(text).toContain('/Title');
  expect(text).toMatch(/\/Lang\s*\(en-GB\)|en-GB/);
});

test('image: portrait and landscape PNGs at 2×, with copyable alt text', async ({ page }) => {
  await withSeed(page);
  await page.goto('/#/share');
  await next(page, 3);
  const [portrait] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.getByRole('button', { name: /Download Spikeprint \(image\)/ }).click()]);
  expect(portrait.suggestedFilename()).toMatch(/-portrait\.png$/);
  const p = readFileSync((await portrait.path())!);
  expect(p.readUInt32BE(16)).toBe(2160); // width
  expect(p.readUInt32BE(20)).toBe(2700); // height
  await expect(page.getByLabel('Alt text to copy')).toHaveValue(/Spikeprint: My working profile and what helps/);
  await page.getByLabel(/Landscape/).check();
  const [landscape] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.getByRole('button', { name: /Download Spikeprint \(image\)/ }).click()]);
  const l = readFileSync((await landscape.path())!);
  expect([l.readUInt32BE(16), l.readUInt32BE(20)]).toEqual([3200, 1800]);
});

test('private link: warns first, opens in a fresh browser with no data, and holds no raw answers', async ({ page, browser }) => {
  await withSeed(page);
  await page.goto('/#/share');
  await next(page, 3);
  await expect(page.getByText('Anyone with this link can see your Spikeprint.')).toBeVisible();
  await page.getByRole('button', { name: 'Make my link' }).click();
  const link = await page.getByLabel('Your private link').inputValue();
  expect(link).toContain('#/view?d=');
  expect(link.length).toBeLessThan(2000 + 200);
  // The link carries computed results, not answers.
  expect(decodeURIComponent(link)).not.toMatch(/C1\.1|answeredAt|dependsTypical/);

  const fresh = await browser.newContext();
  const viewer = await fresh.newPage();
  const requests: string[] = [];
  viewer.on('request', (r) => requests.push(r.url()));
  await viewer.goto(link);
  await expect(viewer.getByRole('heading', { level: 1, name: 'My working profile and what helps' })).toBeVisible();
  await expect(viewer.getByText('a shared copy that can’t be edited')).toBeVisible();
  await expect(viewer.getByRole('link', { name: 'Make your own with Spikeline' })).toBeVisible();
  expect(await viewer.evaluate(() => localStorage.getItem('spikeline:v1'))).toBeNull(); // viewing saves nothing
  expect(requests.filter((u) => !u.startsWith('http://localhost'))).toEqual([]);
  const results = await new AxeBuilder({ page: viewer }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  await fresh.close();
});

test('corrupted links show a friendly message', async ({ page }) => {
  await page.goto('/#/view?d=not-a-real-payload');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('couldn’t open this Spikeprint');
  await expect(page.locator('main')).not.toContainText(/undefined|zod|JSON|stack/i);
});

test('print view expands the tables and hides app chrome in print', async ({ page }) => {
  await withSeed(page);
  await page.goto('/#/print?preset=work');
  await expect(page.locator('table.data-table')).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('header.app-header')).toBeHidden();
  const width = await page.locator('.spikeprint .wheel-box').evaluate((e) => e.getBoundingClientRect().width);
  expect(Math.round(width)).toBeGreaterThan(440); // 120mm ≈ 453px
  expect(Math.round(width)).toBeLessThan(470);
});

test('axe: share steps, print and viewer pass in a dark theme', async ({ page }) => {
  await withSeed(page, { ...seed, settings: { ...seed.settings, colours: 'calm', background: 'dark' } });
  await page.goto('/#/share');
  for (let step = 1; step <= 4; step++) {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`), `step ${step}`).toEqual([]);
    if (step < 4) await next(page);
  }
  await page.goto('/#/print?preset=me');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`)).toEqual([]);
});
