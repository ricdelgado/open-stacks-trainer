# ADR-0003 — Built-in stack data is verified, checked in, and never model-generated

- **Status:** accepted
- **Date:** 2026-11-21

## Context

A memorized stack is an arbitrary 52-card order. A single wrong card silently ruins training. Language models produce plausible-looking orders from memory and are unreliable at this task: during design, a model-recalled Aronson order was wrong at several positions. Built-in data must therefore be treated as reviewed data, not generated code.

## Decision

- Ship exactly three built-ins: **Mnemonica** (Juan Tamariz), **Aronson** (Simon Aronson), **Memorandum** (Woody Aragón).
- The orders are verified against multiple independent published lists, checked for 52 unique valid cards, spot-checked at known landmark positions, and protected by SHA-256 checksums.
- The verified data lives in one file and is imported by the app; no second hand-copied order is allowed.
- `scripts/verify-stacks.mjs` fails on any data or checksum change.
- No agent may generate, reorder, “correct,” or paraphrase built-in data. A data change is a reviewed change that updates the source record, JSON, checksum, and verifier together.
- Position 1 is the top of the face-down deck; position 52 is the bottom.
- Paid stacks (e.g., Mi Baraja Personal by Dani DaOrtiz) are never committed. Users add them through custom stacks in their browser.
- Si Stebbins is excluded from v1 because it is cyclic.

## Consequences

- Training cannot be poisoned by a hallucinated order.
- The repository can publish the three orders as facts with creator credit; no book text or routines are reproduced.
- The implementing agent spends no time “researching” stack orders and must not touch the data to make tests pass.
- Adding a built-in in the future requires the same verification and review process.
