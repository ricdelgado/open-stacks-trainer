# Open Stacks Trainer

A free, static, browser-only trainer for memorized card stacks. Train **Mnemonica**, **Aronson**, **Memorandum**, or your own stack by recalling card ↔ position pairs. No account, no server, no cookies, no analytics, no spaced repetition.

**Live site:** https://ricdelgado.github.io/open-stacks-trainer/

**Install it:** open the live site and use the **Install as app** card on the menu when it appears, or **Add to Home Screen** on Android/Chrome / **Share → Add to Home Screen** on iOS. After the first load it opens and trains offline.

## Built with AI

This project was coded by AI coding agents, under human direction:

- **Qwen4-Max High** (Agent Mode) — initial design interview, stack-order verification, project setup & prompt engineering
- **DeepSeek V4.1 Flash 1017** on OpenCode — design handoff, final stack verification, setup pack, prompt engineering, and implementation
- **ricdelgado** — concept, design decisions, review & testing

The original design interview and prompt plan were produced by Qwen4-Max High. The handoff, final data verification, setup pack, and implementation were completed by DeepSeek V4.1 Flash 1017 on OpenCode.

## What it does

- **Three verified built-in stacks:** Mnemonica, Aronson, Memorandum.
- **Three directions:** position → card, card → position, or mixed.
- **Three modes:** **Basic** asks one card or position at a time. **Next 3 cards** asks for the next three cards after the front card, wrapping from position 52 back to 1. **Quartets** asks for the first card and the three distances between the four cards of each rank.
- **Self-graded with a quiet timer:** reveal the answer, then tap **Got it** or **Missed**. A Got it answer records recall time; no typing, no spaced repetition.
- **Extra practice:** **Reinforcement** brings missed cards or ranks back, **Accelerate** brings slow cards back above a chosen threshold, and **Endless** continues in batches of two shuffled passes until you quit.
- **Streaks and stats:** current streak, best streak, accuracy, practice days, recent misses, average time, and a per-card table (per-rank for Quartets) with sorting and reinforcement progress.
- **Practice calendar:** a global heatmap at the top of Stats shows every practiced day, scaled to your busiest day.
- **Light and dark themes:** a warm paper interface in light or dark, with a system-following default and an explicit **Appearance** setting.
- **Installable and offline:** add the app to your home screen, launch it standalone, and train offline after the first load.
- **Training settings:** a collapsible panel on the menu holds Reinforcement, Accelerate, and Endless; changes save immediately.
- **Settings:** the app language and appearance live here.
- **Languages:** English and Português (Brasil) now; Spanish, Italian, and Japanese are next.
- **Custom stacks:** build one in a phone-friendly grid editor, or paste-import 52 cards. Export and re-import as JSON.
- **Backup and restore:** export all stats, settings, and custom stacks, restore on another browser.
- **Private by design:** everything stays in `localStorage`; there are no network requests after the assets load and no account, cookies, or analytics.
- **Mobile-first:** large tap targets, no horizontal scrolling, a warm light or dark interface, and inline SVG icons instead of image assets.

Position 1 is the **top** of the face-down deck; position 52 is the bottom.

## Stack credits

- **Mnemonica** — Juan Tamariz
- **Aronson stack** — Simon Aronson
- **Memorandum** — Woody Aragón

Only the published card orders are used. No book text, routines, or diagrams are reproduced. The orders are verified against multiple published sources and protected by checksums; see [`data/SOURCES.md`](data/SOURCES.md).

Si Stebbins is not included because it is cyclic and needs a different training model.

## Typeface

**Source Serif 4** is by Adobe, licensed under the SIL Open Font License 1.1. See [`public/fonts/SourceSerif4-OFL.txt`](public/fonts/SourceSerif4-OFL.txt).

## Development

Requires Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev          # local dev server
npm run build        # production build
npm run preview      # preview the production build
npm run typecheck    # tsc --noEmit
npm test -- --run    # unit tests, one pass
npm run test:watch   # unit tests, watch mode
node scripts/verify-stacks.mjs
```

The app is plain Vite + vanilla TypeScript + Vitest. No UI framework, no CSS framework, no backend.

## Deployment

The site is a static build deployed to GitHub Pages by GitHub Actions on every push to `main`.

1. In the repository: **Settings → Pages → Source = GitHub Actions**.
2. Push to `main`. The workflow runs typecheck, tests, the stack-data verifier, and build; it deploys only if they pass.
3. The project-site base path is `/open-stacks-trainer/`, set in the Vite config.

## Data integrity

`data/stacks.json` is the single source of truth for the built-in orders. Do not edit it to make a test pass. `data/checksums.json` and `scripts/verify-stacks.mjs` exist to catch accidental changes. The provenance and verification record is in [`data/SOURCES.md`](data/SOURCES.md).

## Project documents

- [`.scratch/`](.scratch/) — current feature specs and local issue tickets.
- [`CONTEXT.md`](CONTEXT.md) — living glossary and naming rules.
- [`AGENTS.md`](AGENTS.md) — operating manual for coding agents.
- [`docs/adr/`](docs/adr/) — architecture decision records.
- [`docs/history/PRD-v1.md`](docs/history/PRD-v1.md) — historical v1 product requirements and data contracts.
- [`PROMPT.md`](PROMPT.md) — historical v1 build prompt.

## Roadmap

Not yet: ACAAN, cyclic stacks (Si Stebbins), drill-my-misses, Spanish, Italian, and Japanese UI, duplicate-as-template, and Accelerate for Quartets.

## License

MIT. See [`LICENSE`](LICENSE).
