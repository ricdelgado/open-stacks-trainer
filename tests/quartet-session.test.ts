import { describe, expect, it } from "vitest";
import { getBuiltInStack } from "../src/data/stacks";
import { quartetForRank } from "../src/domain/quartets";
import {
  generateEndlessBatch,
  generateSession,
  type Rng,
} from "../src/domain/session";

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

function quartetSession(seed = 7) {
  return generateSession({
    stackId: "mnemonica",
    stackName: "Mnemonica",
    order: order(),
    direction: "mixed",
    mode: "quartets",
    random: seededRandom(seed),
  });
}

describe("Quartets session generation", () => {
  it("builds 13 items with every rank exactly once", () => {
    const session = quartetSession();
    expect(session.mode).toBe("quartets");
    expect(session.items).toHaveLength(13);
    expect(new Set(session.items.map((item) => item.rank)).size).toBe(13);
    expect(session.items.every((item) => item.direction === undefined)).toBe(
      true,
    );
  });

  it("uses the computed first card and position for each item", () => {
    const session = quartetSession(11);
    for (const item of session.items) {
      if (!item.rank) throw new Error("Missing quartet rank.");
      const quartet = quartetForRank(order(), item.rank);
      expect(item.card).toBe(quartet.firstCard);
      expect(item.position).toBe(quartet.positions[0]);
      expect(item.firstCard).toBe(quartet.firstCard);
      expect(item.distances).toEqual(quartet.distances);
      expect(item.positions).toEqual(quartet.positions);
    }
  });

  it("is deterministic under the injected random source", () => {
    expect(quartetSession(99)).toEqual(quartetSession(99));
    expect(quartetSession(99).items).not.toEqual(quartetSession(100).items);
  });
});

describe("Quartets modifiers", () => {
  function endless(seed = 7, previousFrontCard: string | null = null) {
    return generateEndlessBatch({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "mixed",
      mode: "quartets",
      previousFrontCard,
      random: seededRandom(seed),
    });
  }

  it("inserts reinforcement ranks when candidates exist", () => {
    const session = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "mixed",
      mode: "quartets",
      reinforcementCandidates: ["A", "K"],
      random: seededRandom(7),
    });

    const inserts = session.items.filter((item) => item.insert);
    expect(inserts.length).toBeGreaterThan(0);
    expect(inserts.every((item) => item.insert === "reinforcement")).toBe(
      true,
    );
    expect(inserts.every((item) => item.rank === "A" || item.rank === "K")).toBe(
      true,
    );
    expect(session.items.filter((item) => !item.insert)).toHaveLength(13);

    let regularsSinceInsert = 0;
    for (const item of session.items) {
      if (!item.insert) {
        regularsSinceInsert += 1;
        continue;
      }
      expect(regularsSinceInsert).toBeGreaterThanOrEqual(3);
      expect(regularsSinceInsert).toBeLessThanOrEqual(8);
      regularsSinceInsert = 0;
    }
  });

  it("produces no Accelerate inserts for quartets", () => {
    const session = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "mixed",
      mode: "quartets",
      accelerateCandidates: ["A", "K"],
      random: seededRandom(7),
    });

    expect(session.items).toHaveLength(13);
    expect(session.items.some((item) => item.insert === "accelerate")).toBe(
      false,
    );
  });

  it("builds 26-item Endless batches from two 13-rank passes", () => {
    const session = endless();
    expect(session.items).toHaveLength(26);
    const ranks = session.items.map((item) => item.rank);
    expect(new Set(ranks.slice(0, 13)).size).toBe(13);
    expect(new Set(ranks.slice(13)).size).toBe(13);
    for (let index = 1; index < ranks.length; index += 1) {
      expect(ranks[index]).not.toBe(ranks[index - 1]);
    }
  });

  it("avoids repeating the previous rank at a batch boundary", () => {
    const first = endless(7);
    const lastRank = first.items.at(-1)?.rank;
    if (!lastRank) throw new Error("Missing last rank.");
    const second = endless(8, lastRank);
    expect(second.items[0]?.rank).not.toBe(lastRank);
  });
});
