# 02 — Stats page restructure

**What to build:** The Stats page becomes a stack-focused screen with the required action order, a practiced-stack selector, and practiced-mode tabs.

**Blocked by:** 01 — Storage schema v2 and mode-split stats; `v2-training-modes-and-controls/02 — Card +3 mode`.

**Status:** ready-for-human

- [x] The page order is: title → subtitle → **Back to menu** → stack selector → mode tabs → stack data → **Delete training data** → per-card table area → **Export my data**, **Restore from file**, **Delete all data** → **Back to menu** again.
- [x] The first **Back to menu** is the first clickable element after the title and subtitle.
- [x] The stack selector lists only stacks with at least one answer in any mode.
- [x] The stack selector is hidden when only one stack has been practiced.
- [x] Stacks are sorted by the maximum `lastPracticedAt` across their modes, descending, then by name.
- [x] Mode tabs show only modes with at least one answer for the selected stack.
- [x] Mode tabs are hidden when only one mode has been practiced.
- [x] The default stack is the most recently practiced stack; the default mode is that stack’s most recently practiced mode.
- [x] Selection is in-memory only and resets to the defaults on a fresh visit.
- [x] Changing stack selection resets the mode to that stack’s most recently practiced mode.
- [x] Stack data shows the stack name, built-in creator, mode figures, practice days, recent misses, and **Delete training data**.
- [x] **Delete training data** removes every mode for the selected stack after one confirmation; the custom stack itself remains.
- [x] Global actions remain available in the empty state and appear at the bottom.
- [x] The empty state shows the friendly message, both back controls, and the global actions; no stack or mode selectors appear.
- [x] Orphan stats for a missing stack are hidden and never crash the page.
- [x] Keyboard order matches the visual order; the page does not scroll horizontally at 320 px or 375 px.
- [x] Tests cover practiced-only filtering, selector hiding, defaults, stack/mode switching, delete-all-modes, empty state, and orphan stats.
- [x] Typecheck, tests, build, and the stack verifier pass.

## Implementation

- `src/domain/stats-selection.ts` (new): `practicedStacksFor` (practiced-only, orphan-hiding, max-lastPracticed sort then name), `mostRecentMode`, `defaultSelection`, visibility helpers, and `withoutStackStats`.
- `src/screens/stats.ts`: rebuilt around one selected stack + mode. Order is title, lead, first Back to menu, selector, mode tabs, stack data, Delete training data, per-card area, global actions, second Back to menu. In-memory selection; stack change reselects that stack’s most recent mode.
- `src/app.ts`: deleting a stack’s training data (and deleting a custom stack) now uses `withoutStackStats` to drop every mode.
- `src/strings.ts` / `src/styles.css`: selector/tabs labels, revised lead and delete confirmation, tab styles.
- The per-card table area is an empty container for now; ticket 03 fills it.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 149 passed (15 files; new `tests/stats-selection.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass

Awaiting human check in the browser before commit.
