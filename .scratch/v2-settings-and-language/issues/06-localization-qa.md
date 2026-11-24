# 06 — Localization QA and sign-off

**What to build:** A final verification that all five languages are complete, reviewed, formatted correctly, and safe to ship.

**Blocked by:** `02 — Portuguese (Brasil) translation`; `03 — Spanish translation`; `04 — Italian translation`; `05 — Japanese translation`.

**Status:** ready-for-agent

- [ ] Key-parity tests pass for `en`, `pt-BR`, `es`, `it`, and `ja`.
- [ ] No user-visible literal remains outside the dictionaries.
- [ ] A human sign-off is recorded for each translated language.
- [ ] Every language is checked on menu, training, summary, stats, My Stacks, import, editor, settings, help, dialogs, and empty/error states.
- [ ] Dates, times, numbers, decimals, and percentages are correct in each locale.
- [ ] The document title and `lang` attribute update on every language change.
- [ ] Language choice persists across reloads.
- [ ] A v2 backup preserves the language on restore.
- [ ] Delete all data resets the language to English.
- [ ] The language selector lists exactly the complete languages.
- [ ] No horizontal scrolling appears at 320 px or 375 px in any language.
- [ ] No console errors appear during the manual pass.
- [ ] Typecheck, tests, build, and the stack verifier pass.
