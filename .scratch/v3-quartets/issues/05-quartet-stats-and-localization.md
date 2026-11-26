# 05 — Quartet stats, recent misses, localization, and menu integration

**What to build:** Add the per-rank stats table, quartet-aware recent misses, complete English and Portuguese strings, and the menu, settings, and help entries for Quartets.

**Blocked by:** `04 — Quartet scoring, Reinforcement, Endless, and Accelerate handling`.

**Status:** ready-for-agent

- [ ] The menu mode selector includes **Quartets** and no longer labels it later; selecting it persists in settings.
- [ ] Training settings show Reinforcement and Endless for quartets and hide or disable Accelerate with a short note.
- [ ] Stats mode tabs include Quartets; per-mode figures behave as for other modes; practiced-stack and practiced-mode selection treat the quartets bucket like any other.
- [ ] For quartets, the per-card table is replaced by a 13-row per-rank table with rank, first card, distances, current streak, average time, times missed, and reinforcement progress (`x/5` or `—`).
- [ ] The per-rank table supports rank order, reinforcement, slowest average, most missed, and lowest streak sorting.
- [ ] Stats recent misses show rank, first card, and distances for quartets, and card, position, and direction for other modes.
- [ ] All new strings live in the central strings module and are complete in `en` and `pt-BR`: mode name, localized rank names, distance and position labels, the no-direction note, the Accelerate-unavailable note, table headers, quartet miss formatting, and help text; the i18n key-parity test passes.
- [ ] No user-visible literal lives in a screen; stack names and creator names are not translated.
- [ ] The per-rank table, recent misses, menu, and settings fit at 320 px and 375 px with no horizontal scroll and ≥44×44 px tap targets.
- [ ] In-app help and `CONTEXT.md` describe Quartets, the per-rank table, and the unavailable Accelerate.
- [ ] The README feature list and roadmap are updated, with credits and the AI disclosure unchanged.
- [ ] Typecheck, tests, build, and the stack verifier pass; built-in data is untouched.
