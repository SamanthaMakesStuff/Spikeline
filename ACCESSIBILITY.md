# Accessibility record

## Automated (run in CI with `npm run e2e` and `npm run check:contrast`)
- **axe-core (WCAG 2.0/2.1/2.2 A and AA):** 0 violations on 18 routes in all 6 themes (108 checks), plus each share step, the print view and a shared-link viewer: Welcome, Before you start, About you, Hub, three question screens (including the M6 grid), Reflection, Results, Area detail, Settings, Support, Next steps, How this works, Privacy.
- **Contrast script:** body and muted text ≥ 7:1, text on strong fills and buttons ≥ 4.5:1, outlines ≥ 3:1, in every theme.
- **Reflow:** no horizontal scroll at 320px on Welcome, Hub, a question, Results and Settings.
- **Keyboard:** colour choice on Welcome with keyboard only (no focus jump); Support reachable one keystroke after the skip link, closes with Esc and returns focus; the wheel is tab-reachable with arrow-key movement.
- **No external requests** on first load or navigation (checked per route).

## Not done yet: manual testing
Not yet tested by a person with NVDA + Firefox, VoiceOver + Safari (macOS and iOS), or at 200% and 400% zoom. These must be done and recorded here before launch. PDFs from `@react-pdf` may not be fully tagged, so the format screen points screen-reader users to the Print view and the private link. The PDF’s accessibility (tags, reading order) has not been checked with a tool such as PAC.
