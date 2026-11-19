import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Wheel } from '../charts/svg/Wheel';
import { HARD_PERIOD_NOTE, SPIKEPRINT_FOOTER } from '../content/copy';
import { SHARE_NAME } from '../config';
import lexend400 from '../design/fonts/lexend-latin-400-normal.woff2?inline';
import lexend600 from '../design/fonts/lexend-latin-600-normal.woff2?inline';
import bricolage700 from '../design/fonts/bricolage-grotesque-latin-700-normal.woff2?inline';
import { PRESET_BY_ID } from './sections';
import { formatDate } from './SpikeprintView';
import { has, wheelProfile, type SpikeprintData } from './spikeprint';
import { resolveTokens } from './tokens';

export type CardSize = 'portrait' | 'landscape';
export const CARD_SIZES: Record<CardSize, { w: number; h: number }> = {
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1600, h: 900 },
};
const SCALE = 2;
const SANS = `'Lexend', system-ui, sans-serif`;
const DISPLAY = `'Bricolage Grotesque', 'Lexend', system-ui, sans-serif`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Swap var(--token) for the theme’s concrete value, so the standalone SVG doesn’t depend on page CSS. */
export function substituteVars(markup: string, theme: string): string {
  const names = Array.from(new Set([...markup.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1])));
  const tokens = resolveTokens(theme, names.filter((n) => !n.startsWith('font-')));
  return markup.replace(/var\(--([a-z0-9-]+)\)/g, (_, n: string) => {
    if (n === 'font-sans') return SANS;
    if (n === 'font-display') return DISPLAY;
    return tokens[n] || 'currentColor';
  });
}

let measureCtx: CanvasRenderingContext2D | null = null;
function wrap(text: string, font: string, maxWidth: number): string[] {
  measureCtx ??= document.createElement('canvas').getContext('2d')!;
  measureCtx.font = font;
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (line && measureCtx.measureText(test).width > maxWidth) { lines.push(line); line = word; } else line = test;
    }
    lines.push(line);
  }
  return lines;
}

const plain = (marked: string) => marked.replace(/\*/g, '');

/** Alt text for the image, from the same summary sentences the page shows. */
export function altText(d: SpikeprintData): string {
  const preset = PRESET_BY_ID[d.p];
  const parts = [`${SHARE_NAME}: ${preset.title}.${d.n ? ` ${d.n}.` : ''}${d.ex ? ' Example data.' : ''} A wheel with 11 areas. Further out means easier.`];
  if (d.sm?.length) parts.push(d.sm.map(plain).join(' '));
  else if (d.sp?.length) {
    const wp = wheelProfile(d).spokes;
    const stretch = wp.filter((s) => s.relLabel === 'stretch').map((s) => s.label);
    const strong = wp.filter((s) => s.relLabel === 'strength').map((s) => s.label);
    if (strong.length) parts.push(`Relative strengths: ${strong.join(', ')}.`);
    if (stretch.length) parts.push(`Stretch areas: ${stretch.join(', ')}.`);
  }
  return parts.join(' ');
}

interface Block { heading: string; lines: string[] }

function blocks(d: SpikeprintData): Block[] {
  const out: Block[] = [];
  if (has(d, 'strengths') && d.st?.length) out.push({ heading: 'Strengths', lines: d.st.slice(0, 2).map((s) => s.n) });
  const wp = wheelProfile(d).spokes;
  const stretch = wp.filter((s) => s.relLabel === 'stretch').sort((a, b) => (a.rel ?? 0) - (b.rel ?? 0)).slice(0, 2);
  if ((has(d, 'stretch') || has(d, 'wheel')) && stretch.length) out.push({ heading: 'Stretch areas', lines: stretch.map((s) => s.label) });
  return out;
}

export function buildCardSvg(d: SpikeprintData, size: CardSize, theme: string): string {
  const { w, h } = CARD_SIZES[size];
  const portrait = size === 'portrait';
  const m = portrait ? 64 : 56;
  const preset = PRESET_BY_ID[d.p];
  const parts: string[] = [];
  const text = (x: number, y: number, font: string, fill: string, s: string) =>
    parts.push(`<text x="${x}" y="${y}" style="font:${font};fill:${fill}">${esc(s)}</text>`);

  const colX = portrait ? m : m + 780 + 48;
  const colW = portrait ? w - 2 * m : w - colX - m;
  let y = portrait ? m + 36 : m + 40;

  text(colX, y, `700 40px ${DISPLAY}`, 'var(--ink)', SHARE_NAME);
  y += portrait ? 24 : 20;
  const titleFont = `700 ${portrait ? 58 : 52}px ${DISPLAY}`;
  for (const line of wrap(preset.title, titleFont, colW)) { y += portrait ? 62 : 56; text(colX, y, titleFont, 'var(--ink)', line); }
  y += 40;
  text(colX, y, `400 28px ${SANS}`, 'var(--ink-muted)', `${d.n ? `${d.n} · ` : ''}${formatDate(d.d)}`);
  if (d.ex) { y += 40; text(colX, y, `600 26px ${SANS}`, 'var(--ink)', 'Example data, not a real person’s profile'); }
  if (d.hp) {
    for (const line of wrap(HARD_PERIOD_NOTE, `400 24px ${SANS}`, colW)) { y += 34; text(colX, y, `400 24px ${SANS}`, 'var(--ink)', line); }
    y += 6;
  }
  y += 24;

  let wheelSvg = '';
  if (has(d, 'wheel')) {
    const markup = renderToStaticMarkup(createElement(Wheel, { profile: wheelProfile(d), size: 560, title: 'Profile wheel' }));
    const inner = markup.match(/<svg[\s\S]*<\/svg>/)?.[0] ?? '';
    const S = portrait ? 700 : 780;
    const wx = portrait ? (w - S) / 2 : m;
    const wy = portrait ? y : (h - S) / 2;
    wheelSvg = inner.replace(/^<svg[^>]*>/, `<svg x="${wx}" y="${wy}" width="${S}" height="${S}" viewBox="0 0 560 560" style="overflow:visible">`);
    if (portrait) y = wy + S + 16;
  }

  const bs = blocks(d);
  const startY = y + (portrait ? 20 : 0);
  let colY = portrait ? startY : y;
  bs.forEach((b, i) => {
    const bx = portrait ? m + (i * (w - 2 * m)) / 2 : colX;
    const bw = portrait ? (w - 2 * m) / 2 - 16 : colW;
    let by = (portrait ? startY : colY) + 30;
    text(bx, by, `600 28px ${SANS}`, 'var(--ink)', b.heading);
    for (const l of b.lines) for (const line of wrap(l, `400 28px ${SANS}`, bw)) { by += 38; text(bx, by, `400 28px ${SANS}`, 'var(--ink)', line); }
    if (portrait) colY = Math.max(colY, by); else colY = by + 24;
  });

  const footFont = `400 22px ${SANS}`;
  const footLines = wrap(SPIKEPRINT_FOOTER, footFont, colW);
  let fy = h - m - (footLines.length - 1) * 30;
  for (const line of footLines) { text(colX, fy, footFont, 'var(--ink-muted)', line); fy += 30; }

  const fonts = `@font-face{font-family:'Lexend';font-weight:400;src:url(${lexend400}) format('woff2')}@font-face{font-family:'Lexend';font-weight:600;src:url(${lexend600}) format('woff2')}@font-face{font-family:'Bricolage Grotesque';font-weight:700;src:url(${bricolage700}) format('woff2')}`;
  // .wedge-ring is the keyboard-focus ring on the screen chart; it must stay hidden here.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>${fonts}.wedge-ring{opacity:0}</style><rect width="${w}" height="${h}" style="fill:var(--bg)"/><rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="28" style="fill:none;stroke:var(--outline);stroke-width:3"/>${wheelSvg}${parts.join('')}</svg>`;
  return substituteVars(svg, theme);
}

async function loadFonts() {
  await Promise.all([`400 28px Lexend`, `600 28px Lexend`, `700 40px "Bricolage Grotesque"`].map((f) => document.fonts.load(f)));
}

export async function renderPng(d: SpikeprintData, { size, theme }: { size: CardSize; theme: string }): Promise<Blob> {
  await loadFonts();
  const { w, h } = CARD_SIZES[size];
  const url = URL.createObjectURL(new Blob([buildCardSvg(d, size, theme)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('image')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = w * SCALE;
    canvas.height = h * SCALE;
    const ctx = canvas.getContext('2d')!;
    const draw = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); };
    draw();
    // Embedded fonts can arrive a moment after the first draw, so draw again once they have.
    await new Promise((r) => setTimeout(r, 80));
    draw();
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
