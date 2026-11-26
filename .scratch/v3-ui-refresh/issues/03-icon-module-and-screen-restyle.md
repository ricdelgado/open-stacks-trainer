# 03 — Icons, streak badge, and skin-only screen restyle

**What to build:** Add one inline-SVG icon module, add the menu streak badge, and restyle the menu, training, summary, stats, stacks, import, editor, settings, dialogs, notices, and footer in place without moving controls or changing behavior.

**Blocked by:** `01 — Design tokens, theme engine, and Appearance setting`; `02 — Font, typography, shape language, and form controls`.

**Status:** resolved

- [x] `src/ui/icons.ts` exports `icon(name: IconName): SVGSVGElement`; `IconName` is the union `train`, `stacks`, `stats`, `settings`, `reveal`, `check`, `cross`, `plus`, `import`, `export`, `edit`, `trash`, `back`, `install`, `offline`, `update`, `close`, `chevron`, and `bolt`.
- [x] The module builds every SVG node with `document.createElementNS`; it uses no `innerHTML`, no `outerHTML`, and no icon library dependency.
- [x] Every icon uses `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"` except the filled `train` and `bolt` marks, `stroke-width="2"`, round caps and joins, `aria-hidden="true"`, and `focusable="false"`.
- [x] The supplied paths from `_discussion-v3/pack/icons/ui/` are embedded; `bolt` is drawn as one simple filled path on the same 24×24 grid because the pack has no bolt file.
- [x] Icons are wired on **Start training** (`train`), navigation **Stats** (`stats`) and **My Stacks** (`stacks`), **Settings** (`settings`), **Answer** (`reveal`), **Got it** (`check`), **Missed** (`cross`), help dialog **Close** (`close`), the training-settings summary (`chevron`), back links (`back`), and existing labeled actions on My Stacks, stack view, and import (`plus`, `import`, `export`, `edit`, `trash`).
- [x] `install`, `offline`, and `update` ship in the module but are not wired; the PWA feature owns them.
- [x] Icons on primary actions always sit beside a visible text label; icon-only controls have an accessible name; no destructive action is icon-only.
- [x] Icons do not appear in tables, form fields, editor cells, or text-only status messages.
- [x] The menu header shows a compact rounded-square streak badge (`--radius-badge`) with the bolt icon and the selected stack + selected mode `currentStreak`; the badge is hidden at 0 or when no stats exist; it uses `--surface-soft`, ink for the number, and an `--accent-solid` bolt for contrast in both themes.
- [x] The badge number is rendered with `textContent`, the bolt is decorative, and the badge has an accessible name from the strings module in `en` and `pt-BR`.
- [x] The menu keeps its current header, start panel, mode group, and 2×2 navigation order; it gains only the streak badge and the restyle, not the proposal page's card-per-setting split.
- [x] The menu applies the serif title, token surfaces, full-width primary **Start training** pill with icon, styled stack selector, direction segments, Endless and training-settings rows, mode options, single-line navigation buttons with icon + title and no hint text, and themed help/settings controls.
- [x] The Stats and My Stacks navigation buttons use the same button size and type as Settings and How to use; Settings no longer uses the smaller button type. The navigation icons inherit the text colour and turn amber only on hover/focus.
- [x] Training keeps its current header, prompt-slot positions, and button order; the answer card, serif front (card rank or position numeral), timer pill, mode label, insert badge, **Answer**, **Got it**, and **Missed** are restyled and icon-labeled.
- [x] Summary, stats, My Stacks, stack view, import, editor, and settings use the new surfaces, pills, radii, and labeled action icons; tables, form fields, and editor cells stay text-only; editor cells keep their ≥48×48 px size.
- [x] Confirm dialog, help dialog, storage notices, empty states, and the footer use the new tokens and radii; the help dialog close control keeps its accessible name.
- [x] Every existing training, grading, navigation, and stack label, aria attribute, focus move, `document.title`, and keyboard shortcut is unchanged; the Settings lead and the new Appearance strings are the only text changes.
- [x] New strings for the streak label and any icon-only accessible names are added to `src/i18n/en.ts` and `src/i18n/pt-BR.ts`; the i18n key-parity test passes and no user-visible literal lives in a screen.
- [x] No control is moved, renamed, reordered, or removed; no training, scoring, session, storage, route, or data behavior changes.
- [x] Manual checks in both themes at 320 px, 375 px, and desktop show no horizontal scroll, keyboard reachability, visible focus, ≥44×44 px targets (editor cells ≥48×48 px), and no console errors.
- [x] `npm run typecheck`, `npm test -- --run`, `npm run build`, and `node scripts/verify-stacks.mjs` pass; behavior tests pass except the additive fixture edits documented in ticket 01.

## Further notes

- Ticket 02 owns the font, shape tokens, favicon, and custom radio/toggle marks. This ticket consumes them and adds icon SVG paths and the menu badge.
- The streak badge reads existing stats only; do not add a stored field or a second streak source.
- If an existing action has no supplied matching icon, leave it text-only rather than inventing artwork beyond `bolt`.

## Implementation

- Added `src/ui/icons.ts` with the 18 supplied icons plus the new `bolt`; every SVG node is built with `document.createElementNS`, never `innerHTML`.
- Wired icons on the menu primary action and navigation, training reveal/grading, summary, stats, My Stacks, stack view, import, help close, and the training-settings chevron. Navigation icons inherit the text colour and turn amber only on hover/focus.
- Added the menu streak badge from the selected stack + mode `currentStreak`; it hides at zero and carries the localized accessible name.
- Restyled the screens in place with the new tokens, pills, radii, card faces, and miss markers; no control moved, and tables, form fields, and editor cells stayed text-only.
- Added the `menu.currentStreak` strings in both dictionaries.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 226 passed (22 files)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome: menu/nav icons render; the streak badge shows 7 and disappears at 0; training reveal and grading icons render; summary and stats show red miss markers; no horizontal scroll at 320 px; no console errors.

Approved with ticket 04.
