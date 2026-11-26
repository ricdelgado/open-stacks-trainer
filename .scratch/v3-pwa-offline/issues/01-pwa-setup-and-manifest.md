# 01 — PWA setup and manifest

**What to build:** Add `vite-plugin-pwa`, generate the manifest and service worker from the real production build, and register the worker only in production.

**Blocked by:** `v3-ui-refresh/01 — Design tokens, theme engine, and Appearance setting`; `v3-ui-refresh/03 — Icon module and screen restyle`.

**Status:** ready-for-agent

- [ ] `vite-plugin-pwa` is the only new dependency, added as a devDependency at a version compatible with the repo's Vite, and the updated `package-lock.json` is committed.
- [ ] `VitePWA` is registered in `vite.config.ts` with `registerType: "prompt"`, `injectRegister: null`, and `devOptions: { enabled: false }`.
- [ ] Workbox uses `globPatterns: ["**/*.{js,css,html,woff2,svg,png,webmanifest}"]`, `cleanupOutdatedCaches: true`, `skipWaiting: false`, `clientsClaim: false`, and `navigateFallback: "index.html"`.
- [ ] The manifest sets `name: "Open Stacks Trainer"`, `short_name: "Open Stacks"`, the existing description, `start_url: "."`, `scope: "."`, `display: "standalone"`, `orientation: "portrait"`, paper `background_color` and `theme_color`, `lang: "en"`, education/utilities categories, and 192, 512, and maskable 512 icons.
- [ ] `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, and `favicon.svg` are committed from the supplied v3 pack; the artwork is not redesigned.
- [ ] `index.html` links the manifest, apple-touch icon, and SVG favicon with base-aware URLs, adds `viewport-fit=cover`, keeps the modern and legacy standalone meta tags, and keeps `color-scheme` working with the UI refresh.
- [ ] `src/main.ts` registers through `virtual:pwa-register` only when `import.meta.env.PROD`; the dev server registers no service worker and is never intercepted.
- [ ] The production build emits a manifest and service worker; the precache list contains the hashed JS and CSS, `index.html`, the woff2 font, and the icons.
- [ ] The manifest and service-worker URLs sit under `/open-stacks-trainer/`.
- [ ] No runtime network request is added; no cookie, IndexedDB, or second storage key.
- [ ] Typecheck, tests, build, and the stack verifier pass; built-in data is untouched.
