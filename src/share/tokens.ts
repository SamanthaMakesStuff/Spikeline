// Concrete token values for standalone outputs (PDF, image) that can't use page CSS.
/** Read the concrete value of design tokens for a theme, so a standalone SVG doesn’t depend on page CSS. */
export function resolveTokens(theme: string, names: string[]): Record<string, string> {
  const el = document.createElement('div');
  el.setAttribute('data-theme', theme);
  el.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
  document.body.appendChild(el);
  const cs = getComputedStyle(el);
  const out: Record<string, string> = {};
  for (const n of names) out[n] = cs.getPropertyValue(`--${n}`).trim();
  el.remove();
  return out;
}

