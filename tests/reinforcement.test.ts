import { describe, expect, it } from "vitest";
import { getBuiltInStack } from "../src/data/stacks";
import {
  planReinforcementInserts,
  REINFORCEMENT_MAX_GAP,
  REINFORCEMENT_MIN_GAP,
} from "../src/domain/reinforcement";
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

describe("reinforcement inserts", () => {
  it("schedules nothing when the list is empty", () => {
    expect(
      planReinforcementInserts({
        candidates: [],
        regularCount: 52,
        random: () => 0,
      }),
    ).toEqual([]);
  });

  it("uses inclusive gaps of 3 to 8 regular items", () => {
    const inserts = planReinforcementInserts({
      candidates: ["AS"],
      regularCount: 52,
      random: seededRandom(21),
    });

    expect(inserts.length).toBeGreaterThan(0);
    let previous = 0;
    for (const insert of inserts) {
      const gap = insert.afterRegular - previous;
      expect(gap).toBeGreaterThanOrEqual(REINFORCEMENT_MIN_GAP);
      expect(gap).toBeLessThanOrEqual(REINFORCEMENT_MAX_GAP);
      previous = insert.afterRegular;
    }
  });

  it("starts a fresh gap after every insert", () => {
    const inserts = planReinforcementInserts({
      candidates: ["AS"],
      regularCount: 10,
      random: () => 0,
    });

    expect(inserts.map((insert) => insert.afterRegular)).toEqual([3, 6, 9]);
  });

  it("never inserts after the last regular item", () => {
    expect(
      planReinforcementInserts({
        candidates: ["AS"],
        regularCount: 3,
        random: () => 0,
      }),
    ).toEqual([]);

    const inserts = planReinforcementInserts({
      candidates: ["AS"],
      regularCount: 10,
      random: () => 0.999,
    });
    expect(inserts.every((insert) => insert.afterRegular < 10)).toBe(true);
  });
});

describe("reinforcement session generation", () => {
  function generate(
    reinforcementCandidates: readonly string[],
    random: Rng,
    mode: "basic" | "card-plus-3" = "basic",
  ) {
    return generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "position-to-card",
      mode,
      reinforcementCandidates,
      random,
    });
  }

  it("keeps the 52 regular items and adds planned inserts", () => {
    const session = generate(["AS", "KS"], seededRandom(5));
    const regular = session.items.filter((item) => !item.insert);
    const inserts = session.items.filter((item) => item.insert);

    expect(regular).toHaveLength(52);
    expect(new Set(regular.map((item) => item.position)).size).toBe(52);
    expect(inserts.length).toBeGreaterThan(0);
    expect(session.items.at(-1)?.insert).toBeUndefined();
  });

  it("uses the active mode and direction for each insert", () => {
    const session = generate(["AS", "KS"], seededRandom(9), "card-plus-3");
    const inserts = session.items.filter((item) => item.insert);

    expect(inserts.length).toBeGreaterThan(0);
    expect(
      inserts.every(
        (item) =>
          item.direction === "position-to-card" &&
          item.nextCards?.length === 3 &&
          order()[item.position - 1] === item.card,
      ),
    ).toBe(true);
  });

  it("avoids the same insert card twice in a row when it can", () => {
    const session = generate(["AS", "KS"], () => 0);
    const cards = session.items
      .filter((item) => item.insert)
      .map((item) => item.card);

    expect(cards.length).toBeGreaterThan(1);
    for (let index = 1; index < cards.length; index += 1) {
      expect(cards[index]).not.toBe(cards[index - 1]);
    }
  });

  it("does not schedule inserts without candidates", () => {
    const session = generate([], seededRandom(13));
    expect(session.items).toHaveLength(52);
    expect(session.items.every((item) => item.insert === undefined)).toBe(true);
  });

  it("ignores candidate cards that are not in the stack", () => {
    const session = generate(["AS", "ZZ"], seededRandom(17));
    const inserts = session.items.filter((item) => item.insert);
    expect(inserts.every((item) => item.card === "AS")).toBe(true);
  });

  it("keeps regular mixed directions at 26/26 around inserts", () => {
    const session = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "mixed",
      reinforcementCandidates: ["AS", "KS"],
      random: seededRandom(31),
    });
    const regular = session.items.filter((item) => !item.insert);
    const inserts = session.items.filter((item) => item.insert);

    expect(inserts.length).toBeGreaterThan(0);
    expect(
      regular.filter((item) => item.direction === "position-to-card"),
    ).toHaveLength(26);
    expect(
      regular.filter((item) => item.direction === "card-to-position"),
    ).toHaveLength(26);
    expect(
      inserts.every(
        (item) =>
          item.direction === "position-to-card" ||
          item.direction === "card-to-position",
      ),
    ).toBe(true);
  });
});

