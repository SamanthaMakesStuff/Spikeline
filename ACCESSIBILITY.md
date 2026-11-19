# Accessibility record

## Automated (run in CI with `npm run e2e` and `npm run check:contrast`)
- **axe-core (WCAG 2.0/2.1/2.2 A and AA):** 0 violations on 18 routes in all 6 themes (108 checks), plus each share step, the print view and a shared-link viewer: Welcome, Before you start, About you, Hub, three question screens (including the M6 grid), Reflection, Results, Area detail, Settings, Support, Next steps, How this works, Privacy.
- **Contrast script:** body and muted text ≥ 7:1, text on strong fills and buttons ≥ 4.5:1, outlines ≥ 3:1, in every theme.
- **Reflow:** no horizontal scroll at 320px on Welcome, Hub, a question, Results and Settings.
- **Keyboard:** colour choice on Welcome with keyboard only (no focus jump); Support reachable one keystroke after the skip link, closes with Esc and returns focus; the wheel is tab-reachable with arrow-key movement.
- **No external requests** on first load or navigation (checked per route).

## More automated checks (e2e/polish.spec.ts)
- One `h1`, one `main`, a skip link and `lang="en-GB"` on every route; page titles change per route ("Questions 4 to 6 of 11 · Talking and writing").
- Targets at least 44×44px and text never below 15px (14px inside chart SVG). This check found and fixed footer links, the wordmark, key links, phone-number links and small badge numbers.
- Text-spacing overrides (WCAG 1.4.12) and 200% text size with wide spacing at 320px: no sideways scroll.
- Windows high contrast (`forced-colors`): passes axe (colour-contrast rule skipped, as the browser sets colours), outlines use `CanvasText`.
- Storage failure: the banner shows, the app keeps working in memory, and Save backup still works.
- Glossary tips and wheel popovers: open on keyboard, tap or focus, stay until dismissed, close with Esc, nothing is hover-only.
- Default motion setting leaves no transitions.
- Copy lint: no "diagnose", "assess", "likelihood", "test for" or "screening" in components (Next steps names NHS and workplace assessments by name and is exempt); never "spiky"/"flat" for a person, never RSD or PDA.

## Not done yet: manual testing
Not yet tested by a person with NVDA + Firefox, VoiceOver + Safari (macOS and iOS), or at 400% browser zoom. Only Chromium has been run, so Firefox, Safari, iOS Safari and Android Chrome checks are also outstanding. These must be done and recorded here before launch. PDFs from `@react-pdf` may not be fully tagged, so the format screen points screen-reader users to the Print view and the private link. The PDF’s accessibility (tags, reading order) has not been checked with a tool such as PAC.
