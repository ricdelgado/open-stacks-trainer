# ADR-0007 — MIT license, mandatory creator credits, and a visible AI disclosure

- **Status:** accepted
- **Date:** 2026-11-21

## Context

The owner wants the code fully open: anyone may use, study, adapt, and redistribute it, and forks may be closed. The stack orders are published facts, not book text, but the creators deserve credit. The project was built by AI agents under human direction, and the owner wants that stated clearly and accurately rather than hidden.

## Decision

- License the code under **MIT** (copyright 2026 ricdelgado). Forks may be closed; changes need not stay open.
- Credit the stack creators in the README and in the app wherever built-ins are listed or viewed:
  - **Mnemonica** — Juan Tamariz;
  - **Aronson stack** — Simon Aronson;
  - **Memorandum** — Woody Aragón.
- Do not reproduce book text, routines, diagrams, or paid stack orders.
- Put a **Built with AI** section near the top of the README, naming the agents and the human, and noting the handoff:
  - Qwen4-Max High (Agent Mode) — initial design interview, stack-order verification, project setup & prompt engineering;
  - DeepSeek V4.1 Flash 1017 on OpenCode — design handoff, final stack verification, setup pack, prompt engineering, and implementation;
  - ricdelgado — concept, design decisions, review & testing.
- Show a visible AI disclosure in the app’s main-menu footer, linking to the repository:
  - “Built with AI agents — Qwen4-Max High + DeepSeek V4.1 Flash 1017”.

## Consequences

- Maximum reuse with minimal legal friction.
- Attribution and AI transparency are part of the product, not an afterthought.
- A contributor who forks the project may close their fork, which is accepted.
- The disclosure must be kept accurate if the set of contributing agents changes.
