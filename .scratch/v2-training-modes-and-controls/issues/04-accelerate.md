# 04 — Accelerate

**What to build:** A global Accelerate toggle makes cards whose average recall time exceeds a chosen threshold appear more often.

**Blocked by:** `03 — Reinforcement and Settings Training`.

**Status:** resolved

- [x] The Settings → Training page has a global Accelerate toggle, off by default and persisted.
- [x] When the toggle is on, four threshold buttons appear: 0.5s, 1s, 2s, 3s; default 1s.
- [x] When the toggle is off, the threshold buttons are hidden.
- [x] The threshold is stored as 5, 10, 20, or 30 tenths and persists.
- [x] A card is eligible when its mode-specific average is strictly greater than X and it has at least one timed Got it answer.
- [x] Accelerate candidates are fixed at session start.
- [x] The scheduler exposes a refresh seam for Endless to refresh candidates at each 104-item regular batch boundary.
- [x] Extra prompts appear after every 2–4 regular items, inclusive, with a fresh gap after each insert.
- [x] Selection is uniform from eligible cards, avoiding the same card twice in a row when possible.
- [x] The planned total includes accelerate inserts; no insert appears after the last regular item.
- [x] If Reinforcement and Accelerate are both due, the reinforcement prompt appears first, then the accelerate prompt.
- [x] Each accelerate prompt uses the active mode and direction, is graded once, and updates stats normally.
- [x] A muted “Accelerate” indicator sits to the right of the timer, in the same style as Reinforcement.
- [x] If no card qualifies, no accelerate prompts are scheduled and the Training page shows a short hint.
- [x] Tests cover strict `>`, the timed-answer requirement, threshold persistence, gap range, planned total, both-due ordering, no immediate repeat, and no-candidate behavior.
- [x] Typecheck, tests, build, and the stack verifier pass.


## Implementation

- `src/domain/inserts.ts` (new): shared gap planner with injected RNG, uniform
  pick, no immediate repeat when the pool has more than one card, and no insert
  after the last regular item. Reinforcement now uses it.
- `src/domain/accelerate.ts` (new): `accelerateCandidates` filters cards with at
  least one timed Got it answer and an average strictly above the threshold
  (`elapsedTenths > threshold × correctTimedAnswers`). This pure function is the
  Endless refresh seam. `planAccelerateInserts` uses inclusive 2–4 gaps.
- `src/domain/session.ts`: accepts `accelerateCandidates`, interleaves accelerate
  prompts after regular items and after any reinforcement prompt due at the same
  gap. Prompts use the active mode (Card +3 triples included) and direction.
- `src/app.ts`: snapshots eligible cards at session start when the toggle is on.
- `src/screens/settings.ts`: Accelerate toggle plus four threshold radios
  (0.5s, 1s, 2s, 3s), hidden while the toggle is off. The hint shows the count of
  qualifying cards or a short no-cards message for the selected stack + mode.
- `src/strings.ts`: Accelerate toggle, threshold, and hint text.
- `src/screens/training.ts` already shows the muted Accelerate indicator beside
  the timer through the shared insert slot.
- Tests: `tests/accelerate.test.ts` covers strict `>`, the timed-answer rule,
  threshold values, gap range, planned total, both-due ordering, no repeat, empty
  pool, and Card +3 prompts; settings tests cover toggle and threshold persistence.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 193 passed (18 files; new `tests/accelerate.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome: threshold controls hide/show with the toggle, persist across
  reload, and the qualifying-card hint updates at 1s and 3s; 320 px has no
  horizontal scroll.

Awaiting human check in the browser before commit.

## Comments

- Human approved. Ticket resolved.
