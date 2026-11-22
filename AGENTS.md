# AGENTS.md — operating manual for Open Stacks Trainer

This file is for the coding agent. It is not the product spec. Read `PRD.md` for behaviour, `CONTEXT.md` for vocabulary, `data/SOURCES.md` for stack provenance, and `docs/adr/` for the decisions behind the architecture.

## What this repo is

Open Stacks Trainer is a free, static, browser-only trainer for memorized card stacks. v1 trains Mnemonica, Aronson, Memorandum, and user-made custom stacks by asking card ↔ position pairs in one shuffled pass of 52, self-graded after reveal. Progress lives in `localStorage`. There is no backend, no account, no analytics, and no network traffic after the assets load.

The original design interview is `design discussion.txt`. It is history. `PRD.md` wins if they differ.

## Non-negotiables

1. **Never generate, reorder, or “correct” built-in stack data.** Import the provided verified data. Do not edit it to make a test pass. See `data/SOURCES.md`.
2. **Position 1 is the top of the face-down deck; position 52 is the bottom.** Every stack, UI label, and test must agree.
3. **Every stack has exactly 52 unique valid cards.**
4. **One `localStorage` key, `open-stacks-trainer`, one versioned JSON payload.** No cookies, IndexedDB, server storage, or accounts.
5. **Stats are keyed by stable stack ID**, not by name. Renaming a custom stack keeps its stats.
6. **Every graded answer is persisted immediately.** A reload must not lose completed answers.
7. **Vite + vanilla TypeScript + Vitest.** No React/Svelte/Vue, no CSS framework, no backend.
8. **Hash routing.** GitHub Pages has no SPA rewrite. The Vite base is `/open-stacks-trainer/`.
9. **All user-visible strings live in one module.** English v1; Spanish is a later translation, not a rewrite.
10. **Mobile-first.** No horizontal scrolling; tap targets at least 44×44 px; editor cells at least 48×48 px.
11. **Never render user-provided names with `innerHTML`.** Use `textContent` or safe DOM construction.
12. **Credits and disclosure are mandatory.** README and in-app creator credits; README and footer AI disclosure. MIT license.
13. **Stop at every milestone gate** and wait for explicit human approval. Do not sprint to deployment.
14. **Do not commit secrets, paid stack orders, or book content.** Mi Baraja Personal and similar paid stacks are never committed.

## Agent skills

### Issue tracker

Local markdown under `.scratch/<feature-slug>/`. The v1 spec is the root `PRD.md`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` at the repo root, product spec in `PRD.md`, ADRs in `docs/adr/`. See `docs/agents/domain.md`.

> The Matt Pocock setup is already complete. Do **not** rerun `setup-matt-pocock-skills` unless the human explicitly asks to switch issue trackers or restart the configuration.

## How to work

1. **Read first.** `PRD.md`, `CONTEXT.md`, `data/SOURCES.md`, the relevant ADRs, and this file.
2. **Plan the milestone.** Restate the scope and the manual checks you will hand the human at the gate. Keep the PRD vocabulary.
3. **Use the engineering skills when available.** If the human invokes `/implement`, follow it. Use `/tdd` at the pre-agreed seams (domain logic, parser, storage, scoring). Use `/code-review` before each gate.
4. **Work in milestone order:** Setup → M1 → M2 → M3 → M4 → Final. Do not start a later milestone before the previous gate is approved.
5. **Run checks continuously.** Typecheck and the relevant test file after each change; the full suite, build, and data verifier before asking for approval.
6. **Keep changes small.** One coherent slice per commit. Do not refactor unrelated code.
7. **Ask before adding a dependency.** The expected set is Vite, TypeScript, Vitest, and their types. Justify anything else.
8. **If something is ambiguous, stop and ask.** Do not invent product behaviour. The PRD is detailed; use it.
9. **Do not push to GitHub until the M4 gate.** Commit locally after each approved milestone. The first push is the reviewed build.

## Milestones and gates

The exact checks are in `PRD.md` §11. In short:

- **Setup:** verify Node/npm/git, confirm the GitHub repo and `origin` remote, run `node scripts/verify-stacks.mjs`. The Matt Pocock config is done.
- **M1:** Vite + TS + Vitest scaffold; scripts; base path; verified data import; data test; hash router; strings; base styles; menu/navigation skeleton. No training logic. Gate: dev server, menu clicks, typecheck/tests/build.
- **M2:** session generator, training screen, reveal, grading, streaks, immediate persistence, summary, keyboard shortcuts, quit/reload behaviour. Gate: a full session in each direction and mixed.
- **M3:** stats page, hidden untrained stacks, practice days, recent misses, per-stack delete, backup export, restore, delete all, empty/error states. Gate: export → delete all → restore.
- **M4:** My Stacks, stack views, import, editor, rename/delete, per-stack export, README/LICENSE/credits/AI disclosure, deploy workflow, push, live URL. Gate: import, build a stack, mobile editor check, live site.
- **Final:** all checks, final report.

At every gate:

- Say exactly what you changed and what the human should click or check.
- Give the commands to run.
- Wait for an explicit “OK” / “approved” / “continue” before the next milestone.
- If the human reports a problem, fix it and re-run the gate checks.

## Commands

After M1 scaffolds the project, these must work:

```bash
npm install          # first time
npm run dev          # local dev server
npm run build        # production build
npm run preview      # preview the production build
npm run typecheck    # tsc --noEmit
npm test -- --run    # unit tests, one pass
npm run test:watch   # unit tests, watch mode
node scripts/verify-stacks.mjs
```

Before every gate, run at least:

```bash
npm run typecheck
npm test -- --run
npm run build
node scripts/verify-stacks.mjs
```

The GitHub Actions workflow runs typecheck, tests, the stack-data verifier, and build, and deploys only if they pass.

## Suggested file layout

The agent may adjust names, but keep these seams:

```text
/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── AGENTS.md
├── CONTEXT.md
├── PRD.md
├── README.md
├── LICENSE
├── data/
│   ├── stacks.json          # verified built-in data, imported by the app
│   ├── checksums.json
│   └── SOURCES.md
├── scripts/
│   └── verify-stacks.mjs
├── docs/
│   ├── agents/
│   └── adr/
├── .scratch/                # local-markdown issues/specs
├── .github/workflows/deploy.yml
├── src/
│   ├── main.ts
│   ├── app.ts               # hash router + app shell
│   ├── styles.css
│   ├── strings.ts           # every user-visible string
│   ├── domain/              # pure: cards, stack validation, session, scoring, parser
│   ├── storage/             # localStorage read/write/migrate, backup/restore validation
│   ├── data/                # typed access to data/stacks.json
│   ├── screens/             # menu, training, summary, stats, my-stacks, editor, import, view
│   └── ui/                  # card face, buttons, confirm dialog, status message
└── tests/                   # Vitest unit tests
```

Keep `data/stacks.json` as the single source of truth. `src/data/` may wrap it with types and lookups, but must not contain a second hand-written order.

## Architecture rules

- **Domain is pure.** No DOM, no `localStorage`, no `window` in `domain/`. Inject randomness and clocks where tests need determinism.
- **Storage is isolated.** One module owns reading, validating, writing, and migrating the key. Screens do not call `localStorage` directly.
- **Screens own the DOM.** Each screen renders into the app root, attaches its listeners, and cleans them up when leaving.
- **Strings are centralized.** No user-visible literal in a screen; add it to `strings.ts`.
- **Types are explicit.** Strict TypeScript. Avoid `any`; use discriminated unions for directions, routes, and validation results.
- **Small modules.** One reason to change per module. Prefer pure functions for logic that future modes will reuse.
- **No comments that restate the code.** Comment only non-obvious decisions, invariants, or workarounds. (The human asked for no unnecessary comments.)
- **No unsafe HTML.** User names, imported names, and status text are rendered with `textContent`.
- **Fail visibly, not silently.** Catch storage/import/restore errors and show a plain message. Never swallow an error that could lose data.

## Stack data rules

- Built-ins: `mnemonica`, `aronson`, `memorandum`, fixed names and creators.
- Read `data/SOURCES.md` before touching data or its tests.
- Never modify `data/stacks.json` or `data/checksums.json` to satisfy a test.
- The data test must assert IDs, 52-card length, valid cards, no duplicates, full-deck coverage, landmarks, and checksums. A ready-made Vitest test is at `tests/stacks.test.ts`; keep it passing.
- Custom stacks are user data: validate on save, import, and restore; all-or-nothing on failure.
- Paid stacks are never committed. Users add them locally through the editor or paste-import.
- Do not add Si Stebbins in v1; it is cyclic and needs a different training model.

## Storage rules

- Key: `open-stacks-trainer`.
- Payload: `{ schemaVersion: 1, settings, customStacks, stats }`.
- Defaults on first run: first built-in selected, direction `mixed`, empty customs/stats.
- Write-through after every graded answer.
- Keep stats keyed by stack ID; do not key by name.
- `practiceDays`: one per local date, `YYYY-MM-DD`; increment answered/correct.
- `recentMisses`: newest first, cap 20.
- `lastPracticedAt`: update on every answer.
- `currentStreak` carries across sessions; a miss resets it; `bestStreak` is the maximum ever.
- Session-best streak is in-memory only and shown on the summary.
- Corrupt JSON: do not silently wipe; show an error and offer explicit reset with confirmation.
- Unavailable/quota storage: keep the app usable in memory and show a warning.
- Newer schema: refuse to overwrite; show a plain message.
- Backup/restore: replace everything after confirmation; validate before changing anything.
- Delete all: double confirmation; remove the key; reset the app state.

## UI rules

- Mobile-first; test at 320 px, 375 px, and desktop.
- Light theme; system font stack; no external fonts; no image assets.
- Typographic cards: rank + suit glyph; `10`, never `T`; red hearts/diamonds, black spades/clubs.
- Few elements per screen; generous whitespace; clear primary action.
- Buttons are real `<button>` elements; links are real anchors with hash hrefs.
- Visible focus; keyboard reachable; accessible names for cards and positions.
- Tap targets ≥44×44 px; editor cells ≥48×48 px; no horizontal scroll.
- Destructive actions are distinct and confirmed; delete-all is double-confirmed.
- Use a small in-app confirm dialog or native `confirm`; keep messages plain and specific.
- Show inline success/error messages; no alert libraries, no toasts that block.
- Respect `prefers-reduced-motion`.
- Update `document.title` per screen; move focus to the main heading on route change.
- Keyboard: Space/Enter = Answer; 1/N = Missed; 2/Y = Got it; ignore in inputs and dialogs.

## Testing rules

- Test external behaviour, not private implementation details.
- Pure domain tests are the priority: data, parser, session generator, scoring/streaks, custom-stack validation, backup/restore.
- Use table-driven tests for the parser and landmarks.
- Inject the RNG for shuffle/direction tests; inject the clock/date for practice-day tests where practical.
- No browser end-to-end suite in v1; no full-DOM snapshot tests.
- Storage tests should use a fake/in-memory storage or a minimal stub, not a real browser.
- Every bug fix gets a regression test.
- A failing data test means the data changed; do not edit the test or data to hide it.

## Git, CI, and deployment

- Work on `main` locally; commit after each approved milestone with a clear message.
- Do not commit unless the human asks or a milestone gate approves it. Do not push before M4.
- Do not rewrite history, force-push, or change git config.
- Commit `package-lock.json`.
- The deploy workflow is `.github/workflows/deploy.yml`; it runs typecheck, tests, the stack-data verifier, and build, then deploys Pages.
- In GitHub: Settings → Pages → Source = GitHub Actions.
- The live URL is `https://ricdelgado.github.io/open-stacks-trainer/`.
- If the local folder is `open-stack-trainer` (singular), that does not matter; the repo and base path use the plural `open-stacks-trainer`.
- No secrets are needed. Never add one.

## Definition of done

A milestone is done only when:

- the requested behaviour works in the running app;
- typecheck, tests, build, and the data verifier pass;
- the mobile layout has been checked where relevant;
- no console errors appear during the manual checks;
- the PRD behaviour, vocabulary, and labels are followed;
- the human has approved the gate.

The project is done only when the live GitHub Pages URL works, the README contains credits and the AI disclosure, the MIT license is present, and export → delete-all → restore round-trips correctly.

## What not to do

- Do not build Quartets, ACAAN, endless, cyclic stacks, or drill-my-misses in v1.
- Do not add spaced repetition, timers, points, or typed answers.
- Do not add a backend, accounts, analytics, tracking, ads, or external fonts.
- Do not add a UI framework or a CSS framework.
- Do not use cookies or IndexedDB.
- Do not generate or “fix” stack orders.
- Do not commit paid stack orders or book content.
- Do not silently wipe corrupt storage or silently merge a restore.
- Do not push or deploy before the M4 gate.
- Do not stop halfway through a gate and start the next milestone.
