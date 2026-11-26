# v3 practice calendar (stats heatmap)

## Problem Statement

The Stats page lists practice days as text, which makes a practice habit hard to see. Users want an Anki-style calendar: one small square per day, weeks shown as rows, with intensity reflecting how much they practiced, and a tap for the day's numbers. This makes consistency visible at a glance and rewards showing up.

## Solution

Add a global **Practice calendar** at the top of the Stats page:

- seven columns, Monday to Sunday, weeks as rows going down, newest week at the bottom;
- the last 26 weeks by default, with a **Show earlier** control;
- five intensity levels of the amber accent (one empty plus four steps), scaled to the personal busiest day in the visible window;
- tapping or focusing a day shows its date, answers, and correct count;
- aggregates every stack and every mode;
- reads the existing `practiceDays` data, so there is no schema change;
- works in the light and dark themes.

## User Stories

1. As a user, I want a calendar of my practice days, so that I can see my consistency.
2. As a user, I want one square per day, so that the pattern is easy to read.
3. As a user, I want weeks as rows, so that time flows downward like a log.
4. As a user, I want the newest week at the bottom, so that recent practice is closest to the rest of the page.
5. As a user, I want darker squares for busier days, so that intensity is visible without numbers.
6. As a user, I want intensity scaled to my own busiest day, so that the calendar suits my volume.
7. As a user, I want to show earlier weeks, so that I can look back beyond the last half year.
8. As a user, I want to tap a day to see the date and counts, so that I can check a specific day.
9. As a user, I want the calendar to count every stack and mode, so that it reflects my whole habit.
10. As a user, I want an empty state before I have practiced, so that the section is not confusing.
11. As a user, I want the calendar to use the app's theme, so that it is readable in light and dark.
12. As a user, I want weekday labels, so that I can find a specific day.
13. As a user, I want keyboard access to the squares, so that I can inspect days without a mouse.
14. As a user, I want no horizontal scrolling, so that the calendar fits my phone.
15. As a user, I want the day details in plain text, so that I do not have to read a tooltip.
16. As a maintainer, I want the aggregation and intensity as pure functions with an injected "today", so that tests are deterministic.
17. As a maintainer, I want the calendar to read existing data with no schema change, so that the feature stays small.
18. As a user, I want the calendar labeled in my language, so that it matches the rest of the app.

## Implementation Decisions

### Data aggregation (pure domain)

- New module `src/domain/practice-calendar.ts`; no DOM, no storage.
- Input: `AppState.stats` (all stacks and modes) and an injected `today: Date`.
- Output: a grid model with, per day: `date` (`YYYY-MM-DD`), `answered`, `correct`, `level` (0–4), and grid coordinates (week index, weekday index Monday=0).
- Sum `answered` and `correct` per date across every `stats[stackId][mode].practiceDays`. A date appears at most once per mode, so the calendar sums across modes.
- Use local calendar dates exactly as recorded (`formatLocalDate`); never re-interpret time zones.
- The window ends with the current week. Start with the last 26 weeks: from the Monday 25 weeks before this week's Monday through today. Always start on a Monday so columns align.
- Future days in the current week are rendered as empty, non-interactive placeholders so the final row is complete.
- Days before any recorded practice are still shown as empty within the window.

### Intensity model

- `maxAnswered` = the largest `answered` value among days in the currently visible window.
- Level 0 for a day with zero answers (the track color).
- For a practiced day, `ratio = answered / maxAnswered`; level = 1 when `ratio ≤ 0.25`, 2 when `≤ 0.5`, 3 when `≤ 0.75`, otherwise 4.
- Four amber steps plus the empty level; the steps are the same accent in both themes.
- Recompute levels when the window expands (so **Show earlier** may recolor the grid). If `maxAnswered` is 0, every day is level 0.

### Layout and interaction

- Section heading **Practice calendar**, placed at the top of `renderStats`, above the existing stack/mode figures. It is global, not per stack or per mode.
- A weekday header row (Mon–Sun, localized single letters or short names), then weeks as rows downward, newest last.
- The section subtitle shows the visible range, for example `Jun – Nov 2026`, localized.
- Each practiced day is a `<button>` with an accessible name such as "26 Nov 2026: 34 answered, 30 correct". Empty days are non-focusable placeholders. Future days are disabled and `aria-hidden`.
- Visual cell: a rounded square (`--radius-cell` = 6px), colored by level. A focus ring uses the standard focus token.
- Tapping or focusing a day updates an inline details panel below the grid (not a tooltip, not a modal): date, answered, correct, and accuracy. Default selection: today, or the most recent practiced day if today has none.
- **Show earlier** expands the window by 26 more weeks per activation, up to the earliest recorded practice day (and no further). The control is hidden when no earlier data exists.
- A small legend shows **Less** → **More** with the five swatches, localized.
- UI state (expanded window, selected day) is in-memory only; it does not persist.
- At 320 px, seven columns yield roughly 38–40 px wide cells. Cells are at least 40 px wide and 44 px tall, growing at 375 px and above. The 44×44 tap-target rule applies to primary controls; a strict 44 px width for a seven-column chart would force horizontal scrolling, which is forbidden. The inline details panel is the primary inspection target, and every cell is keyboard reachable. This is a deliberate, documented exception for a dense visualization.

### Placement and existing stats

- Do not reorder or remove the existing per-mode figures, practice-day list, recent-misses list, per-card/per-rank tables, or backup/restore/delete actions.
- The calendar is additive at the top of the page and works with the existing practiced-stack and mode selection.
- It counts all practice regardless of which stack or mode is currently selected.

### Theming and localization

- Use the UI-refresh tokens. Level 0 uses `--surface-soft` (the track); levels 1–4 use the amber accent at roughly 28%, 50%, 75%, and 100% strength, legible in both themes. Labels use `--ink` and `--muted`.
- New strings go to the central strings module and are complete in `en` and `pt-BR`: heading, weekday labels, range, **Show earlier**, **Less**/**More**, details labels, empty state, and accessible-name templates.
- The i18n key-parity test must pass.

### Empty state

- If there are no practice days at all, render the grid as all level 0 plus a short message such as "No practice yet. Finish a session and your days will appear here." The section is not hidden, so users learn it exists.

## Testing Decisions

- Pure aggregation tests with an injected `today`:
  - sums across multiple stacks and modes on the same date;
  - ignores modes without practice;
  - window starts on a Monday and covers 26 weeks ending with the current week;
  - includes today; handles Sunday and Monday boundaries;
  - handles month and year rollover and a leap day;
  - future days in the current week are marked non-interactive.
- Intensity tests: zeros map to level 0; the busiest day maps to level 4; boundaries at 25/50/75% map to 1/2/3; `maxAnswered = 0` yields all zeros; recompute after expansion.
- Expansion tests: **Show earlier** adds 26 weeks; hidden when the earliest practice day is already visible; stops at the earliest day.
- Selection/detail tests: default selection is today or the latest practiced day; selection produces the correct details text inputs.
- i18n key-parity tests pass for the new keys.
- DOM smoke at 320 px, 375 px, and desktop: no horizontal scroll; cells at least 40×44 px at 320; keyboard focus updates the details panel; both themes are readable; the empty state renders.
- No schema or backup changes, so storage, migration, and backup tests remain unchanged.

## Out of Scope

- Per-stack or per-mode calendar filters (possible follow-up).
- Year view, monthly totals, charts beyond the day grid, or annotations.
- Exporting the calendar as an image.
- Changing how practice days are recorded or stored.
- Streak calendars or habit reminders.
- Languages beyond English and Português (Brasil).

## Further Notes

- Depends on `v3-ui-refresh` for the tokens, shapes, and themes. It has no dependency on Quartets or the PWA work.
- Uses existing `practiceDays`; no schema change and no new storage field.
- Update `CONTEXT.md` (Practice calendar) and the README feature list and roadmap when this ships.
