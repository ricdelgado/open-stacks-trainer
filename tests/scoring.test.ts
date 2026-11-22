import { describe, expect, it } from "vitest";
import {
  accuracyPercent,
  applyAnswer,
  applySessionAnswer,
  createSessionProgress,
  emptyStats,
  formatLocalDate,
  type AnswerRecord,
} from "../src/domain/scoring";
import {
  AppStore,
  createDefaultState,
  type StorageLike,
} from "../src/storage/app-store";

function answer(overrides: Partial<AnswerRecord> = {}): AnswerRecord {
  return {
    card: "7D",
    position: 7,
    direction: "position-to-card",
    correct: true,
    at: new Date(2026, 10, 21, 12, 0, 0),
    ...overrides,
  };
}

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("stats scoring", () => {
  it("uses the local calendar date", () => {
    expect(formatLocalDate(new Date(2026, 10, 21, 23, 30))).toBe("2026-11-21");
    expect(formatLocalDate(new Date(2026, 0, 2, 1, 0))).toBe("2026-01-02");
  });

  it("increments totals, streak, best streak, and the practice day on a correct answer", () => {
    const previous = {
      ...emptyStats("mnemonica"),
      currentStreak: 3,
      bestStreak: 5,
      totalAnswered: 10,
      totalCorrect: 8,
    };
    const stats = applyAnswer("mnemonica", previous, answer());

    expect(stats.currentStreak).toBe(4);
    expect(stats.bestStreak).toBe(5);
    expect(stats.totalAnswered).toBe(11);
    expect(stats.totalCorrect).toBe(9);
    expect(stats.lastPracticedAt).toBe(answer().at.toISOString());
    expect(stats.practiceDays).toEqual([
      { date: "2026-11-21", answered: 1, correct: 1 },
    ]);
    expect(stats.recentMisses).toEqual([]);
  });

  it("raises the best streak when the current streak passes it", () => {
    const previous = { ...emptyStats("mnemonica"), currentStreak: 5, bestStreak: 5 };
    const stats = applyAnswer("mnemonica", previous, answer());
    expect(stats.currentStreak).toBe(6);
    expect(stats.bestStreak).toBe(6);
  });

  it("resets the current streak and records a miss without lowering the best streak", () => {
    const previous = {
      ...emptyStats("mnemonica"),
      currentStreak: 9,
      bestStreak: 12,
      totalAnswered: 20,
      totalCorrect: 18,
    };
    const stats = applyAnswer(
      "mnemonica",
      previous,
      answer({ correct: false, card: "QC", position: 13, direction: "card-to-position" }),
    );

    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(12);
    expect(stats.totalAnswered).toBe(21);
    expect(stats.totalCorrect).toBe(18);
    expect(stats.recentMisses).toHaveLength(1);
    expect(stats.recentMisses[0]).toEqual({
      card: "QC",
      position: 13,
      direction: "card-to-position",
      at: answer().at.toISOString(),
    });
    expect(stats.practiceDays).toEqual([
      { date: "2026-11-21", answered: 1, correct: 0 },
    ]);
  });

  it("merges answers into one practice day per date", () => {
    const first = applyAnswer(
      "mnemonica",
      undefined,
      answer({ at: new Date(2026, 10, 21, 9, 0) }),
    );
    const second = applyAnswer(
      "mnemonica",
      first,
      answer({ correct: false, at: new Date(2026, 10, 21, 10, 0) }),
    );
    const third = applyAnswer(
      "mnemonica",
      second,
      answer({ at: new Date(2026, 10, 20, 10, 0) }),
    );

    expect(third.practiceDays).toEqual([
      { date: "2026-11-21", answered: 2, correct: 1 },
      { date: "2026-11-20", answered: 1, correct: 1 },
    ]);
  });

  it("keeps only the 20 newest misses, newest first", () => {
    let stats = emptyStats("mnemonica");
    for (let index = 0; index < 25; index += 1) {
      stats = applyAnswer(
        "mnemonica",
        stats,
        answer({
          correct: false,
          position: (index % 52) + 1,
          at: new Date(2026, 10, 21, 12, 0, index),
        }),
      );
    }

    expect(stats.recentMisses).toHaveLength(20);
    expect(stats.recentMisses[0]?.position).toBe(25);
    expect(stats.recentMisses[19]?.position).toBe(6);
  });

  it("persists graded stats through storage immediately", () => {
    const storage = new MemoryStorage();
    const store = new AppStore(storage);
    store.load();
    const state = createDefaultState();
    const stats = applyAnswer("mnemonica", undefined, answer());
    state.stats.mnemonica = stats;
    expect(store.save(state)).toEqual({ ok: true });

    const reloaded = new AppStore(storage).load();
    expect(reloaded.ok).toBe(true);
    expect(reloaded.state.stats.mnemonica).toEqual(stats);
  });
});

describe("session scoring", () => {
  it("tracks correctness, current run, and session-best run", () => {
    let progress = createSessionProgress();
    progress = applySessionAnswer(progress, answer());
    progress = applySessionAnswer(progress, answer());
    progress = applySessionAnswer(progress, answer({ correct: false }));
    progress = applySessionAnswer(progress, answer());

    expect(progress).toMatchObject({
      answered: 4,
      correct: 3,
      missed: 1,
      currentRun: 1,
      bestRun: 2,
    });
    expect(progress.misses).toHaveLength(1);
  });

  it("starts the session best at zero", () => {
    expect(createSessionProgress().bestRun).toBe(0);
  });

  it("computes whole-percent accuracy", () => {
    expect(accuracyPercent(0, 0)).toBeNull();
    expect(accuracyPercent(26, 52)).toBe(50);
    expect(accuracyPercent(1, 3)).toBe(33);
    expect(accuracyPercent(52, 52)).toBe(100);
  });
});
