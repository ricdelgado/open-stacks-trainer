# 03 — Install card, safe areas, and docs

**What to build:** Add the dismissible **Install as app** card with an Android install prompt and iOS instructions, respect standalone safe areas, and document install and offline use.

**Blocked by:** `01 — PWA setup and manifest`; `v3-ui-refresh/03 — Icon module and screen restyle`.

**Status:** ready-for-agent

- [ ] The menu shows a dismissible **Install as app** card only when the app is not standalone and the user has not dismissed it.
- [ ] Android/Chromium: `beforeinstallprompt` is captured, the mini-infobar is prevented, the event is stored, and the card button calls `prompt()`; the card hides after `appinstalled`.
- [ ] iOS Safari: a static two-step Share → Add to Home Screen instruction appears only when the device is iOS, the app is not standalone, and the card was not dismissed.
- [ ] The card hides in standalone mode through `matchMedia("(display-mode: standalone)")` or `navigator.standalone`.
- [ ] `settings.installCardDismissed` defaults to `false`; a missing field validates; dismissal persists; the field stays inside the single `open-stacks-trainer` payload and does not bump the schema.
- [ ] A pure `shouldShowInstallCard({ platform, standalone, dismissed, promptAvailable })` lives in the domain and has table-driven tests across the combinations.
- [ ] Standalone mode adds `env(safe-area-inset-*)` padding so the header, controls, and footer clear the notch and home indicator.
- [ ] The card and iOS instructions use the UI-refresh tokens and the `install` icon, fit at 320 px and 375 px, and cause no horizontal scroll.
- [ ] All install and offline strings live in the central strings module and are complete in `en` and `pt-BR`; the i18n key-parity test passes.
- [ ] `CONTEXT.md` gains or updates the Install prompt and Service worker entries, and the Settings description notes the dismissal field.
- [ ] The README adds a short install/offline note with the live URL and the one-line add-to-home-screen hint; credits and AI disclosure remain unchanged.
- [ ] Manual Android and iOS checks pass; Lighthouse or the browser installability check passes; no console errors.
- [ ] Typecheck, tests, build, and the stack verifier pass; built-in data is untouched.
