# 02 — Practice calendar UI

**What to build:** Render the global **Practice calendar** at the top of Stats with a weekday header, week rows, inline day details, **Show earlier**, and a legend.

**Blocked by:** `01 — Practice-day aggregation and intensity model`; `v3-ui-refresh/01 — Design tokens, theme engine, and Appearance setting`.

**Status:** ready-for-agent

- [ ] **Practice calendar** sits at the top of `renderStats`, above the existing stack and mode figures, and is global rather than per stack or per mode.
- [ ] A localized Mon–Sun weekday header precedes the week rows; weeks flow downward with the newest week last.
- [ ] A localized subtitle shows the visible range, for example `Jun – Nov 2026`.
- [ ] Each practiced day is a `<button>` with an accessible name such as “26 Nov 2026: 34 answered, 30 correct”; empty days are non-focusable placeholders; future days are disabled and `aria-hidden`.
- [ ] Tapping or focusing a day updates an inline details panel below the grid with date, answered, correct, and accuracy; the default selection is today or the latest practiced day.
- [ ] **Show earlier** adds 26 weeks per activation, stops at the earliest recorded practice day, and is hidden when no earlier data exists.
- [ ] A localized **Less** → **More** legend shows the five swatches.
- [ ] The calendar uses rounded-square cells, `--surface-soft` for level 0, and the four amber steps for levels 1–4; the focus ring uses the standard focus token.
- [ ] Expanded-window and selected-day state are in-memory only and do not persist.
- [ ] At 320 px the grid fits seven columns with no horizontal scroll, cells are at least 40 px wide and 44 px tall, and every cell is keyboard reachable.
- [ ] Existing per-mode figures, practice-day list, recent misses, tables, and backup/restore/delete actions are unchanged and not reordered.
- [ ] DOM smoke at 320 px, 375 px, and desktop shows no horizontal scroll; keyboard focus updates the details panel; the empty state renders.
- [ ] Typecheck, tests, build, and the stack verifier pass.
