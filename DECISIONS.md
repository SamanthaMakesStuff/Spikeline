# Decisions and deviations

Where the build departs from, or fills a gap in, `spikeline-build-brief.md`. The brief says to write these down.

## Brief and design system
- **Tokens:** `src/design/tokens.css` is the generated CSS from the design system (`spikeline.css` in the mock-ups), copied as-is. I could not read the design system's own `tokens.json` through the connector in full, so the contrast script parses this CSS instead. Replace it if `tokens.json` changes.
- **Bricolage Grotesque weights:** 600 and 700 are self-hosted (the design system asks for 650–700). Lexend 400/500/600.
- **Wheel labels:** the mock-up puts number badges around the wheel and the area key beside it. I followed the mock-up. The brief's in-chart text labels are not drawn; every wedge is named in its accessible name, the key list and the table.
- **"Not enough answers yet" on the wheel:** the wedge is hatched and named in its accessible name and the key. The words are not written inside the wedge, as it is too narrow for 14px text.
- **Hub groups:** C13 and C14 sit under a fifth group, "Strengths and energy", as in the mock-up.
- **Header order:** the Need support button comes first in the DOM (right after the skip link) and is moved to the right with CSS, so it is one keystroke away (acceptance criterion). Focus order differs slightly from visual order.
- **View switcher:** Wheel / Rows / Cards are toggle buttons (`aria-pressed`), not an ARIA tablist.
- **Page layout "A few at a time":** pages are filled by weight (short items 1, ease+cost items 1.5, checklists/text/grid 3, max 3 per page). The URL item number is the first item on the page, so changing layout never breaks a link.

## Item bank additions (IDs the brief did not give)
- `M2.0` interests free text, `M2.7` interest topics.
- `M5.T1`–`M5.T5` AuDHD tensions, `M5.MED1` and `M5.MED2` medication context.
- `M6.0` hormone eligibility, `M6.1`–`M6.5` one grid per situation (cycles, pregnancy, perimenopause, gender-affirming hormones, contraception or HRT), shown only for situations the person chose.
- Option IDs are made from labels (for example `im-in-one-now`). Do not reword an option without checking scoring and saved data.
- Copy lint (`content.test.ts`) caught "diagnose" in the M3 intro; reworded to "They are not a diagnosis."

## Scoring
- **n for the show threshold** counts items in the domain that are not marked "Doesn’t apply". Skipped items still count, so skipping can stop an area showing, but "doesn’t apply" never does.
- **Hard-day ease** is the mean of all HARD ratings in the area. **Fluctuation** uses only items with both ratings (as the brief says), so the two can differ slightly when some items have no hard-day rating.
- **Unevenness** is the population standard deviation of shown area scores.
- **Driver pattern:** the top lens always shows; a second shows if it has at least half the top count. Ties keep the order A, D, S, W. The summary uses short phrases ("energy") and the longer ones are in `LENS_WORDS`.
- **Float safety:** comparisons at ±15, 60 and 25 round to 6 decimals first. Tests cover the edges.
- **Social motivation** needs both C6.1 and C6.2.
- **Eating patterns** list a pattern when its frequency is "Sometimes" or more. The Beat card is prominent at "Often" or more on M4.4 or M4.6.

## Storage
- `flags` was added to the stored state (`consented`, `storageNoteSeen`, `finished`, `lastSection`) so a section with skipped items can show as done and Carry on knows where you were.
- `putAnswer` replaces an answer (used so hidden follow-up answers are removed); `setAnswer` merges.

## Sharing (milestone 7)
- **One model for every format.** A Spikeprint is a `SpikeprintData` object (computed results for the chosen sections only, short keys, zod-validated). The viewer, print view, preview, PDF, image and private link all render from it, so they can’t disagree. It never contains raw answers (a test checks that no item ID appears).
- **Links store references, not text,** for strength sentences and ideas (looked up from content in the viewer). That keeps the default Work link under 2,000 characters. Free text you type (name, notes, interests) does travel in the link.
- **Voice:** Spikeprints are written in the first person (“my own middle”, “easier for me”) because other people read them. The app’s own results stay second person.
- **Preset defaults:** Health leaves Diagnoses off (the brief’s list of off-by-default items for Health doesn’t name it, so it is tickable). Friends and family has no summary paragraph, as in the brief’s list. The hard-period note always opens an output when it applies, whatever sections are ticked.
- **Example data:** a Spikeprint made from example data says “Example data, not a real person’s profile” on every format.
- **PDF:** `@react-pdf/renderer`, loaded only when you ask for a PDF. Lexend and Bricolage are embedded (WOFF, since the PDF library can’t read WOFF2). Text is real text; language `en-GB`. The fit check counts pages. If a PDF needs more than one page it does not shrink text; it names the biggest sections to untick or lets you allow a second page. A typical profile with the Work defaults fits one page; a heavy example (8 of 11 areas flagged) does not, and says so. The PDF spreads ideas over both columns, uses the first idea per group, and uses 10.5pt text with 1.35 line height.
- **Image:** a pure SVG card (no foreignObject, so Safari can draw it) with fonts embedded as data URLs, drawn on a canvas at 2×. Text is wrapped by measuring in the browser.
- **CSP:** `script-src` gains `'wasm-unsafe-eval'` and `connect-src` gains `data:`, both needed by the PDF library’s WebAssembly (loaded from a data URL, no network). Nothing leaves the origin.
- **Viewer:** `/view` has its own minimal frame (Colours, Need support?, “Make your own with Spikeline”), uses the viewer’s own saved colours (or the defaults), and saves nothing.

## Not done yet
- Milestone 8 (polish) and the manual accessibility pass.
- Support numbers and links in `signposting.ts` and `Info.tsx` are marked `VERIFY`. I have not been able to check them.
- Adjustments and the masking, C9.3 and "hitting a wall" wording carry `// REVIEW` comments for co-design.
- PWA stretch goal: left for later, as agreed.
