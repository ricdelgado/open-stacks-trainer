# 01 — Quartet computation and fixtures

**What to build:** Add a pure quartet computation for any valid 52-card stack and lock it to the 39 published and computed regression fixtures.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `src/domain/quartets.ts` has no DOM or storage imports and exports `Rank`, `QuartetDistances`, `Quartet`, `computeQuartets(order)`, and `quartetForRank(order, rank)`.
- [ ] The algorithm collects the four positions, computes the four cyclic gaps, cuts at the largest gap, chooses the first card, and returns the three distances and four positions in forward counting order.
- [ ] A tie for the largest gap picks the candidate whose first card has the earliest position in stack order.
- [ ] Output ranks follow canonical order `A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K`.
- [ ] The order is validated with the existing stack validation before computation; wrong length, duplicate cards, and invalid cards are rejected.
- [ ] All 39 fixture rows match exactly, including first card, distances, and positions.
- [ ] Mnemonica and Aronson fixture rows are marked published; Memorandum rows are marked computed, not published.
- [ ] Invariant tests assert every distance is at least 1, each distance is at most the largest gap, the distances sum to `52 − maxGap`, the four positions are distinct and valid, and all four cards share the rank.
- [ ] A synthetic custom-stack tie test covers the earliest-position tie-break.
- [ ] Quartets are computed at runtime only; no quartet data is written to `data/stacks.json`, `localStorage`, or backups.
- [ ] `data/stacks.json`, `data/checksums.json`, and the built-in orders are untouched; `node scripts/verify-stacks.mjs` passes.
- [ ] Typecheck and tests pass.
