# 01 — Design tokens, theme engine, and Appearance setting

**What to build:** Introduce light and dark CSS token sets, a pure theme resolver, a DOM theme applier, and a persisted **Appearance** sub-page (**Light**, **Dark**, **System**) that drives `data-theme`, `color-scheme`, and `theme-color`.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] `:root` and `[data-theme="dark"]` define the tokens in the spec table, preserving `--bg`, `--surface`, `--surface-soft`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-strong`, `--danger`, `--focus`, `--radius`, and `--shadow`, and adding `--on-ink`, `--line-strong`, `--dot`, `--accent-solid`, `--accent-gradient`, `--accent-ink`, `--danger-soft`, `--card-face`, `--card-ink`, `--card-red`, and the radius aliases.
- [x] Light `--muted` is `#6F695F`, light `--danger` is `#BE3A34`, and `--accent-ink` is `#8A4F0A` light / `#FFC96B` dark; the other values match the spec table.
- [x] The base CSS has a `@media (prefers-color-scheme: dark)` fallback for a first-paint dark OS, and `[data-theme]` overrides it after JavaScript runs; the string `"system"` is never written to `data-theme`.
- [x] `src/domain/theme.ts` exports a pure `resolveTheme(appearance, systemPrefersDark): "light" | "dark"` that maps `light` → light, `dark` → dark, and `system` or a missing value → the OS preference; it imports no DOM, storage, or browser globals.
- [x] `src/ui/theme.ts` applies the resolved theme to `<html>` as `data-theme`, updates the `<meta name="theme-color">` value to the resolved `--bg`, and exposes a `matchMedia("(prefers-color-scheme: dark)")` watcher with a cleanup function.
- [x] `src/app.ts` applies the theme on startup and after an Appearance change; the system watcher is registered only when the appearance is `system` and is removed when it is replaced or the app is torn down.
- [x] `settings.appearance: "light" | "dark" | "system"` defaults to `"system"`; `Settings`, `DEFAULT_SETTINGS_TOGGLES`, and `isSettings` accept a missing value; a missing value is normalized to `system` in memory on load or restore without rewriting storage on load.
- [x] Existing v2 payloads and backups without `appearance` load and restore without an error; a later ordinary save writes `appearance: "system"`.
- [x] `index.html` declares `color-scheme: light dark` and a base `theme-color` of `#FAF6EE`; the CSS `color-scheme` follows the resolved light or dark token block.
- [x] Settings gains an **Appearance** card; `#/settings/appearance` renders a page matching the Language page with three pill choices (**Light**, **Dark**, **System**) that save immediately, expose `aria-pressed`, and show an inline storage status on failure.
- [x] The Settings hub lead is updated to mention both language and appearance; the Appearance page has its own lead and current-appearance label.
- [x] The router, route union, `document.title` mapping, and strings module cover the new Appearance route; no dead links remain.
- [x] New user-visible strings exist in both `src/i18n/en.ts` and `src/i18n/pt-BR.ts`; the i18n key-parity test passes.
- [x] Tests cover the five `resolveTheme` cases, the `system` default, a legacy v2 payload without the field, persistence round-trip, a v2 backup without the field, and the no-rewrite-on-load rule.
- [x] Only the allowed additive fixture edits are made: the expected settings object in `tests/migration.test.ts` gains `appearance: "system"`, and default-settings expectations that enumerate every setting gain it. No behavioral assertion is weakened or removed.
- [x] `appearance` stays inside the single `open-stacks-trainer` key and `schemaVersion: 2`; no second key, cookie, IndexedDB, or network request is added.
- [x] No existing training, scoring, session, data, or navigation behavior changes; this ticket only adds tokens, theme plumbing, the Settings Appearance card/page, and the strings for them.
- [x] `npm run typecheck`, `npm test -- --run`, `npm run build`, and `node scripts/verify-stacks.mjs` pass.

## Further notes

- Keep the DOM theme logic out of `src/domain/`; the domain resolver must remain pure.
- Do not implement the visual restyle, font, icons, or streak badge here. Later tickets consume these tokens.
- `index.html` also needs the favicon link, but that belongs to ticket 02.

## Implementation

- Added `Appearance` and `APPEARANCES` to `src/domain/types.ts`; `settings.appearance` is optional in the type and defaults to `system` in `DEFAULT_SETTINGS_TOGGLES`.
- `src/domain/theme.ts` owns the pure `resolveTheme`; `src/ui/theme.ts` applies `data-theme`, updates the `theme-color` meta, and owns the live `matchMedia` watcher.
- `AppStore.load` and `parseBackup` normalize a missing appearance to `system` in memory without rewriting storage on load.
- Added the `#/settings/appearance` route, title, screen, and Settings hub card; updated the Settings lead to mention language and appearance.
- `index.html` declares `color-scheme: light dark` and a light `theme-color`; the CSS defines the light/dark token sets and the first-paint OS fallback.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 226 passed (22 files; new `tests/theme.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome: system follows live OS light/dark changes; explicit Light/Dark ignores the OS; the choice persists across reload; `theme-color` follows the resolved theme; no console errors.

Approved with ticket 04.
