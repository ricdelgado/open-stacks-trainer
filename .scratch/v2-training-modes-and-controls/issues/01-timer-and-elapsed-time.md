# 01 — Timer, elapsed capture, and session average

**What to build:** A quiet per-prompt timer measures recall time, stores tenths per card and mode, and adds an Average time figure to the session summary.

**Blocked by:** `v2-per-card-stats/01 — Storage schema v2 and mode-split stats`.

**Status:** resolved

- [x] A small, muted timer appears on the training screen near the progress/streak line.
- [x] The timer starts when a new front is rendered and resets for every new prompt.
- [x] The timer stops on reveal through the button, Space, or Enter.
- [x] The timer pauses while the document is hidden and resumes when visible.
- [x] The visible value is floored whole seconds; stored elapsed time uses tenths.
- [x] The stopped time stays visible during grading.
- [x] The ticking timer is not a live region; the final time is announced once on reveal.
- [x] A Got it grade updates the card’s `elapsedTenths` and `correctTimedAnswers`.
- [x] A Missed grade does not change the card’s elapsed sum or count.
- [x] Per-card timing is stored in the active stack + mode record.
- [x] The summary adds Average time, computed from the session’s Got it answers only, shown to one decimal with the current locale.
- [x] Sums and counts remain non-negative safe integers.
- [x] The timer and capture seams work for Basic and can be reused by Card +3 and Endless.
- [x] Existing keyboard shortcuts and grading behavior are unchanged.
- [x] Tests use an injected clock for start, stop, pause/resume, tenths rounding, floored display, Missed exclusion, and summary average.
- [x] Typecheck, tests, build, and the stack verifier pass.

## Implementation

- `src/domain/timer.ts` (new): `RecallTimer` with an injected monotonic clock. `start`, `pause`, `resume`, `stop`; `elapsedMs`, `tenths` (`Math.round(ms/100)`), `displaySeconds` (`Math.floor(ms/1000)`).
- `src/screens/training.ts`: muted timer near the progress/streak line (not a live region), started on each new front, stopped on reveal, paused/resumed on `visibilitychange`, final time announced once through the existing polite region.
- `src/session/runner.ts`: `grade(correct, at, elapsedTenths?)` accumulates only correct, safe-integer tenths; exposes `sessionAverageTenths`.
- `src/app.ts`: passes elapsed tenths for Got it into `applyAnswer` and the runner; the summary view carries `averageTenths`.
- `src/screens/summary.ts` + `strings.ts`: Average time figure, one decimal, current locale, `—` when none.
- `src/styles.css`: muted, tabular-nums timer style.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 134 passed (14 files; new `tests/timer.test.ts`, runner average tests)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass

Awaiting human check in the browser before commit.

## Comments

- Human confirmed shipped. Commit `4c8559d` is on `origin/main` and included in the
  live Pages build. Ticket resolved.
