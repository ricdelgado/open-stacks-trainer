# ADR-0006 — GitHub Pages hosting with a test-gated Actions deploy

- **Status:** accepted
- **Date:** 2026-11-21

## Context

The app must be free to host, static, public, and easy for a non-technical owner to operate. GitHub Pages fits and the owner already has a GitHub account (`ricdelgado`). A project site is served from `https://ricdelgado.github.io/open-stacks-trainer/`, so assets need a non-root base path. A deploy of broken code would be worse than no deploy.

## Decision

- Host on **GitHub Pages** at `https://ricdelgado.github.io/open-stacks-trainer/`.
- Set Vite’s `base` to `/open-stacks-trainer/`.
- Deploy with a **GitHub Actions** workflow on push to `main` (and manual dispatch):
  - checkout;
  - Node setup;
  - `npm ci`;
  - typecheck;
  - unit tests;
  - stack-data verifier;
  - build;
  - upload the Pages artifact;
  - deploy.
- Deploy only if typecheck, tests, and build pass.
- Use hash routing so deep links work without a Pages rewrite.
- No server, no database, no secrets in the workflow.
- Work on `main` locally and push at the end of M4, so the first deploy is the reviewed build.

## Consequences

- Free, reliable static hosting with a public URL.
- A red build never reaches production.
- The base path is a common failure point; it is part of the M4 gate and must be verified on the live URL.
- The workflow requires `package-lock.json`; it must be committed.
- Pages must be set to “GitHub Actions” as the source in the repository settings.
