import { isRedCard, parseCardCode, suitGlyph } from "../domain/cards";
import { cardAccessibleLabel } from "./card-labels";
import { el } from "./elements";

export type CardSize = "small" | "normal" | "large";

export function createCardFace(code: string, size: CardSize = "normal"): HTMLElement {
  const parts = parseCardCode(code);
  const card = el(
    "span",
    `card-face card-face--${size} ${
      isRedCard(code) ? "card-face--red" : "card-face--black"
    }`,
  );
  card.setAttribute("role", "img");
  card.setAttribute("aria-label", cardAccessibleLabel(code));

  if (!parts) {
    card.append(el("span", "card-face__rank", code));
    return card;
  }

  card.append(
    el("span", "card-face__rank", parts.rank),
    el("span", "card-face__suit", suitGlyph(parts.suit)),
  );
  return card;
}
