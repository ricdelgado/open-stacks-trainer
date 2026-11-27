import { describe, expect, it } from "vitest";
import { FULL_DECK, RANKS, parseCardCode, type Rank } from "../src/domain/cards";
import {
  computeQuartets,
  quartetForRank,
  type QuartetDistances,
} from "../src/domain/quartets";
import { getBuiltInStack } from "../src/data/stacks";

interface FixtureRow {
  rank: Rank;
  firstCard: string;
  distances: QuartetDistances;
  positions: readonly [number, number, number, number];
}

interface FixtureSet {
  stackId: string;
  source: "published" | "computed";
  rows: readonly FixtureRow[];
}

const fixtures: readonly FixtureSet[] = [
  {
    stackId: "mnemonica",
    source: "published",
    rows: [
      { rank: "A", firstCard: "AD", distances: [4, 8, 8], positions: [39, 43, 51, 7] },
      { rank: "2", firstCard: "2H", distances: [8, 9, 8], positions: [2, 10, 19, 27] },
      { rank: "3", firstCard: "3C", distances: [8, 9, 7], positions: [4, 12, 21, 28] },
      { rank: "4", firstCard: "4S", distances: [2, 11, 4], positions: [40, 42, 1, 5] },
      { rank: "5", firstCard: "5H", distances: [8, 9, 5], positions: [8, 16, 25, 30] },
      { rank: "6", firstCard: "6C", distances: [8, 9, 8], positions: [50, 6, 15, 23] },
      { rank: "7", firstCard: "7S", distances: [4, 6, 8], positions: [37, 41, 47, 3] },
      { rank: "8", firstCard: "8H", distances: [8, 7, 4], positions: [14, 22, 29, 33] },
      { rank: "9", firstCard: "9C", distances: [8, 9, 8], positions: [44, 52, 9, 17] },
      { rank: "10", firstCard: "10C", distances: [10, 4, 11], positions: [24, 34, 38, 49] },
      { rank: "J", firstCard: "JH", distances: [12, 4, 9], positions: [20, 32, 36, 45] },
      { rank: "Q", firstCard: "QD", distances: [2, 15, 2], positions: [46, 48, 11, 13] },
      { rank: "K", firstCard: "KC", distances: [8, 5, 4], positions: [18, 26, 31, 35] },
    ],
  },
  {
    stackId: "aronson",
    source: "published",
    rows: [
      { rank: "A", firstCard: "AS", distances: [4, 8, 4], positions: [6, 10, 18, 22] },
      { rank: "2", firstCard: "2S", distances: [10, 5, 9], positions: [41, 51, 4, 13] },
      { rank: "3", firstCard: "3H", distances: [10, 7, 16], positions: [7, 17, 24, 40] },
      { rank: "4", firstCard: "4H", distances: [2, 6, 8], positions: [29, 31, 37, 45] },
      { rank: "5", firstCard: "5C", distances: [9, 8, 7], positions: [3, 12, 20, 27] },
      { rank: "6", firstCard: "6H", distances: [5, 5, 11], positions: [39, 44, 49, 8] },
      { rank: "7", firstCard: "7D", distances: [4, 6, 3], positions: [15, 19, 25, 28] },
      { rank: "8", firstCard: "8H", distances: [15, 7, 7], positions: [46, 9, 16, 23] },
      { rank: "9", firstCard: "9H", distances: [5, 5, 5], positions: [42, 47, 52, 5] },
      { rank: "10", firstCard: "10S", distances: [21, 3, 3], positions: [11, 32, 35, 38] },
      { rank: "J", firstCard: "JC", distances: [1, 2, 17], positions: [33, 34, 36, 1] },
      { rank: "Q", firstCard: "QD", distances: [5, 22, 2], positions: [21, 26, 48, 50] },
      { rank: "K", firstCard: "KH", distances: [13, 11, 12], positions: [30, 43, 2, 14] },
    ],
  },
  {
    stackId: "memorandum",
    source: "computed",
    rows: [
      { rank: "A", firstCard: "AD", distances: [4, 4, 8], positions: [4, 8, 12, 20] },
      { rank: "2", firstCard: "2D", distances: [4, 8, 4], positions: [31, 35, 43, 47] },
      { rank: "3", firstCard: "3D", distances: [8, 4, 10], positions: [24, 32, 36, 46] },
      { rank: "4", firstCard: "4C", distances: [2, 2, 2], positions: [5, 7, 9, 11] },
      { rank: "5", firstCard: "5C", distances: [12, 4, 6], positions: [22, 34, 38, 44] },
      { rank: "6", firstCard: "6C", distances: [4, 12, 4], positions: [29, 33, 45, 49] },
      { rank: "7", firstCard: "7C", distances: [4, 4, 4], positions: [2, 6, 10, 14] },
      { rank: "8", firstCard: "8C", distances: [5, 14, 4], positions: [18, 23, 37, 41] },
      { rank: "9", firstCard: "9C", distances: [3, 18, 4], positions: [27, 30, 48, 52] },
      { rank: "10", firstCard: "10C", distances: [13, 10, 4], positions: [42, 3, 13, 17] },
      { rank: "J", firstCard: "JD", distances: [13, 14, 4], positions: [40, 1, 15, 19] },
      { rank: "Q", firstCard: "QS", distances: [3, 22, 1], positions: [25, 28, 50, 51] },
      { rank: "K", firstCard: "KD", distances: [5, 5, 13], positions: [16, 21, 26, 39] },
    ],
  },
];

function stackOrder(stackId: string): readonly string[] {
  const stack = getBuiltInStack(stackId);
  if (!stack) throw new Error(`Missing stack ${stackId}`);
  return stack.order;
}

describe("quartet computation", () => {
  it.each(fixtures)("matches every $source row for $stackId", ({ stackId, rows }) => {
    const order = stackOrder(stackId);
    const computed = computeQuartets(order);

    expect(computed.map((quartet) => quartet.rank)).toEqual([...RANKS]);
    for (const row of rows) {
      expect(quartetForRank(order, row.rank)).toEqual(row);
    }
  });

  it.each(fixtures)("holds the quartet invariants for $stackId", ({ stackId }) => {
    const order = stackOrder(stackId);
    for (const quartet of computeQuartets(order)) {
      const [p0, p1, p2, p3] = [...quartet.positions].sort(
        (left, right) => left - right,
      ) as [number, number, number, number];
      const gaps = [p1 - p0, p2 - p1, p3 - p2, 52 - (p3 - p0)];
      const maxGap = Math.max(...gaps);

      expect(quartet.distances.every((distance) => distance >= 1)).toBe(true);
      expect(quartet.distances.every((distance) => distance <= maxGap)).toBe(true);
      expect(
        quartet.distances[0] + quartet.distances[1] + quartet.distances[2],
      ).toBe(52 - maxGap);
      expect(new Set(quartet.positions).size).toBe(4);
      expect(quartet.positions.every((position) => position >= 1 && position <= 52)).toBe(true);
      expect(quartet.positions.every((position) => {
        const card = order[position - 1];
        return card !== undefined && parseCardCode(card)?.rank === quartet.rank;
      })).toBe(true);
    }
  });

  it("breaks a largest-gap tie by the earliest first-card position", () => {
    const aces = FULL_DECK.filter((card) => card.startsWith("A"));
    const others = FULL_DECK.filter((card) => !card.startsWith("A"));
    const order: (string | undefined)[] = Array<string | undefined>(52).fill(
      undefined,
    );
    const acePositions = [1, 14, 27, 40];
    acePositions.forEach((position, index) => {
      order[position - 1] = aces[index];
    });
    let next = 0;
    for (let index = 0; index < order.length; index += 1) {
      if (!order[index]) {
        order[index] = others[next];
        next += 1;
      }
    }

    const completeOrder = order.filter(
      (card): card is string => typeof card === "string",
    );
    expect(quartetForRank(completeOrder, "A")).toEqual({
      rank: "A",
      firstCard: "AS",
      distances: [13, 13, 13],
      positions: [1, 14, 27, 40],
    });
  });

  it.each([
    ["short", FULL_DECK.slice(0, 51)],
    ["duplicate", [...FULL_DECK.slice(0, 51), FULL_DECK[0] ?? ""]],
    ["invalid card", [...FULL_DECK.slice(0, 51), "XX"]],
  ])("rejects an invalid %s order", (_label, order) => {
    expect(() => computeQuartets(order)).toThrow("Invalid stack order");
  });
});
