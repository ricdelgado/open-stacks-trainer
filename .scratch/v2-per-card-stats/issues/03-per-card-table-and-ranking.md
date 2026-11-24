# 03 — Per-card table and ranking

**What to build:** The selected stack and mode show a 52-row per-card table with streak, reinforcement progress, miss count, and average elapsed time, plus sorting.

**Blocked by:** 02 — Stats page restructure; `v2-training-modes-and-controls/01 — Timer, elapsed capture, and session average`; `v2-training-modes-and-controls/03 — Reinforcement and Settings Training`.

**Status:** resolved

- [x] The table has 52 rows in the current stack order, including cards with no data.
- [x] Columns are Position, Card, Current streak, Reinforcement, Times missed, and Average time.
- [x] Card cells use the existing typographic card face and accessible card name.
- [x] Current streak is the mode-specific consecutive Got it count.
- [x] Reinforcement shows `x/5` while the card is in the reinforcement list, otherwise `—`.
- [x] Times missed is the mode-specific cumulative count from v2 onward.
- [x] Average time shows one decimal with a localized unit; cards with no timed Got it answers show `—`.
- [x] The sort control offers Stack order (default), Reinforcement, Slowest average first, Most missed, and Lowest streak.
- [x] Reinforcement sorting puts cards in the reinforcement list first, lowest progress first, and cards without it last.
- [x] Cards without an average sort after cards with an average in the slowest view.
- [x] Ties keep stack order.
- [x] Changing stack or mode resets sorting to Stack order.
- [x] At 320 px and 375 px, every cell has a small title above its value, rows stay separated by lines, and there is no horizontal scrolling.
- [x] Practice days, recent misses, and cards collapse and expand on click, and the state is remembered.
- [x] At desktop widths, a conventional table layout is allowed.
- [x] Sort controls, section toggles, and rows are keyboard reachable with clear accessible names.
- [x] Table data is centred in each cell.
- [x] Tests cover row count, column values, `—` handling, default order, each sort mode including reinforcement, tie-breaking, stack/mode reset, and section preferences.
- [x] Typecheck, tests, build, and the stack verifier pass.


## Implementation

- `src/domain/card-table.ts` (new): `buildCardRows` returns 52 rows in stack
  order with per-card streak, reinforcement progress (`x/5` or `null`), miss
  count, and average tenths. `sortCardRows` implements Stack order, Slowest
  average first (untimed last), Most missed, and Lowest streak, with stack-order
  tie-breaks. `createCardTableView` / `changeCardTableStack` /
  `changeCardTableMode` / `changeCardTableSort` own the selection + sort state and
  reset sort on stack or mode change.
- `src/screens/stats.ts`: the empty per-card area now renders the table with a
  Sort select, full column headers on desktop, and one-decimal localized average
  times via `toLocaleString` with the `s` unit. Rows are focusable and carry a
  “Position N, card” accessible name; card cells use the existing card face.
  Practice days, recent misses, and cards are collapsible sections.
- `src/domain/card-table.ts`: adds the Reinforcement sort (in-list first, lowest
  progress first, no-reinforcement cards last, stack-order ties).
- `src/domain/types.ts` + `src/domain/settings.ts`: `settings.statsSections`
  remembers the three open/closed states; older v2 payloads remain valid.
- `src/styles.css`: desktop table plus a phone layout that hides the header and
  puts a small title above every cell value, with row separator lines. Card faces
  shrink inside the table so rows stay compact at 320 px. Cell data is centred.
- `src/strings.ts`: card-table headings, sort labels, column labels, short mobile
  labels, reinforcement progress, and row accessible names.
- Tests: `tests/card-table.test.ts` covers row count/order, values, missing data,
  `—` handling, every sort mode, tie-breaking, no mutation, and sort reset.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 181 passed (17 files; new `tests/card-table.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass

Awaiting human check in the browser before commit.

## Comments

- Human approved after the follow-up: collapsible stats sections with remembered
  state, centred cells, per-cell titles on narrow screens, row separators, and
  the Reinforcement sort. Ticket resolved.
