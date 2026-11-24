# ADR-0008 — Mode-split stats schema v2 with automatic v1 migration

- **Status:** accepted
- **Date:** 2026-11-23

## Context

v1 stored one stats record per stack (`stats[stackId]`). The v2 features need Basic and Card +3 tracked separately, per-card metrics for a new Stats table, and reinforcement state. Training and settings features depend on the shared schema, so it must change once, safely, without losing existing progress.

## Decision

- Move the single `localStorage` payload to `schemaVersion: 2`.
- Key stats by stack ID and then mode: `stats[stackId][mode]`. Modes are `basic` and `card-plus-3`. Endless is a session modifier, not a mode; it updates the active mode.
- Each mode record keeps the v1 fields plus `mode` and `cards`. Each per-card record stores `currentStreak`, `timesMissed`, `elapsedTenths`, `correctTimedAnswers`, and `inReinforcement`. Missing card records mean zeros; average time is `elapsedTenths / correctTimedAnswers`, computed on demand.
- Set `inReinforcement` on a miss and clear it after five consecutive correct answers for that card.
- Extend `settings` with `mode`, `reinforcement`, `accelerate`, `accelerateThresholdTenths`, `endless`, and `language`. Defaults are `basic`, off, off, `10`, off, `en`.
- Migrate a v1 payload automatically on load: wrap each `stats[stackId]` into `stats[stackId].basic` with an empty `cards` map, preserve settings and custom stacks, and add the new setting defaults. Write the migrated v2 payload back to storage, best-effort; if the write fails, keep the migrated state in memory and re-migrate next load.
- Keep `format: "open-stacks-trainer-backup"` and `formatVersion: 1`, now with `schemaVersion: 2`. Restore accepts schema v1 (migrates through the same path) and v2, and refuses newer schema or format versions without changing anything.
- Per-card integers must be non-negative safe integers. Validation is all-or-nothing; corrupt storage is still never silently wiped.

## Consequences

- Basic progress survives the update; Card +3 starts empty after migration.
- Per-card metrics and reinforcement are available to the Stats table and to reinforcement training without another schema change.
- Backups remain portable: old v1 files restore and migrate; newer files are refused.
- The stored payload is larger (52 per-card records per practiced mode), but still small for `localStorage`.
- The Stats page still reads the Basic bucket until the Stats rebuild ticket replaces it with the selector and per-card table.

## References

- `.scratch/v2-per-card-stats/spec.md`
- `.scratch/v2-per-card-stats/issues/01-storage-schema-v2.md`
- `docs/adr/0004-browser-storage-and-stats-identity.md`
