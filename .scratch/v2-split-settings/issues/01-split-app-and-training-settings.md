# 01 — Split app settings from training settings

**What to build:** The Settings area keeps only whole-app preferences, while the
training toggles move to a collapsible Training settings panel on the main menu.

**Blocked by:** `v2-training-modes-and-controls/05 — Endless`;
`v2-settings-and-language/01 — Localization infrastructure`.

**Status:** ready-for-human

## Settings page

- [x] The Settings button moves to the bottom of the menu, below How to use this app and above the footer.
- [x] The Settings page holds only whole-app settings: language now, with room for future dark mode and appearance entries.
- [x] The Settings hub no longer lists Training.
- [x] The old Settings → Training route is removed or redirects safely to Settings; no dead links remain.
- [x] Language selection keeps working and still persists after the split.

## Training settings on the menu

- [x] A collapsible Training settings item sits under the direction selector inside the main menu training box.
- [x] The item is collapsed by default and has a visible label, `aria-expanded`, and a keyboard-reachable toggle.
- [x] When expanded, it shows the global Reinforcement toggle.
- [x] When expanded, it shows the global Accelerate toggle and its four threshold choices, with the same show/hide rule as today.
- [x] When expanded, it shows the global Endless toggle.
- [x] Every toggle saves immediately and persists exactly as it does today.
- [x] The Reinforcement empty/count hint moves with the toggle.
- [x] The menu still fits 320 px and 375 px with no horizontal scrolling.

## Cleanup and tests

- [x] The Training sub-page component and its route are deleted or reduced to a safe redirect.
- [x] All new and moved text stays in the central strings module.
- [x] Tests cover route removal or redirect, settings persistence after the move, and the absence of a Training entry in the Settings hub.
- [x] Typecheck, tests, build, and the stack verifier pass.

## Further notes

- This ticket changes navigation only; it must not change what each toggle does.
- Do this before the translation tickets and localization QA so translators review
  the final menu and Settings structure, or re-run that review afterwards.
- Dark mode and appearance are not part of this ticket; those need their own specs.
- Rename `settingsPage` strings and the settings screen as needed, but keep one
  strings module and the existing storage key.


## Implementation

- `src/screens/settings.ts` is now the whole-app hub plus Language; the Training
  entry, Training sub-page, and `settings-training` route are gone.
- `#/settings/training` parses to Settings and the URL is rewritten to `#/settings`.
- `src/ui/training-settings.ts` wraps the existing Reinforcement, Accelerate
  threshold, and Endless controls. The menu renders it inside a native `<details>`
  under Direction inside the training box, collapsed by default, with
  `aria-expanded` kept in sync.
- The menu Settings link moved below How to use this app, above the footer.
- Router tests now assert that the old Training URL maps to Settings and that the
  Language URL still works.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 212 passed (20 files)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome: menu order is How to use → Settings; Training settings sits
  after Direction; the hub lists only Language; the old URL redirects; toggles
  still persist; 320 px has no horizontal scroll.

Awaiting human review before commit.
