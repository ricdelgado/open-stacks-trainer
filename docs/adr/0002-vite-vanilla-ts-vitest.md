# ADR-0002 — Vite + vanilla TypeScript + Vitest, no UI framework

- **Status:** accepted
- **Date:** 2026-11-21

## Context

The app is small: a menu, a training loop, stats, and a custom-stack editor. It must be static, cheap to host, easy for an AI agent to modify, and safe against silent data/logic errors. A UI framework would add moving parts and bundle size for little benefit at this size. A single hand-written HTML file would become a 2,000-line tangle and offer no type or test safety net.

## Decision

Use **Vite + vanilla TypeScript + Vitest**:

- Vite bundles the source into static assets and provides a live dev server.
- TypeScript strict mode catches wrong property names and type errors before runtime.
- Vitest provides fast unit tests for data integrity, parsing, storage, session generation, and scoring.
- Plain DOM APIs and small render functions; no React/Svelte/Vue.
- Hash-based routing, because GitHub Pages has no SPA rewrite.
- npm as package manager; commit the lockfile.

## Consequences

- Small bundle and few dependencies.
- The agent gets type and test guardrails without framework conventions to learn.
- Screens are hand-rendered; each screen must clean up its own listeners.
- Future modes can reuse the pure domain modules.
- If the app grows much larger, a framework may be reconsidered, but not in v1.
