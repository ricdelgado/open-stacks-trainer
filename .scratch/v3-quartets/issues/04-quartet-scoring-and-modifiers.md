# 04 — Quartet scoring, Reinforcement, Endless, and Accelerate handling

**What to build:** Score each rank into per-rank records, extend misses and reinforcement to ranks, support 26-rank Endless batches, and make Accelerate unavailable for quartets.

**Blocked by:** `02 — Quartets mode and training screen`; `03 — Storage schema v3 and migration`.

**Status:** resolved

- [x] Every graded rank updates `totalAnswered`, `totalCorrect`, the current and best streak, `lastPracticedAt`, the practice day, and the rank record.
- [x] A practice day increments answered by one per graded rank and correct by one when correct.
- [x] Got it increments the rank streak and adds elapsed tenths only when the answer is timed; Missed resets the rank streak, records a quartet miss, and sets `inReinforcement`.
- [x] Five consecutive Got it answers clear the rank's reinforcement flag; rank records are keyed by rank, not by card code.
- [x] Quartet miss records store rank, first card, distances, and timestamp; they stay newest-first and capped at 20; validation accepts the quartet shape only for the quartets mode.
- [x] Reinforcement uses a per-rank list; extra ranks are scheduled after every 3–8 regular ranks with the existing planner and avoid the same rank twice in a row when the list has more than one entry.
- [x] Accelerate is hidden or disabled while quartets is selected, produces no extra prompts, and the stored toggle is preserved for other modes.
- [x] Endless uses 26-item batches made of two independent shuffled passes of the 13 ranks.
- [x] Endless avoids the same rank twice in a row when an alternative exists within and across batches, continues without a summary, and opens the summary on Quit with `Answered N`.
- [x] Tests cover rank-record updates, miss and reinforcement, five-streak clear, timed-only elapsed, practice-day increments, quartet miss shape and cap, reinforcement gap ranges and candidates, no Accelerate inserts, and 26-rank Endless batches.
- [x] Write-through persistence after every grade is verified, and no code path writes quartets to stack data.
- [x] Typecheck, tests, build, and the stack verifier pass.


## Implementation

- Scoring branches on `mode`: card modes update `cards` and card misses; quartets update a rank record, the practice day, totals, streak, and a quartet miss.
- Rank records use the same elapsed-time and five-streak reinforcement rules as card records. Quartet misses are newest-first and capped at 20.
- Reinforcement candidates for quartets come from `ModeStats.ranks`; the session planner inserts ranks after 3–8 regular ranks and avoids a neighbouring rank when possible.
- Accelerate produces no quartet inserts; the training settings hide its controls while quartets is selected and preserve the stored toggle for other modes.
- Endless quartets uses two shuffled 13-rank passes (26 regular items), avoids adjacent ranks where possible, and keeps the existing Quit summary with `Answered N`.
- The runner and app grading path pass the quartet fields into scoring.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 282 passed (27 files; new quartet scoring and modifier tests)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Production preview: a quartets grade persists the rank record and miss; Endless shows `Answered 0`/`Answered 1`, `Quit` opens a summary with the rank and distances, and no Accelerate insert appears.
- Unit coverage includes rank records, timed-only elapsed, five-streak clearing, practice days, miss cap/shape, reinforcement gaps, no Accelerate inserts, 26-rank Endless batches, and batch-boundary rank avoidance.

Ticket 05 delivered the per-rank table, localization, and help.

Human approved tickets 02–04.
