# Stack data provenance

`data/stacks.json` is the single source of truth for the three built-in stacks. The app must import it. No agent may generate, reorder, "correct", or paraphrase these orders.

## Why this file exists

Large language models are good at producing a confident-looking 52-card list and bad at remembering the real one. A single swapped card silently ruins every training session. The orders below were therefore checked against published lists, not recalled from model memory, and the file is protected by:

1. **Two or more independent sources per stack.** Exact full-list matches, plus known landmark positions.
2. **A format check.** Every stack has 52 entries, every entry is a real card, and no card repeats.
3. **A checksum.** SHA-256 over the canonical order string (`order.join(" ")`). Any accidental edit changes the hash.
4. **A runnable verifier.** `node scripts/verify-stacks.mjs` fails loudly on any change.

The original model-recalled Aronson list used during planning was wrong. That is the exact failure this file is designed to prevent.

## Sources checked

Accessed 2026-11-21.

| Stack | Independent full lists | Additional confirmation |
|---|---|---|
| **Mnemonica** — Juan Tamariz | [ULearnMagic](https://ulearnmagic.com/mnemonica-stack-order-juan-tamariz/), [Electricks](https://help.electricks.info/docs/soulmate/mnemonica-stack), [Deck Memorizer](https://www.deckmemorizer.com/mnemonica/browse), [mnemonica.app](https://mnemonica.app/blog/mnemonica-stack-order) | All four full lists agree. Landmarks checked: 1=4♣, 13=Q♣, 26=K♦, 27=2♣, 39=A♦, 52=9♦. |
| **Aronson** — Simon Aronson | [Electricks](https://help.electricks.info/docs/soulmate/aronson-stack), [Deck Memorizer](https://www.deckmemorizer.com/aronson-stack/browse), [mnemonica.app](https://mnemonica.app/blog/aronson-stack-order) | [Simon Aronson's own PDF, *Memories Are Made of This*](http://simonaronson.com/Memories%20Are%20Made%20of%20This.pdf) states that J♠ is #1 and 9♦ is #52. Landmarks checked: 1=J♠, 13=2♦, 26=Q♥, 39=6♥, 52=9♦. |
| **Memorandum** — Woody Aragón | [Electricks](https://help.electricks.info/docs/soulmate/memorandum-stack), [Deck Memorizer](https://www.deckmemorizer.com/memorandum/browse) | Both full lists agree. [Jamy Ian Swiss's Magicana review of *Memorandum*](https://magicana.ca/news/blog/memorandum) confirms #50 is the Q♣. Landmarks checked: 1=J♠, 26=K♥, 39=K♣, 50=Q♣, 52=9♠. |

## Canonical orders and checksums

The canonical card notation is rank + suit letter: `A 2 3 4 5 6 7 8 9 10 J Q K` and `S H C D`. The UI displays suit glyphs (`♠ ♥ ♣ ♦`) and the word `10`, never `T`.

| Stack | SHA-256 of `order.join(" ")` |
|---|---|
| Mnemonica | `4401cd81472fed7cad00858b3929c443ad3afe899e00f8ffed35703b004354d3` |
| Aronson | `3e5422c7d1880019afdc477c0027b737ce3c029ae1aa14bdbf92e61a34f04093` |
| Memorandum | `a0c7d1d20b4e6798e782f3d0edcef986e9440f04dacecc2f766d1d8bded7a000` |

## What is deliberately absent

- **Mi Baraja Personal (Dani DaOrtiz)** is a paid commercial stack. Its order is not published freely and must never be committed here. Users who own it can add it through the in-app custom-stack editor or paste-import; that data stays in their browser.
- **Si Stebbins** is cyclic, so its training model differs. It is a later-version feature, not a v1 built-in.
- **No book text, routines, or diagrams** are reproduced. Only the numerical order of cards is stored, with creator credit.

## Rules for the implementing agent

- Import `data/stacks.json`; do not copy the order into a second hand-written file.
- Never edit `data/stacks.json` or `data/checksums.json` to make a test pass.
- If a change to built-in data is ever requested, update the source table above, the JSON, the checksum, `scripts/verify-stacks.mjs`, and `tests/stacks.test.ts` together, and treat it as a reviewed data change.
- Keep the in-app creator credits: Juan Tamariz, Simon Aronson, Woody Aragón.
