# ADR-0005 — Mobile-first custom-stack editor: suit tabs + adaptive position grid

- **Status:** accepted
- **Date:** 2026-11-21

## Context

The original editor idea was 4 rows of 13 cards plus 4 rows of 13 positions. On a phone that means roughly 26 px cells and horizontal scrolling — both below the 44–48 px minimum tap target and a recipe for mis-taps. The editor still needs to preserve the fast “pick a card, then pick its position” order and the visual grouping by suit.

## Decision

Use **suit tabs plus an adaptive position grid**:

- Card pool: four suit tabs ♠ ♥ ♣ ♦; within a tab, A→K. Used cards are greyed out, disabled, and show the position where they are placed. Each tab shows how many cards remain.
- On desktop, the tabs expand into all four suit rows at once (the original 4×13 layout).
- Position grid: 52 cells, adaptive columns (6 on phone, up to 13 on desktop, intermediate widths allowed), cells at least 48×48 px, never horizontal scrolling.
- A pinned selection bar always shows the selected card and a clear-selection action.
- Interaction rules:
  - tap an unused card → select;
  - tap the selected card again → deselect;
  - tap an empty position with a selection → assign and clear the selection;
  - tap a filled position with no selection → clear and return the card to the pool;
  - tap a filled position with a selection → replace, return the old card, assign the new one, clear the selection.
- Save requires a valid unique name and all 52 positions assigned; the button shows progress until then.
- No drag-and-drop, auto-fill, or duplicate-as-template in v1.

## Consequences

- No horizontal scrolling and tappable cells at every phone and desktop width.
- Suit grouping remains the fast way to find a card, and the card→number tap order is preserved.
- The page can be tall on a phone; the pinned bar keeps context and the position grid is the only large scroll.
- The editor is more complex than a single 4×13 grid but far less error-prone on touch.
