# ADR-0001 — v1 is basic mode only; the stack model stays mode-agnostic

- **Status:** accepted
- **Date:** 2026-11-21

## Context

The product will eventually grow Quartets (Pit Hartling), ACAAN, Endless, and Cyclic-stack training. Building those now would multiply the UI, session model, and test surface before the core trainer is proven. At the same time, a v1 design that hard-codes “one session = one pass of 52” into the stack data would make later modes expensive.

## Decision

- v1 implements only **Basic mode**: one shuffled pass through all 52 positions, self-graded.
- Future modes appear in the mode selector as disabled “later” entries, but are not implemented.
- A **stack** is only an ordered list of 52 cards plus identity and credit. A **session** is a temporary consumer of that stack. Future modes are additional consumers and must not change the stack model.
- Domain logic for cards, stack validation, and session generation is kept pure and separate from screens.

## Consequences

- v1 ships sooner with a smaller, better-tested surface.
- Quartets/ACAAN/endless/cyclic can be added later without migrating stack data.
- Some UI affordances (mode selector) exist before their modes do; they must be clearly disabled.
- Si Stebbins and other cyclic stacks are explicitly out of v1 because their training model differs.
