# Domain Docs

How the engineering skills should consume this repo’s domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the project glossary and naming rules.
- **`PRD.md`** at the repo root — the v1 product spec and data contracts.
- **`docs/adr/`** — read ADRs that touch the area you are about to work in.
- **`data/SOURCES.md`** — before touching stack data or tests that assert it.

If a file does not exist, proceed silently; do not flag its absence. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates domain docs lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (this one):

```
/
├── CONTEXT.md
├── PRD.md
├── docs/adr/
│   ├── 0001-....md
│   └── 0002-....md
└── src/
```

This is a single-context repo. Do not add `CONTEXT-MAP.md` or per-package context files unless the project genuinely becomes a monorepo.

## Use the glossary’s vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

Examples: use **stack** (not deck order), **position** (not index), **session** (not round), **miss** (not wrong), **Got it / Missed** (exact labels), **practice day**, **recent misses**.

If the concept you need is not in the glossary yet, that is a signal: either you are inventing language the project does not use (reconsider) or there is a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0003 (built-in stack data provenance) — but worth reopening because…_

## Data and product docs are part of the domain

- `PRD.md` is the v1 product spec; v2 feature specs live under `.scratch/<feature>/spec.md`.
- `data/stacks.json` is the verified built-in data. Never regenerate or “correct” it.
- `data/SOURCES.md` records provenance. A change to built-in data is a reviewed change, not a test fix.
