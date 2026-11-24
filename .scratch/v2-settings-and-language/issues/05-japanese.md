# 05 — Japanese translation

**What to build:** The complete Japanese interface, reviewed by a human and available from Settings → Language.

**Blocked by:** `01 — Localization infrastructure`.

**Status:** ready-for-agent

- [ ] The `ja` dictionary has exactly the same keys and function signatures as English.
- [ ] Every user-visible string is translated, including help, errors, confirmations, summary, stats, settings, footer, document titles, and accessible names.
- [ ] “日本語” is selectable in the language selector.
- [ ] Dates, times, numbers, decimals, and percentages use Japanese formatting.
- [ ] No English fallback text is visible in a normal flow.
- [ ] Stack names and creator names remain unchanged.
- [ ] A human reviews the translation for tone, card vocabulary, counters, and natural phrasing.
- [ ] The complete interface is checked at 320 px and desktop width.
- [ ] Key-parity tests pass.
- [ ] Typecheck, tests, build, and the stack verifier pass.
