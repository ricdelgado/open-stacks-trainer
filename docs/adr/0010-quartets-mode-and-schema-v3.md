# ADR-0010 — Quartets mode, per-rank records, and schema v3

- **Status:** accepted
- **Date:** 2026-11-26

## Context

Quartets practice adds a new way to train a stack: one prompt per rank, with the first card, three distances, and four positions. Its stats need rank-keyed records and a different miss shape. Existing Basic and Next 3 cards data must survive, and the payload must stay under the single `open-stacks-trainer` key.

## Decision

- Add `quartets` to the `Mode` union as a real mode with its own stats bucket.
- Derive quartets at runtime from the stack order. Never store them as stack data, in `localStorage`, or in backups.
- Add `ModeStats.ranks?: Partial<Record<Rank, RankStats>>`. `RankStats` mirrors `CardStats`; missing records mean zeros. Keep `cards` exclusively for valid card-code keys.
- Replace the single miss shape with a discriminated union: card misses keep `{ card, position, direction, at }`; quartet misses store `{ rank, firstCard, distances, at }`. A quartet miss validates only in the quartets bucket.
- Bump `AppState.schemaVersion` to `3`. The localStorage key, backup format, and backup format version do not change.
- Migrate v2 by validating the existing shape as schema 3 and setting the version to 3. Migrate v1 through the existing v1→basic conversion, then to v3. Preserve every existing Basic and Next 3 cards field. Do not add an empty quartets bucket to stacks that never practiced it.
- Preserve `settings.appearance` and `settings.installCardDismissed`; a missing value still validates and resolves to its default.
- Backups export schema 3 and restore v1, v2, or v3. Newer schemas and formats are refused without changing data.
- Score each graded rank as one answer: update the mode totals, streak, practice day, and rank record. A miss sets the rank's reinforcement flag; five consecutive Got it answers clear it.

## Consequences

- Basic and Next 3 cards data migrate losslessly; quartets starts empty until practiced.
- Rank records stay separate from card records, so validation and stats tables cannot confuse the two key spaces.
- Backups remain portable across v1, v2, and v3.
- The stored payload remains compatible with the one-key storage rule and the existing corrupt/quota handling.

## References

- `.scratch/v3-quartets/spec.md`
- `.scratch/v3-quartets/issues/03-storage-schema-v3-and-migration.md`
- `docs/adr/0008-mode-split-schema-and-migration.md`
- `docs/adr/0004-browser-storage-and-stats-identity.md`
