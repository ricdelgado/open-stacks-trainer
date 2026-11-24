import { describe, expect, it } from "vitest";
import { getBuiltInStack } from "../src/data/stacks";
import {
  ACCELERATE_MAX_GAP,
  ACCELERATE_MIN_GAP,
  accelerateCandidates,
  isAccelerateThreshold,
  planAccelerateInserts,
} from "../src/domain/accelerate";
import { emptyCardStats, emptyStats } from "../src/domain/scoring";
import { generateSession, type Rng } from "../src/domain/session";
import type { ModeStats } from "../src/domain/types";

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

function card(overrides: Partial<ReturnType<typeof emptyCardStats>>) {
  return { ...emptyCardStats(), ...overrides };
}

function statsWith(cards: ModeStats["cards"]): ModeStats {
  return { ...emptyStats("mnemonica", "basic"), cards };
}

describe("accelerate eligibility", () => {
  it("requires the average to be strictly above the threshold", () => {
    const stats = statsWith({
      AS: card({ elapsedTenths: 11, correctTimedAnswers: 1 }),
      "2H": card({ elapsedTenths: 10, correctTimedAnswers: 1 }),
      "3C": card({ elapsedTenths: 21, correctTimedAnswers: 2 }),
      "4D": card({ elapsedTenths: 20, correctTimedAnswers: 2 }),
    });

    expect(accelerateCandidates(stats, 10)).toEqual(["AS", "3C"]);
  });

  it("requires at least one timed Got it answer", () => {
    const stats = statsWith({
      AS: card({ elapsedTenths: 100, correctTimedAnswers: 0 }),
      "2H": card({ elapsedTenths: 100, correctTimedAnswers: 1 }),
    });

    expect(accelerateCandidates(stats, 10)).toEqual(["2H"]);
  });

  it("returns no candidates for unknown stats", () => {
    expect(accelerateCandidates(undefined, 10)).toEqual([]);
  });

  it("accepts only the offered thresholds", () => {
    expect(isAccelerateThreshold(5)).toBe(true);
    expect(isAccelerateThreshold(10)).toBe(true);
    expect(isAccelerateThreshold(20)).toBe(true);
    expect(isAccelerateThreshold(30)).toBe(true);
    expect(isAccelerateThreshold(15)).toBe(false);
  });
});

describe("accelerate inserts", () => {
  it("schedules nothing without candidates", () => {
    expect(
      planAccelerateInserts({
        candidates: [],
        regularCount: 52,
        random: () => 0,
      }),
    ).toEqual([]);
  });

  it("uses inclusive gaps of 2 to 4 regular items", () => {
    const inserts = planAccelerateInserts({
      candidates: ["AS"],
      regularCount: 52,
      random: seededRandom(7),
    });

    expect(inserts.length).toBeGreaterThan(0);
    let previous = 0;
    for (const insert of inserts) {
      const gap = insert.afterRegular - previous;
      expect(gap).toBeGreaterThanOrEqual(ACCELERATE_MIN_GAP);
      expect(gap).toBeLessThanOrEqual(ACCELERATE_MAX_GAP);
      previous = insert.afterRegular;
    }
  });

  it("never inserts after the last regular item", () => {
    const inserts = planAccelerateInserts({
      candidates: ["AS"],
      regularCount: 2,
      random: () => 0,
    });
    expect(inserts).toEqual([]);
  });

  it("avoids the same card twice in a row when it can", () => {
    const inserts = planAccelerateInserts({
      candidates: ["AS", "KS"],
      regularCount: 20,
      random: () => 0,
    });
    const cards = inserts.map((insert) => insert.card);
    expect(cards.length).toBeGreaterThan(1);
    for (let index = 1; index < cards.length; index += 1) {
      expect(cards[index]).not.toBe(cards[index - 1]);
    }
  });
});

describe("accelerate session generation", () => {
  function generate(accelerateCandidates: readonly string[], random: Rng) {
    return generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "position-to-card",
      accelerateCandidates,
      random,
    });
  }

  it("adds planned accelerate prompts to the 52 regular items", () => {
    const session = generate(["AS", "KS"], seededRandom(3));
    const regular = session.items.filter((item) => !item.insert);
    const inserts = session.items.filter((item) => item.insert);

    expect(regular).toHaveLength(52);
    expect(inserts.length).toBeGreaterThan(0);
    expect(inserts.every((item) => item.insert === "accelerate")).toBe(true);
    expect(session.items.at(-1)?.insert).toBeUndefined();
  });

  it("asks reinforcement before accelerate when both are due", () => {
    const session = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "position-to-card",
      reinforcementCandidates: ["AS"],
      accelerateCandidates: ["KS"],
      random: () => 0,
    });
    const sequence = session.items
      .filter((item) => item.insert)
      .map((item) => item.insert);

    const bothDue = sequence.findIndex(
      (kind, index) =>
        kind === "reinforcement" && sequence[index + 1] === "accelerate",
    );
    expect(bothDue).toBeGreaterThanOrEqual(0);
  });

  it("uses the active mode for accelerate prompts", () => {
    const session = generateSession({
      stackId: "mnemonica",
      stackName: "Mnemonica",
      order: order(),
      direction: "position-to-card",
      mode: "card-plus-3",
      accelerateCandidates: ["AS"],
      random: seededRandom(11),
    });
    const inserts = session.items.filter((item) => item.insert);

    expect(inserts.length).toBeGreaterThan(0);
    expect(inserts.every((item) => item.nextCards?.length === 3)).toBe(true);
  });
});
