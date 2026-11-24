# ADR-0009 — Typed locale dictionaries with English fallback

- **Status:** accepted
- **Date:** 2026-11-24

## Context

The v1 app had one English strings object imported everywhere. v2 adds a persisted
language setting and four target languages. A missing or mistyped translation must
not produce blank UI, and the English interface must stay visually unchanged after
the refactor.

## Decision

- Keep one source dictionary, `src/i18n/en.ts`, and derive `Strings` from its shape.
  Every other dictionary uses `satisfies Strings`, so a missing key, an extra key,
  or a wrong function signature fails typecheck.
- Store dictionaries in one registry. `availableLanguages()` lists only registered,
  complete dictionaries, using native language names.
- Keep the exported `strings` binding live. `setLanguage` reassigns it and updates
  `document.documentElement.lang`; screens re-render without a page reload.
- English is the runtime fallback when the stored language is unknown. A key-parity
  test also compares the full shape of every dictionary against English, so fallback
  does not hide an incomplete translation.
- Store the choice in `settings.language` inside the existing payload. Default is
  `en`. Backup and restore keep it; Delete all data resets it to `en`.
- Format dates, times, numbers, and decimals with `getLocale()`. Card codes, suit
  glyphs, stack names, and creator names stay unchanged.
- Add a sub-page at `#/settings/language` with Back to Settings. Selecting a language
  saves immediately and refreshes the current screen.

## Consequences

- Adding a string forces every complete language to account for it.
- A language becomes selectable only when its dictionary is registered.
- Translators can work one dictionary at a time without touching screens.
- English remains the source of truth and the fallback for unknown stored values.
- The cost is a larger bundle as translations land, which is acceptable for a static
  offline-friendly app.

## References

- `src/i18n/`
- `tests/i18n.test.ts`
- `.scratch/v2-settings-and-language/spec.md`
