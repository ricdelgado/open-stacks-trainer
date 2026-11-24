import { describe, expect, it } from "vitest";
import { emptyStats } from "../src/domain/scoring";
import {
  defaultSelection,
  mostRecentMode,
  practicedStacksFor,
  shouldShowModeTabs,
  shouldShowStackSelector,
  withoutStackStats,
} from "../src/domain/stats-selection";
import type { Mode, ModeStats, StackModes } from "../src/domain/types";

const names: Record<string, string> = {
  mnemonica: "Mnemonica",
  aronson: "Aronson",
  memorandum: "Memorandum",
  bravo: "Bravo",
  alpha: "Alpha",
};

function resolveName(stackId: string): string | null {
  return names[stackId] ?? null;
}

function modeStats(
  stackId: string,
  mode: Mode,
  totalAnswered: number,
  lastPracticedAt: string,
): ModeStats {
  return {
    ...emptyStats(stackId, mode),
    totalAnswered,
    totalCorrect: totalAnswered,
    lastPracticedAt,
  };
}

function buildStats(): Record<string, StackModes> {
  return {
    mnemonica: {
      basic: modeStats("mnemonica", "basic", 5, "2026-11-20T10:00:00.000Z"),
      "card-plus-3": modeStats(
        "mnemonica",
        "card-plus-3",
        2,
        "2026-11-22T10:00:00.000Z",
      ),
    },
    aronson: {
      basic: modeStats("aronson", "basic", 3, "2026-11-21T10:00:00.000Z"),
    },
  };
}

describe("stats practiced-stack selection", () => {
  it("lists only stacks with at least one answered mode", () => {
    const stats = buildStats();
    stats.memorandum = {
      basic: modeStats("memorandum", "basic", 0, ""),
    };

    const practiced = practicedStacksFor(stats, resolveName);
    expect(practiced.map((stack) => stack.stackId)).toEqual([
      "mnemonica",
      "aronson",
    ]);
  });

  it("hides orphan stats for stacks that no longer exist", () => {
    const stats = buildStats();
    stats.ghost = {
      basic: modeStats("ghost", "basic", 5, "2026-11-23T10:00:00.000Z"),
    };

    const practiced = practicedStacksFor(stats, resolveName);
    expect(practiced.map((stack) => stack.stackId)).toEqual([
      "mnemonica",
      "aronson",
    ]);
  });

  it("sorts by the most recent mode across modes, descending", () => {
    const practiced = practicedStacksFor(buildStats(), resolveName);
    expect(practiced.map((stack) => stack.stackId)).toEqual([
      "mnemonica",
      "aronson",
    ]);
    expect(practiced[0]?.lastPracticedAt).toBe("2026-11-22T10:00:00.000Z");
  });

  it("breaks last-practiced ties by name", () => {
    const at = "2026-11-20T10:00:00.000Z";
    const stats: Record<string, StackModes> = {
      bravo: { basic: modeStats("bravo", "basic", 1, at) },
      alpha: { basic: modeStats("alpha", "basic", 1, at) },
    };

    const practiced = practicedStacksFor(stats, resolveName);
    expect(practiced.map((stack) => stack.stackId)).toEqual(["alpha", "bravo"]);
  });

  it("exposes practiced modes in mode order", () => {
    const practiced = practicedStacksFor(buildStats(), resolveName);
    expect(practiced[0]?.modes.map((entry) => entry.mode)).toEqual([
      "basic",
      "card-plus-3",
    ]);
    expect(practiced[1]?.modes.map((entry) => entry.mode)).toEqual(["basic"]);
  });

  it("defaults to the most recent stack and its most recent mode", () => {
    const practiced = practicedStacksFor(buildStats(), resolveName);
    expect(defaultSelection(practiced)).toEqual({
      stackId: "mnemonica",
      mode: "card-plus-3",
    });
  });

  it("picks the most recent mode and keeps mode order on a tie", () => {
    const practiced = practicedStacksFor(buildStats(), resolveName);
    const mnemonica = practiced[0];
    if (!mnemonica) throw new Error("expected mnemonica");
    expect(mostRecentMode(mnemonica)).toBe("card-plus-3");

    const at = "2026-11-20T10:00:00.000Z";
    const tied = practicedStacksFor(
      {
        alpha: {
          basic: modeStats("alpha", "basic", 1, at),
          "card-plus-3": modeStats("alpha", "card-plus-3", 1, at),
        },
      },
      resolveName,
    )[0];
    if (!tied) throw new Error("expected tied stack");
    expect(mostRecentMode(tied)).toBe("basic");
  });

  it("shows the stack selector only with more than one practiced stack", () => {
    const practiced = practicedStacksFor(buildStats(), resolveName);
    expect(shouldShowStackSelector(practiced)).toBe(true);
    expect(shouldShowStackSelector(practiced.slice(0, 1))).toBe(false);
  });

  it("shows mode tabs only with more than one practiced mode", () => {
    const practiced = practicedStacksFor(buildStats(), resolveName);
    expect(shouldShowModeTabs(practiced[0])).toBe(true);
    expect(shouldShowModeTabs(practiced[1])).toBe(false);
    expect(shouldShowModeTabs(undefined)).toBe(false);
  });

  it("returns an empty selection when nothing is practiced", () => {
    expect(practicedStacksFor({}, resolveName)).toEqual([]);
    expect(defaultSelection([])).toBeNull();
  });

  it("removes every mode when deleting a stack's training data", () => {
    const stats = buildStats();
    const next = withoutStackStats(stats, "mnemonica");

    expect(next.mnemonica).toBeUndefined();
    expect(next.aronson).toBeDefined();
    expect(stats.mnemonica).toBeDefined();
  });
});
