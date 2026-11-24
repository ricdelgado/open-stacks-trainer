# v2 settings and language

## Problem Statement

The app is English-only. It also has no settings home for the new training toggles. Users who speak Portuguese, Spanish, Italian, or Japanese cannot use the interface in their own language, and there is no persisted place to choose a language or manage training preferences.

Language touches every screen, every message, accessible names, document titles, dates, and numbers. It must come after the training and stats behavior is stable, or every new feature will require translation rework.

## Solution

Introduce a Settings area with a small hub and sub-pages. The first training toggle ticket creates the hub and the **Training** sub-page; this feature area adds the **Language** sub-page and the localization system.

Support five languages: English, Português (Brasil), Español, Italiano, and 日本語. English is the default and the source/fallback. The chosen language is saved, applied immediately, and used for locale-aware formatting.

## User Stories

1. As a user, I want a Settings button in the menu header, so that preferences are easy to find.
2. As a user, I want a Settings hub with Training and Language sub-pages, so that each page stays short.
3. As a user, I want to return from a sub-page to Settings, so that navigation is predictable.
4. As a user, I want to choose English, Português (Brasil), Español, Italiano, or 日本語, so that I can use the app in my language.
5. As a user, I want language names shown in their own language, so that I can recognize mine.
6. As a user, I want the language change to apply immediately, so that I do not need to reload.
7. As a user, I want my language choice saved, so that it survives reloads and browser restarts.
8. As a user, I want every visible string translated, including help, errors, summaries, stats, settings, and buttons, so that the interface is consistent.
9. As a user, I want document titles and screen-reader names translated, so that accessibility is not English-only.
10. As a user, I want dates, times, and numbers formatted for my language, so that they look natural.
11. As a user, I want card notation and suit glyphs unchanged, so that card codes remain language-neutral.
12. As a user, I want stack names and creator names unchanged, so that proper nouns are not altered.
13. As a user, I want missing translations to fall back to English rather than showing blank text, so that the app remains usable.
14. As a user, I want my language preserved through backup and restore, so that restoring does not silently change it.
15. As a user, I want Delete all data to reset the language to English, so that the app returns to its clean default.
16. As a screen-reader user, I want the page `lang` attribute updated, so that the correct voice is used.
17. As a reviewer, I want a key-parity check, so that no language silently misses a string.
18. As a reviewer, I want AI translations marked for human review, so that awkward or incorrect translations do not ship.
19. As a maintainer, I want one typed strings module, so that adding a new string forces every language to account for it.
20. As a maintainer, I want the English UI to remain visually unchanged after the refactor, so that localization does not alter the design.

## Implementation Decisions

### Settings structure

- A compact Settings button sits in the menu header.
- The Settings hub has two sub-pages: **Training** and **Language**.
- The Training sub-page is introduced with the first training-toggle ticket and contains Reinforcement, Accelerate + threshold, and Endless.
- The Language sub-page is added by this feature area.
- Each sub-page has a Back to Settings control. Settings has Back to menu.
- All settings save immediately and persist in the single storage payload.

### Languages and storage

- Language codes: `en`, `pt-BR`, `es`, `it`, `ja`.
- Default is English.
- The language is stored in `settings.language` inside `schemaVersion: 2`.
- Changing the language re-renders the current screen immediately without a reload.
- The language is included in backup/restore. Delete all data resets it to `en`.
- Do not detect the browser language automatically. English remains the first-run default.
- Show the language names natively: English, Português (Brasil), Español, Italiano, 日本語.

### Strings and formatting

- Replace the single English strings object with typed locale dictionaries that share one key shape.
- English is the source of truth and the fallback for any missing key.
- No user-visible literal may remain in screens, components, or DOM helpers.
- Cover labels, buttons, headings, help, validation errors, storage warnings, status messages, confirmations, empty states, summary, stats, settings, footer, AI disclosure sentence, document titles, and accessible names.
- Card codes and suit glyphs stay language-neutral. Stack names and creator names are proper nouns and stay unchanged.
- Use the selected locale for dates, times, numbers, decimals, and percentages. Average time uses the locale decimal separator.
- Update the document’s `lang` attribute on language change.
- Keep the five languages LTR; no RTL support is needed.
- Keep localized plural handling; do not concatenate English fragments.
- The English UI must look and behave the same after the refactor.

### Translation quality

- AI translations are allowed but must be reviewed by a human before release.
- Each language ticket includes a full pass over the interface at 320 px and desktop, including help, errors, summary, stats, settings, and accessible names.
- A key-parity test must fail if any locale misses or adds a key relative to English.
- Fall back to English at runtime for safety, but do not rely on fallback to hide an incomplete translation.

## Testing Decisions

- Add a pure dictionary test: every locale has exactly the English key set and the same function-returning keys.
- Add a no-hardcoded-strings check where practical; at minimum review screens for literals.
- Test language persistence: save, reload, restore a backup, delete all data.
- Test immediate switching: the current screen changes without a page reload.
- Test locale formatting with fixed dates, times, and decimals.
- Test `lang` and document titles after switching.
- Manual human review is required for each language; automated tests cannot judge translation quality.
- Reuse the fake-storage and injected-clock seams. No browser end-to-end suite is required.

## Out of Scope

- Translating README, PRD, specs, or other repository documentation.
- Browser-language auto-detection.
- Additional languages beyond the four requested.
- RTL layouts.
- A user-facing translation editor.
- Voice-over or audio.
- Translating stack names or creator names.

## Further Notes

- This feature area is last. It depends on all training and stats UI strings being stable.
- The Settings hub and Training sub-page are delivered earlier with the first training toggle; this area adds the Language sub-page and the localization infrastructure.
- Add an ADR for the typed locale-dictionary architecture and the English-fallback policy.
- Update `CONTEXT.md` with the language and locale vocabulary during implementation.
