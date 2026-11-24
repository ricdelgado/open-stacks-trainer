# v2 per-card stats

## Problem Statement

Stats are currently stored once per stack. That is enough for Basic training, but it cannot answer three new questions:

- How did the user perform in **Basic** versus **Card +3**?
- Which cards are slow, frequently missed, or close to leaving the reinforcement list?
- Which cards should be ranked by average elapsed time?

The Stats page also needs to change from one long list of practiced stacks into a stack-focused view with a stack selector, mode tabs, per-card data, and the requested action order.

## Solution

Move storage to `schemaVersion: 2`, split stats by stack and mode, and add per-card metrics. Rebuild the Stats page around one selected stack and one selected mode, with a responsive per-card table and sorting. Preserve v1 data through automatic migration and keep backup/restore safe.

## User Stories

1. As a user, I want my existing Basic progress to survive the update, so that I do not lose streaks or practice history.
2. As a user, I want Basic and Card +3 stats kept separate, so that each mode’s accuracy and streaks mean something.
3. As a user, I want Endless sessions to count toward the active mode, so that Endless is a session modifier rather than a third set of stats.
4. As a user, I want the Stats page to open on my most recently practiced stack, so that the useful data appears first.
5. As a user, I want a stack selector only when I have practiced more than one stack, so that the page stays simple.
6. As a user, I want mode tabs only for modes I have actually practiced, so that I never see empty tabs.
7. As a user, I want **Back to menu** to be the first clickable control after the title and subtitle, so that leaving the page is obvious.
8. As a user, I want a second **Back to menu** after the global actions, so that I can leave from either end of the page.
9. As a user, I want per-stack **Delete training data** to remove every mode for that stack, so that resetting a stack is one action.
10. As a user, I want the per-card table in stack order, so that I can compare cards by position.
11. As a user, I want to see each card’s current streak, reinforcement progress, times missed, and average elapsed time, so that I can spot weak cards.
12. As a user, I want to sort by average time, so that the slowest cards rise to the top.
13. As a user, I want to sort by times missed and by lowest streak, so that I can find weak cards without reading all 52 rows.
14. As a user, I want cards with no timed answers to show `—` and sort last, so that missing data is not confused with a fast time.
15. As a phone user, I want the table to become readable two-line rows instead of scrolling sideways, so that it works at 320 px.
16. As a user, I want the global **Export my data**, **Restore from file**, and **Delete all data** actions at the bottom, so that destructive actions are not the first thing I tap.
17. As a user, I want v1 backups to restore and migrate, so that old backup files remain useful.
18. As a user, I want newer backups refused without changing anything, so that a future version cannot damage my data.
19. As a screen-reader user, I want card rows and sort controls to have clear names, so that the table is usable without sight.
20. As a maintainer, I want schema validation and tests around migration, restore, and per-card updates, so that data loss is caught before release.

## Implementation Decisions

### Storage shape

Move to `schemaVersion: 2`. The payload keeps one `localStorage` key and this shape:

```json
{
  "schemaVersion": 2,
  "settings": {
    "selectedStackId": "mnemonica",
    "direction": "mixed",
    "mode": "basic",
    "reinforcement": false,
    "accelerate": false,
    "accelerateThresholdTenths": 10,
    "endless": false,
    "language": "en"
  },
  "customStacks": [],
  "stats": {
    "mnemonica": {
      "basic": {
        "stackId": "mnemonica",
        "mode": "basic",
        "currentStreak": 0,
        "bestStreak": 0,
        "totalAnswered": 0,
        "totalCorrect": 0,
        "lastPracticedAt": "2026-11-21T12:00:00.000Z",
        "practiceDays": [],
        "recentMisses": [],
        "cards": {
          "AS": {
            "currentStreak": 0,
            "timesMissed": 0,
            "elapsedTenths": 0,
            "correctTimedAnswers": 0,
            "inReinforcement": false
          }
        }
      },
      "card-plus-3": {}
    }
  }
}
```

- Stats are keyed by stack ID and then by mode. Modes are `basic` and `card-plus-3`.
- Endless is not a mode. Endless answers update the active Basic or Card +3 record.
- `settings.mode` is persisted and defaults to `basic`.
- The toggle and language fields are owned by their feature tickets; the v2 schema reserves them.
- Per-card records use card codes and survive custom-stack renames and reordering.
- `elapsedTenths` and `correctTimedAnswers` are non-negative safe integers. The average is `elapsedTenths / correctTimedAnswers`, computed on demand.
- `inReinforcement` is true after a miss and false after five consecutive Got it answers.
- Missing card records are treated as zeros and `—` for average time.

### Migration and backups

- A v1 payload is migrated automatically: `stats[stackId]` becomes `stats[stackId].basic`; existing settings are preserved; new settings get defaults.
- Per-card records start empty after migration because v1 did not store per-card history. The UI shows `0` and `—` until new answers arrive.
- Backups keep `format: "open-stacks-trainer-backup"` and `formatVersion: 1`, with `schemaVersion: 2`.
- Restore accepts schema v1 (migrates) and v2. It refuses newer schema or format versions with a plain message and changes nothing.
- Restore still replaces the whole payload; it never merges.
- Delete all data removes the key and resets settings, custom stacks, and all mode stats.
- Delete training data for a stack removes every mode for that stack, including per-card records and reinforcement flags. The stack itself stays.

### Stats page

Required order:

1. Title.
2. Subtitle/lead.
3. **Back to menu** (first clickable element).
4. Stack selector, only when more than one stack has `totalAnswered > 0` in any mode.
5. Mode tabs, only when more than one mode has `totalAnswered > 0` for the selected stack.
6. Stack data: name, creator for built-ins, mode figures, practice days, recent misses, **Delete training data**.
7. Per-card table.
8. **Export my data**, **Restore from file**, **Delete all data**.
9. **Back to menu** again.

- Practiced stacks are sorted by the maximum `lastPracticedAt` across their modes, descending, then by name.
- The default stack is the most recently practiced stack; the default mode is that stack’s most recently practiced mode.
- Selection is in-memory only and resets to the defaults on a fresh visit.
- Orphan stats for a deleted stack stay stored but are hidden.
- Empty state: when no stack has answers, show the friendly empty message, the global actions, and both back controls. No selectors.
- If only one stack is practiced, hide the stack selector and show its stats directly.
- If only one mode is practiced for the selected stack, hide the mode tabs.

### Per-card table

- 52 rows in current stack order, including cards with no data.
- Columns: Position, Card, Current streak, Reinforcement, Times missed, Average time.
- Card rendering uses the existing typographic card face and accessible card name.
- Current streak is the mode-specific consecutive Got it count.
- Reinforcement is `x/5` while `inReinforcement` is true, otherwise `—`.
- Times missed is the mode-specific cumulative count from v2 onward.
- Average time shows one decimal and a localized unit; no timed answers show `—`.
- Sort control: Stack order (default), Slowest average first, Most missed, Lowest streak.
- Cards with no average sort after cards with an average in the slowest view.
- Changing stack or mode resets sorting to Stack order.
- At phone widths, each row becomes two compact lines with labels; no horizontal scrolling. At desktop widths, a conventional table layout is allowed.
- Sort controls and rows are keyboard reachable with accessible names.

## Testing Decisions

- Test external behavior: migration output, restored state, visible stats, row order, and sort order.
- Storage tests: v1 to v2 migration; defaults for new fields; safe-integer validation; corrupt data still not silently wiped; newer schema refused.
- Backup tests: v2 round-trip; v1 backup migration; invalid backup changes nothing; newer version refused.
- Stats selectors: practiced-only stacks, practiced-only modes, one-stack/one-mode hiding, most-recent defaults, deletion falling back safely.
- Table tests: 52 rows, column values, `—` handling, default order, all sort modes, stable tie-breaking by position.
- Responsive check at 320 px and 375 px with no horizontal scroll.
- Reuse the existing pure domain and fake-storage seams; do not add a browser end-to-end suite.

## Out of Scope

- Per-card accuracy percentage or per-card history charts.
- Cross-stack rankings.
- Per-mode **Delete training data**.
- Pagination or virtualized tables.
- Editing stack order from the Stats page.
- Comparing two stacks or modes side by side.
- Time-series graphs.

## Further Notes

- This feature area owns the shared schema. Training features and settings depend on it.
- The v1 PRD remains the historical Basic specification; these v2 documents describe the new behavior.
- Update `CONTEXT.md` with the new vocabulary as part of implementation, and add an ADR for the mode-split schema.
