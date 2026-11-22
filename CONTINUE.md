# Continue prompt

Paste this into a new OpenCode session in this repository, with DeepSeek V4.1 Flash 1017 selected.

---

Read `AGENTS.md`, `PRD.md`, `CONTEXT.md`, and `PROMPT.md`. Then inspect the repo state:

```bash
git log --oneline -10
git status --short --branch
git remote -v
```

Do not redo approved work. Do not rerun `setup-matt-pocock-skills`; it is already configured. Determine the last completed milestone from the commits and files:

- no commits / no `package.json` → start at **Phase 0 / M1**;
- scaffold and menu exist but no training loop → **M2**;
- training exists but no stats/backup → **M3**;
- stats exist but no custom stacks/deploy → **M4**;
- everything exists and is live → **Final**.

If the project exists, run the current checks:

```bash
npm run typecheck
npm test -- --run
npm run build
node scripts/verify-stacks.mjs
```

Report what is done, what is next, and the exact gate checks for the human. Then continue from the next milestone in `PROMPT.md`, stopping at its gate and waiting for explicit approval.

Rules that still apply: never generate or edit built-in stack data, keep position 1 as the top, save every answer immediately, do not push before the M4 gate, and do not add scope.
