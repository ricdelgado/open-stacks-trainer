# 03 — Per-card table and ranking

**What to build:** The selected stack and mode show a 52-row per-card table with streak, reinforcement progress, miss count, and average elapsed time, plus sorting.

**Blocked by:** 02 — Stats page restructure; `v2-training-modes-and-controls/01 — Timer, elapsed capture, and session average`; `v2-training-modes-and-controls/03 — Reinforcement and Settings Training`.

**Status:** ready-for-agent

- [ ] The table has 52 rows in the current stack order, including cards with no data.
- [ ] Columns are Position, Card, Current streak, Reinforcement, Times missed, and Average time.
- [ ] Card cells use the existing typographic card face and accessible card name.
- [ ] Current streak is the mode-specific consecutive Got it count.
- [ ] Reinforcement shows `x/5` while the card is in the reinforcement list, otherwise `—`.
- [ ] Times missed is the mode-specific cumulative count from v2 onward.
- [ ] Average time shows one decimal with a localized unit; cards with no timed Got it answers show `—`.
- [ ] The sort control offers Stack order (default), Slowest average first, Most missed, and Lowest streak.
- [ ] Cards without an average sort after cards with an average in the slowest view.
- [ ] Ties keep stack order.
- [ ] Changing stack or mode resets sorting to Stack order.
- [ ] At 320 px and 375 px, each row becomes compact two-line labelled rows with no horizontal scrolling.
- [ ] At desktop widths, a conventional table layout is allowed.
- [ ] Sort controls and rows are keyboard reachable with clear accessible names.
- [ ] Tests cover row count, column values, `—` handling, default order, each sort mode, tie-breaking, and stack/mode reset.
- [ ] Typecheck, tests, build, and the stack verifier pass.
