# 01 — Storage schema v2 and mode-split stats

**What to build:** Existing v1 data is preserved and automatically migrated to a schema that supports Basic and Card +3 separately, per-card metrics, and reinforcement state. The app still works after the migration, and backups remain safe.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] The storage payload moves to `schemaVersion: 2` with one `localStorage` key.
- [x] Stats are keyed by stack ID and then mode (`basic`, `card-plus-3`).
- [x] Existing v1 stack stats migrate into the `basic` bucket; settings and custom stacks are preserved.
- [x] Card +3 starts empty after migration.
- [x] Per-card records store `currentStreak`, `timesMissed`, `elapsedTenths`, `correctTimedAnswers`, and `inReinforcement`.
- [x] Missing card records are treated as zero values, and averages are computed on demand.
- [x] Per-card integers are validated as non-negative safe integers.
- [x] New settings fields for mode, reinforcement, accelerate threshold, endless, and language exist with defaults (`basic`, off, 10 tenths, off, `en`).
- [x] v1 graded answers still persist immediately after migration.
- [x] v2 backups export with `format: "open-stacks-trainer-backup"`, `formatVersion: 1`, and `schemaVersion: 2`.
- [x] Restore accepts v1 (migrates) and v2; newer schema or format versions are refused without changing anything.
- [x] Invalid backups still change nothing.
- [x] Delete training data for a stack removes every mode for that stack, including per-card and reinforcement data; the stack remains.
- [x] Delete all data resets settings, customs, and all mode stats.
- [x] Corrupt or unavailable storage behavior is unchanged: no silent wipe, visible warning, explicit reset path.
- [x] Tests cover migration, defaults, round-trip, v1 restore, newer-version refusal, per-card validation, and delete semantics.
- [x] `CONTEXT.md` gains the new vocabulary, and an ADR records the mode-split schema and migration.
- [x] Typecheck, tests, build, and the stack verifier pass.

## Implementation

- Types: `Mode`, `CardStats`, `ModeStats`, `StackModes`; `AppState.schemaVersion: 2`; `Settings` toggles with defaults. `scoring.applyAnswer(stackId, mode, stats, answer)` updates mode totals and the per-card record (miss sets reinforcement, five consecutive correct clears it, timed elapsed accumulates only for correct timed answers).
- `src/domain/migrate.ts` migrates v1 to v2 (v1 stats into `basic`, settings defaults, empty `cards`) and validates v2. `AppStore.load()` migrates and writes the v2 payload back best-effort; newer schema refused, corrupt unchanged.
- Backups now emit `schemaVersion: 2`; restore accepts v1 (migrates) and v2 and refuses newer. `deleteStackStats` already removes the whole stack entry, so all modes go.
- `app.ts` writes to `stats[stackId][mode]`; the Stats page reads the `basic` bucket until the rebuild ticket.
- Docs: `CONTEXT.md` vocabulary and `docs/adr/0008-mode-split-schema-and-migration.md`.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 125 passed (13 files)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Dev server smoke — HTTP 200

Awaiting human review before commit and push.
