// Checks token text/background and control/background pairs in every theme against the WCAG targets.
// Usage: npm run check:contrast   (exits 1 on any failure)
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/design/tokens.css', import.meta.url), 'utf8');
const blocks = [...css.matchAll(/(?::root, )?\[data-theme="([a-z-]+)"\]\{([^}]*)\}/g)];
const themes = Object.fromEntries(
  blocks.map(([, id, body]) => [id, Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):(#[0-9A-Fa-f]{6})/g)].map(([, k, v]) => [k, v]))]),
);

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const hues = ['teal', 'plum', 'tomato', 'butter'];
const pairs = [
  // [foreground token, background token, minimum ratio, description]
  ['ink', 'bg', 7, 'body text on page'],
  ['ink', 'surface', 7, 'body text on cards'],
  ['ink-muted', 'bg', 7, 'muted text on page'],
  ['ink-muted', 'surface', 7, 'muted text on cards'],
  ['on-action', 'action', 4.5, 'text on primary buttons'],
  ['on-support', 'support', 4.5, 'text on support button'],
  ['ink', 'butter-soft', 7, 'text on callouts'],
  ['outline', 'bg', 3, 'control and chart outlines on page'],
  ['outline', 'surface', 3, 'control outlines on cards'],
  // Buttons always carry an outline, so the outline (above) is what marks the boundary, not the fill.
  // The focus ring is an ink ring (checked above as ink on bg) with a decorative halo outside it, separated from the page by a 2px gap.
  ...hues.flatMap((h) => [
    [`on-strong`, `${h}-strong`, 4.5, `text on ${h} fills`],
    [`${h}-ink`, 'bg', 4.5, `${h} text on page`],
    [`${h}-ink`, 'surface', 4.5, `${h} text on cards`],
    [`ink`, `${h}-band-4`, 4.5, `ink marks over ${h} wheel bands`],
  ]),
];

let failures = 0;
for (const [id, t] of Object.entries(themes)) {
  for (const [fg, bg, min, what] of pairs) {
    if (!t[fg] || !t[bg]) continue;
    const r = ratio(t[fg], t[bg]);
    if (r + 1e-9 < min) {
      failures++;
      console.error(`FAIL ${id}: ${what} (${fg} ${t[fg]} on ${bg} ${t[bg]}) is ${r.toFixed(2)}:1, needs ${min}:1`);
    }
  }
}
console.log(`${Object.keys(themes).length} themes, ${pairs.length} pair types checked, ${failures} failure(s).`);
process.exit(failures ? 1 : 0);
