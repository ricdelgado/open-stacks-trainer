# 05 — Endless

**What to build:** A global Endless toggle lets Basic or Card +3 continue in batches of 104 regular items until the user quits, with a summary on quit.

**Blocked by:** `02 — Card +3 mode`; `03 — Reinforcement and Settings Training`; `04 — Accelerate`.

**Status:** resolved

- [x] Settings → Training has a global Endless toggle, off by default and persisted.
- [x] Endless is a modifier, not a mode; it combines with Basic and Card +3.
- [x] A batch contains 104 regular items: two independent shuffled passes of all 52 positions.
- [x] The same front card does not appear twice in a row within a batch, across the two passes, across batch boundaries, or around extra prompts when an alternative exists.
- [x] After 104 regular items, a fresh 104-item batch starts without a visible break or summary.
- [x] The training screen shows “Answered N” instead of `N/52`, plus the current streak and direction.
- [x] Extra Reinforcement/Accelerate prompts are inserted between regular items and counted in N.
- [x] Reinforcement/Accelerate candidates refresh at each batch boundary.
- [x] Answers write to the active Basic or Card +3 stats record; Endless has no separate stats bucket.
- [x] Quit asks for confirmation, then opens the summary.
- [x] The summary shows correct and missed out of N, accuracy, session-best streak, missed list, Average time, Train again, and Menu.
- [x] Train again starts a new Endless session with the same mode, direction, and toggles.
- [x] Normal 52-item Quit behavior is unchanged: confirm, discard the unfinished session, keep graded stats, return to the menu.
- [x] Tests cover batch size, two full passes, no adjacent duplicate, fresh batches, `Answered N`, quit summary, active-mode stats, and candidate refresh.
- [x] Typecheck, tests, build, and the stack verifier pass.


## Implementation

- `src/domain/session.ts`: `generateEndlessBatch` builds two independently
  shuffled 52-position passes (104 regular items), swaps the pass boundary or
  batch start when it would repeat a front card, and plans Reinforcement and
  Accelerate prompts over the 104 regular items. The shared insert composer
  avoids a neighbouring regular/extra card when the candidate pool allows it.
- `src/session/runner.ts`: `SessionRunner` accepts `endless` and `nextBatch`.
  At the end of a batch it calls `nextBatch` with the last front card and continues
  in the new batch; progress, streak, misses, and average carry over. Normal
  runners still complete at the end of their items.
- `src/app.ts`: endless sessions start with `generateEndlessBatch`; the next-batch
  callback recomputes reinforcement and accelerate candidates from current state,
  so lists refresh at each 104-item boundary. Quit on an endless session builds a
  completed summary and opens `#/summary`; normal quit still discards and returns
  to the menu. Train again uses the same mode, direction, and toggles.
- `src/screens/training.ts`: endless shows “Answered N” (and an accessible
  “Answered N cards”), with the streak and direction unchanged.
- `src/screens/settings.ts` + `src/strings.ts`: persisted Endless toggle with a
  short explanation on Settings → Training.
- Tests: `tests/endless.test.ts` covers batch size, two full passes, pass and batch
  boundaries, no adjacent duplicate with extras, fresh batches, Card +3 triples,
  the next-batch callback, continuation past 104, and normal 52-item completion.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 204 passed (19 files; new `tests/endless.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome: Endless toggle persists; training shows `Answered 0` then
  `Answered 3`; Quit confirms and opens the summary (3/3 correct, 100%);
  Train again starts a fresh `Answered 0`; normal 52-item Quit returns to the menu.

Awaiting human check in the browser before commit.

## Comments

- Human approved. Ticket resolved.
