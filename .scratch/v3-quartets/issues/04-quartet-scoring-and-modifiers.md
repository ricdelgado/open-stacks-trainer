# 04 — Quartet scoring, Reinforcement, Endless, and Accelerate handling

**What to build:** Score each rank into per-rank records, extend misses and reinforcement to ranks, support 26-rank Endless batches, and make Accelerate unavailable for quartets.

**Blocked by:** `02 — Quartets mode and training screen`; `03 — Storage schema v3 and migration`.

**Status:** ready-for-agent

- [ ] Every graded rank updates `totalAnswered`, `totalCorrect`, the current and best streak, `lastPracticedAt`, the practice day, and the rank record.
- [ ] A practice day increments answered by one per graded rank and correct by one when correct.
- [ ] Got it increments the rank streak and adds elapsed tenths only when the answer is timed; Missed resets the rank streak, records a quartet miss, and sets `inReinforcement`.
- [ ] Five consecutive Got it answers clear the rank's reinforcement flag; rank records are keyed by rank, not by card code.
- [ ] Quartet miss records store rank, first card, distances, and timestamp; they stay newest-first and capped at 20; validation accepts the quartet shape only for the quartets mode.
- [ ] Reinforcement uses a per-rank list; extra ranks are scheduled after every 3–8 regular ranks with the existing planner and avoid the same rank twice in a row when the list has more than one entry.
- [ ] Accelerate is hidden or disabled while quartets is selected, produces no extra prompts, and the stored toggle is preserved for other modes.
- [ ] Endless uses 26-item batches made of two independent shuffled passes of the 13 ranks.
- [ ] Endless avoids the same rank twice in a row when an alternative exists within and across batches, continues without a summary, and opens the summary on Quit with `Answered N`.
- [ ] Tests cover rank-record updates, miss and reinforcement, five-streak clear, timed-only elapsed, practice-day increments, quartet miss shape and cap, reinforcement gap ranges and candidates, no Accelerate inserts, and 26-rank Endless batches.
- [ ] Write-through persistence after every grade is verified, and no code path writes quartets to stack data.
- [ ] Typecheck, tests, build, and the stack verifier pass.
