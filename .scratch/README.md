# Local issue tracker

This directory is the repo's local-markdown issue tracker, configured by `docs/agents/issue-tracker.md`.

- The v1 product spec is the root-level `PRD.md`.
- Future feature specs go in `.scratch/<feature-slug>/spec.md`.
- Tickets go in `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`.
- Record triage state as a `Status:` line near the top of each ticket (see `docs/agents/triage-labels.md`).
- Append conversation history under a `## Comments` heading.

Do not create GitHub issues unless the human asks to switch the tracker.
