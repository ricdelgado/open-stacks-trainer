# 03 — Reinforcement and Settings Training

**What to build:** A global Reinforcement toggle makes recently missed cards appear more often, and the app gains the Settings hub with a Training sub-page.

**Blocked by:** `v2-per-card-stats/01 — Storage schema v2 and mode-split stats`; `02 — Card +3 mode`.

**Status:** ready-for-agent

- [ ] A compact Settings button appears in the menu header.
- [ ] How to use this app moves to the bottom of the menu content, above the footer.
- [ ] Settings opens a hub with a Training entry; the hub is structured so the Language entry and sub-page can be added later by the localization feature area.
- [ ] Training opens a sub-page with Back to Settings.
- [ ] The Training page has a global Reinforcement toggle, off by default and persisted.
- [ ] The reinforcement list is per stack + mode and is stored with the mode stats.
- [ ] A Missed answer adds the front card to its list and resets its consecutive Got it count to 0.
- [ ] A Got it answer advances the count; five consecutive Got it answers remove the card from the list.
- [ ] All graded answers count toward the five, including normal, insert, and Endless prompts.
- [ ] Reinforcement candidates are fixed at session start; a card missed during the current session is eligible in the next session.
- [ ] In Endless, candidates refresh at each 104-item regular batch boundary when Endless exists.
- [ ] Extra prompts are inserted after every 3–8 regular items, inclusive, with a fresh gap after each insert.
- [ ] Selection is uniform from the current list, avoiding the same card twice in a row when the list has more than one card.
- [ ] The planned session total includes all reinforcement inserts; no insert appears after the last regular item.
- [ ] Each reinforcement prompt uses the active mode and direction, is graded once, and updates stats normally.
- [ ] A small muted “Reinforcement” badge appears above the front.
- [ ] If the list is empty, no reinforcement prompts are scheduled and the Training page shows a short hint.
- [ ] Tests with an injected random source cover add/reset, five-streak removal, per-mode separation, gap range, planned total, no immediate repeat, and empty list.
- [ ] Typecheck, tests, build, and the stack verifier pass.
