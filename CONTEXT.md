# CONTEXT — Open Stacks Trainer

This is the project glossary. Use these terms exactly in code, UI strings, tests, issues, and documentation. If a concept is missing, add it here before inventing a synonym.

## Product

**Open Stacks Trainer** — a free, static, browser-only trainer for memorized card stacks. No accounts, no server, no spaced repetition.

**Basic mode** — the only training mode in v1: one shuffled pass through all 52 positions, one prompt at a time, self-graded after reveal.

**Future modes** — Quartets (Pit Hartling), ACAAN, Endless, and Cyclic stacks. Visible in the mode selector as disabled “later” entries, never implemented in v1.

## Core vocabulary

**Stack** — an ordered list of 52 unique playing cards. Position 1 is the top card of the face-down deck; position 52 is the bottom. Use “stack,” not “deck,” when referring to the order.

**Built-in stack** — one of the three shipped, verified stacks: Mnemonica (Juan Tamariz), Aronson (Simon Aronson), Memorandum (Woody Aragón). Read-only in the app.

**Custom stack** — a user-created or user-imported stack stored in the browser. It has a stable ID, a unique name, and an order. Never committed to the repository.

**Position** — a number from 1 to 52 identifying a card’s place in the stack. Use “position,” not “index.” Position 1 is the top of the face-down deck.

**Card code** — canonical storage notation: rank + suit letter, e.g. `AS`, `10H`, `7D`. Ranks are `A 2 3 4 5 6 7 8 9 10 J Q K`; suits are `S H C D`.

**Card face** — the human-facing rendering of a card: rank + suit glyph, e.g. `A♠`, `10♥`, `7♦`. The UI always shows `10`, never `T`. Hearts and diamonds are red; spades and clubs are black.

**Card rank** — the value of a card (`A`, `2`–`10`, `J`, `Q`, `K`). Do not use “rank” to mean position.

**Direction** — which side is asked first:
- `position-to-card` — front is the position, back is the card.
- `card-to-position` — front is the card, back is the position.
- `mixed` — each session item gets a direction at random, 50/50, fixed for that item.

**Session** — one shuffled pass of all 52 positions, with no repeats. Use “session,” not “round” or “quiz.”

**Item** — one position/card pair inside a session, with its position, card, and direction.

**Front** — the prompt shown before the answer is revealed.

**Back** — the answer shown after reveal.

**Reveal** — the action of showing the back. Triggered by the **Answer** button, Space, or Enter.

**Grade** — the user’s self-assessment after reveal: **Got it** (correct) or **Missed** (incorrect). There is no automatic grading.

**Miss** — a graded incorrect answer. Use “miss,” not “wrong” or “failure.”

**Miss log / recent misses** — the last 20 misses for a stack, newest first, each with card, position, direction, and timestamp. Stored so a future “drill my recent misses” mode can use it.

**Current streak** — the number of consecutive correct answers for a stack, persisted across sessions. A miss resets it to 0.

**Best streak** — the highest current streak ever recorded for a stack, persisted.

**Session-best streak** — the longest consecutive-correct run inside one session, starting from 0 at session start. Shown on the summary only; separate from the stack’s persisted best streak.

**Summary** — the screen after the 52nd item with correct/missed counts, accuracy, session-best streak, the missed cards, and Train again / Menu.

**Practice day** — one local calendar date (`YYYY-MM-DD`) with the number of cards answered and how many were correct. There is one entry per day.

**Stats** — the persisted per-stack record: current streak, best streak, total answered, total correct, last practiced timestamp, practice days, and recent misses.

**Accuracy** — `totalCorrect / totalAnswered`, displayed as a whole percent. With zero answers, display “—”.

## Data and storage

**Storage key** — the single `localStorage` key `open-stacks-trainer` holding one versioned JSON object.

**Schema version** — the `schemaVersion` field inside the stored JSON. v1 is `1`. Future versions migrate; a newer version must not be overwritten.

**Stack ID** — a stable identifier. Built-ins use `mnemonica`, `aronson`, `memorandum`. Customs use `custom-<uuid>`. Renaming never changes the ID, so stats survive.

**Backup** — a JSON file containing settings, custom stacks, and stats. File format `open-stacks-trainer-backup`.

**Restore** — replacing all current settings, custom stacks, and stats with a backup after confirmation. Restore never merges.

**Stack export** — a JSON file containing one stack (name, creator, order). File format `open-stacks-trainer-stack`. Re-importable through the import screen.

**Delete all data** — a double-confirmed action that removes the storage key, so stats, custom stacks, and settings are gone. Built-in stacks remain because they are code.

**Delete training data** — a per-stack action that removes only that stack’s stats. The custom stack itself remains.

**Write-through** — every graded answer is saved immediately; a reload does not lose completed answers.

## Screens and actions

**Menu** — the main screen: Start training, Stack selector, Mode selector, Stats, My Stacks. A direction control sits inside the Start Training area. Footer shows the AI disclosure.

**Training screen** — the active session: progress (`answered/52`), current streak, direction label, front, Answer, then Missed/Got it after reveal.

**Stats page** — practiced stacks only, most recent first, with per-stack stats and global backup/restore/delete actions.

**My Stacks** — the stack management screen: built-ins (view only) and customs (view, edit, export, delete), plus Create stack and Import stack.

**Editor** — the custom-stack grid: name, suit tabs, card pool, adaptive position grid, pinned selection bar, save. Used cards are greyed out. See the PRD for the exact interaction rules.

**Import** — paste 52 cards in notation or a stack export JSON, validate, name, save as a custom stack.

**View** — the read-only 1–52 order of a stack, with creator credit and export.

## Naming rules

- Say **Open Stacks Trainer** (plural “Stacks”) in UI, README, and docs.
- Say **stack**, **position**, **card**, **session**, **item**, **reveal**, **grade**, **miss**, **streak**, **practice day**, **stats**, **backup**, **restore**.
- Use the exact button labels **Answer**, **Missed**, **Got it**, **Train again**, **Menu**, **Export my data**, **Restore from file**, **Delete all data**, **Delete training data**, **Create stack**, **Import stack**, **Save**.
- Do not use **quiz**, **round**, **level**, **score**, **points**, **wrong**, **failure**, **flashcard** (except when explaining the inspiration in the README), **deck order** (say **stack order**), or **index** (say **position**).
- “Rank” means a card’s value. “Position” means 1–52.

## Invariants

- Every stack has exactly 52 unique valid cards.
- Position 1 is the top of the face-down deck.
- Built-in data is never generated, reordered, or “corrected” by an agent.
- Custom stacks and stats stay in the browser; nothing is uploaded.
- Stats are keyed by stable stack ID.
- Every answer is persisted immediately.
- Built-in stacks are read-only; custom stacks are editable.
- No account, no network, no cookies.

## Relationships

```
Stack (52 ordered cards)
  └── Session (one shuffled pass of 52 items)
        └── Item (position + card + direction)
              └── Reveal → Grade (Got it / Missed)
                    └── Stats update (streak, practice day, recent miss)
```

A stack is data. A session is a temporary consumer of that data. Future modes are additional consumers; they must not change the stack model.
