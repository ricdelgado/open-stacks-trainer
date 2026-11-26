# 02 — Offline precache and update flow

**What to build:** Make cold starts work offline after one online load, and surface a polite, non-blocking **New version available · Reload** pill that never appears during an active training session.

**Blocked by:** `01 — PWA setup and manifest`.

**Status:** resolved

- [x] The first successful production load installs the worker and precaches the complete build.
- [x] A cold start with no network serves the cached shell; training, stats, My Stacks, the editor, import, backup export, and restore work offline.
- [x] An offline reload keeps all graded answers, settings, stats, and custom stacks because persistence stays in `localStorage`.
- [x] `onNeedRefresh` sets an update flag; the shell renders a small, non-modal **New version available · Reload** pill away from the primary controls.
- [x] The pill never auto-reloads, never blocks input, and never appears on the training screen while a session is active; it waits for a non-training screen or the end of the session.
- [x] Tapping **Reload** calls `updateSW(true)` and reloads into the new version; ignoring the pill keeps the current version with no forced skip-waiting.
- [x] A pure route-based predicate decides update-pill visibility and has a unit test for an active training session versus other routes.
- [x] If registration fails, the app keeps working online with no user-visible error and no console noise.
- [x] Manual update check: a new build raises the pill on menu, summary, stats, and settings; the pill is absent mid-session; Reload swaps builds without losing graded answers.
- [x] Manual offline check: load once online, switch to airplane mode, close and reopen the app, train a full session, open Stats, and export a backup.
- [x] Typecheck, tests, build, and the stack verifier pass; the dev server registers no service worker.


## Implementation

- Added `src/domain/pwa.ts` with the pure `shouldShowUpdatePill(routeName, sessionActive)` predicate.
- Added `src/pwa.ts` to own the production registration, the `onNeedRefresh` flag, the update subscription, and `updateSW(true)`; `src/main.ts` calls `initPwa()`.
- Added a fixed, non-modal `pwa-update-pill` in the app shell. It reuses the `update` icon and the new `pwa.updateReload` string.
- Update notifications update only the pill host, never re-render the training screen. The pill hides on `#/train` while a session is active, appears again after the session ends, and reserves bottom padding while visible.
- Added `tests/pwa.test.ts` covering the training and non-training routes.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 239 passed (23 files; new `tests/pwa.test.ts`)
- `npm run build` — pass; manifest, service worker, and 15 precache entries
- `node scripts/verify-stacks.mjs` — pass
- Offline preview: online load and reload, then network offline and reload; the menu, training, grading, and Stats all work, and a graded answer survives the offline reload.
- Update preview: a new build raises the pill on Stats; Reload swaps builds without losing stored answers. A new build raised mid-session leaves the pill hidden on Training; it appears after Quit to the menu.
- Registration failure: a fresh profile with `sw.js`/`workbox-*` blocked still renders the app with no console errors.
- Pill fits at 320 px and 375 px with no horizontal scroll; it is fixed, non-blocking, and reserves page padding while shown.
- Dev remains unregistered because `initPwa` exits before registration outside production.

Human approved ticket 02.
