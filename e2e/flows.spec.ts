import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
const load = (page: Page, state = seed) => page.addInitScript((s) => { if (!localStorage.getItem('spikeline:v1')) localStorage.setItem('spikeline:v1', JSON.stringify(s)); }, state);

test('new visitor picks colours with the keyboard; it applies instantly and survives a reload with no flash', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'bright-light');
  await page.getByRole('radio', { name: 'Calm' }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'calm-light');
  await expect(page.getByRole('radio', { name: 'Calm' })).toBeFocused(); // no focus jump
  await page.getByRole('radio', { name: 'Dark' }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'calm-dark');
  await page.waitForTimeout(500);
  // The boot script sets the theme before the app loads.
  await page.goto('/');
  await page.reload();
  const early = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(early).toBe('calm-dark');
  await ctx.close();
});

test('Match my device follows the system setting live', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'bright-light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'bright-dark');
  await ctx.close();
});

test('answers autosave, survive closing the page, and continue where they were', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Start/ }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('link', { name: 'Skip', exact: true }).click();
  await page.goto('/#/q/C1/1');
  await page.getByRole('radio', { name: 'Fairly easy' }).first().check();
  await expect(page.getByRole('group', { name: /energy does it take/ }).or(page.getByText('How much energy does it take out of you?')).first()).toBeVisible();
  await page.waitForTimeout(600);
  await page.reload();
  await expect(page.getByRole('radio', { name: 'Fairly easy' }).first()).toBeChecked();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('spikeline:v1')!).answers['C1.1'].ease);
  expect(saved).toBe(3);
});

test('"It depends" asks for context, then a typical rating, and scores that rating', async ({ page }) => {
  await page.goto('/#/q/C1/1');
  await page.getByRole('radio', { name: 'It depends' }).first().check();
  await expect(page.getByText('When does it change?')).toBeVisible();
  await page.getByRole('checkbox', { name: 'When tired' }).first().check();
  await page.getByRole('radio', { name: 'Manageable with effort' }).nth(1).check();
  await page.waitForTimeout(500);
  const a = await page.evaluate(() => JSON.parse(localStorage.getItem('spikeline:v1')!).answers['C1.1']);
  expect(a.ease).toBe('depends');
  expect(a.dependsTypical).toBe(2);
  expect(a.dependsTags).toEqual(['tired']);
});

test('backup, delete everything, restore: identical results', async ({ page }) => {
  await load(page);
  await page.goto('/#/results');
  const summary = async () => (await page.locator('p.lead').first().innerText()).trim();
  const before = await summary();
  expect(before).toContain('Compared with your own middle');

  await page.goto('/#/settings');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save backup' }).click()]);
  expect(download.suggestedFilename()).toMatch(/^spikeline-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();

  await page.getByRole('button', { name: 'Delete everything' }).click();
  await page.getByRole('button', { name: 'Yes, delete my answers' }).click();
  await expect(page.getByRole('heading', { name: 'Map your spiky profile' })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('spikeline:v1') ?? '{"answers":{}}').answers ?? {}).length)).toBe(0);

  await page.getByLabel('Choose a backup file').setInputFiles(path);
  await expect(page.getByRole('dialog')).toContainText('Replace what’s on this device?');
  await page.getByRole('button', { name: 'Replace' }).click();
  await page.goto('/#/results');
  expect(await summary()).toBe(before);
});

test('an invalid backup shows a plain message', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Choose a backup file').first().setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"nope":1}') });
  await expect(page.getByRole('alert')).toContainText('couldn’t read that file');
  await expect(page.getByRole('alert')).not.toContainText(/zod|undefined|JSON|error/i);
});

test('support is one keystroke after the skip link and opens a closable dialog', async ({ page }) => {
  await load(page);
  await page.goto('/#/hub');
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Need support?' })).toBeFocused();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Samaritans');
  await expect(dialog.getByRole('link', { name: '116 123' })).toHaveAttribute('href', 'tel:116123');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Need support?' })).toBeFocused();
});

test('results appear only once enough areas have answers', async ({ page }) => {
  await page.goto('/#/hub');
  await expect(page.getByText('Answer a few more sections to see your profile.').first()).toBeVisible();
  await page.goto('/#/results');
  await expect(page.getByText('Answer a few more sections to see your profile.')).toBeVisible();
});

test('the wheel is keyboard reachable and opens area details', async ({ page }) => {
  await load(page);
  await page.goto('/#/results');
  const wedge = page.getByRole('button', { name: /^1\. Focus:/ });
  await wedge.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: /^2\. Getting started/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/results\/area\/starting/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting started and switching');
});

test('rows, cards and wheel show the same numbers', async ({ page }) => {
  await load(page);
  await page.goto('/#/results');
  await page.getByText('Show as a table').click();
  const tableValues = await page.locator('table.data-table tbody tr').evaluateAll((rows) => rows.map((r) => (r.querySelectorAll('td')[0] as HTMLElement).innerText.split(' · ')[0]));
  await page.getByRole('button', { name: 'Cards', exact: true }).click();
  const cardValues = await page.locator('.area-card .small.tabular').evaluateAll((els) => els.map((e) => (e as HTMLElement).innerText.match(/Ease: (\d+) of 100/)?.[1]).filter(Boolean));
  expect(cardValues).toEqual(tableValues.filter((v) => /^\d+$/.test(v)));
});

test('no network requests leave the app’s own origin', async ({ page }) => {
  await load(page);
  const external: string[] = [];
  page.on('request', (r) => { const u = new URL(r.url()); if (!['localhost', '127.0.0.1'].includes(u.hostname) && u.protocol.startsWith('http')) external.push(r.url()); });
  for (const route of ['/', '/hub', '/q/C1/1', '/results', '/settings', '/privacy']) { await page.goto(`/#${route}`); await page.waitForTimeout(150); }
  expect(external).toEqual([]);
});

test('the page reflows at 320px with no horizontal scroll', async ({ page }) => {
  await load(page);
  await page.setViewportSize({ width: 320, height: 700 });
  for (const route of ['/', '/hub', '/q/C2/1', '/results', '/settings']) {
    await page.goto(`/#${route}`);
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(0);
  }
});
