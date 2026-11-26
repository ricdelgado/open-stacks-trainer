# v3 Quartets practice

## Problem Statement

Basic and Next 3 cards train absolute card-to-position recall. A performer who has memorized a stack also needs **quartet** retrieval: for a four-of-a-kind, know the four positions and, more importantly, the relative distances between them. With those distances you can jump from one card of a value to the next without walking the whole stack.

Example (Mnemonica): the four Threes sit at positions 4, 12, 21, and 28, at distances `8 · 9 · 7`. Knowing those three numbers lets you reach any Three from another.

A quartet is described from a cut that groups the four cards as tightly as possible. Given the four positions, look at the four cyclic gaps between neighbouring cards (including the wrap from the last back to position 1). Cut the deck at the **largest** gap; the card right after that cut is the quartet's **first card**, and the three following gaps are its **distances**. The first card is not necessarily the first of that value in normal stack order. Example (Mnemonica Sevens): positions 3, 37, 41, and 47; the largest gap is between 3 and 37, so the first card is the Seven of Spades at 37 and the distances are `4 · 6 · 8`, with positions read as 37, 41, 47, 3.

The app has no way to compute or practice this.

## Solution

Add a pure quartet computation for any 52-card stack and a **Quartets** training mode:

- compute the 13 quartets at runtime from the stack order; never store them as stack data;
- one shuffled pass of the 13 ranks per session;
- front: the rank; back: the first card face, the three distances, and the four positions as a secondary line;
- reuse the reveal → **Got it** / **Missed** flow, quiet timer, keyboard shortcuts, and write-through persistence;
- reuse Reinforcement and Endless with rank-based semantics;
- add a per-rank table and quartet-aware miss records;
- migrate the storage schema from v2 to v3 without losing data.

## User Stories

1. As a user, I want a Quartets mode, so that I can drill relative distances between the four cards of each rank.
2. As a user, I want the app to compute quartets automatically for any stack, so that custom stacks work too.
3. As a user, I want the first card chosen by cutting at the largest gap, so that the distances are as tight as possible.
4. As a user, I want the three distances in counting order from the first card, so that I can count forward and reach the others quickly.
5. As a user, I want to see the four resulting positions after reveal, so that I can cross-check against the stack.
6. As a user, I want each session to cover all 13 ranks once, so that the drill is complete.
7. As a user, I want a rank to be graded once, so that the flow stays fast.
8. As a user, I want the same timer and keyboard shortcuts as other modes, so that I do not relearn controls.
9. As a user, I want the direction control hidden for quartets, so that I am not offered a meaningless choice.
10. As a user, I want Reinforcement to bring missed ranks back, so that weak quartets repeat.
11. As a user, I want a reinforced rank to clear after five consecutive Got it, so that recovered quartets stop appearing.
12. As a user, I want Endless to continue in rank batches of 26, so that I can practice beyond one pass.
13. As a user, I want a per-rank table, so that I can see which quartets are weak or slow.
14. As a user, I want recent misses for quartets to show the rank, first card, and distances, so that the record is meaningful.
15. As a user, I want each graded rank to count as one answer in streaks and practice days, so that my stats stay coherent.
16. As a user, I want quartets to have their own stats bucket, so that they do not distort Basic or Next 3 cards.
17. As a user, I want my existing stats and custom stacks preserved after the update, so that I lose nothing.
18. As a user, I want backups from v2 to restore and migrate, so that my data stays portable.
19. As a user, I want Accelerate not offered for quartets, so that I am not nudged by an ill-suited threshold.
20. As a maintainer, I want the quartet algorithm as a pure function with injected inputs, so that it is exhaustively testable.
21. As a maintainer, I want the published Tamariz and Aronson tables as regression fixtures, so that a future change cannot silently break the algorithm.
22. As a maintainer, I want the v2-to-v3 migration tested, so that a schema change never loses data.

## Implementation Decisions

### Quartet computation (pure domain)

- New module `src/domain/quartets.ts`; no DOM, no storage.
- Types (`src/domain/types.ts` or the module): `Rank = "A" | "2" | ... | "10" | "J" | "Q" | "K"`; `QuartetDistances = readonly [number, number, number]`; `Quartet { rank: Rank; firstCard: string; distances: QuartetDistances; positions: readonly [number, number, number, number] }`.
- `computeQuartets(order: readonly string[]): Quartet[]` and `quartetForRank(order, rank): Quartet`. Validate the order first with the existing stack validation; a stack must be 52 unique valid cards.
- Algorithm for one rank:
  1. Collect the four positions `p0 < p1 < p2 < p3`.
  2. Cyclic gaps: `g0 = p1 - p0`, `g1 = p2 - p1`, `g2 = p3 - p2`, `g3 = 52 - (p3 - p0)`. Each gap is ≥ 1 and the four sum to 52.
  3. Find the index `cut` of the **largest** gap. If two gaps tie for largest (possible in custom stacks), choose the candidate whose first card has the earliest position in stack order: among indices `i` with `g[i] === max`, compare `p[(i + 1) % 4]` and pick the smallest.
  4. `firstIndex = (cut + 1) % 4`. The first card is the card at `p[firstIndex]`.
  5. Distances are the three gaps starting at the first card: `distances[k] = g[(firstIndex + k) % 4]` for `k = 0, 1, 2`.
  6. Positions in output order are the four positions walking forward from the first card: `[p[firstIndex], p[(firstIndex + 1) % 4], p[(firstIndex + 2) % 4], p[(firstIndex + 3) % 4]]`.
- Output order: ranks in canonical order `A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K`.
- Invariants to assert in tests: every distance ≥ 1; `distances[0] + distances[1] + distances[2] === 52 - maxGap`; each distance ≤ `maxGap`; the four positions are distinct valid positions; the four cards share the rank.
- Compute at runtime for built-in and custom stacks. Never write quartets into `data/stacks.json`, `localStorage`, or backups.

### Reference fixtures

These tables are the regression fixtures. The Tamariz and Aronson rows are the published Pit Hartling quartet-distances tables and must match exactly. The Memorandum rows are **computed** (no published table was found); label them as computed in tests, not as verified source data. Positions are listed in counting order from the first card.

**Mnemonica (Juan Tamariz) — published**

| Rank | First card | Distances | Positions |
|---|---|---|---|
| A | AD | 4 · 8 · 8 | 39, 43, 51, 7 |
| 2 | 2H | 8 · 9 · 8 | 2, 10, 19, 27 |
| 3 | 3C | 8 · 9 · 7 | 4, 12, 21, 28 |
| 4 | 4S | 2 · 11 · 4 | 40, 42, 1, 5 |
| 5 | 5H | 8 · 9 · 5 | 8, 16, 25, 30 |
| 6 | 6C | 8 · 9 · 8 | 50, 6, 15, 23 |
| 7 | 7S | 4 · 6 · 8 | 37, 41, 47, 3 |
| 8 | 8H | 8 · 7 · 4 | 14, 22, 29, 33 |
| 9 | 9C | 8 · 9 · 8 | 44, 52, 9, 17 |
| 10 | 10C | 10 · 4 · 11 | 24, 34, 38, 49 |
| J | JH | 12 · 4 · 9 | 20, 32, 36, 45 |
| Q | QD | 2 · 15 · 2 | 46, 48, 11, 13 |
| K | KC | 8 · 5 · 4 | 18, 26, 31, 35 |

**Aronson (Simon Aronson) — published**

| Rank | First card | Distances | Positions |
|---|---|---|---|
| A | AS | 4 · 8 · 4 | 6, 10, 18, 22 |
| 2 | 2S | 10 · 5 · 9 | 41, 51, 4, 13 |
| 3 | 3H | 10 · 7 · 16 | 7, 17, 24, 40 |
| 4 | 4H | 2 · 6 · 8 | 29, 31, 37, 45 |
| 5 | 5C | 9 · 8 · 7 | 3, 12, 20, 27 |
| 6 | 6H | 5 · 5 · 11 | 39, 44, 49, 8 |
| 7 | 7D | 4 · 6 · 3 | 15, 19, 25, 28 |
| 8 | 8H | 15 · 7 · 7 | 46, 9, 16, 23 |
| 9 | 9H | 5 · 5 · 5 | 42, 47, 52, 5 |
| 10 | 10S | 21 · 3 · 3 | 11, 32, 35, 38 |
| J | JC | 1 · 2 · 17 | 33, 34, 36, 1 |
| Q | QD | 5 · 22 · 2 | 21, 26, 48, 50 |
| K | KH | 13 · 11 · 12 | 30, 43, 2, 14 |

**Memorandum (Woody Aragón) — computed, not published**

| Rank | First card | Distances | Positions |
|---|---|---|---|
| A | AD | 4 · 4 · 8 | 4, 8, 12, 20 |
| 2 | 2D | 4 · 8 · 4 | 31, 35, 43, 47 |
| 3 | 3D | 8 · 4 · 10 | 24, 32, 36, 46 |
| 4 | 4C | 2 · 2 · 2 | 5, 7, 9, 11 |
| 5 | 5C | 12 · 4 · 6 | 22, 34, 38, 44 |
| 6 | 6C | 4 · 12 · 4 | 29, 33, 45, 49 |
| 7 | 7C | 4 · 4 · 4 | 2, 6, 10, 14 |
| 8 | 8C | 5 · 14 · 4 | 18, 23, 37, 41 |
| 9 | 9C | 3 · 18 · 4 | 27, 30, 48, 52 |
| 10 | 10C | 13 · 10 · 4 | 42, 3, 13, 17 |
| J | JD | 13 · 14 · 4 | 40, 1, 15, 19 |
| Q | QS | 3 · 22 · 1 | 25, 28, 50, 51 |
| K | KD | 5 · 5 · 13 | 16, 21, 26, 39 |

### Mode, session, and training screen

- Add `"quartets"` to the `Mode` union. It is a real mode with its own stats bucket, like `basic` and `card-plus-3`.
- Session: 13 items, one per rank, shuffled with the existing injected-RNG Fisher–Yates. No repeats.
- Direction is not used. While `settings.mode === "quartets"`, the menu hides the direction control and shows a one-line note that quartets have no direction. Switching back to Basic or Next 3 cards uses the previously chosen direction, which remains persisted.
- `SessionItem` gains quartet fields: `rank`, `firstCard`, `distances`, `positions`. Keep `card = firstCard` and `position = positions[0]` so the timer, progress, streak, practice-day, and per-item plumbing keep working. Do not persist a fake direction; the scoring path branches on `mode`.
- Progress label `answered/13`. Timer behavior is identical to Basic: starts on a new front, stops on reveal, pauses while the document is hidden, scores in tenths, displays floored seconds.
- Front: the localized rank name (`Aces`, `Twos`, … `Kings`; pt-BR equivalents). Back: the first card face, the three distances as `4 · 6 · 8`, and the four positions as a secondary line `37, 41, 47, 3`. Accessible names describe the rank and the answer.
- One grade covers the rank. Write-through persistence after every grade. Keyboard shortcuts (Space/Enter reveal; 1/N Missed; 2/Y Got it) are unchanged.

### Scoring and records

- Add a per-rank record for quartets: `ModeStats.ranks?: Record<Rank, RankStats>`, where `RankStats` mirrors `CardStats` (`currentStreak`, `timesMissed`, `elapsedTenths`, `correctTimedAnswers`, `inReinforcement`). Do not reuse the `cards` map, whose keys must be valid card codes.
- Each graded rank updates: `totalAnswered`, `totalCorrect`, current/best streak, `lastPracticedAt`, the practice day (answered +1, correct +1 when correct), and the rank record. A Got it increments the rank streak and adds elapsed tenths when timed; a Miss resets the rank streak and sets `inReinforcement`.
- Reinforcement clears after five consecutive Got it for the rank.
- Extend the persisted miss record. Define a discriminated union or optional fields so a quartet miss stores `{ rank, firstCard, distances, at }` while existing card misses keep `{ card, position, direction, at }`. `recentMisses` stays newest-first and capped at 20. Validation accepts the quartet shape only for the quartets mode.
- Stats recent misses show rank, first card, and distances for quartets; card, position, and direction for other modes.

### Reinforcement, Accelerate, Endless

- Reinforcement: per-rank list for the quartets mode. A miss adds the rank; five consecutive Got it removes it. Extra prompts are ranks, scheduled after every 3–8 regular ranks with the existing planner. Avoid the same rank twice in a row when the list has more than one entry.
- Accelerate: not available for quartets in this release. Its 0.5–3 s thresholds assume single-card recall and rank recall is legitimately slower. Hide/disable the Accelerate control while quartets is selected; the stored toggle is preserved for other modes.
- Endless: 26-item batches (two independent shuffled passes of the 13 ranks). Avoid the same rank twice in a row when an alternative exists, within and across batches. A fresh batch continues without a summary until Quit, and Quit opens the summary, exactly like the existing Endless. Progress shows `Answered N`.

### Selection, settings, and stats

- The menu mode selector includes **Quartets** (no longer labelled "later").
- Training settings show Reinforcement and Endless for quartets; Accelerate is hidden/disabled as above.
- Stats mode tabs include Quartets. Per-mode figures behave as for other modes.
- For quartets, the per-card table is replaced by a **per-rank table** with 13 rows: rank, first card, distances, current streak, average time, times missed, and reinforcement progress (`x/5` or `—`). Offer the same sort family adapted to ranks: rank order, reinforcement, slowest average, most missed, lowest streak.
- Practiced-stack and practiced-mode selection logic treats the quartets bucket like any other mode.

### Storage schema v2 → v3

- Bump `AppState.schemaVersion` to `3` and keep the single `localStorage` key `open-stacks-trainer`.
- `Mode` includes `quartets`; `ModeStats.ranks` is optional and used only for quartets; `MissRecord` covers both shapes; `settings.appearance` (from `v3-ui-refresh`) is preserved, and `settings.installCardDismissed` (from `v3-pwa-offline`) is preserved if present.
- Migration: accept v1 and v2 payloads. A v1 payload migrates through the existing v1→v2 path, then to v3. Preserve every existing field of `basic` and `card-plus-3` data unchanged; add nothing to stacks that never practiced quartets. Set `schemaVersion: 3` and write back best-effort; if the write fails, keep the migrated state in memory and re-migrate next load.
- Validation: `parseAppState` requires schema 3 after this change. Keep `isCards` for card-code keys and add `isRanks` for rank keys. `isModeStats` validates `ranks` only when present. `isMissRecord` validates both record shapes.
- Backups: export `schemaVersion: 3`, format `open-stacks-trainer-backup`, format version unchanged. Restore accepts v1, v2, and v3 (migrating older), refuses newer schema or format versions, and remains all-or-nothing.
- Corrupt or unavailable storage behavior is unchanged: no silent wipe, visible warning, explicit reset.
- Add an ADR (next number, likely `0010`) recording the mode extension, per-rank records, miss-record union, and the v3 migration.

### Localization

- Add all new strings to the central strings module and complete both `en` and `pt-BR`: mode name **Quartets**, localized rank names (singular/plural as needed), distance/position labels, the no-direction note, the Accelerate-unavailable note, per-rank table headers, quartet miss formatting, and help text.
- The i18n key-parity test must pass. No user-visible literal in a screen.

## Testing Decisions

- `tests/quartets.test.ts`:
  - all 39 fixture rows (13 per stack) match `computeQuartets` exactly, including first card, distances, and positions;
  - Tamariz and Aronson rows are marked published; Memorandum rows are marked computed;
  - invariants: distances positive, each ≤ max gap, sum equals `52 - maxGap`, positions distinct, all four cards share the rank;
  - rank output order is canonical;
  - tie-break: a synthetic custom stack with two equal largest gaps picks the first card with the earliest position;
  - invalid stack (wrong length, duplicates, invalid card) is rejected before computation.
- Session tests: 13 items, each rank once, deterministic under injected RNG; Endless 26-item batches, two full passes, no adjacent duplicate when avoidable; Reinforcement insert gaps 3–8 and rank candidates; Accelerate produces no inserts for quartets.
- Scoring tests: rank records update; miss sets reinforcement and resets the rank streak; five consecutive Got it clears it; elapsed accumulates only on timed Got it; practice day increments by one per rank; quartet miss record shape and 20-entry cap.
- Migration tests: v2→v3 preserves all existing data and adds no destructive changes; v1→v3 works; backups round-trip; newer schema refused; invalid payload changes nothing; `appearance` and `installCardDismissed` survive.
- Stats tests: quartets bucket appears only when practiced; rank table builds 13 rows; sorting behaves; misses render the quartet shape.
- DOM smoke: front rank, back first card + distances + positions, 320 px with no horizontal scroll, keyboard flow.
- The stack data verifier is unaffected; built-in data is never edited.

## Out of Scope

- ACAAN, cyclic stacks, or drill-my-misses.
- Accelerate for quartets.
- Quartet diagrams, card images, or visual deck cuts.
- Manually editing quartet data; quartets are always derived.
- A direction for quartets.
- Languages beyond English and Português (Brasil).
- Reworking Basic or Next 3 cards behavior.

## Further Notes

- Order: Quartets has no dependency and can ship before or after the PWA work. The schema bump must include any settings added by the UI refresh and PWA features that shipped first.
- The algorithm was verified against the published Tamariz and Aronson tables at 26/26. Memorandum has no published table; its rows are regression fixtures derived from the verified stack order.
- Never write quartet data to `data/stacks.json`, `localStorage`, or backups as stack data.
- Update `CONTEXT.md` (Quartet, First card, Distance, Cut, Quartets mode, Per-rank record) and the README feature list and roadmap when this ships.
