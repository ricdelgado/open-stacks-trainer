# 02 — Font, typography, shape language, and form controls

**What to build:** Self-host Source Serif 4, apply the serif and sans type rules, install the rounded-rectangle and pill shape language across the existing layouts, and keep the switch thumb and mode selector circular without moving any control.

**Blocked by:** `01 — Design tokens, theme engine, and Appearance setting`.

**Status:** resolved

- [x] `public/fonts/source-serif-4-latin-600.woff2` is copied from `_discussion-v3/pack/fonts/`, and `public/fonts/SourceSerif4-OFL.txt` contains the SIL Open Font License 1.1 text.
- [x] One `@font-face` declares `font-family: "Source Serif 4"`, `font-weight: 600`, `font-style: normal`, `font-display: swap`; the font URL resolves under the `/open-stacks-trainer/` production base and the dev server.
- [x] Source Serif 4 renders the Portuguese accented characters used in pt-BR.
- [x] Source Serif 4 is used only for screen titles and headings, card ranks, large position numerals, stack names, and the future quartets distance line; body text, buttons, inputs, labels, captions, tables, the timer, progress text, and stats values use the system sans stack.
- [x] The token radii are applied: cards `18px`, card faces `12px`, data cells `6px`, inputs `12px`, pills `999px`, the streak badge `10px`, icon tiles `22%`.
- [x] `border-radius: 50%` remains only on the switch thumb and the mode selector (outer and selected marks); the other circular motifs are the 1.1 px background dots and the font suit glyphs.
- [x] Native radio circles keep their circular look through a custom circular mark and a filled circular selected state; the whole label row stays keyboard-reachable, keeps a visible `:focus-visible` ring, and keeps a ≥44×44 px target.
- [x] Card faces stay `#FFFFFF` with `#1B1813` ink and `#C9403A` red in both themes through the card tokens, not through theme-dependent text tokens.
- [x] The page background uses `radial-gradient(var(--dot) 1.1px, transparent 1.1px)` at `18px 18px`, with no horizontal scroll at 320 px.
- [x] Selectors and toggles read as pills; the position cells, heatmap-style cells, and editor cells read as rounded squares; the streak badge radius is defined here and applied in ticket 03; empty states, notices, and dialogs use the card radius.
- [x] Unselected mode rows and marks use the stronger `--line-strong` outline so they read clearly in dark mode.
- [x] If progress is drawn graphically anywhere, it uses a thin rounded track and fill; no new progress widget is added.
- [x] `public/favicon.svg` is copied from `_discussion-v3/pack/icons/favicon.svg`; `index.html` links it with a base-safe URL and removes the `data:,` placeholder; the icon loads in dev and in the production build.
- [x] The README credits section gains one line naming Source Serif 4 and its OFL licence; the AI disclosure, feature list, roadmap, and stack credits are otherwise untouched.
- [x] No external font, CDN, icon font, second serif (no Fraunces), or runtime network request is added.
- [x] A source scan test confirms `border-radius: 50%` appears only on the switch thumb and mode selector.
- [x] Manual checks at 320 px, 375 px, and desktop in both themes show no horizontal scroll, ≥44×44 px controls (editor cells ≥48×48 px), visible focus, correct card colours, and no console errors.
- [x] The existing layout and control order are unchanged; only CSS and the minimal wrappers or spans needed for the custom radio/toggle marks are touched.
- [x] `npm run typecheck`, `npm test -- --run`, `npm run build`, and `node scripts/verify-stacks.mjs` pass; behavior tests pass except the additive fixture edits documented in ticket 01.

## Further notes

- The font and SVGs live in the gitignored `_discussion-v3/` pack; copy the font and favicon into `public/` at implementation time. Add the SIL OFL 1.1 text for the font from the licence itself; the pack does not include a licence file.
- Do not wire the icons or add the streak badge in this ticket; ticket 03 owns those.
- Keep the current `src/styles.css` class names and DOM hooks where possible.

## Implementation

- Copied `source-serif-4-latin-600.woff2` to `public/fonts/` and added `SourceSerif4-OFL.txt`; declared the single `@font-face`; added the README typeface credit.
- Applied Source Serif 4 to headings, card ranks, large position numerals, stack names, and the future quartets distance line; kept sans for body, controls, tables, timer, progress, and stats values.
- Applied the token radii, custom circular radio mark, circular toggle thumb, stronger `--line-strong` mode outlines, fixed card-face colours, dot-grid background, and pill actions.
- Replaced the `data:,` favicon with the supplied SVG linked relatively, so it works in dev and under the Pages base.
- Added `tests/styles.test.ts` for the allowed-circle rule (switch thumb and mode selector) and the dot-grid invariant.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 226 passed (22 files; new `tests/styles.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome at 320 px, 375 px, and desktop in both themes: no horizontal scroll, ≥44 px targets, 48×48 px editor cells, local woff2 loaded, favicon 200, no remote requests.

Approved with ticket 04.
