# 05 — Endless

**What to build:** A global Endless toggle lets Basic or Card +3 continue in batches of 104 regular items until the user quits, with a summary on quit.

**Blocked by:** `02 — Card +3 mode`; `03 — Reinforcement and Settings Training`; `04 — Accelerate`.

**Status:** ready-for-agent

- [ ] Settings → Training has a global Endless toggle, off by default and persisted.
- [ ] Endless is a modifier, not a mode; it combines with Basic and Card +3.
- [ ] A batch contains 104 regular items: two independent shuffled passes of all 52 positions.
- [ ] The same front card does not appear twice in a row within a batch, across the two passes, across batch boundaries, or around extra prompts when an alternative exists.
- [ ] After 104 regular items, a fresh 104-item batch starts without a visible break or summary.
- [ ] The training screen shows “Answered N” instead of `N/52`, plus the current streak and direction.
- [ ] Extra Reinforcement/Accelerate prompts are inserted between regular items and counted in N.
- [ ] Reinforcement/Accelerate candidates refresh at each batch boundary.
- [ ] Answers write to the active Basic or Card +3 stats record; Endless has no separate stats bucket.
- [ ] Quit asks for confirmation, then opens the summary.
- [ ] The summary shows correct and missed out of N, accuracy, session-best streak, missed list, Average time, Train again, and Menu.
- [ ] Train again starts a new Endless session with the same mode, direction, and toggles.
- [ ] Normal 52-item Quit behavior is unchanged: confirm, discard the unfinished session, keep graded stats, return to the menu.
- [ ] Tests cover batch size, two full passes, no adjacent duplicate, fresh batches, `Answered N`, quit summary, active-mode stats, and candidate refresh.
- [ ] Typecheck, tests, build, and the stack verifier pass.
