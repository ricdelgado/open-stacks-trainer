# 02 — Quartets mode and training screen

**What to build:** Add the `quartets` mode with a 13-rank shuffled session, a rank front, and a first-card, distance, and position back, with the direction control hidden.

**Blocked by:** `01 — Quartet computation and fixtures`.

**Status:** ready-for-agent

- [ ] `quartets` is added to the `Mode` union and is a real mode with its own stats bucket; Basic and Next 3 cards behavior is unchanged.
- [ ] A normal session has 13 items, one per rank, shuffled with the existing injected-RNG Fisher–Yates; no rank repeats.
- [ ] While `settings.mode === "quartets"`, the menu hides the direction control and shows a one-line note that quartets have no direction; switching back restores the persisted direction.
- [ ] `SessionItem` carries `rank`, `firstCard`, `distances`, and `positions`, with `card = firstCard` and `position = positions[0]` so the timer, progress, streak, practice-day, and item plumbing keep working.
- [ ] No fake direction is persisted; the scoring path branches on `mode`.
- [ ] The front shows the localized rank name (`Aces` … `Kings`, with pt-BR equivalents).
- [ ] The back shows the first card face, the three distances as `4 · 6 · 8`, and the four positions as a secondary line `37, 41, 47, 3`.
- [ ] Progress shows `answered/13`; the timer starts, stops on reveal, pauses while the document is hidden, and shows floored seconds exactly as in Basic.
- [ ] One grade covers the rank; Space/Enter, 1/N, and 2/Y work unchanged; write-through persistence happens after every grade.
- [ ] Accessible names describe the rank and the answer; the back is announced once on reveal.
- [ ] The rank front, distance line, and position line fit at 320 px and 375 px with no horizontal scroll and ≥44×44 px tap targets.
- [ ] Tests cover 13 items, each rank once, deterministic order under injected RNG, and the front and back content.
- [ ] Typecheck, tests, build, and the stack verifier pass.
