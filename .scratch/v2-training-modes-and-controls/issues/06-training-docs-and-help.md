# 06 — Training docs and help refresh

**What to build:** The project vocabulary, in-app help, and README explain the new modes, toggles, timer, and stats behavior before localization begins.

**Blocked by:** `05 — Endless`.

**Status:** resolved

- [x] `CONTEXT.md` defines mode, Basic, Card +3, Endless, Reinforcement, Accelerate, elapsed time, per-card stats, and reinforcement list.
- [x] The in-app How to use content explains the mode selector, Card +3, the timer, Reinforcement, Accelerate, Endless, and where to find settings.
- [x] The help text still states that position 1 is the top of the face-down deck.
- [x] The README feature list includes Card +3, Endless, Reinforcement, Accelerate, the timer, per-card stats, and settings.
- [x] All new user-visible strings live in the central strings module.
- [x] No app behavior changes beyond the help and documentation updates.
- [x] The help opens and closes correctly on phone and desktop widths.
- [x] Typecheck, tests, build, and the stack verifier pass.


## Implementation

- `CONTEXT.md`: added Card +3, Endless, extra prompt, planned total, reinforcement
  list, Accelerate, elapsed time, and Settings; updated session, summary, menu,
  training screen, and Stats descriptions plus the naming rules.
- `src/strings.ts` help sections: now cover stack/direction/mode, the timer,
  grading, Reinforcement and Accelerate, Endless, stats review, and shortcuts.
  The position note still says position 1 is the top of the face-down deck.
- `README.md`: replaces the v1-only feature list with Basic and Card +3, the quiet
  timer, Reinforcement/Accelerate/Endless, per-card stats, and Settings; updates
  the roadmap and Si Stebbins wording.
- No behavior changed; the help dialog already scrolls the longer content.

## Verification (desktop)

- `npm run typecheck` — pass
- `npm test -- --run` — 204 passed (19 files)
- `npm run build` — pass
- `node scripts/verify-stacks.mjs` — pass
- Headless Chrome: the dialog opens with all seven sections and the position note,
  scrolls inside its panel, closes cleanly, and has no horizontal overflow at 320 px.

Awaiting human check in the browser before commit.

## Comments

- Human approved. Ticket resolved.
