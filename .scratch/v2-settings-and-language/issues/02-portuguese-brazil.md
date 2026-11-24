# 02 — Portuguese (Brasil) translation

**What to build:** The complete Brazilian Portuguese interface, reviewed by a human and available from Settings → Language.

**Blocked by:** `01 — Localization infrastructure`.

**Status:** ready-for-human

- [x] The `pt-BR` dictionary has exactly the same keys and function signatures as English.
- [x] Every user-visible string is translated, including help, errors, confirmations, summary, stats, settings, footer, document titles, and accessible names.
- [x] Language names remain native in the selector; “Português (Brasil)” is selectable.
- [x] Dates, times, numbers, decimals, and percentages use Brazilian Portuguese formatting.
- [x] No English fallback text is visible in a normal flow.
- [x] Stack names and creator names remain unchanged.
- [ ] A human reviews the translation for tone, card vocabulary, and natural phrasing.
- [ ] The complete interface is checked at 320 px and desktop width.
- [x] Key-parity tests pass.
- [x] Typecheck, tests, build, and the stack verifier pass.


## Implementation

- `src/i18n/pt-BR.ts` is a complete dictionary `satisfies Strings`, including the
  card rank and suit names, all help, error, confirmation, settings, stats, editor,
  import, summary, storage, and accessible-name strings.
- Portuguese uses decimal commas for averages and threshold labels, localized
  practice-day dates (for example `24 de nov. de 2026`), and localized timestamps.
- The language selector already listed Português (Brasil) through the registry.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 212 passed (20 files)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome: menu, training, stats, language settings, and help render in
  Portuguese; `lang=pt-BR`; average time shows `1,3s`; practice day shows
  `24 de nov. de 2026`; 320 px has no horizontal scroll.

Awaiting human translation review and the remaining phone/desktop pass before commit.
