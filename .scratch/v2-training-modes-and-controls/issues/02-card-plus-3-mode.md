# 02 — Card +3 mode

**What to build:** A persisted Card +3 training mode asks for the next three cards after the front card, with one grade and its own mode stats.

**Blocked by:** `v2-per-card-stats/01 — Storage schema v2 and mode-split stats`; `01 — Timer, elapsed capture, and session average`.

**Status:** resolved

- [x] The mode selector enables Basic and Card +3; future modes stay disabled with “later”.
- [x] The selected mode is saved in settings and restored; default is Basic.
- [x] Card +3 runs one 52-item pass with every position once.
- [x] Position → card shows a position as the front; Card → position shows a card; Mixed chooses per item.
- [x] The back is always the three cards at the next three positions after the front card’s position, wrapping 52 → 1.
- [x] The three answer cards appear in one compact row that fits 320 px without horizontal scrolling.
- [x] One Got it/Missed grade covers the triple and advances to the next item.
- [x] Card +3 writes to its own mode stats record, including streaks, practice days, recent misses, and per-card data.
- [x] Only the front card receives per-card elapsed time, streak, and miss updates.
- [x] The summary shows the front card and position in the missed list.
- [x] Train again restarts Card +3 with the same direction and a fresh shuffle.
- [x] Space/Enter, 1/N, and 2/Y work as in Basic.
- [x] Tests cover 52 items, direction behavior, next-three wrap at 50, 51, and 52, one-grade flow, mode persistence, and mode-separated stats.
- [x] Typecheck, tests, build, and the stack verifier pass.

## Implementation

- `src/domain/session.ts`: `mode` on options/session; Card +3 items carry `nextCards` (positions P+1, P+2, P+3, wrapping 52 → 1).
- `src/screens/menu.ts`: Basic and Card +3 are enabled radios bound to `settings.mode`; Quartets, ACAAN, and Cyclic stay disabled.
- `src/screens/training.ts`: shows the “Card +3” label, renders the three answer cards in a compact row, announces the triple on reveal; timer and keyboard flow unchanged.
- `src/domain/scoring.ts`: `applyAnswerToState` writes the answer into the active stack + mode bucket. `src/app.ts` uses the session’s generated mode, so Card +3 stats stay separate and only the front card is updated.
- `src/strings.ts` and `src/styles.css`: “Card +3”, “Next three cards”, `.card-triple`, muted mode label.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 138 passed (14 files; Card +3 generation, wrap at 50/51/52, mode separation, mode persistence)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass

Awaiting human check in the browser before commit.

## Comments

- Human confirmed shipped. Commit `9c2e497` is on `origin/main` and included in the
  live Pages build. Ticket resolved.
