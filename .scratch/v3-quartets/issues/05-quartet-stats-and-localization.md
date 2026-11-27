# 05 — Quartet stats, recent misses, localization, and menu integration

**What to build:** Add the per-rank stats table, quartet-aware recent misses, complete English and Portuguese strings, and the menu, settings, and help entries for Quartets.

**Blocked by:** `04 — Quartet scoring, Reinforcement, Endless, and Accelerate handling`.

**Status:** resolved

- [x] The menu mode selector includes **Quartets** and no longer labels it later; selecting it persists in settings.
- [x] Training settings show Reinforcement and Endless for quartets and hide or disable Accelerate with a short note.
- [x] Stats mode tabs include Quartets; per-mode figures behave as for other modes; practiced-stack and practiced-mode selection treat the quartets bucket like any other.
- [x] For quartets, the per-card table is replaced by a 13-row per-rank table with rank, first card, distances, current streak, average time, times missed, and reinforcement progress (`x/5` or `—`).
- [x] The per-rank table supports rank order, reinforcement, slowest average, most missed, and lowest streak sorting.
- [x] Stats recent misses show rank, first card, and distances for quartets, and card, position, and direction for other modes.
- [x] All new strings live in the central strings module and are complete in `en` and `pt-BR`: mode name, localized rank names, distance and position labels, the no-direction note, the Accelerate-unavailable note, table headers, quartet miss formatting, and help text; the i18n key-parity test passes.
- [x] No user-visible literal lives in a screen; stack names and creator names are not translated.
- [x] The per-rank table, recent misses, menu, and settings fit at 320 px and 375 px with no horizontal scroll and ≥44×44 px tap targets.
- [x] In-app help and `CONTEXT.md` describe Quartets, the per-rank table, and the unavailable Accelerate.
- [x] The README feature list and roadmap are updated, with credits and the AI disclosure unchanged.
- [x] Typecheck, tests, build, and the stack verifier pass; built-in data is untouched.


## Implementation

- Added `src/domain/rank-table.ts` with 13 canonical rank rows, first card, distances, rank streak, reinforcement progress, misses, and average time. Added rank-order, reinforcement, slowest, most-missed, and lowest-streak sorting.
- Stats renders a per-rank table for quartets and keeps the per-card table for Basic and Next 3 cards. Mode tabs and per-mode figures include Quartets.
- Recent misses show rank, first card, distances, and timestamp for quartets; card modes keep card, position, and direction.
- Added the Accelerate-unavailable note and hid its controls while Quartets is selected.
- Added all quartet strings in English and Portuguese: rank names, distances/positions, table headers, sort labels, miss formatting, no-direction note, Accelerate note, and the help section.
- Updated in-app help and verified the existing `CONTEXT.md`/README descriptions. Feature list and roadmap remain accurate; credits and AI disclosure are unchanged.
- Added `tests/rank-table.test.ts`.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 285 passed (28 files)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Production preview with both Basic and Quartets buckets: the Quartets tab shows a 13-row rank table with seven columns; switching to Basic restores the per-card table; sorting by most missed reorders rows.
- Recent misses show `7♠`, Sevens, `4 · 6 · 8`, and the timestamp.
- At 320 px the rank table, sort controls, recent misses, menu note, and settings note have no horizontal scroll and no undersized controls.
- Help includes the Quartets section.

Human approved ticket 05.
