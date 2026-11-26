# v3 UI refresh — Atoms-inspired visual language, themes, and icons

## Problem Statement

The v2 interface works but looks generic: one flat light palette, system sans-serif everywhere, no icon affordances, and every control looks the same. Users spend long sessions on these screens and want the app to feel calm, tactile, and deliberate, like a printed card table.

The visual reference is the Atoms (Atomic Habits) app: warm paper, bookish serif display type, one amber accent, generous rounded surfaces, and small chunky icons. The app also has no dark mode, which matters for night practice, and no icon cues, which makes the menu and actions slower to scan.

This is a visual slice. It must not change training, scoring, storage, navigation, or data behavior. It also must not redesign the screen layout: keep the current DOM order and control positions, and restyle them in place. The only new UI elements are the Appearance setting, a menu streak badge, and the favicon.

## Solution

Restyle the whole app with a small design-token layer and a theme engine:

- define light and dark token sets as CSS custom properties;
- add a persisted **Appearance** setting: **Light**, **Dark**, or **System** (default **System**);
- bundle **Source Serif 4** (self-hosted woff2) for headings, card ranks, position numerals, and stack names; keep the system sans for body text and controls;
- adopt a shape language of rounded rectangles, rounded cards, and pills, with circles only for the switch thumb and the mode selector;
- keep one amber gradient as the only decorative accent and reserve red for miss markers, errors, and destructive actions;
- add a small inline-SVG icon set wired through one icon module, always paired with a text label;
- make the browser `theme-color` and `color-scheme` follow the active theme;
- use the supplied amber spade as the favicon.

Every existing screen is restyled in place. Flows, control order, routes, and training/navigation behavior do not change. Existing training, grading, navigation, and stack labels stay the same; the Appearance work adds its own strings and updates the Settings lead to mention language and appearance.

## User Stories

1. As a user, I want a warm, paper-like interface, so that long practice sessions feel calm rather than clinical.
2. As a user, I want a dark theme, so that I can practice at night without a bright screen.
3. As a user, I want the app to follow my phone's light/dark setting by default, so that it matches the rest of my device.
4. As a user, I want to choose Light, Dark, or System explicitly, so that I control the appearance.
5. As a user, I want my appearance choice to persist, so that I do not set it every visit.
6. As a user, I want headings, card ranks, position numbers, and stack names in a bookish serif, so that the app feels like a card table, not a spreadsheet.
7. As a user, I want body text and controls in a clean sans, so that labels stay easy to read.
8. As a user, I want card faces to stay white with red and black suits in both themes, so that they read like real cards.
9. As a user, I want recognisable icons beside the main actions, so that the menu is faster to scan.
10. As a user, I want every icon to have a text label, so that nothing depends on guessing a symbol.
11. As a user, I want rounded cards, cells, and pills, with the switch thumb and mode selector kept circular, so that the interface is consistent and the controls read correctly.
12. As a user, I want a single amber accent used sparingly, so that the important action is obvious.
13. As a user, I want red to mean a miss, an error, or a destructive action and nothing else, so that the grading and warning colors stay unambiguous.
14. As a user, I want a subtle dot-grid background, so that the screen has texture without noise.
15. As a user, I want the current streak shown as a compact badge on the menu, so that it is visible without dominating the header.
16. As a user, I want clear focus states, so that I can navigate by keyboard.
17. As a user, I want comfortable tap targets on a phone, so that I do not mis-tap.
18. As a user, I want both English and Portuguese fully translated, so that no screen shows mixed languages.
19. As a user, I want the interface to respect reduced-motion, so that animations do not distract or discomfort me.
20. As a user, I want the app to keep working with no network, so that a self-hosted font does not add a request.
21. As a maintainer, I want the theme resolved by one small pure function, so that the behavior is testable.
22. As a maintainer, I want icons created in one module, so that swapping the artwork later touches one place.
23. As a maintainer, I want the restyle to change no behavior, so that the existing behavior tests keep passing.

## Implementation Decisions

### Scope: restyle only

- Keep the current screen structure, DOM order, and control positions. Do not adopt the proposal page's card-per-setting menu; today's start panel, mode group, and 2×2 navigation grid stay where they are.
- Allowed DOM changes: wrappers or extra spans needed to draw a custom radio or toggle, the Appearance settings page, the menu streak badge, and the favicon link.
- Default response: restyle the existing element; do not move it, rename it, or change its label.

### Design tokens

Define tokens as CSS custom properties on `:root` for light and under `[data-theme="dark"]` for dark. Keep the existing semantic token names (`--bg`, `--surface`, `--surface-soft`, `--ink`, `--muted`, `--line`, `--accent`, `--danger`, `--focus`, `--radius`, `--shadow`) and add the new ones.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FAF6EE` | `#14110D` |
| `--surface` (cards) | `#FFFFFF` | `#1F1B15` |
| `--surface-soft` | `#F1EBDF` | `#2D271E` |
| `--ink` | `#1B1813` | `#F4EEE2` |
| `--on-ink` (text on ink fills) | `#FAF6EE` | `#1B1813` |
| `--muted` | `#6F695F` | `#9C9486` |
| `--line` | `#E5DFD2` | `#2D271E` |
| `--line-strong` (interactive outlines) | `#BDB4A2` | `#6B5E4A` |
| `--dot` (grid) | `#EAE3D5` | `#251F17` |
| `--accent`, `--accent-solid` | `#F09A26` | `#F09A26` |
| `--accent-gradient` | `linear-gradient(160deg, #FFC96B, #F09A26)` | same |
| `--accent-ink` (amber text) | `#8A4F0A` | `#FFC96B` |
| `--accent-strong` (legacy alias of `--accent-ink`) | `#8A4F0A` | `#FFC96B` |
| `--danger` (miss, error, destructive) | `#BE3A34` | `#E06B62` |
| `--danger-soft` | `#FBE9E6` | `#3A1E1B` |
| `--focus` | `#1D4ED8` | `#8AB4FF` |
| `--card-face` | `#FFFFFF` | `#FFFFFF` |
| `--card-ink` | `#1B1813` | `#1B1813` |
| `--card-red` | `#C9403A` | `#C9403A` |
| `--shadow` | `0 1px 3px rgb(27 24 19 / 7%)` | `0 1px 3px rgb(0 0 0 / 40%)` |

The light `--muted` and `--danger` values differ from the proposal page on purpose: the sampled `#8B8478` measured 3.44:1 on paper and `#C9403A` measured 4.18:1 on the soft-red notice surface. The adjusted values keep normal-size text at WCAG AA. `--accent-ink` is the only amber allowed for text.

Radius, type, and shadow tokens:

- `--radius: 18px` for cards and large surfaces.
- `--radius-face: 12px` for card faces.
- `--radius-cell: 6px` for heatmap cells, position cells, editor cells, and chip cells.
- `--radius-input: 12px` for inputs, selects, and text areas.
- `--radius-pill: 999px` for buttons, selectors, and toggles.
- `--radius-badge: 10px` for the streak badge.
- Icon tiles use `border-radius: 22%` of their size.
- `--serif: "Source Serif 4", Georgia, "Times New Roman", serif`.
- `--sans: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

### Color rules

- `--accent` and `--accent-solid` are decorative only: icons, the heatmap, active dots, and the streak badge bolt. Amber is never a background behind small text.
- `--accent-ink` (and its legacy alias `--accent-strong`) is the only amber used for text. It is used for small accent labels and link hover/focus.
- The streak badge uses `--surface-soft` for its background, `--ink` for the number, and `--accent-solid` for the bolt; it does not put amber text on a dark badge.
- Links are ink with an underline; hover and focus use `--accent-ink`.
- Primary buttons are ink pills with `--on-ink` text. Secondary actions are outlined or soft-filled pills. **Missed** is a neutral outlined pill.
- `--danger` is used only for miss markers and lists, storage/import errors and notices, and destructive actions with confirmation. It is never decorative.
- Success and info statuses use `--accent-ink` or `--muted`; no green success color remains.
- Card faces always use `--card-face`, `--card-ink`, and `--card-red` in both themes. No theme token changes a card face.
- No hard-coded colour in component CSS outside the token declarations. Existing hard-coded whites, reds, greens, and border colours in `src/styles.css` move to tokens. The supplied favicon and app-icon SVG assets keep their own artwork colours.

### Theme engine and Appearance setting

- Add `settings.appearance: "light" | "dark" | "system"`, default `"system"`.
- This is an **additive** change inside `schemaVersion: 2`; it does not bump the schema. Extend `Settings`, `DEFAULT_SETTINGS_TOGGLES`, and `isSettings` so a **missing** `appearance` validates.
- Normalize a missing value to `"system"` in memory when a payload or backup loads. Do not write storage on load; the explicit value is persisted on the next ordinary save.
- Existing payloads and v2 backups without the field load and restore without prompting.
- New pure module `src/domain/theme.ts`: `resolveTheme(appearance: Appearance | undefined, systemPrefersDark: boolean): "light" | "dark"`. `system` and a missing value map to the OS preference; `light` and `dark` map to themselves.
- New DOM module `src/ui/theme.ts`: apply the resolved theme as `data-theme="light|dark"` on `<html>`, set the `<meta name="theme-color">` value to `--bg`, and expose a system-theme watcher with a cleanup function. Never store `"system"` in the DOM attribute.
- `index.html` declares `color-scheme: light dark` and a base `theme-color`; the base CSS includes a `@media (prefers-color-scheme: dark)` fallback for the tokens, so the first paint matches a dark OS before JavaScript runs. `src/app.ts` applies the explicit choice after load.
- When `appearance` is `system`, listen to `matchMedia("(prefers-color-scheme: dark)")` changes and re-resolve. Remove the listener when the app is torn down or the watcher is replaced.
- Set `color-scheme` to the resolved scheme in CSS through the token blocks.
- Add Settings → **Appearance** as a new sub-page at `#/settings/appearance`, matching the existing Language page: three pill choices (**Light**, **Dark**, **System**) that save immediately, with `aria-pressed` and an inline status message.
- Full theme coverage: menu, training, summary, stats, My Stacks, stack view, import, editor, settings, confirm dialog, help dialog, storage notices, and the footer.

### Typography and assets

- Copy the supplied `source-serif-4-latin-600.woff2` to `public/fonts/source-serif-4-latin-600.woff2`. The latin subset covers the Portuguese accented characters used in pt-BR.
- Commit the SIL Open Font License 1.1 text at `public/fonts/SourceSerif4-OFL.txt` and add a one-line Source Serif 4 credit to the README credits section. Do not change the AI disclosure.
- Declare one `@font-face` with `font-family: "Source Serif 4"`, `font-weight: 600`, `font-style: normal`, `font-display: swap`.
- Use Source Serif 4 for screen titles and headings, card ranks on card faces, large position numerals, stack names, and the quartets distance line when that screen exists.
- Use the system sans stack for body text, buttons, inputs, labels, captions, tables, the timer, progress text, and stats values.
- No external font, CDN, second serif, or network request. Do not bundle Fraunces.
- Copy the supplied `favicon.svg` to `public/favicon.svg` and link it from `index.html` with the Vite base-safe URL. Remove the current empty `data:,` icon. App icons, the manifest, and install icons remain in the PWA feature.

### Shape language and form controls

- Cards are rounded rectangles with a soft shadow. Primary actions are full-width pills where they are full-width today; secondary actions are outlined or soft-filled pills.
- Selectors and toggles are pills; the toggle thumb stays a circle.
- Keep the native radio semantics and circular look: hide the native control and draw a circular mark with a filled circular selected state. Keep the whole row keyboard-reachable with a visible focus ring.
- Use `--line-strong` for mode rows and mode marks so unselected modes remain readable in dark mode.
- The streak is a small rounded-square badge with a bolt icon and the number.
- Position cells, heatmap cells, editor cells, and card chips are rounded squares; editor cells keep their ≥48 px size.
- If progress is shown graphically, use a thin rounded track and fill. Do not add a new progress widget in this slice; the existing progress text stays.
- Empty states, notices, and dialogs inherit the same surfaces and radii.
- `border-radius: 50%` is allowed only on the switch thumb and the mode selector (outer and selected marks). The other circular motifs are the 1.1 px background dots and the suit glyphs, which come from the font.

### Icons

- One module `src/ui/icons.ts` exports `icon(name: IconName): SVGSVGElement`. Build SVG elements with `document.createElementNS`; do not use `innerHTML`.
- Inline SVG only, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"` except intentional filled marks, `stroke-width="2"`, round caps and joins, `aria-hidden="true"`, `focusable="false"`.
- Icon set (union type): `train`, `stacks`, `stats`, `settings`, `reveal`, `check`, `cross`, `plus`, `import`, `export`, `edit`, `trash`, `back`, `install`, `offline`, `update`, `close`, `chevron`, and `bolt`.
- `bolt` is new and has no supplied artwork: draw one simple filled bolt path in the same 24×24 grid.
- Use the supplied SVG paths from `_discussion-v3/pack/icons/ui/`; no icon library dependency.
- Icons always sit next to a visible text label on primary actions. Icon-only controls are allowed only when a visible or accessible name is present, and never for destructive actions.
- Wire icons on: **Start training** (`train`), the navigation grid **Stats** (`stats`) and **My Stacks** (`stacks`), **Settings** (`settings`), **Answer** (`reveal`), **Got it** (`check`), **Missed** (`cross`), help dialog **Close** (`close`), the training-settings summary (`chevron`), back links (`back`), and existing labeled actions on My Stacks, stack view, and import (`plus`, `import`, `export`, `edit`, `trash`). The PWA icons (`install`, `offline`, `update`) ship in the module but are wired by the PWA feature.
- Navigation icons inherit the current text colour and take `--accent-ink` only when the control is hovered or focused.
- Do not put icons in tables, form fields, editor cells, or status messages.

### Streak badge

- Add a compact rounded-square badge to the menu header beside the title.
- Read the current streak from the selected stack and selected mode in the existing stats payload. Do not add or change stored data.
- Hide the badge when the streak is 0 or when the stack/mode has no stats.
- The visible number uses `textContent`; the bolt icon is decorative; the badge has an accessible name from the strings module (for example, “Current streak: 12”).
- The training screen keeps its existing text streak. Do not add a second badge there.

### Screen-level restyle (behavior and layout frozen)

- **Menu**: keep the current header, start panel, mode group, and 2×2 navigation grid in the same order; apply the serif title, streak badge, token surfaces, full-width primary **Start training** pill with icon, styled stack selector, direction segments, Endless and training-settings rows, mode options, and single-line navigation buttons with icon + title and no hint text. The navigation buttons match the Settings and How to use buttons in size and type. Do not split the controls into the proposal page's separate Stack/Mode/Direction cards.
- **Training**: keep the current header, prompt slots, and button order; apply the rounded answer card, serif front (card rank or position numeral), quiet timer pill, mode label, insert badge, primary **Answer** pill, then **Got it** / **Missed**.
- **Summary**: serif headline, stat cards, missed list, **Train again** / **Menu**.
- **Stats**: calendar stays a separate feature above the stack and mode figures; style the existing stack figures, collapsible sections, and per-card tables with the new tokens.
- **My Stacks / View / Import / Editor**: same surfaces, pills, and icons on labeled actions; editor cells keep their size, behaviour, and text-only contents.
- **Settings**: hub and Language entry gain the new Appearance entry; the hub uses the new surfaces and icons.
- Keep every existing label except the Settings lead, plus every existing aria attribute, focus move, `document.title`, and keyboard shortcut.
- Add only the Appearance route/page, the streak badge, and the favicon link. No other new screens or controls.

### Accessibility and motion

- Text and control contrast meets WCAG AA in both themes. Amber is not a text background; `--accent-ink` is used where amber text is needed.
- Visible `:focus-visible` ring using `--focus` with a 2 px offset.
- Custom radios and toggles stay keyboard-reachable and keep the label's ≥44×44 px target.
- Tap targets stay ≥44×44 px (editor cells ≥48×48 px); no horizontal scroll at 320 px, 375 px, or desktop.
- Transitions are short (≤150 ms) and disabled under `prefers-reduced-motion: reduce`.
- Card faces keep accessible names describing rank and suit.
- The streak badge has an accessible name; decorative icons stay out of the accessibility tree.

### Localization

- Add all new strings to `src/i18n/en.ts` and `src/i18n/pt-BR.ts`: Appearance, Light, Dark, System, the Appearance page title/lead, the current-appearance label, the streak badge accessible name, and any icon-only accessible names.
- The existing i18n key-parity test must pass; no user-visible literal lives in a screen.
- Stack names and creator names are not translated.

## Testing Decisions

- Pure unit test for `resolveTheme`: `light` → light; `dark` → dark; `system` + true → dark; `system` + false → light; missing + true/false → dark/light.
- Storage/settings tests: `appearance` defaults to `system`; an old v2 payload without the field loads; setting it persists and round-trips; a v2 backup without the field restores; the missing value is normalized in memory but storage is not rewritten on load.
- i18n key-parity test passes for the new keys in `en` and `pt-BR`.
- A source scan test confirms `border-radius: 50%` appears only on the switch thumb and mode selector.
- Existing behavior tests pass. Adding a setting changes exact-equality fixtures, so the only allowed test edits are additive:
  - the expected settings object in `tests/migration.test.ts` gains `appearance: "system"`;
  - default-settings expectations that enumerate every setting gain `appearance: "system"`.
  - Do not weaken or delete any behavioral assertion.
- Manual checks in both themes at 320 px, 375 px, and desktop: no horizontal scroll, ≥44 px controls (editor cells ≥48 px), visible focus, correct card colors, no console errors.
- Manual reduced-motion check: no non-essential transitions.
- Network check: the production build loads no remote font or icon request.
- Existing typecheck, tests, build, and stack verifier stay green; built-in data is untouched.

## Out of Scope

- Any change to training logic, scoring, sessions, storage semantics, routes, labels, or keyboard shortcuts beyond adding Appearance.
- A layout redesign, including the proposal page's card-per-setting menu.
- Any change to data, stack orders, or quartets.
- A new progress bar or any other new widget.
- PWA manifest, service worker, install card, app icons, or offline behaviour (see `v3-pwa-offline`). The UI feature only ships the favicon and the icons the PWA will later reuse.
- The practice calendar (see `v3-stats-calendar`) and Quartets screens (see `v3-quartets`).
- User-selectable accent colors or fonts; a second serif such as Fraunces.
- A high-contrast or OLED-specific theme.
- Animated celebrations, confetti, or sound.
- Languages beyond English and Português (Brasil).
- Reworking the editor interaction model.

## Further Notes

- This feature has no dependencies and ships first in the v3 order (UI → PWA → Quartets → Calendar).
- `v3-pwa-offline` and `v3-stats-calendar` depend on the tokens and theme engine defined here.
- The appearance setting is additive within schema v2; `v3-quartets` later bumps the schema to v3 and must preserve `appearance`.
- The Source Serif 4 woff2, the favicon, and the icon SVGs are supplied in `_discussion-v3/pack/`, which is gitignored; copy the needed assets into `public/` and embed the icon paths in the module at implementation time. Add the SIL OFL 1.1 text for the font from the licence itself; the pack does not include a licence file.
- The proposal pages are `_discussion-v3/open-stacks-trainer/v3/style-proposal.html` and `proposal-v2.html`. They are decision aids, not shipping code.
- `CONTEXT.md` already defines Appearance and Theme; verify those entries and the Settings description still match the shipped behaviour. Do not change other v3 features.
- Update the README font credit when the font ships; keep the feature list, roadmap, credits, and AI disclosure intact.
