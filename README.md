# Spikeline

A static, privacy-first web app for autistic, ADHD and AuDHD adults to map their own profile (where things are easier or harder for them, what they cost in energy, and how they change on hard days) and share a **Spikeprint**. Not a diagnostic tool. See `spikeline-build-brief.md` for the full brief (kept outside the repo), `DECISIONS.md` for deviations and `ACCESSIBILITY.md` for test status.

```bash
npm install
npm run dev            # local development
npm test               # unit tests (scoring, flow, storage, content integrity)
npm run check:contrast # token contrast, all six themes
npm run build          # type-check and build to dist/
npm run e2e            # Playwright + axe (builds and serves dist/)
```

If Playwright can't find a browser, set `CHROMIUM_PATH` to one you already have.

Screenshots of every main screen in all six themes are in `docs/screenshots/`.

All answers stay in the browser's `localStorage`. There is no server, analytics, cookies or third-party request. Content (item bank, copy, signposting) lives in `src/content/`.
