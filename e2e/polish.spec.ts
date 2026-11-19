import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
const withSeed = (page: Page, state = seed) =>
  page.addInitScript((s) => { if (!localStorage.getItem('spikeline:v1')) localStorage.setItem('spikeline:v1', JSON.stringify(s)); }, state);

const ROUTES = ['/', '/how-it-works', '/about-you', '/hub', '/q/C2/1', '/reflection', '/results', '/results/area/planning', '/share', '/settings', '/support', '/next-steps', '/about-this-tool', '/privacy'];

test('every page has one h1, landmarks, a skip link and an en-GB language', async ({ page }) => {
  await withSeed(page);
  for (const route of ROUTES) {
    await page.goto(`/#${route}`);
    await page.waitForTimeout(100);
    expect(await page.locator('h1').count(), `${route} h1`).toBe(1);
    expect(await page.locator('main').count(), `${route} main`).toBe(1);
    expect(await page.locator('header').count(), `${route} header`).toBeGreaterThan(0);
    expect(await page.locator('a.skip-link').count(), `${route} skip`).toBe(1);
    expect(await page.title(), `${route} title`).toContain('Spikeline');
  }
  expect(await page.locator('html').getAttribute('lang')).toBe('en-GB');
});

test('page titles change per route and say where you are in a section', async ({ page }) => {
  await withSeed(page);
  await page.goto('/#/q/C5/2');
  const title = await page.title();
  expect(title).toMatch(/^Questions? \d+( to \d+)? of \d+ · Talking and writing · Spikeline$/);
  await page.goto('/#/results');
  expect(await page.title()).toBe('Your profile · Spikeline');
});

test('interactive targets are at least 44×44px and text is never below 15px (14px in charts)', async ({ page }) => {
  await withSeed(page);
  const small: string[] = [];
  for (const route of ['/', '/hub', '/q/C2/1', '/results', '/share', '/settings']) {
    await page.goto(`/#${route}`);
    await page.waitForTimeout(150);
    const found = await page.evaluate(() => {
      const out: string[] = [];
      const targets = document.querySelectorAll<HTMLElement>('button, a[href], input:not([type=hidden]), select, textarea, summary');
      for (const el of targets) {
        if (el.closest('.sr-only, .skip-link')) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        // Native radios and checkboxes sit inside a labelled hit area; measure that.
        const box = el.matches('input[type=radio],input[type=checkbox]') ? (el.closest('label') ?? el).getBoundingClientRect() : r;
        const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline'; // links in running text are exempt (WCAG 2.5.8)
        if (!inline && (box.height < 43.5 || box.width < 43.5) && !el.closest('table')) out.push(`${el.tagName}.${el.className} ${Math.round(box.width)}×${Math.round(box.height)} "${(el.textContent ?? '').trim().slice(0, 24)}"`);
      }
      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || el.closest('.sr-only')) continue;
        const px = parseFloat(cs.fontSize);
        const inSvg = !!el.closest('svg');
        if (px < (inSvg ? 13.9 : 14.9)) out.push(`font ${px}px: "${(el.textContent ?? '').trim().slice(0, 24)}"`);
      }
      return out;
    });
    small.push(...found.map((f) => `${route}: ${f}`));
  }
  expect(small).toEqual([]);
});

test('text spacing overrides (WCAG 1.4.12) do not clip or overflow', async ({ page }) => {
  await withSeed(page);
  await page.setViewportSize({ width: 390, height: 800 });
  for (const route of ['/', '/hub', '/q/C2/1', '/results', '/share']) {
    await page.goto(`/#${route}`);
    await page.addStyleTag({ content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}' });
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
});

test('200% text size with wide spacing still reflows at 320px with no sideways scroll', async ({ page }) => {
  await withSeed(page, { ...seed, settings: { ...seed.settings, textSize: 200, lineSpacing: 'wide', letterSpacing: 'wide' } });
  await page.setViewportSize({ width: 320, height: 700 });
  for (const route of ['/', '/hub', '/q/C2/1', '/results', '/share', '/settings']) {
    await page.goto(`/#${route}`);
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
});

test('Windows high contrast: pages still pass axe and chart outlines use system colours', async ({ page }) => {
  await withSeed(page);
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/#/results');
  await page.waitForTimeout(200);
  // In forced-colours mode the browser chooses colours itself, so axe’s colour-contrast rule (which reads the declared colours) doesn’t apply.
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  const outline = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--outline').trim());
  expect(outline.toLowerCase()).toBe('canvastext');
});

test('the wheel keeps its outline broken, not pulled to the centre, when an area has too few answers', async ({ page }) => {
  const partial = { ...seed, answers: Object.fromEntries(Object.entries(seed.answers).filter(([id]) => !/^C(1|2)\./.test(id) || id === 'C2.5')) };
  await withSeed(page, partial);
  await page.goto('/#/results');
  await expect(page.getByText('Not enough answers yet').first()).toBeVisible();
  const d = await page.locator('svg.wheel-svg path[style*="stroke-width: 3"][style*="miter"]').first().getAttribute('d');
  expect(d).toBeTruthy();
  expect(d).not.toContain('Z'); // open path: not closed through the gaps
  await expect(page.getByRole('button', { name: /^1\. Focus: not enough answers yet/i })).toBeVisible();
});

test('if the browser can’t save, the app says so, keeps working, and a backup still works', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); }; });
  await page.goto('/#/q/C1/1');
  await page.getByRole('radio', { name: 'Fairly easy' }).first().check();
  await expect(page.getByRole('alert').filter({ hasText: 'We can’t save on this device' })).toBeVisible();
  await expect(page.getByText('Not saved on this device')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Fairly easy' }).first()).toBeChecked();
  await page.goto('/#/settings');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save backup' }).click()]);
  expect(JSON.parse(readFileSync((await dl.path())!, 'utf8')).state.answers['C1.1'].ease).toBe(3);
});

test('glossary tips open on click, close with Esc and never depend on hover', async ({ page }) => {
  await withSeed(page);
  await page.goto('/#/results');
  const tip = page.getByRole('button', { name: 'What is your middle?' });
  await tip.click();
  await expect(page.getByRole('group', { name: 'Your middle' })).toContainText('average of your own scores');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group', { name: 'Your middle' })).toBeHidden();
  await expect(tip).toBeFocused();
});

test('the wheel popover opens on focus, stays until dismissed, and closes with Esc', async ({ page }) => {
  await withSeed(page);
  await page.goto('/#/results');
  await page.getByRole('button', { name: /^3\. Planning and time:/ }).focus();
  const pop = page.getByRole('group', { name: 'Planning and time summary' });
  await expect(pop).toBeVisible();
  await page.waitForTimeout(1200); // persists, does not time out
  await expect(pop).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(pop).toBeHidden();
});

test('reduced motion and the default motion setting leave no transitions running', async ({ page }) => {
  await withSeed(page);
  await page.goto('/#/hub');
  const dur = await page.locator('.btn').first().evaluate((e) => getComputedStyle(e).transitionDuration);
  expect(['0s', '']).toContain(dur);
});
