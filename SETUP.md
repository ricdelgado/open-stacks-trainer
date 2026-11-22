# Setup and handoff guide

This repository is **ready for implementation**. The design is finished, the three built-in stack orders are verified, and the Matt Pocock repo configuration is in place. This guide is for you (the human), not for the coding agent.

## What is already done

- `PRD.md` — the complete v1 product spec, data contracts, and acceptance criteria.
- `CONTEXT.md` — the glossary and naming rules.
- `AGENTS.md` — the operating manual for the coding agent.
- `data/stacks.json` — verified Mnemonica, Aronson, and Memorandum orders.
- `data/checksums.json` + `scripts/verify-stacks.mjs` — data integrity protection.
- `data/SOURCES.md` — where each order came from and how it was checked.
- `docs/adr/` — the architecture decisions.
- `docs/agents/` — the Matt Pocock issue-tracker, triage-label, and domain-doc configuration.
- `PROMPT.md` — the master implementation prompt with milestone gates.
- `CONTINUE.md` — a short prompt for resuming after a session ends.
- `README.md`, `LICENSE`, `.gitignore`, `.github/workflows/deploy.yml`.

The app itself is **not** built yet. The next agent builds it by following `PROMPT.md`.

## 1. Check Node.js

You already have Node v22.23.4 and npm 10.9.9 on this machine, which is enough. To check again:

```bash
node --version
npm --version
```

If Node is missing, install the **LTS** version from <https://nodejs.org/> and reopen the terminal.

## 2. Create the empty GitHub repository

1. Sign in to GitHub as **ricdelgado**.
2. Go to <https://github.com/new>.
3. Repository name: **open-stacks-trainer** (plural “stacks”).
4. Visibility: **Public** (required for free GitHub Pages).
5. **Do not** add a README, `.gitignore`, or license. The local repo already has them; an empty repo avoids a merge on the first push.
6. Create the repository.

The live URL will be:

```text
https://ricdelgado.github.io/open-stacks-trainer/
```

The local folder may be named `open-stack-trainer` (singular). That does not matter; the GitHub repo and the Vite base path use the plural.

## 3. Connect this folder to GitHub

Choose **one** of these. The coding agent will help; do not push until the M4 gate.

### Option A — GitHub CLI (recommended)

Install GitHub CLI, sign in, and connect the remote (the repo already exists from step 2):

```bash
# Debian/Ubuntu example. Use your distro's package manager if different.
sudo apt install gh

gh auth login
# Choose GitHub.com → HTTPS → login with a browser.

# From this folder:
git remote add origin https://github.com/ricdelgado/open-stacks-trainer.git
```

### Option B — GitHub Desktop

Install [GitHub Desktop](https://desktop.github.com/), sign in, choose **Add existing repository**, select this folder, then **Publish repository** once the first commit exists. This handles authentication for you.

### Option C — HTTPS + personal access token

Add the remote:

```bash
git remote add origin https://github.com/ricdelgado/open-stacks-trainer.git
```

When Git asks for a password, use a **fine-grained personal access token** with read/write access to the repository, not your GitHub password. This is the most manual option; prefer A or B if you are unsure.

## 4. Run the app locally (after M1)

The agent will scaffold the project during M1. After that:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/open-stacks-trainer/`). To preview the production build:

```bash
npm run build
npm run preview
```

## 5. Deploy to GitHub Pages

The workflow is already at `.github/workflows/deploy.yml`.

1. In the GitHub repository: **Settings → Pages → Source = GitHub Actions**.
2. Push `main` (the agent does this at the M4 gate, after your approval).
3. Watch the **Actions** tab. The workflow runs typecheck, tests, the data verifier, and build; it deploys only if they pass.
4. Open <https://ricdelgado.github.io/open-stacks-trainer/>.

The Vite base path is `/open-stacks-trainer/`. A 404 or missing CSS usually means the base path or the Pages source is wrong.

## 6. Start the next agent

1. Open OpenCode in this folder.
2. Select **DeepSeek V4.1 Flash 1017**.
3. Either paste the whole of `PROMPT.md` as the first message, or say: “Read `PROMPT.md` and execute it, stopping at every gate.”
4. The agent will stop after Setup and after each milestone (M1–M4). At each stop:
   - read what it changed;
   - run the manual checks it lists;
   - reply **OK** / **approved** to continue, or describe the problem.
5. If the session ends, start a new one and paste `CONTINUE.md` (or say: “Read `CONTINUE.md` and continue from the last approved gate”).

The Matt Pocock skills are installed globally. **Do not** rerun `setup-matt-pocock-skills`; the repo configuration is done.

## 7. Protect your data

The app stores everything in your browser. Clearing site data, using a different browser, or changing devices loses it unless you have a backup.

- Use **Export my data** on the Stats page regularly.
- The backup contains your stats **and** your custom stacks.
- **Restore from file** replaces everything after a confirmation. Export first if you are unsure.
- **Delete all data** requires two confirmations. There is no undo.

## Troubleshooting

| Problem | What to do |
|---|---|
| `npm: command not found` | Install Node.js LTS and reopen the terminal. |
| `npm ci` fails | Delete `node_modules` and `package-lock.json`, run `npm install`, then commit the new lockfile. |
| Dev server shows a blank page | Check the browser console and the Vite terminal; the agent should fix it. |
| Live site 404 / missing assets | Check Vite `base` is `/open-stacks-trainer/` and Pages source is GitHub Actions. |
| GitHub Actions fails | Run `npm run typecheck`, `npm test -- --run`, `node scripts/verify-stacks.mjs`, and `npm run build` locally. |
| Editor is hard to use on a phone | Test at 320 px and 375 px; there must be no horizontal scroll and cells must be at least 48 px. |
| Stats look wrong after a rename | Stats are keyed by stack ID; renaming should preserve them. If not, it is a bug; report it. |
| Data disappeared after clearing the browser | Restore your latest backup. Without a backup, browser data is gone. |
| A custom stack is missing after restore | The backup did not contain it; re-import the stack JSON. |
| The agent tries to generate a stack order | Stop it. Built-in data comes only from `data/stacks.json`; see `data/SOURCES.md`. |

## Do not do this

- Do not ask any model to generate, reorder, or “correct” a built-in stack order.
- Do not edit `data/stacks.json` or `data/checksums.json` to make a test pass.
- Do not commit Mi Baraja Personal or any paid stack order, book text, or routine.
- Do not add a backend, accounts, analytics, or tracking.
- Do not add a UI framework or CSS framework.
- Do not push or deploy before the M4 gate.
- Do not install dependencies the agent has not justified.

## File map

```text
PRD.md                    product spec and data contracts
CONTEXT.md                glossary and naming rules
AGENTS.md                 agent operating manual
PROMPT.md                 master implementation prompt
CONTINUE.md               short resume prompt
SETUP.md                  this guide
README.md                 public project description
LICENSE                   MIT
data/stacks.json          verified built-in orders
data/checksums.json       SHA-256 protection
data/SOURCES.md           provenance and verification record
scripts/verify-stacks.mjs runnable data verifier
tests/stacks.test.ts      ready-made Vitest data integrity test
docs/adr/                 architecture decisions
docs/agents/              Matt Pocock repo configuration
.scratch/                 local issue tracker
.github/workflows/        Pages deploy workflow
design discussion.txt     original design interview (history only)
```

## Credits

- **Mnemonica** — Juan Tamariz
- **Aronson stack** — Simon Aronson
- **Memorandum** — Woody Aragón

The project is MIT-licensed. The app was built by AI agents under human direction; see the **Built with AI** section in `README.md`.
