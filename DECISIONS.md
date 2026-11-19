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

## Not done yet
- Milestones 7 and 8 (sharing: presets, PDF, PNG, private link, print; polish and the manual accessibility pass).
- Support numbers and links in `signposting.ts` and `Info.tsx` are marked `VERIFY`. I have not been able to check them.
- Adjustments and the masking, C9.3 and "hitting a wall" wording carry `// REVIEW` comments for co-design.
- PWA stretch goal: left for later, as agreed.
