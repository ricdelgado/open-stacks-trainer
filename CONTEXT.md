# CONTEXT — Open Stacks Trainer

This is the project glossary. Use these terms exactly in code, UI strings, tests, issues, and documentation. If a concept is missing, add it here before inventing a synonym.

## Product

**Open Stacks Trainer** — a free, static, browser-only trainer for memorized card stacks. No accounts, no server, no spaced repetition.

**Mode** — the training variant whose stats are tracked separately. v2 modes are **Basic** and **Next 3 cards**; v3 adds **Quartets**. Stats are keyed by stack ID and then by mode. Endless is a session modifier, not a mode: it counts toward the active mode.

**Basic mode** — one shuffled pass through all 52 positions, one prompt at a time, self-graded after reveal. The v1 mode and the v2 default.

**Next 3 cards mode** — one 52-item pass. The internal mode value stays `card-plus-3`. The front follows the direction: a position or a card. The back is always the next three cards after the front card’s position, wrapping 52 → 1. One grade covers the triple. Only the front card updates per-card stats.

**Quartets mode** — the mode whose internal value is `quartets`. One shuffled pass of the 13 ranks; the front is the rank, the back is the first card and the three distances; no direction. Stats have their own bucket and use per-rank records.

**Endless** — a modifier, not a mode. A Basic or Next 3 cards batch has 104 regular items: two independent shuffled passes of all 52 positions. A Quartets batch has 26 regular items: two independent shuffled passes of the 13 ranks. A fresh batch starts without a summary until the user quits. Stats go to the active mode record, and the screen shows “Answered N.”

**Future modes** — ACAAN is a later mode. Cyclic stacks need a different model and are out of scope. Quartets ships in v3 as `quartets`.

**Appearance** — the Settings option **Light**, **Dark**, or **System**; default **System**. Stored as `settings.appearance`.

**Theme** — the resolved light or dark token set, applied as `data-theme` on `<html>`. **System** resolves through the OS preference; the string `system` is never written to the attribute.

**Language** — a UI locale stored in `settings.language`. Codes are `en`, `pt-BR`, `es`, `it`, and `ja`. English is the default, the source dictionary, and the fallback. Only languages with a complete dictionary appear in Settings → Language.

**Locale dictionary** — one typed object per language with exactly the English key shape, including functions for interpolated strings. Card codes and suit glyphs stay language-neutral; stack names and creator names are not translated.

**Locale formatting** — dates, times, numbers, decimals, and percentages use the selected language. Dates persist as ISO or `YYYY-MM-DD`; only display formatting changes.

## Core vocabulary

**Stack** — an ordered list of 52 unique playing cards. Position 1 is the top card of the face-down deck; position 52 is the bottom. Use “stack,” not “deck,” when referring to the order.

**Built-in stack** — one of the three shipped, verified stacks: Mnemonica (Juan Tamariz), Aronson (Simon Aronson), Memorandum (Woody Aragón). Read-only in the app.

**Custom stack** — a user-created or user-imported stack stored in the browser. It has a stable ID, a unique name, and an order. Never committed to the repository.

**Position** — a number from 1 to 52 identifying a card’s place in the stack. Use “position,” not “index.” Position 1 is the top of the face-down deck.

**Card code** — canonical storage notation: rank + suit letter, e.g. `AS`, `10H`, `7D`. Ranks are `A 2 3 4 5 6 7 8 9 10 J Q K`; suits are `S H C D`.

**Card face** — the human-facing rendering of a card: rank + suit glyph, e.g. `A♠`, `10♥`, `7♦`. The UI always shows `10`, never `T`. Hearts and diamonds are red; spades and clubs are black.

**Card rank** — the value of a card (`A`, `2`–`10`, `J`, `Q`, `K`). Do not use “rank” to mean position.

**Quartet** — the four cards of one rank, described by a first card, three distances, and four positions.

**First card** — the card right after the cut at the largest cyclic gap; the counting start for the quartet.

**Distance** — the number of cards between consecutive members of a quartet, read from the first card forward; three per quartet.

**Cut** — the conceptual deck rotation placed at the largest gap so all four cards of a rank group as closely as possible.

**Direction** — which side is asked first:
- `position-to-card` — front is the position, back is the card.
- `card-to-position` — front is the card, back is the position.
- `mixed` — each session item gets a direction at random, 50/50, fixed for that item.

**Session** — one training run. Basic and Next 3 cards normally cover one shuffled pass of all 52 positions, with no repeats; Quartets covers the 13 ranks once. An Endless session continues in batches until quit. Use “session,” not “round” or “quiz.”

**Item** — one prompt inside a session. For Basic and Next 3 cards it is a position/card pair with its position, card, and direction; for Quartets it is a rank with its first card, distances, and positions.

**Extra prompt** — a scheduled Reinforcement or Accelerate prompt inserted between regular items. It uses the active mode, is graded once, and counts in totals, streaks, practice days, recent misses, and per-card or per-rank stats.

**Planned total** — the regular items plus every scheduled extra prompt. Basic and Next 3 cards show `answered/total`, Quartets shows `answered/13`, and Endless shows “Answered N.”

**Front** — the prompt shown before the answer is revealed.

**Back** — the answer shown after reveal.

**Reveal** — the action of showing the back. Triggered by the **Answer** button, Space, or Enter.

**Grade** — the user’s self-assessment after reveal: **Got it** (correct) or **Missed** (incorrect). There is no automatic grading.

**Miss** — a graded incorrect answer. Use “miss,” not “wrong” or “failure.”

**Miss log / recent misses** — the last 20 misses for a stack and mode, newest first. Card modes store card, position, direction, and timestamp; Quartets stores rank, first card, distances, and timestamp. Stored so a future “drill my recent misses” mode can use it.

**Per-card record** — per stack and mode, stored by card code: current streak, times missed, elapsed tenths, correct timed answers, and reinforcement flag. A missing record means zeros.

**Per-rank record** — the Quartets analogue of a per-card record, keyed by rank: current streak, times missed, elapsed tenths, correct timed answers, and reinforcement flag. A missing record means zeros.

**Card streak** — the per-card consecutive Got it count within a mode, reset by a miss. Distinct from the stack-level current streak. For Quartets, the equivalent is the per-rank streak.

**Reinforcement** — a weak-card or weak-rank flag: set after a miss, cleared after five consecutive correct answers for that card or rank.

**Reinforcement list** — the per stack and mode set of cards flagged for reinforcement, or ranks in Quartets. Extra reinforcement prompts appear after every 3–8 regular items. The Stats per-card or per-rank table shows `x/5` while a card or rank is listed.

**Accelerate** — a global toggle that schedules extra prompts for slow cards. A card qualifies when its mode average is strictly greater than the chosen threshold (0.5s, 1s, 2s, or 3s) and it has at least one timed Got it answer. Extra accelerate prompts appear after every 2–4 regular items, after any reinforcement prompt due at the same gap. Accelerate is unavailable for Quartets.

**Elapsed time** — recall time measured in tenths of a second. A Got it answer records it; a Missed answer records no time. Per-card average is elapsed tenths divided by correct timed answers; Quartets uses the same calculation per rank. The on-screen timer is floored to whole seconds, stops on reveal, and pauses while the document is hidden.

**Current streak** — the number of consecutive correct answers for a stack, persisted across sessions. A miss resets it to 0.

**Best streak** — the highest current streak ever recorded for a stack, persisted.

**Session-best streak** — the longest consecutive-correct run inside one session, starting from 0 at session start. Shown on the summary only; separate from the stack’s persisted best streak.

**Summary** — the screen after a completed session or an Endless Quit, with correct/missed counts out of the answered total, accuracy, session-best streak, average time, the missed cards or ranks, and Train again / Menu.

**Practice day** — one local calendar date (`YYYY-MM-DD`) with the number of cards or ranks answered and how many were correct. There is one entry per day.

**Stats** — the persisted record for one stack and one mode: current streak, best streak, total answered, total correct, last practiced timestamp, practice days, recent misses, and per-card records (per-rank records for Quartets).

**Accuracy** — `totalCorrect / totalAnswered`, displayed as a whole percent. With zero answers, display “—”.

## Data and storage

**Storage key** — the single `localStorage` key `open-stacks-trainer` holding one versioned JSON object.

**Schema version** — the `schemaVersion` field inside the stored JSON. v1 is `1`; v2 is `2`; v3 is `3`. A v1 payload migrates automatically into the Basic bucket and then through v2 to v3; a newer version must not be overwritten. v3 adds the `quartets` mode, per-rank records, and the two miss-record shapes, and it preserves `appearance` and `installCardDismissed`.

**Install prompt** — the browser event or iOS instructions that add the app to the home screen. Dismissal is stored as `settings.installCardDismissed` inside the payload; it is never a second key.

**Service worker** — the production-only cached app shell that enables offline use. It is registered only in production and is never active in the dev server.

**Stack ID** — a stable identifier. Built-ins use `mnemonica`, `aronson`, `memorandum`. Customs use `custom-<uuid>`. Renaming never changes the ID, so stats survive.

**Backup** — a JSON file containing settings, custom stacks, and stats. File format `open-stacks-trainer-backup`.

**Restore** — replacing all current settings, custom stacks, and stats with a backup after confirmation. Restore never merges.

**Stack export** — a JSON file containing one stack (name, creator, order). File format `open-stacks-trainer-stack`. Re-importable through the import screen.

**Delete all data** — a double-confirmed action that removes the storage key, so stats, custom stacks, and settings are gone. Built-in stacks remain because they are code.

**Delete training data** — a per-stack action that removes every mode’s stats for that stack, including per-card and reinforcement data. The custom stack itself remains.

**Write-through** — every graded answer is saved immediately; a reload does not lose completed answers.

## Screens and actions

**Menu** — the main screen: Start training, Stack selector, Direction selector (hidden for Quartets), collapsible Training settings, Mode selector, Stats, My Stacks, then How to use this app and Settings. It also shows a dismissible **Install as app** card when the app can be installed. Footer shows the AI disclosure.

**Training screen** — the active session: progress (`answered/planned total`, or “Answered N” in Endless), current streak, direction label (not shown for Quartets), quiet timer, mode label for Next 3 cards and Quartets, an optional Reinforcement indicator beside the timer, front, Answer, then Missed/Got it after reveal. For Quartets, the front is the rank and the back is the first card, the three distances, and the four positions.

**Stats page** — stack-focused, per mode: a global **Practice calendar** at the top, then stack selector, mode tabs, per-mode figures, collapsible practice days / recent misses / per-card table, and global backup/restore/delete actions. The table can sort by stack order, Reinforcement, slowest average, most missed, or lowest streak; for Quartets, a per-rank table replaces the per-card table.

**Practice calendar** — the global heatmap at the top of Stats; one square per day, weeks as rows, five intensity levels, aggregated across every stack and mode.

**My Stacks** — the stack management screen: built-ins (view only) and customs (view, edit, export, delete), plus Create stack and Import stack.

**Editor** — the custom-stack grid: name, suit tabs, card pool, adaptive position grid, pinned selection bar, save. Used cards are greyed out. See `docs/history/PRD-v1.md` for the v1 interaction rules.

**Import** — paste 52 cards in notation or a stack export JSON, validate, name, save as a custom stack.

**Settings** — the whole-app settings area reached from the bottom of the menu. It holds Language and Appearance (Light / Dark / System). Training settings are a collapsible panel on the menu under Direction and hold the persisted Reinforcement, Accelerate (with threshold), and Endless toggles; Accelerate is unavailable for Quartets. Changes save immediately.

**View** — the read-only 1–52 order of a stack, with creator credit and export.

## Naming rules

- Say **Open Stacks Trainer** (plural “Stacks”) in UI, README, and docs.
- Say **stack**, **position**, **card**, **session**, **item**, **reveal**, **grade**, **miss**, **streak**, **practice day**, **stats**, **backup**, **restore**.
- Use the exact button labels **Answer**, **Missed**, **Got it**, **Train again**, **Menu**, **Export my data**, **Restore from file**, **Delete all data**, **Delete training data**, **Create stack**, **Import stack**, **Save**, **Show earlier**, and **Install as app**.
- Use the exact setting labels **Reinforcement**, **Accelerate**, **Endless**, **Slow card threshold**, **Appearance**, **Light**, **Dark**, **System**, and **Settings**.
- Use the exact mode and section labels **Quartets**, **Practice calendar**, **Less**, and **More**.
- Show language names in their own language: **English**, **Português (Brasil)**, **Español**, **Italiano**, **日本語**.
- Do not use **quiz**, **round**, **level**, **score**, **points**, **wrong**, **failure**, **flashcard** (except when explaining the inspiration in the README), **deck order** (say **stack order**), or **index** (say **position**).
- “Rank” means a card’s value. “Position” means 1–52.

## Invariants

- Every stack has exactly 52 unique valid cards.
- Position 1 is the top of the face-down deck.
- Built-in data is never generated, reordered, or “corrected” by an agent.
- Custom stacks and stats stay in the browser; nothing is uploaded.
- Stats are keyed by stable stack ID and then mode.
- Every answer is persisted immediately.
- Quartets are derived from the stack order at runtime; they are never stored as stack data, in `localStorage`, or in backups.
- Built-in stacks are read-only; custom stacks are editable.
- No account, no network, no cookies.

## Relationships

```
Stack (52 ordered cards)
  └── Session (one shuffled pass of 52 items, or 13 ranks for Quartets)
        └── Item (position + card + direction, or rank + first card + distances)
              └── Reveal → Grade (Got it / Missed)
                    └── Stats update (mode streak, per-card or per-rank record, practice day, recent miss)
```

A stack is data. A session is a temporary consumer of that data. Future modes are additional consumers; they must not change the stack model.
