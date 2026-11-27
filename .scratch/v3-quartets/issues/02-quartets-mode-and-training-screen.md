# 02 — Quartets mode and training screen

**What to build:** Add the `quartets` mode with a 13-rank shuffled session, a rank front, and a first-card, distance, and position back, with the direction control hidden.

**Blocked by:** `01 — Quartet computation and fixtures`.

**Status:** resolved

- [x] `quartets` is added to the `Mode` union and is a real mode with its own stats bucket; Basic and Next 3 cards behavior is unchanged.
- [x] A normal session has 13 items, one per rank, shuffled with the existing injected-RNG Fisher–Yates; no rank repeats.
- [x] While `settings.mode === "quartets"`, the menu hides the direction control and shows a one-line note that quartets have no direction; switching back restores the persisted direction.
- [x] `SessionItem` carries `rank`, `firstCard`, `distances`, and `positions`, with `card = firstCard` and `position = positions[0]` so the timer, progress, streak, practice-day, and item plumbing keep working.
- [x] No fake direction is persisted; the scoring path branches on `mode`.
- [x] The front shows the localized rank name (`Aces` … `Kings`, with pt-BR equivalents).
- [x] The back shows the first card face, the three distances as `4 · 6 · 8`, and the four positions as a secondary line `37, 41, 47, 3`.
- [x] Progress shows `answered/13`; the timer starts, stops on reveal, pauses while the document is hidden, and shows floored seconds exactly as in Basic.
- [x] One grade covers the rank; Space/Enter, 1/N, and 2/Y work unchanged; write-through persistence happens after every grade.
- [x] Accessible names describe the rank and the answer; the back is announced once on reveal.
- [x] The rank front, distance line, and position line fit at 320 px and 375 px with no horizontal scroll and ≥44×44 px tap targets.
- [x] Tests cover 13 items, each rank once, deterministic order under injected RNG, and the front and back content.
- [x] Typecheck, tests, build, and the stack verifier pass.


## Implementation

- Added `quartets` to the `Mode` union and enabled it in the menu. The direction control is hidden while quartets is selected and the no-direction note is shown.
- `generateSession` now builds one shuffled pass of the 13 ranks. Each `SessionItem` carries `rank`, `firstCard`, `distances`, and `positions`, with `card = firstCard` and `position = positions[0]`.
- Training shows the localized rank on the front and the first card, `4 · 6 · 8` distances, and `37, 41, 47, 3` positions on the back. The timer, progress, keyboard shortcuts, and write-through grading are unchanged.
- Summary and Stats miss rendering accept the quartet miss shape; the direction line is omitted for quartets.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 282 passed (27 files; quartet session, scoring, and fixture tests included)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Production preview: Quartets hides Direction, shows the no-direction note, hides Accelerate, starts at `0/13`, shows the rank front and card/distance/position back, and fits at 320 px and 375 px with no horizontal scroll.
- Grading a rank writes the quartets bucket, rank record, and quartet miss shape immediately.

Human approved tickets 02–04.
