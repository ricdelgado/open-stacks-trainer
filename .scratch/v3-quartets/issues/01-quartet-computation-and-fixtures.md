# 01 — Quartet computation and fixtures

**What to build:** Add a pure quartet computation for any valid 52-card stack and lock it to the 39 published and computed regression fixtures.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] `src/domain/quartets.ts` has no DOM or storage imports and exports `Rank`, `QuartetDistances`, `Quartet`, `computeQuartets(order)`, and `quartetForRank(order, rank)`.
- [x] The algorithm collects the four positions, computes the four cyclic gaps, cuts at the largest gap, chooses the first card, and returns the three distances and four positions in forward counting order.
- [x] A tie for the largest gap picks the candidate whose first card has the earliest position in stack order.
- [x] Output ranks follow canonical order `A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K`.
- [x] The order is validated with the existing stack validation before computation; wrong length, duplicate cards, and invalid cards are rejected.
- [x] All 39 fixture rows match exactly, including first card, distances, and positions.
- [x] Mnemonica and Aronson fixture rows are marked published; Memorandum rows are marked computed, not published.
- [x] Invariant tests assert every distance is at least 1, each distance is at most the largest gap, the distances sum to `52 − maxGap`, the four positions are distinct and valid, and all four cards share the rank.
- [x] A synthetic custom-stack tie test covers the earliest-position tie-break.
- [x] Quartets are computed at runtime only; no quartet data is written to `data/stacks.json`, `localStorage`, or backups.
- [x] `data/stacks.json`, `data/checksums.json`, and the built-in orders are untouched; `node scripts/verify-stacks.mjs` passes.
- [x] Typecheck and tests pass.


## Implementation

- Added `src/domain/quartets.ts` with no DOM or storage imports. It re-exports `Rank` and exports `QuartetDistances`, `Quartet`, `computeQuartets`, and `quartetForRank`.
- The computation validates with `validateStackOrder`, collects the four positions, calculates the four cyclic gaps, cuts at the largest gap, applies the earliest-first-card tie-break, and returns distances and positions in forward counting order.
- Added `tests/quartets.test.ts` with all 39 fixture rows. Mnemonica and Aronson are marked published; Memorandum is marked computed.
- Added invariant coverage, the canonical rank order check, a synthetic four-way tie, and invalid-order rejection.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 261 passed (25 files; new `tests/quartets.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- All 13 Mnemonica, 13 Aronson, and 13 Memorandum fixture rows match first card, distances, and positions exactly.
- No `data/stacks.json`, checksum, storage, or backup data was changed; quartets are computed only.

Human approved tickets 01–04.
