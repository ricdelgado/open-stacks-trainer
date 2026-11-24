# Open Stacks Trainer — Master Implementation Prompt (TCRR)

You are the implementation agent for **Open Stacks Trainer**. Work in this repository. Read the project documents first, then build and deploy v1 exactly as specified. This is a **gated** build: stop at every milestone and wait for explicit human approval.

---

# TASK

Build **Open Stacks Trainer v1** from this setup pack to a live, free GitHub Pages site.

v1 is a static, browser-only trainer for memorized card stacks:

- three verified built-in stacks: **Mnemonica**, **Aronson**, **Memorandum**;
- basic training in three directions: position → card, card → position, mixed;
- one shuffled pass of all 52 positions per session, self-graded after reveal;
- current/best streaks, practice days, accuracy, recent misses;
- custom stacks via a phone-friendly grid editor and paste-import, with per-stack export;
- a full backup/restore for stats and custom stacks;
- no backend, no accounts, no analytics, no cookies, no network calls after load.

Deliverables:

1. A working Vite + vanilla TypeScript + Vitest app implementing `docs/history/PRD-v1.md`.
2. Unit tests for data integrity, parsing, storage, session generation, scoring/streaks, custom-stack validation, and backup/restore.
3. A menu, training screen, summary, stats page, My Stacks, stack view, import, and editor.
4. A README with creator credits and the mandatory AI disclosure; an MIT `LICENSE`; the deploy workflow.
5. A live GitHub Pages URL: `https://ricdelgado.github.io/open-stacks-trainer/`.
6. A final report listing what was built, what was tested, and any limitations.

Do **not** redesign the product. Do **not** build future modes. Do **not** invent behaviour that is not in `docs/history/PRD-v1.md`.

---

# CONTEXT

## Read these first, in this order

1. `docs/history/PRD-v1.md` — the product spec, data contracts, milestones, and acceptance criteria. **This wins over everything else.**
2. `CONTEXT.md` — the glossary and naming rules. Use its vocabulary in code, tests, and UI labels.
3. `AGENTS.md` — the operating manual and non-negotiables.
4. `data/SOURCES.md` — stack provenance and verification.
5. `docs/adr/` — the architecture decisions.
6. `data/stacks.json` and `data/checksums.json` — the verified built-in data.
7. `PROMPT.md` (this file) — the gated workflow.


## State of the repository

- This is a **setup pack**, not a built app. There is no `package.json`, `src/`, or app code yet.
- The repo is initialized on `main` with no commits.
- The Matt Pocock configuration is already complete: `AGENTS.md`, `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md`. **Do not rerun `setup-matt-pocock-skills`.**
- The three built-in orders are verified against multiple independent sources. `scripts/verify-stacks.mjs` passes. The data must not be regenerated.
- The target GitHub repo is `ricdelgado/open-stacks-trainer`. A remote may or may not be configured yet.
- The local folder may be named `open-stack-trainer` (singular). The repo and Vite base path use the plural `open-stacks-trainer`.
- Node 22 and npm 10 are available. Vite needs Node 20.19+ or 22.12+.

## The human

The human is **not a technical expert**. Explain manual checks in plain language, with exact clicks and commands. Do not assume they know Vite, TypeScript, `localStorage`, or GitHub Actions. When a tool or account step is needed, give exact steps and wait.

## Product in one paragraph

A magician picks a stack and a direction, then gets one shuffled pass of 52 prompts. Each prompt shows one side (position or card); the **Answer** button reveals the other side; the magician taps **Got it** or **Missed**. Every answer is saved immediately. At the end, a summary shows counts, accuracy, session-best streak, and misses. The Stats page shows only practiced stacks, with current/best streak, accuracy, practice days, and the last 20 misses. A custom stack can be built in a grid editor or pasted in; data can be backed up and restored. Position 1 is the top of the face-down deck.

---

# RULES

## Product and data rules

1. **Never generate, reorder, or “correct” built-in stack data.** Import `data/stacks.json`. Do not copy the order into a second hand-written list. Do not edit `data/stacks.json` or `data/checksums.json` to make a test pass. If a data test fails, investigate the code, not the data.
2. **Position 1 is the top of the face-down deck; position 52 is the bottom.** Every label, test, and data contract must agree.
3. **Every stack has exactly 52 unique valid cards.** Validate built-ins and customs.
4. **Built-ins:** IDs `mnemonica`, `aronson`, `memorandum`; names and creators fixed. Built-ins are read-only in the UI.
5. **Custom stacks:** validate on save, import, and restore; all-or-nothing on failure. Names are trimmed, 1–60 characters, unique among all stacks, case-insensitive. Built-in names are reserved.
6. **Stats are keyed by stable stack ID**, never by name. Renaming a custom stack keeps its ID and stats.
7. **Every graded answer is persisted immediately** (write-through). A reload must not lose completed answers.
8. **No paid stacks or book content committed.** Mi Baraja Personal is added locally by the user, never committed. Si Stebbins is out of v1.
9. **Out of scope:** Quartets, ACAAN, endless mode, cyclic stacks, drill-my-misses, spaced repetition, timers, points, typed answers, accounts, sync, analytics, dark mode, Spanish UI, PWA, card images, drag-and-drop.
10. **Credits and disclosure are mandatory.** README and in-app creator credits; README and main-menu footer AI disclosure; MIT license.

## Technology rules

1. **Vite + vanilla TypeScript + Vitest.** No React, Svelte, Vue, or other UI framework. No CSS framework.
2. **Plain DOM APIs.** Small render functions per screen. Each screen cleans up its listeners when leaving.
3. **Strict TypeScript.** Avoid `any`. Use discriminated unions for direction, routes, and validation results. Enable `strict`, `noUncheckedIndexedAccess` where practical.
4. **Hash routing only.** GitHub Pages has no SPA rewrite. Routes are in `docs/history/PRD-v1.md` §7.12. Unknown hash → menu.
5. **Vite base `/open-stacks-trainer/`.** The app is a project site, not a root site.
6. **One `localStorage` key:** `open-stacks-trainer`; one versioned JSON payload. No cookies, IndexedDB, or server storage.
7. **All user-visible strings in one module.** English v1. No user-visible literal in a screen.
8. **No network calls after load.** No analytics, tracking, external fonts, remote APIs, or telemetry.
9. **No backend, no accounts, no secrets.**
10. **Dependencies:** keep to Vite, TypeScript, Vitest, and their types. Ask before adding anything else. Do not add a framework or a utility library for something small.
11. **npm.** Commit `package-lock.json`. Use `npm ci` in CI.
12. **Security:** no `eval`; never render user-provided names with `innerHTML`; use `textContent` or safe DOM construction.
13. **No comments that restate the code.** Comment only non-obvious invariants, decisions, or workarounds. The human asked for no unnecessary comments.

## UX rules

1. **Mobile-first.** Test at 320 px, 375 px, and desktop. No horizontal scrolling anywhere.
2. **Tap targets:** at least 44×44 px; editor cells at least 48×48 px.
3. **Light theme, system font stack, no external fonts, no image assets.** Generous whitespace; few elements per screen.
4. **Typographic cards:** rank + suit glyph; `10`, never `T`; red hearts/diamonds, black spades/clubs.
5. **Exact labels:** **Answer**, **Missed**, **Got it**, **Train again**, **Menu**, **Export my data**, **Restore from file**, **Delete all data**, **Delete training data**, **Create stack**, **Import stack**, **Save**.
6. **Buttons are real `<button>` elements; links are real anchors with hash hrefs.**
7. **Keyboard:** Space/Enter = Answer; 1/N = Missed; 2/Y = Got it. Ignore when focus is in an input/textarea/select, when a modifier is held, or when a dialog is open. Prevent default only when handled.
8. **Accessibility:** visible focus, keyboard reachable, accessible names for cards and position cells, `aria-live` for reveal/progress where useful, `aria-selected` on suit tabs, `aria-pressed` on card buttons.
9. **Destructive actions are distinct and confirmed.** Delete-all is double-confirmed. Delete-custom-stack warns that stats are deleted too. Restore warns that it replaces everything.
10. **Update `document.title` per screen; move focus to the main heading on route change; scroll to top.**
11. **Respect `prefers-reduced-motion`.** v1 has little or no animation.
12. **Show inline success/error messages in plain language.** No alert libraries, no blocking toasts.

## Process rules

1. **Work in milestone order:** Phase 0 Setup → M1 → M2 → M3 → M4 → Final.
2. **Stop at every gate.** Summarize what changed, give the exact commands and manual checks, and wait for an explicit **OK / approved / continue**. Silence is not approval. Do not start the next milestone early.
3. **Run checks continuously:** typecheck and the relevant test file after each change. Before every gate run:
   ```bash
   npm run typecheck
   npm test -- --run
   npm run build
   node scripts/verify-stacks.mjs
   ```
   Also check for console errors during manual checks.
4. **Use the engineering skills when available.**
   - If the human invokes `/implement`, follow it.
   - Use `/tdd` at the pre-agreed seams: data validation, parser, session generator, scoring/streaks, storage, backup/restore.
   - Use `/code-review` before each gate.
   - If a skill is unavailable, follow its intent manually.
   - **Do not rerun `setup-matt-pocock-skills`.**
5. **Keep changes small.** One coherent slice per commit. Do not refactor unrelated code.
6. **Git:** commit after each approved milestone on `main`, e.g. `chore: add setup pack and verified stack data`, `feat: m1 scaffold and menu`, `feat: m2 training loop`, `feat: m3 stats and backup`, `feat: m4 custom stacks and deploy`. Do not push before the M4 gate. Do not amend, rebase, force-push, or change git config. Do not commit `node_modules`, `dist`, or secrets.
7. **If blocked, stop and ask a specific question.** Do not guess product behaviour. The PRD is detailed; use it.
8. **If a tool is missing, do not install it silently.** Give the exact install command and wait for the human.
9. **Do not claim success without running the checks.** A milestone is not done because the code “looks right.”

## Error-handling rules

1. Corrupt stored JSON: do not silently wipe. Show a plain error and offer an explicit reset with confirmation.
2. Storage unavailable or quota exceeded: keep the app usable in memory and show a visible warning. Do not crash.
3. Newer storage schema: refuse to overwrite; show a plain message.
4. Invalid import/restore: change nothing; show a plain, specific error.
5. Backup restore: replace everything only after confirmation. Explain that it replaces current data and suggest exporting first.
6. Delete all: double confirmation; remove the key; reset the app state.
7. Never swallow an error that could lose data.

---

# WORKFLOW AND GATES

At every gate, use this protocol:

- State the milestone and what changed.
- List the exact commands the human should run.
- List the exact clicks/checks the human should perform.
- State what “pass” looks like.
- Stop and wait for explicit approval.
- If the human reports a problem, fix it, re-run the checks, and re-present the gate.

Do not proceed on silence. Do not combine milestones. Do not push before M4 approval.

---

## Phase 0 — Setup (gate)

### Do

1. Read the documents listed in **Context**. Confirm you understand the PRD, glossary, ADRs, and data provenance.
2. Check:
   ```bash
   node --version
   npm --version
   git --version
   git status --short --branch
   git remote -v
   node scripts/verify-stacks.mjs
   ```
3. Confirm `data/stacks.json` and `data/checksums.json` are unchanged and the verifier passes.
4. If there is no `origin` remote, guide the human through connecting the repository to GitHub:
   - GitHub CLI (`gh auth login`, then `gh repo create ...` or `git remote add ...`);
   - GitHub Desktop;
   - HTTPS with a personal access token.
   Do not install tools silently. Do not push. The repo must be public and empty when created.
5. If the repo/remote already exists, verify it and continue.
6. Check `git config user.name` and `git config user.email`. If they are missing, ask the human to set them (or tell you the values); do not change git config yourself.
7. Do not scaffold app code yet.

### Gate 0 — human check

Ask the human to confirm:

- the GitHub repo `ricdelgado/open-stacks-trainer` exists and is public;
- `git remote -v` shows `origin` (or they have chosen GitHub Desktop and will publish);
- they are ready for M1.

Then stop and wait.

After the human approves Gate 0, commit the setup pack (docs, data, verifier, workflow) with a clear message such as `chore: add setup pack and verified stack data`. Do not push. Then start M1.

---

## M1 — Scaffold, verified data, menu skeleton (gate)

### Do

1. Scaffold Vite + vanilla TypeScript. The folder is not empty, so either:
   - create the scaffold in a temporary folder and copy in `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, and the minimal `src/` entry files; or
   - run `npm create vite@latest . -- --template vanilla-ts` and choose the option to ignore existing files if prompted.
   Do **not** overwrite `docs/history/PRD-v1.md`, `CONTEXT.md`, `AGENTS.md`, `README.md`, `LICENSE`, `PROMPT.md`, `data/`, `docs/`, `scripts/`, `tests/`, `.github/`, `.scratch/`, or `.gitignore`.
2. Install Vite, TypeScript, and Vitest. Add scripts:
   ```json
   {
     "dev": "vite",
     "build": "tsc --noEmit && vite build",
     "preview": "vite preview",
     "typecheck": "tsc --noEmit",
     "test": "vitest",
     "test:watch": "vitest --watch"
   }
   ```
   Adjust `build` if a separate typecheck script is cleaner, but `npm run build` must produce `dist/`.
3. Set `base: "/open-stacks-trainer/"` in the Vite config. Set `build.outDir` to `dist` (default). Add `resolveJsonModule`/strict TypeScript settings. Add an `engines` field for Node 20.19+ or 22.12+.
4. Import `data/stacks.json` through a typed data module. Do not duplicate the order. Built-in IDs, names, and creators must match the file.
5. Add the **built-in data integrity test**: IDs, 52-card length, valid cards, no duplicates, full-deck coverage, landmarks, checksums. A ready-made test is at `tests/stacks.test.ts`; keep it, adapt its imports if needed, and make it run under Vitest.
6. Build the hash router and app shell. Implement routes from `docs/history/PRD-v1.md` §7.12. Unknown → menu. Update `document.title` and focus the main heading on route change.
7. Add the centralized strings module. Every visible label comes from it.
8. Add base styles: mobile-first, light theme, system font, card face, buttons, focus styles, layout.
9. Build the **menu / navigation skeleton**:
   - title **Open Stacks Trainer**;
   - Start training (big button);
   - Stack selector (built-ins; customs appear after M4) with creator for built-ins; remembers last;
   - Mode selector (Basic active; Quartets, ACAAN, Endless, Cyclic disabled with “later”);
   - Stats and My Stacks navigation;
   - direction control (Position → card / Card → position / Mixed) inside the Start Training area;
   - footer AI disclosure linking to the repo.
   The Start button may navigate to a placeholder until M2. Stats and My Stacks screens may be placeholders. **No training logic yet.**
10. Add a minimal in-app confirm dialog or native `confirm` helper for later destructive actions.
11. Create the storage module skeleton with defaults and a safe `load`/`save` that can report corrupt/unavailable storage. Do not wire training yet.
12. Run:
    ```bash
    npm run typecheck
    npm test -- --run
    npm run build
    node scripts/verify-stacks.mjs
    ```

### Gate M1 — human check

Give the human:

```bash
npm install
npm run dev
```

Ask them to:

- open the URL Vite prints;
- confirm the menu shows the five elements and the AI disclosure footer;
- click **Stats** and **My Stacks** and return to the menu;
- try the stack selector and the direction control;
- confirm future modes are disabled and labelled “later”;
- resize to a phone width and confirm no horizontal scroll;
- check the browser console for errors.

Pass = menu/navigation works, data test passes, typecheck/tests/build pass, no console errors.

Then stop, wait for approval, and commit M1.

---

## M2 — Training loop, summary, streaks (gate)

### Do

1. Implement the **session generator** (pure domain):
   - 52 items, one per position;
   - every position exactly once; every card exactly once;
   - fixed direction respected;
   - mixed direction chosen 50/50 per item;
   - Fisher–Yates shuffle;
   - injectable RNG for tests.
2. Implement the **training screen**:
   - progress `answered/52`;
   - persisted current streak;
   - direction label;
   - front: position (large number) or card face;
   - **Answer** button;
   - after reveal: front + back, **Missed** and **Got it**;
   - after grading, advance immediately; ignore repeated clicks on the same item;
   - card face uses rank + suit glyph, `10`, red/black;
   - accessible names and `aria-live` where useful.
3. Implement **grading and streak updates**:
   - correct: `totalCorrect++`, `currentStreak++`, `bestStreak = max`, session correct++;
   - miss: `currentStreak = 0`, session missed++, add recent miss (card, position, direction, ISO timestamp);
   - update practice day (`answered`, `correct`) and `lastPracticedAt`;
   - persist immediately after every grade.
4. Implement the **summary**:
   - correct/missed out of 52;
   - session accuracy;
   - session-best streak (longest run within the session, starting from 0);
   - missed list;
   - **Train again** (same stack/direction, new shuffle);
   - **Menu**.
5. Implement **keyboard shortcuts** exactly as specified.
6. Implement **Quit** with confirmation; answers already given stay saved; unfinished session discarded.
7. Implement reload behaviour: unfinished session is lost; graded stats remain; app returns to menu.
8. Add tests for session generation, direction split, shuffle determinism, scoring/streaks, practice days, recent misses, and persistence updates.
9. Run all gate checks.

### Gate M2 — human check

Ask the human to:

- run a full session in **Position → card**; confirm 52 prompts, Answer reveals, Got it/Missed advance, progress and streak update;
- run a full session in **Card → position**;
- run a full session in **Mixed** and confirm both directions appear;
- deliberately miss one early answer and confirm the streak resets; then build a small streak;
- finish a session and check the summary counts, accuracy, session-best streak, and missed list;
- click **Train again** and **Menu**;
- mid-session, reload the page and confirm graded stats survive (the unfinished session may be gone);
- test Space/Enter, 1/N, 2/Y;
- test Quit and confirm the dialog;
- check the console for errors.

Pass = all of the above, typecheck/tests/build/data verifier pass.

Then stop, wait for approval, and commit M2.

---

## M3 — Stats, backup, restore, delete (gate)

### Do

1. Implement the **stats page**:
   - only `totalAnswered > 0` stacks;
   - most recent first;
   - per stack: name, creator for built-ins, current/best streak, accuracy, total answered, practice days, last 20 misses, **Delete training data**;
   - practice days show date, answered, correct; most recent first;
   - misses show card, position, direction, local timestamp; newest first;
   - empty state;
   - global **Export my data**, **Restore from file**, **Delete all data**.
2. Implement **export backup** (settings + custom stacks + stats), Blob download, correct file name.
3. Implement **restore**:
   - file picker, parse, validate all-or-nothing;
   - confirmation explaining replacement;
   - refuse newer format/schema;
   - reject duplicate/colliding custom names;
   - replace, refresh UI, success message;
   - invalid data changes nothing.
4. Implement **per-stack delete training data** with confirmation.
5. Implement **delete all data** with double confirmation; remove the key; reset settings/customs/stats; return to menu.
6. Implement storage error handling: corrupt JSON, unavailable storage, quota; visible plain messages; no silent wipe; explicit reset path.
7. Add tests for storage round-trip, corrupt JSON, schema handling, backup/restore validation, replace semantics, recent-miss cap, practice-day merging.
8. Run all gate checks.

### Gate M3 — human check

Ask the human to:

- train a few cards, then open **Stats**;
- confirm the practiced stack appears and an untrained stack is hidden;
- check current/best streak, accuracy, practice day, and recent miss;
- click **Export my data** and confirm a JSON file downloads;
- click **Delete all data**, confirm both dialogs, and confirm stats/customs reset;
- click **Restore from file**, choose the exported file, confirm, and verify the data returns;
- delete training data for one stack and confirm only that stack resets;
- check the empty state after deleting everything;
- check the console for errors.

Pass = all of the above, typecheck/tests/build/data verifier pass.

Then stop, wait for approval, and commit M3.

---

## M4 — Custom stacks, deployment (gate)

### Do

1. Implement **My Stacks**:
   - built-ins with creator and **View** (read-only);
   - customs with **View**, **Edit**, **Export**, **Delete**;
   - **Create stack** and **Import stack**;
   - delete confirmation warns that stats are deleted too;
   - deleting the selected stack falls back to the first built-in.
2. Implement the **stack view**: read-only 1–52 order, creator credit, export.
3. Implement **paste import**:
   - name field; textarea;
   - accept text notation (letters/symbols, `10`/`T`, separators), stack export JSON, and optionally a raw 52-card array;
   - prefill name from JSON when the field is empty; editable;
   - validate count, real cards, duplicates, name uniqueness;
   - plain-language errors; nothing saved on failure;
   - backup JSON gets the “use Restore on Stats” message;
   - success navigates to My Stacks with a success message.
4. Implement the **grid editor** exactly as `docs/history/PRD-v1.md` §7.7 and ADR-0005:
   - name, suit tabs, remaining counts, used cards greyed with their position;
   - desktop expands to four suit rows;
   - adaptive position grid (6 → 13 columns, cells ≥48 px, no horizontal scroll);
   - pinned selection bar;
   - select/deselect/assign/clear/replace rules;
   - save disabled until valid unique name + 52/52; progress label;
   - edit pre-fills; rename keeps ID/stats; cancel with unsaved changes confirms.
5. Implement **per-stack export** JSON with the correct format and filename.
6. Verify and update as needed: **README**, **LICENSE**, credits, AI disclosure, and the deploy workflow:
   - README **Built with AI** section near the top, with the exact wording in `docs/history/PRD-v1.md` §15;
   - stack credits for Tamariz, Aronson, Aragón;
   - MIT license;
   - main-menu footer AI disclosure linking to the repo;
   - workflow runs typecheck, tests, verifier, build, and deploys only if green.
7. Run all gate checks:
   ```bash
   npm run typecheck
   npm test -- --run
   npm run build
   node scripts/verify-stacks.mjs
   ```
8. Present the local M4 checks (below) and ask for approval to commit, push, and deploy.
9. **Only after explicit approval**: commit M4, push `main`, and watch the Actions run. Verify the live URL and the base path.
10. If the workflow fails, fix it locally, re-run the checks, commit the fix, push the fix, and re-present the live check. Do not force-push.

### Gate M4 — human check

First, the local checks:

- open **My Stacks**; confirm built-ins are view-only with creators; view one;
- **Import stack**: paste 52 cards in notation; try a bad input (51 cards, duplicate) and confirm a plain error and nothing saved; import valid text;
- **Create stack**: build a 52-card stack in the editor; on a phone (320/375 px) confirm no horizontal scroll, 48 px cells, suit tabs, used cards greyed, select/deselect/clear/replace;
- save with an incomplete grid and confirm it is disabled; finish 52/52, save, view it, rename it, confirm stats survive a rename;
- export the custom stack, re-import it, then delete it (confirm stats warning);
- check the README for credits and AI disclosure; check the footer link;
- check the console for errors.

Then ask for approval to commit, push, and deploy. After the push:

- open the **live URL** and confirm the menu, one session, and Stats work with the correct base path;
- check the Actions run is green;
- check the console for errors.

Pass = all of the above, live URL works, typecheck/tests/build/data verifier pass.

Then stop, wait for final approval, and report. If the human reports a problem, fix it, re-run the checks, commit, and re-present the gate (push the fix only if the live site needs it).

---

## Final — report

Run the full gate checks one last time. Report:

- the live URL;
- what was built and what was manually checked;
- the test/typecheck/build/verifier results;
- any limitations or follow-ups (without adding scope);
- confirmation that README, LICENSE, credits, and AI disclosure are present.

---

# RESULTS / DEFINITION OF DONE

The project is done only when:

1. `npm run typecheck`, `npm test -- --run`, and `npm run build` pass from a clean state.
2. `node scripts/verify-stacks.mjs` passes and the built-in data is unchanged.
3. A full 52-card session works in all three directions, with no repeats, correct summary, and immediate persistence.
4. A miss resets the current streak and appears in recent misses; a correct answer increments the streak; best streak persists.
5. Reloading after some answers keeps stats; the unfinished session is gone.
6. Stats show only practiced stacks, most recent first, with correct practice days, accuracy, streaks, and misses.
7. Export → Delete all → Restore reproduces the same stats and custom stacks.
8. Invalid import/restore data changes nothing and shows a plain error.
9. The editor prevents saving until 52/52 and a unique name; select/clear/replace work.
10. The editor has no horizontal scroll at 320 px, 375 px, and desktop; cells are at least 48 px.
11. The site is live at `https://ricdelgado.github.io/open-stacks-trainer/` with correct assets and hash routing.
12. README contains stack credits, the MIT license, and the AI disclosure; the app footer shows the disclosure and links to the repo.
13. No network requests after load, no analytics, no accounts, no secrets.
14. No console errors during the manual checks.
15. The human has approved each gate.

**Final report format:**

```text
Open Stacks Trainer v1 — completion report

Live URL: ...
Built: ...
Tested: ...
Checks: typecheck ✅ / tests ✅ / build ✅ / data verifier ✅
Manual checks: ...
Known limitations: ...
```

---

# IF SOMETHING IS AMBIGUOUS

Stop and ask a specific question. Do not invent product behaviour. The PRD is detailed; use it. If a requirement is genuinely missing, propose the smallest option that fits the existing decisions and ask for approval before implementing it. Do not add scope silently.

# IF A CHECK FAILS

- A failing data test means the data or checksums changed. Do not edit them to hide it. Report it and ask.
- A failing parser/scoring/storage test means the code is wrong. Fix the code and add a regression test if the bug was not covered.
- A failing build or typecheck means the code is not ready. Fix it before presenting a gate.
- A failing deployment means the workflow or base path is wrong. Fix it locally, re-run the checks, and re-present the gate.

# BEGIN

Start by reading the documents and reporting a short plan for Phase 0. Then execute Phase 0 and stop at Gate 0. Do not scaffold the app until the human approves.
