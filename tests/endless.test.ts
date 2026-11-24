import { describe, expect, it } from "vitest";
import { getBuiltInStack } from "../src/data/stacks";
import {
  generateEndlessBatch,
  generateSession,
  type Rng,
} from "../src/domain/session";
import { SessionRunner } from "../src/session/runner";

function stack() {
  const builtIn = getBuiltInStack("mnemonica");
  if (!builtIn) throw new Error("Missing fixture stack.");
  return builtIn;
}

function seededRandom(seed: number): Rng {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
}

function batch(random: Rng = seededRandom(1), previousFrontCard?: string) {
  const builtIn = stack();
  return generateEndlessBatch({
    stackId: builtIn.id,
    stackName: builtIn.name,
    order: builtIn.order,
    direction: "position-to-card",
    previousFrontCard,
    random,
  });
}

describe("endless batches", () => {
  it("contains 104 regular items: two full passes of 52 positions", () => {
    const session = batch();
    const regular = session.items.filter((item) => !item.insert);
    expect(regular).toHaveLength(104);
    expect(new Set(regular.map((item) => item.position)).size).toBe(52);
    expect(
      regular.filter((item) => item.position <= 52).length,
    ).toBe(104);

    const firstPass = regular.slice(0, 52).map((item) => item.position);
    const secondPass = regular.slice(52).map((item) => item.position);
    expect(new Set(firstPass).size).toBe(52);
    expect(new Set(secondPass).size).toBe(52);
  });

  it("does not repeat the front card between the two passes", () => {
    const session = batch(seededRandom(2));
    const regular = session.items.filter((item) => !item.insert);
    expect(regular[51]?.card).not.toBe(regular[52]?.card);
  });

  it("does not repeat the previous batch front card at the boundary", () => {
    const first = batch(seededRandom(3));
    const previous = first.items.at(-1)?.card;
    expect(previous).toBeDefined();
    const second = batch(seededRandom(4), previous);
    expect(second.items[0]?.card).not.toBe(previous);
  });

  it("never puts the same front card twice in a row, including extras", () => {
    const builtIn = stack();
    const session = generateEndlessBatch({
      stackId: builtIn.id,
      stackName: builtIn.name,
      order: builtIn.order,
      direction: "position-to-card",
      reinforcementCandidates: ["AS", "KS", "QC"],
      accelerateCandidates: ["AS", "KS", "QC"],
      random: seededRandom(5),
    });

    expect(session.items.some((item) => item.insert)).toBe(true);
    for (let index = 1; index < session.items.length; index += 1) {
      expect(session.items[index]?.card).not.toBe(
        session.items[index - 1]?.card,
      );
    }
  });

  it("builds a different batch for a different random source", () => {
    expect(batch(seededRandom(6)).items).not.toEqual(
      batch(seededRandom(7)).items,
    );
  });

  it("keeps Card +3 triple backs in endless batches", () => {
    const builtIn = stack();
    const session = generateEndlessBatch({
      stackId: builtIn.id,
      stackName: builtIn.name,
      order: builtIn.order,
      direction: "mixed",
      mode: "card-plus-3",
      random: seededRandom(8),
    });
    expect(session.mode).toBe("card-plus-3");
    expect(
      session.items.every((item) => item.nextCards?.length === 3),
    ).toBe(true);
  });
});

describe("endless runner", () => {
  function endlessRunner() {
    const builtIn = stack();
    const nextBatch = (previousFrontCard: string) =>
      generateEndlessBatch({
        stackId: builtIn.id,
        stackName: builtIn.name,
        order: builtIn.order,
        direction: "position-to-card",
        previousFrontCard,
        random: seededRandom(9),
      });
    return new SessionRunner(batch(seededRandom(9)), {
      endless: true,
      nextBatch,
    });
  }

  it("continues into a fresh batch after 104 regular items", () => {
    const session = endlessRunner();
    for (let index = 0; index < 104; index += 1) {
      expect(session.reveal()).toBe(true);
      expect(session.grade(true, new Date(2026, 10, 21, 12, 0, index))).not.toBe(
        null,
      );
    }

    expect(session.isEndless).toBe(true);
    expect(session.isComplete).toBe(false);
    expect(session.progress.answered).toBe(104);
    expect(session.currentItem).not.toBeNull();
  });

  it("asks for a fresh batch with the previous front card at the boundary", () => {
    const builtIn = stack();
    const calls: string[] = [];
    const session = new SessionRunner(batch(seededRandom(9)), {
      endless: true,
      nextBatch: (previousFrontCard) => {
        calls.push(previousFrontCard);
        return generateEndlessBatch({
          stackId: builtIn.id,
          stackName: builtIn.name,
          order: builtIn.order,
          direction: "position-to-card",
          previousFrontCard,
          random: seededRandom(10),
        });
      },
    });

    let lastCard = "";
    for (let index = 0; index < 104; index += 1) {
      lastCard = session.currentItem?.card ?? "";
      session.reveal();
      session.grade(true, new Date());
    }

    expect(calls).toEqual([lastCard]);
  });

  it("stays endless past a single session length", () => {
    const session = endlessRunner();
    for (let index = 0; index < 130; index += 1) {
      session.reveal();
      session.grade(true, new Date());
    }
    expect(session.progress.answered).toBe(130);
    expect(session.currentItem).not.toBeNull();
  });

  it("normal sessions still complete at 52", () => {
    const builtIn = stack();
    const session = new SessionRunner(
      generateSession({
        stackId: builtIn.id,
        stackName: builtIn.name,
        order: builtIn.order,
        direction: "position-to-card",
        random: seededRandom(1),
      }),
    );
    for (let index = 0; index < 52; index += 1) {
      session.reveal();
      session.grade(true, new Date());
    }
    expect(session.isEndless).toBe(false);
    expect(session.isComplete).toBe(true);
  });
});
