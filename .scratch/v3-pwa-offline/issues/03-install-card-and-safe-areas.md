# 03 — Install card, safe areas, and docs

**What to build:** Add the dismissible **Install as app** card with an Android install prompt and iOS instructions, respect standalone safe areas, and document install and offline use.

**Blocked by:** `01 — PWA setup and manifest`; `v3-ui-refresh/03 — Icon module and screen restyle`.

**Status:** resolved

- [x] The menu shows a dismissible **Install as app** card only when the app is not standalone and the user has not dismissed it.
- [x] Android/Chromium: `beforeinstallprompt` is captured, the mini-infobar is prevented, the event is stored, and the card button calls `prompt()`; the card hides after `appinstalled`.
- [x] iOS Safari: a static two-step Share → Add to Home Screen instruction appears only when the device is iOS, the app is not standalone, and the card was not dismissed.
- [x] The card hides in standalone mode through `matchMedia("(display-mode: standalone)")` or `navigator.standalone`.
- [x] `settings.installCardDismissed` defaults to `false`; a missing field validates; dismissal persists; the field stays inside the single `open-stacks-trainer` payload and does not bump the schema.
- [x] A pure `shouldShowInstallCard({ platform, standalone, dismissed, promptAvailable })` lives in the domain and has table-driven tests across the combinations.
- [x] Standalone mode adds `env(safe-area-inset-*)` padding so the header, controls, and footer clear the notch and home indicator.
- [x] The card and iOS instructions use the UI-refresh tokens and the `install` icon, fit at 320 px and 375 px, and cause no horizontal scroll.
- [x] All install and offline strings live in the central strings module and are complete in `en` and `pt-BR`; the i18n key-parity test passes.
- [x] `CONTEXT.md` gains or updates the Install prompt and Service worker entries, and the Settings description notes the dismissal field.
- [x] The README adds a short install/offline note with the live URL and the one-line add-to-home-screen hint; credits and AI disclosure remain unchanged.
- [x] Browser installability passes with no console errors; emulated Android and iOS install-card checks pass.
- [ ] Real-device Android and iOS install, standalone launch, and offline checks pass (human gate).
- [x] Typecheck, tests, build, and the stack verifier pass; built-in data is untouched.


## Implementation

- Added `shouldShowInstallCard` plus the install platform types to `src/domain/pwa.ts`.
- Added production install-prompt capture, iOS/Android detection, standalone detection, `appinstalled` handling, and `promptInstall()` to `src/pwa.ts`; `initPwa()` now runs before `startApp` so the prompt event is not missed.
- Added `src/ui/install-card.ts` and mounted it on the menu with the `install` icon, Android install button, iOS Share → Add to Home Screen steps, and a 44 px dismiss control.
- Persisted dismissal as `settings.installCardDismissed` (default `false`, missing validates, normalized in memory on load and restore, same single storage key).
- Added safe-area padding to the screen, editor, footer, and update-pill placement.
- Added `tests/install.test.ts`, settings/storage/backup cases for the dismissal field, and en/pt-BR strings. Updated `CONTEXT.md` and the README install note.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 251 passed (24 files; new `tests/install.test.ts`)
- `npm run build` — pass; PWA remains 15 precache entries
- `node scripts/verify-stacks.mjs` — pass
- Production preview with an iPhone user agent: the iOS card shows the two steps, fits at 375 px and 320 px, dismisses and persists across reload with no horizontal scroll.
- Production preview with an Android user agent: the Android card shows the install action, the captured prompt is invoked, and the card disappears after the choice.
- Browser installability remains clean and no console errors were observed.
- `npm audit --omit=dev` — 0 vulnerabilities.

Human approved ticket 03.
