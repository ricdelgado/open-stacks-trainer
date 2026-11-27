# 02 — Practice calendar UI

**What to build:** Render the global **Practice calendar** at the top of Stats with a collapsible heading, weekday header, four-week rows, inline day details, **Show more**, and a legend.

**Blocked by:** `01 — Practice-day aggregation and intensity model`; `v3-ui-refresh/01 — Design tokens, theme engine, and Appearance setting`.

**Status:** resolved

- [x] **Practice calendar** sits at the top of `renderStats`, above the existing stack and mode figures, and is global rather than per stack or per mode.
- [x] A localized Mon–Sun weekday header precedes the week rows; weeks flow downward with the newest week last.
- [x] A localized subtitle shows the visible range, for example `Jun – Nov 2026`.
- [x] The **Practice calendar** heading is collapsible and starts expanded.
- [x] Each non-future day is a `<button>` with an accessible name: practiced days name their counts, empty days say “no practice”, and future days are disabled and `aria-hidden`.
- [x] Tapping or focusing a day updates an inline details panel below the grid with date, answered, correct, and accuracy; the default selection is today or the latest practiced day; empty days show `—` for all three values.
- [x] **Show more** starts with four visible weeks, adds four weeks per activation, and stops at 26 weeks; it is hidden at 26 weeks.
- [x] A localized **Less** → **More** legend shows the five swatches.
- [x] The calendar uses rounded-square cells, `--surface-soft` for level 0, and the four amber steps for levels 1–4; the focus ring uses the standard focus token.
- [x] Window, selected-day, and collapsed state are in-memory only and do not persist.
- [x] At 320 px the grid fits seven columns with no horizontal scroll, cells are at least 40 px wide and 44 px tall, and every non-future day is keyboard reachable.
- [x] Existing per-mode figures, practice-day list, recent misses, tables, and backup/restore/delete actions are unchanged and not reordered.
- [x] DOM smoke at 320 px, 375 px, and desktop shows no horizontal scroll; keyboard focus updates the details panel; the empty state renders.
- [x] Typecheck, tests, build, and the stack verifier pass.

## Comments

- Human review after the first implementation: keep the section collapsible; show four weeks at a time with a small **Show more** button that adds four weeks up to 26; make empty days selectable and show `—` for answered, correct, and accuracy.
- Updated the UI and the domain window option to match. Verified the four-week start, 4→8→12→16→20→24→26 stepping, hidden button at 26, collapse toggle, empty-day details, and 320/375/desktop widths with no horizontal scroll.
- Follow-up bug: the Stats stack/mode selection reset to the most recently practiced stack on re-entry. It now persists as `settings.statsSelection`, resolves against practiced data, and survives navigation, reload, backup, and restore.
