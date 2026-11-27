# 01 — Practice-day aggregation and intensity model

**What to build:** Add a pure calendar model that aggregates existing practice days across all stacks and modes into a 26-week Monday-first window with five intensity levels.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] `src/domain/practice-calendar.ts` has no DOM or storage imports and accepts `AppState.stats` plus an injected `today: Date`.
- [x] The model sums `answered` and `correct` per local `YYYY-MM-DD` across every stack and mode, using the recorded dates without reinterpreting time zones.
- [x] The default window starts on the Monday 25 weeks before the current week's Monday and ends with the current week; it always starts on a Monday.
- [x] Days before recorded practice and future days in the current week are represented as empty, non-interactive placeholders so the final row is complete.
- [x] Intensity uses `maxAnswered` in the visible window: zero answers → level 0; ratio ≤ 0.25 → level 1; ≤ 0.5 → 2; ≤ 0.75 → 3; otherwise 4; `maxAnswered = 0` yields level 0 everywhere.
- [x] Expanding the window by 26 weeks recomputes levels against the new visible maximum and stops at the earliest recorded practice day.
- [x] Each day carries `date`, `answered`, `correct`, `level`, a week index, and a weekday index with Monday = 0.
- [x] Tests cover multi-stack and multi-mode sums on the same date, ignored modes without practice, Monday start, the 26-week span, today inclusion, Sunday and Monday boundaries, month and year rollover, a leap day, future-day placeholders, and intensity boundaries.
- [x] Expansion tests cover adding 26 weeks, hiding when the earliest day is already visible, and stopping at the earliest day.
- [x] No schema, backup, or storage change is made; the model reads existing `practiceDays` only.
- [x] Typecheck and tests pass.
