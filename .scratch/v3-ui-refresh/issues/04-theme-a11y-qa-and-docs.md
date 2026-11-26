# 04 — Theme, accessibility, and behavior-frozen QA

**What to build:** Verify both themes, accessibility, localization, and reduced motion across the app; document the appearance setting; and prove the restyle changed no training, scoring, storage, navigation, or data behavior.

**Blocked by:** `01 — Design tokens, theme engine, and Appearance setting`; `02 — Typography and shape language`; `03 — Icon module and screen restyle`.

**Status:** ready-for-agent

- [ ] All screens, dialogs, notices, empty states, and the footer are checked in light and dark at 320 px, 375 px, and desktop with no horizontal scroll.
- [ ] Text and control contrast meets WCAG AA in both themes; amber is never a text background; red appears only for misses; card faces stay white with red and black suits.
- [ ] A keyboard-only pass reaches every control; `:focus-visible` uses the `--focus` ring with a 2 px offset; accessible names exist for cards, positions, and icon-only controls.
- [ ] A reduced-motion check shows no non-essential transitions; all transitions are ≤150 ms.
- [ ] **Appearance**, **Light**, **Dark**, **System**, and the icon labels are translated in `en` and `pt-BR`; the i18n key-parity test passes; no user-visible literal lives in a screen.
- [ ] The full existing test suite passes without modification, proving behavior is frozen.
- [ ] Typecheck, build, and `node scripts/verify-stacks.mjs` pass.
- [ ] A production-build network check shows no remote font or icon request.
- [ ] `CONTEXT.md` Appearance and Theme entries and the Settings description are updated.
- [ ] The README feature list and roadmap are updated, with credits and the AI disclosure unchanged.
- [ ] In-app help or Settings copy explains Appearance; all strings come from the central module.
- [ ] Built-in stack data, storage schema, routes, and training logic are untouched.
