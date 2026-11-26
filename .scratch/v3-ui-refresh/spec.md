# v3 UI refresh — Atoms-inspired visual language, themes, and icons

## Problem Statement

The v2 interface works but looks generic: one flat light palette, system sans-serif everywhere, no icon affordances, and every control looks the same. Users spend long sessions on these screens and want the app to feel calm, tactile, and deliberate, like a printed card table.

The visual reference is the Atoms (Atomic Habits) app: warm paper, bookish serif display type, one amber accent, generous rounded surfaces, and small chunky icons. The app also has no dark mode, which matters for night practice, and no icon cues, which makes the menu and actions slower to scan.

This is a visual slice. It must not change training, scoring, storage, navigation, or data behavior.

## Solution

Restyle the whole app with a small design-token layer and a theme engine:

- define light and dark token sets as CSS custom properties;
- add a persisted **Appearance** setting: **Light**, **Dark**, or **System** (default **System**);
- bundle **Source Serif 4** (self-hosted woff2) for headings and card ranks; keep the system sans for body text and controls;
- adopt a shape language of rounded rectangles, rounded cards, and pills — no circles in components;
- keep one amber gradient as the only accent and reserve red for miss markers;
- add a small inline-SVG icon set wired through one icon module, always paired with a text label;
- make the browser `theme-color` and `color-scheme` follow the active theme.

Every existing screen is restyled in place; flows and labels do not change.

## User Stories

1. As a user, I want a warm, paper-like interface, so that long practice sessions feel calm rather than clinical.
2. As a user, I want a dark theme, so that I can practice at night without a bright screen.
3. As a user, I want the app to follow my phone's light/dark setting by default, so that it matches the rest of my device.
4. As a user, I want to choose Light, Dark, or System explicitly, so that I control the appearance.
5. As a user, I want my appearance choice to persist, so that I do not set it every visit.
6. As a user, I want headings and card ranks in a bookish serif, so that the app feels like a card table, not a spreadsheet.
7. As a user, I want body text and controls in a clean sans, so that labels stay easy to read.
8. As a user, I want card faces to stay white with red and black suits in both themes, so that they read like real cards.
9. As a user, I want recognisable icons beside the main actions, so that the menu is faster to scan.
10. As a user, I want every icon to have a text label, so that nothing depends on guessing a symbol.
11. As a user, I want rounded cards, cells, and pills instead of circles, so that the interface has a consistent shape language.
12. As a user, I want a single amber accent used sparingly, so that the important action is obvious.
13. As a user, I want red to mean a miss and nothing else, so that the grading colors stay unambiguous.
14. As a user, I want a subtle dot-grid background, so that the screen has texture without noise.
15. As a user, I want the streak shown as a compact badge, so that it is visible without dominating the header.
16. As a user, I want clear focus states, so that I can navigate by keyboard.
17. As a user, I want comfortable tap targets on a phone, so that I do not mis-tap.
18. As a user, I want both English and Portuguese fully translated, so that no screen shows mixed languages.
19. As a user, I want the interface to respect reduced-motion, so that animations do not distract or discomfort me.
20. As a user, I want the app to keep working with no network, so that a self-hosted font does not add a request.
21. As a maintainer, I want the theme resolved by one small pure function, so that the behavior is testable.
22. As a maintainer, I want icons created in one module, so that swapping the artwork later touches one place.
23. As a maintainer, I want the restyle to change no behavior, so that the existing tests keep passing unchanged.

## Implementation Decisions

### Design tokens

Define tokens as CSS custom properties on `:root` for light and under `[data-theme="dark"]` for dark. Keep the existing semantic token names (`--bg`, `--surface`, `--surface-soft`, `--ink`, `--muted`, `--line`, `--accent`, `--danger`, `--focus`, `--radius`, `--shadow`) so the current stylesheet keeps working, and add the new ones.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FAF6EE` | `#14110D` |
| `--surface` (cards) | `#FFFFFF` | `#1F1B15` |
| `--surface-soft` | `#F1EBDF` | `#2D271E` |
| `--ink` | `#1B1813` | `#F4EEE2` |
| `--muted` | `#8B8478` | `#9C9486` |
| `--line` | `#E5DFD2` | `#2D271E` |
| `--dot` (grid) | `#EAE3D5` | `#251F17` |
| `--accent-solid` | `#F09A26` | `#F09A26` |
| `--accent-gradient` | `linear-gradient(160deg, #FFC96B, #F09A26)` | same |
| `--danger` (miss only) | `#C9403A` | `#E06B62` |
| `--focus` | `#1D4ED8` | `#8AB4FF` |

- The amber gradient is the only decorative accent: app icon, icon tiles, heatmap levels, active indicators, and the streak badge accent. It is never used as a background behind small text (white on `#F09A26` fails WCAG AA).
- Primary buttons are ink pills in light theme and warm-white pills in dark theme. **Missed** is an outlined pill. Red is reserved for the miss marker.
- Corner radii: cards `18px`; data cells (heatmap, editor) `6px`; pills `999px`; inputs `12px`; icon tiles `22%` of their size. Replace every current `border-radius: 50%` (for example toggle knobs or badges) with a rounded rectangle.
- Dots: the page background uses a `radial-gradient(var(--dot) 1.1px, transparent 1.1px)` at `18px 18px`. The 1px dots are intentional texture, not a component shape; they are the only circular motif.
- Shadows: one soft card shadow token per theme; no heavy elevation.

### Theme engine and Appearance setting

- Add `settings.appearance: "light" | "dark" | "system"`, default `"system"`.
- This is an **additive** change inside `schemaVersion: 2`; it does not bump the schema. Extend `Settings`, `DEFAULT_SETTINGS_TOGGLES`, and `isSettings` so a **missing** `appearance` validates and resolves to `"system"`. Existing payloads and v2 backups without the field load and restore unchanged; the explicit value is written on the next save.
- New pure module `src/domain/theme.ts`: `resolveTheme(appearance, systemPrefersDark): "light" | "dark"`. `system` maps to the OS preference; `light` and `dark` map to themselves.
- Apply the resolved theme as `data-theme="light|dark"` on `<html>`. Never store `"system"` in the DOM attribute.
- `index.html` declares `color-scheme: light dark` and the base CSS includes a `@media (prefers-color-scheme: dark)` fallback for the tokens, so the first paint matches a dark OS before JavaScript runs. `src/app.ts` applies the explicit choice after load.
- When `appearance === "system"`, listen to `matchMedia("(prefers-color-scheme: dark)")` changes and re-resolve. Remove the listener on teardown.
- Update `<meta name="theme-color">` to the resolved `--bg` value on every resolve. Set `color-scheme` to the resolved scheme in CSS.
- Add Settings → **Appearance** as a three-option control (Light / Dark / System) that saves immediately, like Language.
- Full theme coverage: menu, training, summary, stats, My Stacks, stack view, import, editor, settings, confirm dialog, help dialog, storage notices, and the footer.

### Typography

- Bundle Source Serif 4 semibold (600) as a latin-subset woff2 at `public/fonts/source-serif-4-latin-600.woff2`. The latin subset covers the Portuguese accented characters used in pt-BR.
- Declare one `@font-face` with `font-family: "Source Serif 4"`, `font-weight: 600`, `font-style: normal`, `font-display: swap`.
- Use Source Serif 4 for: screen titles and headings, card ranks on card faces, stack names, and the quartets distance line. Use the system sans stack for body text, buttons, inputs, labels, captions, and tables.
- No external font, CDN, or network request. No second serif.

### Shape language and components

- Cards are white/`--surface` rounded rectangles with a soft shadow.
- Primary action: a full-width pill; secondary actions: outlined or soft-filled pills.
- Selectors and toggles are pills; the toggle thumb is a rounded rectangle, not a circle.
- The streak is a small rounded-square badge with a bolt icon and the number.
- Position cells and heatmap cells are rounded squares; editor cells keep their ≥48 px size.
- Progress is shown as a thin rounded track and fill, not a circle.
- Empty states, notices, and dialogs inherit the same surfaces and radii.

### Icons

- One module `src/ui/icons.ts` exports `icon(name: IconName): SVGSVGElement`. Inline SVG only, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"` (except intentional filled marks), `stroke-width="2"`, round caps and joins, `aria-hidden="true"`, `focusable="false"`.
- Icon set (union type): `train`, `stacks`, `stats`, `settings`, `reveal`, `check`, `cross`, `plus`, `import`, `export`, `edit`, `trash`, `back`, `install`, `offline`, `update`, `close`, `chevron`.
- Icons always sit next to a visible text label on primary actions. Icon-only controls are allowed only when a visible or accessible name is present, and never for destructive actions.
- No icon library dependency.
- The finished SVG artwork is supplied in the v3 pack; the implementer embeds the paths in the module.

### Screen-level restyle (behavior frozen)

- **Menu**: serif title, streak badge, full-width primary **Start training** pill with icon, stack/mode/direction cards, 2×2 navigation grid with icons, Training settings panel, footer.
- **Training**: rounded answer card, serif front (position or card rank), quiet timer pill, mode label, insert badge, primary **Answer** pill, then **Got it** / **Missed**.
- **Summary**: serif headline, stat cards, missed list, **Train again** / **Menu**.
- **Stats**: calendar (separate spec) above stack and mode figures; per-card/per-rank tables styled with the new tokens.
- **My Stacks / View / Import / Editor**: same surfaces, pills, and icons; editor cells keep their size and behavior.
- **Settings**: hub and Language/Appearance entries.
- Keep every existing label, aria attribute, focus move, `document.title`, and keyboard shortcut.

### Accessibility and motion

- Text and control contrast meets WCAG AA in both themes. Amber is not a text background.
- Visible `:focus-visible` ring using `--focus` with a 2 px offset.
- Tap targets stay ≥44×44 px (editor cells ≥48×48 px); no horizontal scroll at 320 px, 375 px, or desktop.
- Transitions are short (≤150 ms) and disabled under `prefers-reduced-motion: reduce`.
- Card faces keep accessible names describing rank and suit.

### Localization

- Add all new strings to the central strings module and complete both `en` and `pt-BR` dictionaries: Appearance, Light, Dark, System, icon accessible names, and any helper text.
- The existing i18n key-parity test must pass; no user-visible literal lives in a screen.

## Testing Decisions

- Pure unit test for `resolveTheme`: `light` → light; `dark` → dark; `system` + true → dark; `system` + false → light.
- Storage/settings tests: `appearance` defaults to `system`; an old v2 payload without the field loads; setting it persists and round-trips; a v2 backup without the field restores.
- i18n key-parity test passes for the new keys in `en` and `pt-BR`.
- A source scan test (or a documented manual check) confirms no `border-radius: 50%` remains in `src/styles.css`.
- Manual checks in both themes at 320 px, 375 px, and desktop: no horizontal scroll, ≥44 px controls, visible focus, correct card colors, no console errors.
- Manual reduced-motion check: no non-essential transitions.
- Network check: the production build loads no remote font or icon request.
- Existing typecheck, tests, build, and stack verifier stay green; because behavior is frozen, existing tests must pass without modification.

## Out of Scope

- Any change to training logic, scoring, sessions, storage semantics, routes, or labels.
- New modes or features.
- User-selectable accent colors or fonts.
- A high-contrast or OLED-specific theme.
- Animated celebrations, confetti, or sound.
- PWA manifest, service worker, install UI, or `theme-color` static manifest values (see `v3-pwa-offline`).
- Languages beyond English and Português (Brasil).
- Reworking the editor interaction model.

## Further Notes

- This feature has no dependencies and ships first in the v3 order (UI → PWA → Quartets → Calendar).
- `v3-pwa-offline` and `v3-stats-calendar` depend on the tokens and theme engine defined here.
- The appearance setting is additive within schema v2; `v3-quartets` later bumps the schema to v3 and must preserve `appearance`.
- The Source Serif 4 woff2 and the icon SVGs are provided in the v3 pack and committed into `public/fonts/` and the icon module at implementation time.
- Update `CONTEXT.md` (Appearance, Theme, and Settings entries) and the README feature list and roadmap when this ships.
