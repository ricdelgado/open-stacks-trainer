# v3 PWA and offline use

## Problem Statement

Today the app is an ordinary web page. On a phone it shows the browser chrome, has no home-screen icon, and a cold start with no connection fails because the HTML, JavaScript, CSS, font, and icons come from GitHub Pages. Users want the site to behave like an installed app: add it to the home screen, launch it without browser UI, and keep training offline after the first online load.

All user data already lives in `localStorage`, so only the app shell and its assets need to be available offline. There is no server, account, or sync to design around.

## Solution

Add a web app manifest and a service worker with `vite-plugin-pwa` (the approved new development dependency):

- install to the home screen with a proper name and icons;
- launch in standalone mode with no browser interface;
- precache the production build, including the self-hosted font and icons, so cold starts work with no network;
- ship silent background updates surfaced by a polite **New version available · Reload** pill that never interrupts a session;
- show a dismissible **Install as app** card on the menu, with an Android install prompt and iOS Share → Add to Home Screen instructions.

Training, scoring, storage, and data behavior do not change.

## User Stories

1. As a user, I want to add the app to my phone's home screen, so that it is one tap away.
2. As a user, I want the home-screen icon to look like a real app icon, so that I can recognize it.
3. As a user, I want the app to open without browser chrome when launched from the home screen, so that it feels native.
4. As a user, I want the app to work with no connection after I have loaded it once, so that I can practice anywhere.
5. As a user, I want a cold start with airplane mode to work, so that offline use is not limited to the open tab.
6. As a user, I want my stats and custom stacks to survive, so that offline mode does not risk data.
7. As a user, I want an install hint on Android, so that I know the app can be installed.
8. As a user, I want plain instructions on iPhone, so that I know how to add it to the home screen.
9. As a user, I want the install hint to go away once installed, so that it does not nag me.
10. As a user, I want to dismiss the install hint, so that I can ignore it.
11. As a user, I want updates to download in the background, so that I am not blocked.
12. As a user, I want a small, non-blocking reload notice, so that I decide when to update.
13. As a user, I want updates to wait until I am not in the middle of a session, so that I never lose a prompt.
14. As a user, I want the app to keep the last working version if an update fails, so that I can still train.
15. As a user, I want the installed app to respect safe areas on notched phones, so that controls are not under the notch.
16. As a user, I want the app to stay private with no new network calls, so that installing does not change the privacy model.
17. As a maintainer, I want the service worker generated from the real hashed build, so that offline caches cannot silently go stale.
18. As a maintainer, I want the service worker only in production, so that the dev server is never intercepted.
19. As a maintainer, I want the subpath `/open-stacks-trainer/` handled by the build tool, so that scope and assets are correct on GitHub Pages.
20. As a maintainer, I want install and update visibility rules as pure predicates, so that they are testable without a browser.

## Implementation Decisions

### Dependency

- Add `vite-plugin-pwa` as a **devDependency**. It is the one approved new dependency; pin the version compatible with the repo's Vite version and commit the updated `package-lock.json`.
- Use it at build time to generate the manifest link, the service worker, and the precache manifest from the real hashed build output. Do not hand-write cache lists.

### Vite configuration

- Register via `VitePWA({...})` in `vite.config.ts` with `registerType: "prompt"`, `injectRegister: null`, and `devOptions: { enabled: false }`.
- `workbox.globPatterns: ["**/*.{js,css,html,woff2,svg,png,webmanifest}"]`, `cleanupOutdatedCaches: true`, `skipWaiting: false`, `clientsClaim: false`.
- Provide `navigateFallback: "index.html"`. Hash routing means every route resolves to the same shell; the fallback protects direct loads.
- The manifest:
  - `name`: "Open Stacks Trainer"
  - `short_name`: "Open Stacks"
  - `description`: the existing app description
  - `start_url`: `"."` and `scope: "."` (resolved against the Vite base `/open-stacks-trainer/`)
  - `display`: `"standalone"`
  - `orientation`: `"portrait"`
  - `background_color`: `"#FAF6EE"`
  - `theme_color`: `"#FAF6EE"`
  - `lang`: `"en"`
  - `categories`: `["education", "utilities"]`
  - `icons`: 192 and 512 `purpose: "any"`, plus 512 `purpose: "maskable"`
- Assets committed under `public/icons/`: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (180), and `favicon.svg`. The SVG artwork and PNGs are supplied in the v3 pack; the implementer places them and does not redesign them.

### Registration and assets

- Register manually from `src/main.ts` using `virtual:pwa-register`, only when `import.meta.env.PROD` is true.
- `index.html`:
  - add the manifest link (the plugin may inject it) and `theme-color`;
  - add `<link rel="apple-touch-icon">` and `<link rel="icon" type="image/svg+xml">`, with base-aware URLs;
  - add `viewport-fit=cover` to the viewport meta and the modern `mobile-web-app-capable` meta plus the legacy `apple-mobile-web-app-capable`;
  - keep `color-scheme` working with the UI refresh.
- In standalone mode, add `env(safe-area-inset-*)` padding so the header, controls, and footer clear the notch and home indicator.
- Do not add any runtime request. The service worker and cache are local.

### Update flow

- On `onNeedRefresh`, set a flag that the app shell renders as a non-modal pill: **New version available · Reload**.
- The pill is small, sits away from the primary controls, and never auto-reloads or blocks input.
- Tapping **Reload** calls the registration's update function (`updateSW(true)`) and reloads into the new version.
- The pill is not shown over an active training session; it appears on the menu, summary, stats, settings, or other non-training screens. If a new version arrives mid-session, it simply waits until the session ends or the user navigates to a non-training screen.
- Ignoring the pill keeps the current version; the next cold start uses whatever the browser activates. No forced skip-waiting.
- If registration fails, the app continues to work online and logs nothing user-visible.

### Install experience

- Menu shows a dismissible **Install as app** card when the app is not already installed and the user has not dismissed it.
- Android/Chromium: capture `beforeinstallprompt`, prevent the default mini-infobar, store the event, and call `prompt()` from the card's button. Hide the card after `appinstalled`.
- iOS Safari: no programmatic prompt exists. Show a static two-step instruction (Share → Add to Home Screen) when the device is iOS, the app is not standalone, and the card was not dismissed.
- Hide the card when running standalone: `matchMedia("(display-mode: standalone)")` or `navigator.standalone`.
- Persist dismissal as `settings.installCardDismissed: boolean` (default `false`; a missing field validates and resolves to `false`). This is an additive change within schema v2 and does **not** create a second `localStorage` key. The one-key rule is preserved.
- Extract the visibility decision into a pure predicate, for example `shouldShowInstallCard({ platform, standalone, dismissed, promptAvailable })` in the domain layer.

### Offline behavior

- The first successful production load installs the service worker and precaches the complete build.
- After that, cold starts with no network serve the cached shell; `localStorage` provides settings, stats, and custom stacks.
- Training, stats, My Stacks, the editor, import, backup export, and restore all work offline.
- No new background sync, push, analytics, or remote request is introduced.

### Privacy and limits

- Installing does not change the privacy model: still no account, no network after load.
- iOS needs 16.4 or newer for full home-screen web-app behavior; older iOS still opens the site in Safari.
- The manifest `theme_color` and `background_color` are static paper values; the runtime `theme-color` still follows the UI-refresh theme.

## Testing Decisions

- Pure unit tests:
  - `shouldShowInstallCard` across platform, standalone, dismissed, and prompt-available combinations;
  - a route-based predicate for update-pill visibility (hidden on `train` while a session is active, shown elsewhere).
- Build-level checks:
  - the production build emits a manifest and service worker;
  - the precache list contains the hashed JS/CSS, `index.html`, the woff2 font, and the icons;
  - the service worker and manifest URLs sit under `/open-stacks-trainer/`;
  - the dev server registers no service worker.
- Manual Android check: install prompt appears, install completes, icon is correct, launch has no browser UI, cold start offline works.
- Manual iOS check: Share → Add to Home Screen instructions appear; installed app launches standalone; cold start offline works on iOS 16.4+.
- Manual update check: serve a new build, confirm the pill appears, confirm it is absent during a session, confirm Reload swaps without losing graded answers.
- Manual offline check: load once online, switch to airplane mode, close and reopen the app, train a full session, open Stats, export a backup.
- Mobile check at 320 px and 375 px in standalone: no horizontal scroll, safe areas respected, ≥44 px controls.
- Lighthouse or the browser installability check passes; no console errors.
- Existing typecheck, tests, build, and stack verifier stay green.

## Out of Scope

- Push notifications, background sync, periodic background refresh.
- Offline/online conflict resolution or server sync (there is no server).
- App-store packaging (TWA/Capacitor) or native shells.
- Install UI on desktop beyond the browser's own control.
- Forced updates, version pinning, or an update changelog.
- Supporting iOS older than 16.4 for home-screen standalone behavior.
- Changing the app icon artwork; the pack supplies it and it is replaceable later.

## Further Notes

- Depends on `v3-ui-refresh` for the final palette, theme-engine `theme-color` handling, and the icon set.
- The app icon PNGs, apple-touch icon, and favicon are supplied in the v3 pack (`_discussion-v3/pack/icons/`).
- The one `localStorage` key rule is preserved: install dismissal is a settings field, not a new key.
- Update `CONTEXT.md` (Install prompt, Service worker, Appearance) and the README (install/offline notes, roadmap) when this ships.
