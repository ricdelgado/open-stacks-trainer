import { parseCardCode } from "../domain/cards";
import { strings } from "../strings";

export function cardAccessibleLabel(code: string): string {
  const parts = parseCardCode(code);
  if (!parts) return code;
  return strings.cards.accessibleName(
    strings.cards.rankNames[parts.rank],
    strings.cards.suitNames[parts.suit],
  );
}
