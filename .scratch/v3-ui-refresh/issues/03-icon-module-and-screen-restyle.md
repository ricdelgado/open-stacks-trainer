# 03 — Icon module and screen restyle

**What to build:** Add one inline-SVG icon module and use the icon set to restyle the menu, training, summary, stats, stacks, import, editor, and settings actions without changing behavior.

**Blocked by:** `01 — Design tokens, theme engine, and Appearance setting`; `02 — Typography and shape language`.

**Status:** ready-for-agent

- [ ] `src/ui/icons.ts` exports `icon(name: IconName): SVGSVGElement` covering the union `train`, `stacks`, `stats`, `settings`, `reveal`, `check`, `cross`, `plus`, `import`, `export`, `edit`, `trash`, `back`, `install`, `offline`, `update`, `close`, and `chevron`.
- [ ] Every icon is inline SVG with `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"` except intentional filled marks, `stroke-width="2"`, round caps and joins, `aria-hidden="true"`, and `focusable="false"`.
- [ ] The supplied v3 pack SVG artwork is embedded in the module; no icon library dependency is added.
- [ ] Icons always sit next to a visible text label on primary actions; icon-only controls have a visible or accessible name and are never used for destructive actions.
- [ ] The menu uses the serif title, streak badge, full-width **Start training** pill with an icon, stack/mode/direction cards, and the 2×2 navigation grid with icons.
- [ ] Training, summary, stats, My Stacks, stack view, import, editor, settings, confirm dialog, and help dialog use the new surfaces, pills, and icons where the spec lists them, with layouts unchanged at 320 px and 375 px.
- [ ] Card faces keep accessible names describing rank and suit; decorative icons stay out of the accessibility tree.
- [ ] All new user-visible strings, including icon accessible names and helper text, live in the central strings module and are complete in `en` and `pt-BR`; the i18n key-parity test passes.
- [ ] Manual checks confirm keyboard reachability, visible focus, ≥44×44 px tap targets (editor cells ≥48×48 px), and no horizontal scroll at 320 px, 375 px, and desktop.
- [ ] Typecheck, tests, build, and the stack verifier pass; behavior tests pass without modification.
