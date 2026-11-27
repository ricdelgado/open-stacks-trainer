# 03 — Storage schema v3 and migration

**What to build:** Bump the one stored payload to `schemaVersion: 3` with the quartet mode, optional per-rank records, and both miss-record shapes, migrating v1 and v2 payloads losslessly.

**Blocked by:** `01 — Quartet computation and fixtures`; `02 — Quartets mode and training screen`.

**Status:** resolved

- [x] `AppState.schemaVersion` is `3` and the app still uses the single `localStorage` key `open-stacks-trainer`.
- [x] `Mode` includes `quartets`; `ModeStats.ranks?: Record<Rank, RankStats>` mirrors `CardStats` and is used only for quartets; `cards` stays keyed by valid card codes.
- [x] `MissRecord` is a validated union or optional shape so quartet misses store `{ rank, firstCard, distances, at }` while card misses keep `{ card, position, direction, at }`; `recentMisses` stays newest-first and capped at 20.
- [x] `parseAppState` requires schema 3, keeps `isCards`, adds `isRanks`, validates `ranks` only when present, and validates both miss shapes.
- [x] Migration accepts v1 and v2: v1 runs the existing v1→v2 path and then to v3; every `basic` and `card-plus-3` field is preserved; no empty quartets bucket is added for stacks that never practiced quartets; write-back is best-effort and re-migrates next load if it fails.
- [x] `settings.appearance` and `settings.installCardDismissed` are preserved when present; a missing value still validates.
- [x] Backups export `schemaVersion: 3` with the unchanged format and format version; restore accepts v1, v2, and v3, refuses newer schema or format versions, and remains all-or-nothing.
- [x] Corrupt, unavailable, and quota storage behavior is unchanged: no silent wipe, a visible warning, and an explicit reset.
- [x] Migration tests cover v2→v3 and v1→v3 lossless preservation, backup round-trip, newer-schema refusal, invalid payload no-op, and survival of `appearance` and `installCardDismissed`.
- [x] An ADR (next number, likely `0010`) records the mode extension, per-rank records, miss-record union, and v3 migration.
- [x] No quartet data is stored as stack data; built-in data is untouched; typecheck, tests, build, and the stack verifier pass.


## Implementation

- Bumped `AppState.schemaVersion` to `3`, `SCHEMA_VERSION` to `3`, and the backup schema version to `3`.
- Added `ModeStats.ranks?: Partial<Record<Rank, RankStats>>`, `RankStats`, and the card/quartet `MissRecord` union.
- Added rank-key validation, quartet-distance validation, mode-specific miss-shape validation, and ranks-only-for-quartets validation.
- v2 payloads migrate to v3 by validating the existing structure under the v3 schema; v1 still runs through the basic conversion. Existing Basic and Next 3 cards data is preserved and no empty quartets bucket is created.
- `settings.appearance` and `settings.installCardDismissed` survive migration; missing values still normalize.
- Backups export schema 3, restore v1/v2/v3, deep-copy rank records and quartet distance arrays, and refuse newer schemas.
- Added `docs/adr/0010-quartets-mode-and-schema-v3.md`.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 282 passed (27 files; expanded migration, storage, and backup coverage)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- v1→v3 and v2→v3 migration, backup round-trip, newer-schema refusal, quartet/card miss validation, and appearance/install preservation are covered.

Human approved tickets 02–04.
