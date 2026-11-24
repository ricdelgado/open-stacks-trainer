# 01 — Localization infrastructure

**What to build:** A typed, multi-language strings system with a Settings → Language page, persisted language choice, locale-aware formatting, and English as the source/fallback. English remains the only complete language until the translation tickets land.

**Blocked by:** `v2-training-modes-and-controls/06 — Training docs and help refresh`; `v2-per-card-stats/03 — Per-card table and ranking`.

**Status:** ready-for-human

- [x] The central strings module becomes typed locale dictionaries with one shared key shape.
- [x] English is the source dictionary and the runtime fallback.
- [x] No user-visible literal remains in screens, components, dialogs, or DOM helpers.
- [x] Document titles, accessible names, validation errors, storage warnings, confirmations, help, summary, stats, settings, and the footer use dictionary keys.
- [x] `settings.language` is added with default `en`; supported values are `en`, `pt-BR`, `es`, `it`, `ja`.
- [x] The Settings hub gains a Language entry and a Language sub-page with Back to Settings.
- [x] The Language page lists only languages that have a complete dictionary; initially that is English.
- [x] Changing the language applies immediately without a reload and persists.
- [x] The document `lang` attribute updates with the language.
- [x] Dates, times, numbers, decimals, and percentages use the selected locale.
- [x] Card codes and suit glyphs remain language-neutral; stack and creator names stay unchanged.
- [x] A key-parity test fails if a locale has a missing or extra key relative to English.
- [x] An ADR records the typed-dictionary architecture and the English-fallback policy.
- [x] `CONTEXT.md` gains language and locale vocabulary.
- [x] The English UI is visually unchanged after the refactor.
- [x] Typecheck, tests, build, and the stack verifier pass.


## Implementation

- `src/i18n/en.ts` is the source dictionary. `src/i18n/index.ts` owns the registry,
  the live `strings` binding, `setLanguage`, `getLocale`, native language names,
  and `availableLanguages`.
- `src/strings.ts` re-exports the live binding, so existing screen imports switched
  language without a mechanical refactor.
- `src/app.ts` calls `setLanguage(state.settings.language)` at the start of every
  render. The language page saves immediately, refreshes without reload, and updates
  `document.documentElement.lang` and `document.title`.
- Added `#/settings/language`, the Settings hub Language entry, and the language
  list. Only registered dictionaries appear; English plus Portuguese are registered.
- Date, time, practice-day, and decimal formatting use `getLocale()`. Card codes,
  suit glyphs, stack names, and creator names are unchanged.
- `tests/i18n.test.ts` compares the full dictionary shape, checks live switching,
  fallback, native names, `lang`, and decimal formatting.
- `docs/adr/0009-typed-locale-dictionaries.md` records the architecture; `CONTEXT.md`
  defines Language, locale dictionary, and locale formatting.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 212 passed (20 files; new `tests/i18n.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome: Settings → Language lists English and Português (Brasil), the
  switch applies immediately, `lang` and title update, and the choice persists.

Awaiting human review before commit.
