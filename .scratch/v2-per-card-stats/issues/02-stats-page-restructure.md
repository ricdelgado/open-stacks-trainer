# 02 — Stats page restructure

**What to build:** The Stats page becomes a stack-focused screen with the required action order, a practiced-stack selector, and practiced-mode tabs.

**Blocked by:** 01 — Storage schema v2 and mode-split stats; `v2-training-modes-and-controls/02 — Card +3 mode`.

**Status:** ready-for-agent

- [ ] The page order is: title → subtitle → **Back to menu** → stack selector → mode tabs → stack data → **Delete training data** → per-card table area → **Export my data**, **Restore from file**, **Delete all data** → **Back to menu** again.
- [ ] The first **Back to menu** is the first clickable element after the title and subtitle.
- [ ] The stack selector lists only stacks with at least one answer in any mode.
- [ ] The stack selector is hidden when only one stack has been practiced.
- [ ] Stacks are sorted by the maximum `lastPracticedAt` across their modes, descending, then by name.
- [ ] Mode tabs show only modes with at least one answer for the selected stack.
- [ ] Mode tabs are hidden when only one mode has been practiced.
- [ ] The default stack is the most recently practiced stack; the default mode is that stack’s most recently practiced mode.
- [ ] Selection is in-memory only and resets to the defaults on a fresh visit.
- [ ] Changing stack selection resets the mode to that stack’s most recently practiced mode.
- [ ] Stack data shows the stack name, built-in creator, mode figures, practice days, recent misses, and **Delete training data**.
- [ ] **Delete training data** removes every mode for the selected stack after one confirmation; the custom stack itself remains.
- [ ] Global actions remain available in the empty state and appear at the bottom.
- [ ] The empty state shows the friendly message, both back controls, and the global actions; no stack or mode selectors appear.
- [ ] Orphan stats for a missing stack are hidden and never crash the page.
- [ ] Keyboard order matches the visual order; the page does not scroll horizontally at 320 px or 375 px.
- [ ] Tests cover practiced-only filtering, selector hiding, defaults, stack/mode switching, delete-all-modes, empty state, and orphan stats.
- [ ] Typecheck, tests, build, and the stack verifier pass.
