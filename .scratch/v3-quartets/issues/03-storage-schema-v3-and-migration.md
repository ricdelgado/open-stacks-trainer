# 03 — Storage schema v3 and migration

**What to build:** Bump the one stored payload to `schemaVersion: 3` with the quartet mode, optional per-rank records, and both miss-record shapes, migrating v1 and v2 payloads losslessly.

**Blocked by:** `01 — Quartet computation and fixtures`; `02 — Quartets mode and training screen`.

**Status:** ready-for-agent

- [ ] `AppState.schemaVersion` is `3` and the app still uses the single `localStorage` key `open-stacks-trainer`.
- [ ] `Mode` includes `quartets`; `ModeStats.ranks?: Record<Rank, RankStats>` mirrors `CardStats` and is used only for quartets; `cards` stays keyed by valid card codes.
- [ ] `MissRecord` is a validated union or optional shape so quartet misses store `{ rank, firstCard, distances, at }` while card misses keep `{ card, position, direction, at }`; `recentMisses` stays newest-first and capped at 20.
- [ ] `parseAppState` requires schema 3, keeps `isCards`, adds `isRanks`, validates `ranks` only when present, and validates both miss shapes.
- [ ] Migration accepts v1 and v2: v1 runs the existing v1→v2 path and then to v3; every `basic` and `card-plus-3` field is preserved; no empty quartets bucket is added for stacks that never practiced quartets; write-back is best-effort and re-migrates next load if it fails.
- [ ] `settings.appearance` and `settings.installCardDismissed` are preserved when present; a missing value still validates.
- [ ] Backups export `schemaVersion: 3` with the unchanged format and format version; restore accepts v1, v2, and v3, refuses newer schema or format versions, and remains all-or-nothing.
- [ ] Corrupt, unavailable, and quota storage behavior is unchanged: no silent wipe, a visible warning, and an explicit reset.
- [ ] Migration tests cover v2→v3 and v1→v3 lossless preservation, backup round-trip, newer-schema refusal, invalid payload no-op, and survival of `appearance` and `installCardDismissed`.
- [ ] An ADR (next number, likely `0010`) records the mode extension, per-rank records, miss-record union, and v3 migration.
- [ ] No quartet data is stored as stack data; built-in data is untouched; typecheck, tests, build, and the stack verifier pass.
