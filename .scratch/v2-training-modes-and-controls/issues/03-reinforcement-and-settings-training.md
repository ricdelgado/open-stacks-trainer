# 03 — Reinforcement and Settings Training

**What to build:** A global Reinforcement toggle makes recently missed cards appear more often, and the app gains the Settings hub with a Training sub-page.

**Blocked by:** `v2-per-card-stats/01 — Storage schema v2 and mode-split stats`; `02 — Card +3 mode`.

**Status:** resolved

- [x] A compact Settings button appears in the menu header.
- [x] How to use this app moves to the bottom of the menu content, above the footer.
- [x] Settings opens a hub with a Training entry; the hub is structured so the Language entry and sub-page can be added later by the localization feature area.
- [x] Training opens a sub-page with Back to Settings.
- [x] The Training page has a global Reinforcement toggle, off by default and persisted.
- [x] The reinforcement list is per stack + mode and is stored with the mode stats.
- [x] A Missed answer adds the front card to its list and resets its consecutive Got it count to 0.
- [x] A Got it answer advances the count; five consecutive Got it answers remove the card from the list.
- [x] All graded answers count toward the five, including normal, insert, and Endless prompts.
- [x] Reinforcement candidates are fixed at session start; a card missed during the current session is eligible in the next session.
- [ ] In Endless, candidates refresh at each 104-item regular batch boundary when Endless exists.
- [x] Extra prompts are inserted after every 3–8 regular items, inclusive, with a fresh gap after each insert.
- [x] Selection is uniform from the current list, avoiding the same card twice in a row when the list has more than one card.
- [x] The planned session total includes all reinforcement inserts; no insert appears after the last regular item.
- [x] Each reinforcement prompt uses the active mode and direction, is graded once, and updates stats normally.
- [x] A muted “Reinforcement” indicator sits to the right of the timer, in the same style, so the layout does not shift.
- [x] If the list is empty, no reinforcement prompts are scheduled and the Training page shows a short hint.
- [x] Tests with an injected random source cover add/reset, five-streak removal, per-mode separation, gap range, planned total, no immediate repeat, and empty list.
- [x] Typecheck, tests, build, and the stack verifier pass.

## Implementation

- `src/domain/reinforcement.ts` (new): `planReinforcementInserts` snapshots the
  candidate list, uses inclusive 3–8 gaps over regular items, avoids an immediate
  repeat when the list has more than one card, and never inserts after the last
  regular item.
- `src/domain/session.ts`: sessions accept `reinforcementCandidates`; inserts are
  interleaved after regular items and carry `insert: "reinforcement"`. Inserts use
  the active mode (Card +3 triples included) and the active direction; mixed picks
  a direction per insert.
- `src/app.ts`: `beginSession` snapshots cards with `inReinforcement` from the
  active stack + mode when the toggle is on; grading already routes every answer
  through the normal stats path.
- `src/screens/settings.ts` (new): Settings hub at `#/settings` with a Training
  entry, and Training settings at `#/settings/training` with Back to Settings, the
  persisted Reinforcement toggle, and the list count/empty hint.
- `src/screens/menu.ts`: compact Settings link in the header; How to use this app
  moved below the navigation, above the footer.
- `src/screens/training.ts` + `src/styles.css`: muted “Reinforcement” indicator
  to the right of the timer, using the timer’s font, size, and colour, so the
  prompt and buttons keep their position. The same slot shows “Accelerate” when
  ticket 04 adds it. `src/strings.ts` owns all new text and the settings document
  titles.
- `src/router.ts`: `#/settings` and `#/settings/training` routes.

Deferred to ticket 05: Endless does not exist yet, so the batch-boundary candidate
refresh is not wired. `generateSession` already takes a per-session candidate
snapshot, so Endless can regenerate with a fresh snapshot at each boundary.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 163 passed (16 files; new `tests/reinforcement.test.ts`)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass

Awaiting human check in the browser before commit.

## Comments

- Human confirmed it works. Follow-up: the Reinforcement indicator moved from a
  badge above the front to the right of the timer (same style) so it no longer
  pushes the prompt and buttons down. The Accelerate indicator will use the same
  slot. Ticket resolved.
