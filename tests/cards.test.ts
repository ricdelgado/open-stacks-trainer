import { describe, expect, it } from "vitest";
import {
  cardFaceText,
  FULL_DECK,
  isCardCode,
  isRedCard,
  parseCardCode,
} from "../src/domain/cards";
import { cardAccessibleLabel } from "../src/ui/card-labels";

describe("card notation", () => {
  it("describes a complete deck", () => {
    expect(FULL_DECK).toHaveLength(52);
    expect(new Set(FULL_DECK).size).toBe(52);
    expect(FULL_DECK).toContain("10H");
    expect(FULL_DECK).not.toContain("TH");
  });

  it.each([
    ["AS", "A♠", false],
    ["10H", "10♥", true],
    ["KD", "K♦", true],
    ["7C", "7♣", false],
  ])("renders %s as %s", (code, face, red) => {
    expect(cardFaceText(code)).toBe(face);
    expect(isRedCard(code)).toBe(red);
    expect(cardFaceText(code)).not.toContain("T");
  });

  it("gives cards accessible names", () => {
    expect(cardAccessibleLabel("7D")).toBe("seven of diamonds");
    expect(cardAccessibleLabel("10S")).toBe("ten of spades");
    expect(cardAccessibleLabel("AC")).toBe("ace of clubs");
  });

  it("parses valid cards and rejects invalid ones", () => {
    expect(parseCardCode("QC")).toEqual({ rank: "Q", suit: "C" });
    expect(parseCardCode("1S")).toBeNull();
    expect(parseCardCode("11H")).toBeNull();
    expect(parseCardCode("")).toBeNull();
    expect(isCardCode("10D")).toBe(true);
    expect(isCardCode("TD")).toBe(false);
  });
});
