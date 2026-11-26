# 01 — PWA setup and manifest

**What to build:** Add `vite-plugin-pwa`, generate the manifest and service worker from the real production build, and register the worker only in production.

**Blocked by:** `v3-ui-refresh/01 — Design tokens, theme engine, and Appearance setting`; `v3-ui-refresh/03 — Icon module and screen restyle`.

**Status:** resolved

- [x] `vite-plugin-pwa` is the only new dependency, added as a devDependency at a version compatible with the repo's Vite, and the updated `package-lock.json` is committed.
- [x] `VitePWA` is registered in `vite.config.ts` with `registerType: "prompt"`, `injectRegister: null`, and `devOptions: { enabled: false }`.
- [x] Workbox uses `globPatterns: ["**/*.{js,css,html,woff2,svg,png,webmanifest}"]`, `cleanupOutdatedCaches: true`, `skipWaiting: false`, `clientsClaim: false`, and `navigateFallback: "index.html"`.
- [x] The manifest sets `name: "Open Stacks Trainer"`, `short_name: "Open Stacks"`, the existing description, `start_url: "."`, `scope: "."`, `display: "standalone"`, `orientation: "portrait"`, paper `background_color` and `theme_color`, `lang: "en"`, education/utilities categories, and 192, 512, and maskable 512 icons.
- [x] `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, and `favicon.svg` are committed from the supplied v3 pack; the artwork is not redesigned.
- [x] `index.html` links the manifest, apple-touch icon, and SVG favicon with base-aware URLs, adds `viewport-fit=cover`, keeps the modern and legacy standalone meta tags, and keeps `color-scheme` working with the UI refresh.
- [x] `src/main.ts` registers through `virtual:pwa-register` only when `import.meta.env.PROD`; the dev server registers no service worker and is never intercepted.
- [x] The production build emits a manifest and service worker; the precache list contains the hashed JS and CSS, `index.html`, the woff2 font, and the icons.
- [x] The manifest and service-worker URLs sit under `/open-stacks-trainer/`.
- [x] No runtime network request is added; no cookie, IndexedDB, or second storage key.
- [x] Typecheck, tests, build, and the stack verifier pass; built-in data is untouched.


## Implementation

- Added `vite-plugin-pwa@2.0.0` as a devDependency only; `package-lock.json` updated.
- Configured `VitePWA` with `registerType: "prompt"`, `injectRegister: null`, `devOptions.enabled: false`, the paper manifest, and the specified Workbox options.
- Copied the supplied icons to `public/icons/` and moved the favicon there; `index.html` now declares `viewport-fit=cover`, both standalone meta tags, the base-relative SVG favicon, and the Apple touch icon. The plugin injects the manifest link in the production build.
- Added `src/vite-env.d.ts` for the virtual module types and register the worker from `src/main.ts` only when `import.meta.env.PROD`.
- The build emits `manifest.webmanifest` and `sw.js`; the precache contains the hashed JS/CSS, `index.html`, the woff2 font, the manifest, and every icon.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 226 passed (22 files)
- `npm run build` — pass; PWA generated 15 precache entries
- `node scripts/verify-stacks.mjs` — pass
- Production preview under `/open-stacks-trainer/`: manifest and service-worker scope are correct; Chrome installability reports no errors; the precache paths include the shell, assets, font, manifest, and icons.
- Dev server: no manifest link, no service-worker registration, no `sw.js` request.
- `npm audit --omit=dev` — 0 vulnerabilities; the dev-only build tooling reports 4 moderate `glob`/`minimatch` advisories, with no non-breaking fix available.

Human approved ticket 01.
