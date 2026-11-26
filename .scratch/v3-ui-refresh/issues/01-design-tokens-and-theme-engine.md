# 01 — Design tokens, theme engine, and Appearance setting

**What to build:** Introduce light and dark CSS token sets, a pure theme resolver, and a persisted **Appearance** setting (**Light**, **Dark**, **System**) that drives `data-theme`, `color-scheme`, and `theme-color`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Light and dark token sets exist as CSS custom properties on `:root` and `[data-theme="dark"]`, keeping the existing semantic names and adding the dot, accent, danger, focus, radius, and shadow tokens defined in the spec.
- [ ] `src/domain/theme.ts` exports a pure `resolveTheme(appearance, systemPrefersDark): "light" | "dark"` that maps `light` → light, `dark` → dark, and `system` → the OS preference; it imports no DOM or storage.
- [ ] `settings.appearance: "light" | "dark" | "system"` defaults to `"system"`; a missing field validates; Settings → **Appearance** offers **Light** / **Dark** / **System** and saves immediately like Language.
- [ ] The resolved theme is applied as `data-theme="light"` or `data-theme="dark"` on `<html>`; the string `"system"` is never written to the attribute.
- [ ] When `appearance` is `system`, a `matchMedia("(prefers-color-scheme: dark)")` listener re-resolves the theme and is removed on teardown.
- [ ] `color-scheme` and the `<meta name="theme-color">` value follow the resolved theme; `index.html` declares `color-scheme: light dark` and the base CSS includes a first-paint dark fallback.
- [ ] Every screen, dialog, storage notice, help dialog, and the footer use the token set; no screen-specific hard-coded colour drives surfaces, text, or focus.
- [ ] Pure tests cover all four `resolveTheme` cases; storage tests cover the default, an old v2 payload without the field, persistence round-trip, and a v2 backup without the field.
- [ ] `appearance` stays additive inside `schemaVersion: 2` and inside the single `open-stacks-trainer` key; no second key, cookie, or IndexedDB is added.
- [ ] No font, icon font, or other runtime network request is added.
- [ ] Typecheck, tests, build, and `node scripts/verify-stacks.mjs` pass; existing behavior tests pass without modification.
