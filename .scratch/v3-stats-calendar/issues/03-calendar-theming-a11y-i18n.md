# 03 — Calendar theming, accessibility, localization, and QA

**What to build:** Finish the calendar's light and dark theming, accessibility, English and Portuguese strings, empty state, and end-to-end QA.

**Blocked by:** `02 — Practice calendar UI`.

**Status:** ready-for-agent

- [ ] Both themes render the grid and legend legibly; level 0 uses the track token; levels 1–4 use the same amber steps in light and dark; labels use the ink and muted tokens.
- [ ] Focus and keyboard order are logical; every non-future day is reachable and updates the details, including empty days with `—` values; future days are skipped.
- [ ] Accessible names use the selected locale; the heading and legend are announced; the inline details panel is not a tooltip or modal.
- [ ] All calendar strings live in the central strings module and are complete in `en` and `pt-BR`: heading, weekday labels, range, **Show more**, **Less**/**More**, detail labels, empty state, and accessible-name templates; the i18n key-parity test passes.
- [ ] The empty state renders the all-level-0 grid plus a localized “No practice yet…” message and is not hidden.
- [ ] No user-visible literal lives in the screen; dates, numbers, and percentages use the selected locale.
- [ ] Manual QA at 320 px, 375 px, and desktop in both themes shows no horizontal scroll, cells at least 40×44 px at 320 px, readable details, and reduced motion respected.
- [ ] `CONTEXT.md` Practice calendar entry, README feature list, and roadmap are updated, with credits and the AI disclosure unchanged.
- [ ] No schema, backup, storage, or practice-day recording change is made.
- [ ] Typecheck, tests, build, and the stack verifier pass.
