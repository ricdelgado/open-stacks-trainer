# 02 — Card +3 mode

**What to build:** A persisted Card +3 training mode asks for the next three cards after the front card, with one grade and its own mode stats.

**Blocked by:** `v2-per-card-stats/01 — Storage schema v2 and mode-split stats`; `01 — Timer, elapsed capture, and session average`.

**Status:** ready-for-agent

- [ ] The mode selector enables Basic and Card +3; future modes stay disabled with “later”.
- [ ] The selected mode is saved in settings and restored; default is Basic.
- [ ] Card +3 runs one 52-item pass with every position once.
- [ ] Position → card shows a position as the front; Card → position shows a card; Mixed chooses per item.
- [ ] The back is always the three cards at the next three positions after the front card’s position, wrapping 52 → 1.
- [ ] The three answer cards appear in one compact row that fits 320 px without horizontal scrolling.
- [ ] One Got it/Missed grade covers the triple and advances to the next item.
- [ ] Card +3 writes to its own mode stats record, including streaks, practice days, recent misses, and per-card data.
- [ ] Only the front card receives per-card elapsed time, streak, and miss updates.
- [ ] The summary shows the front card and position in the missed list.
- [ ] Train again restarts Card +3 with the same direction and a fresh shuffle.
- [ ] Space/Enter, 1/N, and 2/Y work as in Basic.
- [ ] Tests cover 52 items, direction behavior, next-three wrap at 50, 51, and 52, one-grade flow, mode persistence, and mode-separated stats.
- [ ] Typecheck, tests, build, and the stack verifier pass.
