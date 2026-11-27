import { describe, expect, it } from "vitest";
import {
  applyAnswer,
  applyAnswerToState,
  applySessionAnswer,
  createSessionProgress,
  emptyStats,
  type AnswerRecord,
} from "../src/domain/scoring";
import { createDefaultState } from "../src/storage/app-store";

function quartetAnswer(overrides: Partial<AnswerRecord> = {}): AnswerRecord {
  return {
    card: "7S",
    position: 37,
    rank: "7",
    firstCard: "7S",
    distances: [4, 6, 8],
    correct: true,
    at: new Date(2026, 10, 21, 12, 0, 0),
    ...overrides,
  };
}

function apply(
  stats: ReturnType<typeof emptyStats> | undefined,
  overrides: Partial<AnswerRecord> = {},
) {
  return applyAnswer("mnemonica", "quartets", stats, quartetAnswer(overrides));
}

describe("quartet scoring", () => {
  it("creates a per-rank record and practice day from a correct answer", () => {
    const stats = apply(undefined, { elapsedTenths: 12 });

    expect(stats.totalAnswered).toBe(1);
    expect(stats.totalCorrect).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.bestStreak).toBe(1);
    expect(stats.cards).toEqual({});
    expect(stats.ranks?.["7"]).toEqual({
      currentStreak: 1,
      timesMissed: 0,
      elapsedTenths: 12,
      correctTimedAnswers: 1,
      inReinforcement: false,
    });
    expect(stats.practiceDays).toEqual([
      { date: "2026-11-21", answered: 1, correct: 1 },
    ]);
    expect(stats.recentMisses).toEqual([]);
  });

  it("records a quartet miss and sets rank reinforcement", () => {
    const stats = apply(undefined, {
      correct: false,
      at: new Date(2026, 10, 21, 12, 0, 5),
    });

    expect(stats.currentStreak).toBe(0);
    expect(stats.totalAnswered).toBe(1);
    expect(stats.totalCorrect).toBe(0);
    expect(stats.ranks?.["7"]?.timesMissed).toBe(1);
    expect(stats.ranks?.["7"]?.inReinforcement).toBe(true);
    expect(stats.recentMisses[0]).toEqual({
      rank: "7",
      firstCard: "7S",
      distances: [4, 6, 8],
      at: new Date(2026, 10, 21, 12, 0, 5).toISOString(),
    });
    expect(stats.cards).toEqual({});
  });

  it("clears reinforcement after five consecutive Got it answers", () => {
    let stats = apply(undefined, { correct: false });
    for (let index = 0; index < 4; index += 1) {
      stats = apply(stats);
    }
    expect(stats.ranks?.["7"]?.inReinforcement).toBe(true);
    stats = apply(stats);
    expect(stats.ranks?.["7"]?.inReinforcement).toBe(false);
    expect(stats.ranks?.["7"]?.currentStreak).toBe(5);
  });

  it("adds elapsed tenths only on timed Got it answers", () => {
    let stats = apply(undefined, { elapsedTenths: 5 });
    stats = apply(stats, { correct: false, elapsedTenths: 30 });
    stats = apply(stats, { elapsedTenths: 7 });

    expect(stats.ranks?.["7"]?.elapsedTenths).toBe(12);
    expect(stats.ranks?.["7"]?.correctTimedAnswers).toBe(2);
  });

  it("counts each graded rank once in the mode and practice day", () => {
    let stats = apply(undefined);
    stats = apply(stats, {
      rank: "K",
      card: "KC",
      firstCard: "KC",
      distances: [8, 5, 4],
      position: 18,
      correct: false,
    });

    expect(stats.totalAnswered).toBe(2);
    expect(stats.totalCorrect).toBe(1);
    expect(stats.practiceDays[0]).toEqual({
      date: "2026-11-21",
      answered: 2,
      correct: 1,
    });
  });

  it("keeps recent quartet misses newest-first and capped at 20", () => {
    let stats = emptyStats("mnemonica", "quartets");
    for (let index = 0; index < 25; index += 1) {
      stats = apply(stats, {
        correct: false,
        at: new Date(2026, 10, 21, 12, 0, index),
      });
    }

    expect(stats.recentMisses).toHaveLength(20);
    expect(stats.recentMisses[0]).toMatchObject({
      rank: "7",
      firstCard: "7S",
    });
  });

  it("adds the session miss in the quartet shape", () => {
    const progress = applySessionAnswer(
      createSessionProgress(),
      quartetAnswer({ correct: false }),
    );

    expect(progress.misses[0]).toEqual({
      rank: "7",
      firstCard: "7S",
      distances: [4, 6, 8],
    });
  });

  it("keeps quartets in their own stats bucket", () => {
    const state = applyAnswerToState(
      createDefaultState(),
      "mnemonica",
      "quartets",
      quartetAnswer(),
    );

    expect(state.stats.mnemonica?.quartets?.totalAnswered).toBe(1);
    expect(state.stats.mnemonica?.basic).toBeUndefined();
  });
});
