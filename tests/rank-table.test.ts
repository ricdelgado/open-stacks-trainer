import { describe, expect, it } from "vitest";
import { getBuiltInStack } from "../src/data/stacks";
import { RANKS } from "../src/domain/cards";
import {
  buildRankRows,
  sortRankRows,
  type RankRow,
} from "../src/domain/rank-table";
import { emptyCardStats, emptyStats } from "../src/domain/scoring";

function order(): readonly string[] {
  const stack = getBuiltInStack("mnemonica");
  if (!stack) throw new Error("Missing fixture stack.");
  return stack.order;
}

function stats() {
  return {
    ...emptyStats("mnemonica", "quartets"),
    ranks: {
      "7": {
        ...emptyCardStats(),
        currentStreak: 4,
        timesMissed: 2,
        elapsedTenths: 20,
        correctTimedAnswers: 2,
        inReinforcement: true,
      },
      A: {
        ...emptyCardStats(),
        currentStreak: 1,
        timesMissed: 5,
        elapsedTenths: 60,
        correctTimedAnswers: 2,
      },
    },
  };
}

describe("rank table", () => {
  it("builds 13 rows in canonical rank order", () => {
    const rows = buildRankRows(order(), stats());
    expect(rows).toHaveLength(13);
    expect(rows.map((row) => row.rank)).toEqual([...RANKS]);
    expect(rows.find((row) => row.rank === "7")).toMatchObject({
      firstCard: "7S",
      distances: [4, 6, 8],
      currentStreak: 4,
      reinforcementStreak: 4,
      timesMissed: 2,
      averageTenths: 10,
    });
    expect(rows.find((row) => row.rank === "A")).toMatchObject({
      firstCard: "AD",
      timesMissed: 5,
      averageTenths: 30,
    });
  });

  it("sorts by reinforcement, slowest, most missed, and lowest streak", () => {
    const rows = buildRankRows(order(), stats());
    const reinforcement = sortRankRows(rows, "reinforcement");
    expect(reinforcement[0]?.rank).toBe("7");
    const slowest = sortRankRows(rows, "slowest");
    expect(slowest[0]?.rank).toBe("A");
    const mostMissed = sortRankRows(rows, "most-missed");
    expect(mostMissed[0]?.rank).toBe("A");
    const lowest = sortRankRows(rows, "lowest-streak");
    expect(lowest[0]?.currentStreak).toBe(0);
  });

  it("uses rank order as the tie-breaker", () => {
    const rows: RankRow[] = buildRankRows(order(), undefined);
    expect(sortRankRows(rows, "most-missed").map((row) => row.rank)).toEqual([
      ...RANKS,
    ]);
    expect(sortRankRows(rows, "lowest-streak").map((row) => row.rank)).toEqual([
      ...RANKS,
    ]);
  });
});
