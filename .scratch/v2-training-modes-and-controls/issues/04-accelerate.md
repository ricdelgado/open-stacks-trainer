# 04 — Accelerate

**What to build:** A global Accelerate toggle makes cards whose average recall time exceeds a chosen threshold appear more often.

**Blocked by:** `03 — Reinforcement and Settings Training`.

**Status:** ready-for-agent

- [ ] The Settings → Training page has a global Accelerate toggle, off by default and persisted.
- [ ] When the toggle is on, four threshold buttons appear: 0.5s, 1s, 2s, 3s; default 1s.
- [ ] When the toggle is off, the threshold buttons are hidden.
- [ ] The threshold is stored as 5, 10, 20, or 30 tenths and persists.
- [ ] A card is eligible when its mode-specific average is strictly greater than X and it has at least one timed Got it answer.
- [ ] Accelerate candidates are fixed at session start.
- [ ] The scheduler exposes a refresh seam for Endless to refresh candidates at each 104-item regular batch boundary.
- [ ] Extra prompts appear after every 2–4 regular items, inclusive, with a fresh gap after each insert.
- [ ] Selection is uniform from eligible cards, avoiding the same card twice in a row when possible.
- [ ] The planned total includes accelerate inserts; no insert appears after the last regular item.
- [ ] If Reinforcement and Accelerate are both due, the reinforcement prompt appears first, then the accelerate prompt.
- [ ] Each accelerate prompt uses the active mode and direction, is graded once, and updates stats normally.
- [ ] A small muted “Accelerate” badge appears above the front.
- [ ] If no card qualifies, no accelerate prompts are scheduled and the Training page shows a short hint.
- [ ] Tests cover strict `>`, the timed-answer requirement, threshold persistence, gap range, planned total, both-due ordering, no immediate repeat, and no-candidate behavior.
- [ ] Typecheck, tests, build, and the stack verifier pass.
