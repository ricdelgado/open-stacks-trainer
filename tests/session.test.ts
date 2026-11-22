import { describe, expect, it } from "vitest";
import { getBuiltInStack } from "../src/data/stacks";
import { generateSession, type Rng } from "../src/domain/session";

function order(): readonly string[] {
  const stack = getBuiltInStack("mnemonica");
  if (!stack) throw new Error("Missing fixture stack.");
  return stack.order;
}

function seededRandom(seed: number): Rng {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
}

describe("session generation", () => {
  it("uses all 52 positions and cards exactly once", () => {
    const session = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "position-to-card",
      random: seededRandom(7),
    });

    expect(session.items).toHaveLength(52);
    expect(new Set(session.items.map((item) => item.position)).size).toBe(52);
    expect(new Set(session.items.map((item) => item.card)).size).toBe(52);
    expect(session.items.every((item) => item.position >= 1 && item.position <= 52)).toBe(true);
  });

  it("maps each position to the card at that position", () => {
    const session = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "position-to-card",
      random: seededRandom(11),
    });
    for (const item of session.items) {
      expect(item.card).toBe(order()[item.position - 1]);
    }
  });

  it("respects each fixed direction", () => {
    const positionToCard = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "position-to-card",
      random: seededRandom(1),
    });
    const cardToPosition = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "card-to-position",
      random: seededRandom(1),
    });

    expect(positionToCard.direction).toBe("position-to-card");
    expect(positionToCard.items.every((item) => item.direction === "position-to-card")).toBe(true);
    expect(cardToPosition.items.every((item) => item.direction === "card-to-position")).toBe(true);
  });

  it("splits mixed direction 50/50 and fixes it per item", () => {
    const session = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "mixed",
      random: seededRandom(42),
    });
    const forward = session.items.filter(
      (item) => item.direction === "position-to-card",
    );
    const reverse = session.items.filter(
      (item) => item.direction === "card-to-position",
    );

    expect(forward).toHaveLength(26);
    expect(reverse).toHaveLength(26);
  });

  it("is deterministic with an injected random source", () => {
    const options = {
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "mixed" as const,
    };
    const first = generateSession({ ...options, random: seededRandom(99) });
    const second = generateSession({ ...options, random: seededRandom(99) });
    const different = generateSession({ ...options, random: seededRandom(100) });

    expect(second).toEqual(first);
    expect(different.items).not.toEqual(first.items);
  });

  it("rejects an invalid stack order", () => {
    expect(() =>
      generateSession({
        stackId: "bad",
        stackName: "Bad",
        order: ["AS", "AS"],
        direction: "mixed",
      }),
    ).toThrow("52 cards");
  });
});
