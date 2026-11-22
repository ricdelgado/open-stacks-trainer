export const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export const SUITS = ["S", "H", "C", "D"] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];

export interface CardParts {
  rank: Rank;
  suit: Suit;
}

const SUIT_GLYPHS: Record<Suit, string> = {
  S: "♠",
  H: "♥",
  C: "♣",
  D: "♦",
};

export const FULL_DECK: readonly string[] = RANKS.flatMap((rank) =>
  SUITS.map((suit) => `${rank}${suit}`),
);

const FULL_DECK_SET = new Set(FULL_DECK);

export function isCardCode(value: unknown): value is string {
  return typeof value === "string" && FULL_DECK_SET.has(value);
}

export function parseCardCode(code: string): CardParts | null {
  if (code.length < 2) return null;
  const rank = code.slice(0, -1) as Rank;
  const suit = code.slice(-1) as Suit;
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) return null;
  return { rank, suit };
}

export function cardFaceText(code: string): string {
  const parts = parseCardCode(code);
  if (!parts) return code;
  return `${parts.rank}${SUIT_GLYPHS[parts.suit]}`;
}

export function isRedCard(code: string): boolean {
  const parts = parseCardCode(code);
  return parts?.suit === "H" || parts?.suit === "D";
}

export function suitGlyph(suit: Suit): string {
  return SUIT_GLYPHS[suit];
}

