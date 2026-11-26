# 02 — Typography and shape language

**What to build:** Self-host Source Serif 4 for display text, keep the system sans for body and controls, and apply the rounded-rectangle and pill shape language across every screen.

**Blocked by:** `01 — Design tokens, theme engine, and Appearance setting`.

**Status:** ready-for-agent

- [ ] Source Serif 4 semibold latin woff2 is committed at `public/fonts/source-serif-4-latin-600.woff2` and declared with one `@font-face` (`font-weight: 600`, `font-style: normal`, `font-display: swap`).
- [ ] The latin subset renders the Portuguese accented characters used in pt-BR.
- [ ] Source Serif 4 is used only for screen titles and headings, card ranks, stack names, and the quartets distance line; body text, buttons, inputs, labels, captions, and tables use the system sans stack.
- [ ] Cards are rounded rectangles with a soft shadow; primary actions are full-width pills; secondary actions are outlined or soft-filled pills; selectors and toggles are pills with rounded-rectangle thumbs.
- [ ] Corner radii follow the tokens: cards `18px`, data cells `6px`, pills `999px`, inputs `12px`, icon tiles `22%` of their size.
- [ ] Every `border-radius: 50%` is removed from `src/styles.css`; the only circular motif is the 1.1 px background dot grid.
- [ ] The amber gradient is the only decorative accent and is never used behind small text; red is reserved for the miss marker; **Missed** is an outlined pill.
- [ ] The streak is a rounded-square badge; position and heatmap cells are rounded squares; progress is a thin rounded track and fill; editor cells keep their ≥48×48 px size.
- [ ] Every existing label, aria attribute, focus move, `document.title`, and keyboard shortcut is unchanged.
- [ ] A source scan or documented check confirms no `border-radius: 50%` remains in `src/styles.css`.
- [ ] Manual checks at 320 px, 375 px, and desktop in both themes show no horizontal scroll, ≥44×44 px tap targets (editor cells ≥48×48 px), visible focus, correct red and black card colours, and no console errors.
- [ ] Transitions are ≤150 ms and disabled under `prefers-reduced-motion: reduce`.
- [ ] No external font, CDN, or runtime network request is added; the production build loads the font locally.
- [ ] Typecheck, tests, build, and the stack verifier pass; behavior tests pass without modification.
