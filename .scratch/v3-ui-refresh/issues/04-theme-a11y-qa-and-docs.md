# 04 — Theme, accessibility, behavior-frozen QA, and docs

**What to build:** Verify both themes, accessibility, localization, reduced motion, and the unchanged behavior across the app; align the project docs; and prove the restyle changed no training, scoring, storage, navigation, or data behavior.

**Blocked by:** `01 — Design tokens, theme engine, and Appearance setting`; `02 — Font, typography, shape language, and form controls`; `03 — Icons, streak badge, and skin-only screen restyle`.

**Status:** resolved

- [x] Every screen, dialog, notice, empty state, status message, and the footer is checked in light and dark at 320 px, 375 px, and desktop with no horizontal scroll and no console errors.
- [x] Text and control contrast meets WCAG AA in both themes; the documented checks cover light `--muted` on paper and soft surfaces, light `--danger` on the notice surface, `--accent-ink` on paper and warm ink, and the streak badge number in both themes.
- [x] Amber is never a text background; `--accent-ink` is the only amber text; red appears only for misses, errors, and destructive actions; card faces stay white with red and black suits in both themes.
- [x] A keyboard-only pass reaches every control; `:focus-visible` uses the `--focus` ring with a 2 px offset; custom radios and toggles work; accessible names exist for cards, positions, the streak badge, and any icon-only control.
- [x] A reduced-motion check shows no non-essential transitions; all transitions are ≤150 ms.
- [x] **Appearance**, **Light**, **Dark**, **System**, the Appearance lead/current text, and the streak label are translated in `en` and `pt-BR`; the i18n key-parity test passes; no user-visible literal lives in a screen.
- [x] The full existing behavior suite passes. The only test edits are the additive fixtures documented in ticket 01; no behavioral assertion is weakened, deleted, or skipped.
- [x] A behavior-frozen review confirms routes, labels (except the Settings lead and new Appearance strings), keyboard shortcuts, scoring, sessions, storage semantics, and data access are unchanged; the only new route is `#/settings/appearance`.
- [x] `npm run typecheck`, `npm test -- --run`, `npm run build`, and `node scripts/verify-stacks.mjs` pass.
- [x] A production-build network check shows no remote font, icon, or stylesheet request; the font, favicon, and icons load from the built assets under the Pages base.
- [x] `CONTEXT.md` Appearance, Theme, and Settings entries match the shipped behavior; do not change other v3 features or delete existing terms.
- [x] The README font credit is present; the feature list, roadmap, stack credits, and AI disclosure are intact. The mobile-first bullet now says inline SVG icons instead of image assets, which matches the shipped UI.
- [x] No app icons, manifest, service worker, install card, calendar, or Quartets code ships in this feature; built-in stack data, the storage schema, and training logic are untouched.
- [x] `git status` shows only the UI-refresh implementation files, `CONTEXT.md` if its entries needed correction, `README.md` for the font credit, and the test fixture edits documented above; no unrelated refactor is included.
- [x] The milestone gate report lists the files changed, both-theme checks, the contrast results, the behavior-frozen evidence, and the exact commands run.

## Further notes

- The spec's contrast adjustments are intentional: light `--muted` is `#6F695F`, light `--danger` is `#BE3A34`, and `--accent-ink` is `#8A4F0A` light / `#FFC96B` dark.
- Do not “fix” stack data or tests to hide a mismatch. If a built-in data test fails, stop and ask.
- This is the final UI-refresh gate; PWA, Quartets, and Calendar work starts only after approval.

## Implementation

- QA pass in both themes on the menu, training, summary, stats, My Stacks, stack view, import, editor, Settings, Appearance, help dialog, storage notice, and footer.
- Documented contrast checks: light muted `#6F695F`, light danger `#BE3A34`, light amber text `#8A4F0A`; dark muted `#9C9486`, dark danger `#E06B62`, dark amber text `#FFC96B`; card faces stay white with fixed ink/red.
- Verified keyboard reveal and grading keys, visible focus, custom radios/toggles, live system-theme changes, explicit theme overrides, reduced motion, en/pt-BR strings, and local-only font/favicon requests.
- `CONTEXT.md` Appearance, Theme, and Settings entries match the shipped behavior. README gained the font credit and the mobile-first bullet now says inline SVG icons instead of image assets.
- The pre-existing `.gitignore` change adding `_discussion-v3/` was left untouched.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 226 passed (22 files)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome at 320 px, 375 px, and desktop: no horizontal scroll; theme follows the OS in System mode and stays fixed in Light/Dark; help dialog and storage notice fit; font and favicon load locally; no console errors.

## Comments

- Review corrections applied: the switch thumb and mode selector remain circular; unselected mode outlines use `--line-strong` in dark mode; navigation icons inherit the text colour and turn amber only on hover/focus; Stats and My Stacks are single-line icon + title buttons matching Settings/How to use; the Settings font size matches How to use.
- Human approved ticket 04. Committed with the UI-refresh work.
