import { describe, expect, it } from "vitest";
import { getBuiltInStack } from "../src/data/stacks";
import {
  buildCardRows,
  changeCardTableMode,
  changeCardTableSort,
  changeCardTableStack,
  createCardTableView,
  isCardSort,
  sortCardRows,
} from "../src/domain/card-table";
import { emptyCardStats, emptyStats } from "../src/domain/scoring";
import type { ModeStats } from "../src/domain/types";

function order(): readonly string[] {
  const stack = getBuiltInStack("mnemonica");
  if (!stack) throw new Error("Missing fixture stack.");
  return stack.order;
}

function modeStats(
  cards: ModeStats["cards"] = {},
): ModeStats {
  return { ...emptyStats("mnemonica", "basic"), cards };
}

function card(overrides: Partial<ReturnType<typeof emptyCardStats>>) {
  return { ...emptyCardStats(), ...overrides };
}

describe("card table rows", () => {
  it("builds 52 rows in current stack order", () => {
    const rows = buildCardRows(order(), modeStats());
    expect(rows).toHaveLength(52);
    expect(rows.map((row) => row.position)).toEqual(
      Array.from({ length: 52 }, (_, index) => index + 1),
    );
    expect(rows.map((row) => row.card)).toEqual([...order()]);
  });

  it("treats missing card records as zeroes and a missing average", () => {
    const rows = buildCardRows(["AS"], modeStats());
    expect(rows[0]).toMatchObject({
      position: 1,
      card: "AS",
      currentStreak: 0,
      reinforcementStreak: null,
      timesMissed: 0,
      averageTenths: null,
    });
  });

  it("reads mode-specific per-card values", () => {
    const rows = buildCardRows(
      ["AS", "2H"],
      modeStats({
        AS: card({
          currentStreak: 3,
          timesMissed: 2,
          elapsedTenths: 28,
          correctTimedAnswers: 2,
          inReinforcement: true,
        }),
        "2H": card({ currentStreak: 5, timesMissed: 0 }),
      }),
    );

    expect(rows[0]).toMatchObject({
      currentStreak: 3,
      reinforcementStreak: 3,
      timesMissed: 2,
      averageTenths: 14,
    });
    expect(rows[1]).toMatchObject({
      currentStreak: 5,
      reinforcementStreak: null,
    });
  });
});

describe("card table sorting", () => {
  function rows() {
    return buildCardRows(
      ["AS", "2H", "3C", "4D"],
      modeStats({
        AS: card({ timesMissed: 2, elapsedTenths: 30, correctTimedAnswers: 2 }),
        "2H": card({ timesMissed: 2, elapsedTenths: 10, correctTimedAnswers: 1 }),
        "3C": card({ timesMissed: 0, currentStreak: 1 }),
        "4D": card({ timesMissed: 5, elapsedTenths: 50, correctTimedAnswers: 2 }),
      }),
    );
  }

  it("keeps stack order by default", () => {
    expect(sortCardRows(rows(), "stack-order").map((row) => row.card)).toEqual([
      "AS",
      "2H",
      "3C",
      "4D",
    ]);
  });

  it("sorts reinforcement cards first, lowest value first", () => {
    const withReinforcement = buildCardRows(
      ["AS", "2H", "3C", "4D"],
      modeStats({
        AS: card({ inReinforcement: true, currentStreak: 0 }),
        "2H": card({ inReinforcement: true, currentStreak: 3 }),
        "3C": card({ inReinforcement: false }),
        "4D": card({ inReinforcement: true, currentStreak: 2 }),
      }),
    );

    expect(
      sortCardRows(withReinforcement, "reinforcement").map(
        (row) => row.card,
      ),
    ).toEqual(["AS", "4D", "2H", "3C"]);
  });

  it("ties reinforcement values by stack order", () => {
    const tied = buildCardRows(
      ["AS", "2H", "3C"],
      modeStats({
        AS: card({ inReinforcement: true, currentStreak: 1 }),
        "2H": card({ inReinforcement: true, currentStreak: 1 }),
        "3C": card({ inReinforcement: false }),
      }),
    );
    expect(
      sortCardRows(tied, "reinforcement").map((row) => row.card),
    ).toEqual(["AS", "2H", "3C"]);
  });

  it("sorts slowest average first, with untimed cards last", () => {
    const sorted = sortCardRows(rows(), "slowest");
    expect(sorted.map((row) => row.card)).toEqual(["4D", "AS", "2H", "3C"]);
    expect(sorted.at(-1)?.averageTenths).toBeNull();
  });

  it("breaks average ties by stack order", () => {
    const tied = buildCardRows(
      ["AS", "2H"],
      modeStats({
        AS: card({ elapsedTenths: 20, correctTimedAnswers: 1 }),
        "2H": card({ elapsedTenths: 20, correctTimedAnswers: 1 }),
      }),
    );
    expect(sortCardRows(tied, "slowest").map((row) => row.card)).toEqual([
      "AS",
      "2H",
    ]);
  });

  it("sorts most missed first and ties by stack order", () => {
    expect(
      sortCardRows(rows(), "most-missed").map((row) => row.card),
    ).toEqual(["4D", "AS", "2H", "3C"]);
  });

  it("sorts lowest streak first and ties by stack order", () => {
    expect(
      sortCardRows(rows(), "lowest-streak").map((row) => row.card),
    ).toEqual(["AS", "2H", "4D", "3C"]);
  });

  it("does not mutate the input rows", () => {
    const input = rows();
    const before = [...input];
    sortCardRows(input, "most-missed");
    expect(input).toEqual(before);
  });
});

describe("card table selection", () => {
  it("resets sorting when the stack changes", () => {
    let view = createCardTableView("mnemonica", "basic");
    view = changeCardTableSort(view, "slowest");
    view = changeCardTableStack(view, "aronson", "card-plus-3");

    expect(view).toEqual({
      stackId: "aronson",
      mode: "card-plus-3",
      sort: "stack-order",
    });
  });

  it("resets sorting when the mode changes", () => {
    let view = createCardTableView("mnemonica", "basic");
    view = changeCardTableSort(view, "most-missed");
    view = changeCardTableMode(view, "card-plus-3");

    expect(view).toEqual({
      stackId: "mnemonica",
      mode: "card-plus-3",
      sort: "stack-order",
    });
  });

  it("keeps the stack and mode when only sorting changes", () => {
    const view = changeCardTableSort(
      createCardTableView("mnemonica", "basic"),
      "lowest-streak",
    );
    expect(view).toEqual({
      stackId: "mnemonica",
      mode: "basic",
      sort: "lowest-streak",
    });
  });

  it("recognises only known sort values", () => {
    expect(isCardSort("stack-order")).toBe(true);
    expect(isCardSort("slowest")).toBe(true);
    expect(isCardSort("reinforcement")).toBe(true);
    expect(isCardSort("nope")).toBe(false);
  });
});
