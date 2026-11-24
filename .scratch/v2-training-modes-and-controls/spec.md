# v2 training modes and controls

## Problem Statement

v1 offers one Basic mode: a single shuffled pass of 52 positions, self-graded after reveal. It does not measure recall speed, does not adapt to missed or slow cards, and always ends at 52 items. Users cannot practice longer chunks of a stack (Card +3), focus on weak cards (Reinforcement), focus on slow cards (Accelerate), or train without a fixed session length (Endless).

This feature area adds those training behaviors. It depends on the v2 mode-split storage schema and feeds the per-card stats and localization work.

## Solution

Add:

- a quiet per-item timer and per-card elapsed-time capture;
- a persisted **Card +3** mode;
- global **Reinforcement**, **Accelerate**, and **Endless** settings under a new Settings → Training page;
- scheduled extra prompts that appear inside a session;
- a summary that reflects the planned session length and average time.

Endless is a modifier, not a mode. Stats remain split by **Basic** and **Card +3**, and Endless answers update the active mode.

## User Stories

1. As a user, I want to see a small timer while I recall, so that I know my pace without being distracted.
2. As a user, I want the timer to stop when I reveal the answer, so that grading time is not counted.
3. As a user, I want the timer to pause when I leave the app, so that a phone call does not ruin my average.
4. As a user, I want the final time to stay visible during grading, so that I can see how I did.
5. As a user, I want the timer to reset for each new prompt, so that each card is measured separately.
6. As a user, I want the summary to show my average time for the session, so that I can compare sessions.
7. As a user, I want a Card +3 mode, so that I can practice the cards that follow any card or position.
8. As a user, I want the Card +3 answer to wrap from 52 back to 1, so that every prompt has exactly three answer cards.
9. As a user, I want to grade a Card +3 prompt once, so that the flow stays fast.
10. As a user, I want Card +3 to respect Position → card, Card → position, and Mixed, so that I can train the retrieval path I need.
11. As a user, I want the app to remember my mode, so that I do not reselect it every time.
12. As a user, I want a Reinforcement toggle, so that cards I miss appear more often.
13. As a user, I want a missed card to leave the reinforcement list after five consecutive Got it answers, so that I stop seeing cards I have recovered.
14. As a user, I want reinforcement prompts spaced unpredictably, so that the session does not become predictable.
15. As a user, I want an Accelerate toggle, so that cards that take me longer appear more often.
16. As a user, I want to choose the Accelerate threshold (0.5s, 1s, 2s, 3s), so that “slow” matches my level.
17. As a user, I want to see whether a prompt is Reinforcement or Accelerate, so that the repetition makes sense.
18. As a user, I want Reinforcement and Accelerate to coexist predictably, so that both needs are handled.
19. As a user, I want an Endless toggle, so that I can keep training past 52 prompts.
20. As a user, I want Endless to use two shuffled passes of the stack, so that cards repeat without becoming chaotic.
21. As a user, I want Endless to avoid the same front card twice in a row when possible, so that it feels varied.
22. As a user, I want Endless to show how many answers I have given, so that I know the session size.
23. As a user, I want Quit in Endless to confirm and then show a summary, so that I can review what I did.
24. As a user, I want the normal 52-item Quit behavior unchanged, so that an interrupted Basic session still discards the unfinished session.
25. As a user, I want the summary denominator to include scheduled extra prompts, so that accuracy matches the work I actually did.
26. As a user, I want Extra prompts to count in streaks, practice days, recent misses, and per-card stats, so that they are real practice.
27. As a user, I want the mode, toggles, threshold, and Endless choice saved, so that my setup persists.
28. As a user, I want Settings reachable from the menu header, so that I can change training behavior quickly.
29. As a user, I want How to use this app moved to the bottom, so that the main training controls stay prominent.
30. As a keyboard user, I want the existing shortcuts to work in every mode, so that I can train without a mouse.
31. As a maintainer, I want session plans to be deterministic under an injected random source, so that scheduling is testable.
32. As a maintainer, I want timer calculations to use an injected clock, so that timing tests are stable.

## Implementation Decisions

### Modes and session model

- Modes are `basic` and `card-plus-3`. The mode selector enables both; future modes stay disabled with the “later” label.
- `settings.mode` persists. Default is Basic.
- A normal session has 52 regular items, one per position, in a Fisher–Yates shuffle. Direction is fixed or mixed exactly as in v1.
- Extra Reinforcement/Accelerate prompts are inserted between regular items and are included in a precomputed planned total.
- A session item carries: position, card, direction, and an optional insert kind (`reinforcement` or `accelerate`).
- No extra prompt is inserted after the last regular item.
- Gaps are counted over regular items only. Extra prompts do not reset or advance the gap scheduler.
- The planner is pure and accepts an injected random source.

### Card +3

- One 52-item pass. The item’s front follows the direction:
  - position → card: front is the position; back is the next three cards.
  - card → position: front is the card; back is the next three cards.
  - mixed: choose per item, fixed for that item.
- “Next three” means the cards at positions `P+1`, `P+2`, `P+3` after the front card’s position `P`, wrapping `52 → 1`.
- The back is always three card faces, never positions, in this mode.
- Show the three cards in one compact row that fits 320 px without horizontal scrolling.
- One Got it/Missed covers the triple.
- Card +3 has its own mode stats, per-card records, streaks, practice days, recent misses, and reinforcement list.
- Only the front card receives per-card time/streak/miss data.
- The summary’s missed list shows the front card and position.
- Keyboard behavior is identical to Basic.

### Timer

- The timer starts when a new front is rendered and stops on reveal (Answer button, Space, or Enter).
- It pauses while `document.hidden` is true and resumes when visible.
- Elapsed time is measured in tenths of a second (`Math.round(milliseconds / 100)`).
- The visible value is floored whole seconds (for example 12.9s shows `12s`).
- The stopped time stays visible during grading.
- The timer has a small, muted, non-animated appearance near the progress/streak line.
- The ticking value is not a live region. On reveal, announce the final time once through the existing polite announcement path.
- A Missed grade records no elapsed time. A Got it grade records the stopped time.
- Quitting or reloading before grading records no time for that item.

### Per-card elapsed time

- Per-card timing is per stack + mode.
- Store `elapsedTenths` (non-negative safe integer) and `correctTimedAnswers` (non-negative safe integer). Average is `elapsedTenths / correctTimedAnswers`.
- Only a Got it answer updates the sum and count.
- A Missed answer leaves the average unchanged.
- Cards with no timed answers show `—`.
- Per-card data updates from Basic, Card +3, and Endless sessions in the active mode.
- The session summary adds one Average time figure computed from the session’s Got it answers only, shown to one decimal.

### Reinforcement

- Global toggle in Settings → Training; default off; persisted.
- The reinforcement list is per stack + mode.
- A Missed answer adds the card to its list and resets its consecutive Got it count to 0.
- A Got it answer advances the count; at 5 consecutive Got it the card leaves the list.
- Every graded answer counts, including normal, Reinforcement, Accelerate, and Endless prompts.
- Candidates are fixed at session start. A card missed during the current session becomes eligible in the next session.
- In Endless, candidates refresh at each 104-item regular batch boundary.
- If the list is empty at session start, no reinforcement prompts are scheduled.
- Extra prompts appear after every 3–8 regular items, inclusive, with a fresh gap after each insert.
- Choose uniformly from the current stack+mode list, avoiding the same card twice in a row when the list has more than one card.
- Each reinforcement prompt uses the active mode and direction, is graded once, and updates stats normally.
- Show a small muted “Reinforcement” badge above the front.
- The Stats per-card table shows reinforcement progress as `x/5` while in the list, otherwise `—`.

### Accelerate

- Global toggle in Settings → Training; default off; persisted.
- Threshold choices are 0.5s, 1s, 2s, 3s; stored as 5, 10, 20, or 30 tenths. Default 1s. The threshold controls appear only when the toggle is on.
- A card is eligible when its mode-specific average is strictly greater than X and `correctTimedAnswers > 0`.
- Candidates are fixed at session start, or refreshed at each Endless batch boundary.
- Extra prompts appear after every 2–4 regular items, inclusive, with a fresh gap.
- Choose uniformly from eligible cards, avoiding the same card twice in a row when possible.
- If both Reinforcement and Accelerate are due at the same point, ask the reinforcement prompt first, then the accelerate prompt.
- Each accelerate prompt uses the active mode and direction, is graded once, and updates stats normally.
- Show a small muted “Accelerate” badge above the front.
- If no card qualifies, schedule no accelerate prompts and show a short hint in Settings.

### Endless

- Global toggle in Settings → Training; default off; persisted.
- Endless is a modifier, not a mode. It works with Basic and Card +3.
- A batch contains 104 regular items: two independent shuffled passes of all 52 positions.
- Avoid the same front card twice in a row within a batch, including across the two passes. Avoid it across batch boundaries and around extra prompts when an alternative exists.
- When the 104 regular items are exhausted, build a fresh batch and continue without a visible break or summary.
- Show “Answered N” instead of `N/total`; keep the current streak and direction label.
- Extra prompts add to the answered count and the summary.
- Quit asks for confirmation, then opens the summary. It does not return straight to the menu.
- The summary is based on answers given: correct, missed, accuracy, session-best streak, missed list, Average time, Train again, and Menu.
- Normal 52-item Quit behavior stays unchanged: confirm, discard the unfinished session, keep graded stats, return to the menu.

### Settings, menu, and summary

- Add a compact Settings button in the menu header.
- Move How to use this app to the bottom of the menu content, above the footer.
- Introduce the Settings hub and the Training sub-page with the three toggles and the Accelerate threshold.
- Settings changes save immediately and persist.
- Training screen shows: progress, persisted current streak, quiet timer, direction, mode label when Card +3, optional insert badge, front, Answer, then the back and Missed/Got it.
- Summary shows: correct/missed out of the planned total, accuracy, session-best streak, Average time, missed list, Train again, Menu.
- Train again starts the same stack, direction, mode, and toggles with a fresh shuffle.
- Existing keyboard shortcuts work in all modes and all insert kinds.
- All new text lives in the central strings module.

## Testing Decisions

- Test external behavior through pure domain seams.
- Session generator: 52 items; no duplicate positions/cards; direction split; Card +3 front/back and wrap; planned total with extras; no insert after the last regular item; gap ranges 3–8 and 2–4; Reinforcement-before-Accelerate order; no adjacent duplicate front card when avoidable.
- Timer: injected clock; start/stop; pause/resume while hidden; tenths rounding; floored display; Missed does not update averages.
- Per-card stats: sum/count incremental average; safe-integer guard; mode separation; Card +3 front-card-only attribution.
- Reinforcement: add/reset on miss; advance/remove at five; per stack+mode lists; start-of-session snapshot; Endless batch refresh.
- Accelerate: strict `>` threshold; eligibility requires a timed correct answer; threshold persistence; no candidates means no inserts.
- Endless: 104-item batches; two full passes; no adjacent duplicate; fresh batch; `Answered N`; quit summary; stats bucket is the active mode.
- Summary: denominator includes extras; average uses Got it only; Train again preserves settings.
- DOM smoke: timer appearance, insert badges, Card +3 three-card row at 320 px, no horizontal scroll, keyboard flow.
- Reuse the existing injected RNG and clock patterns.

## Out of Scope

- Quartets, ACAAN, cyclic stacks, or other future modes.
- Spaced repetition, scheduling, points, timers with countdown, or typed answers.
- Continuous Reinforcement/Accelerate updates inside a session (candidates refresh only at session/batch boundaries).
- Per-mode Delete training data.
- Re-queueing missed cards inside the normal 52-item pass.
- Configurable gap ranges.
- Sound, animation, or celebration effects.
- Translating the new strings; localization is a later feature area.

## Further Notes

- This feature area depends on the v2 mode-split schema from `v2-per-card-stats`.
- The Stats table and sorting depend on the per-card data produced here.
- Update `CONTEXT.md`, the in-app help, and the README after the behavior is stable, before localization begins.
- The v1 PRD remains the historical Basic specification; these v2 documents describe the new behavior.
