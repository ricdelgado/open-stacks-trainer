import { describe, expect, it } from "vitest";
import { parseAppState } from "../src/domain/app-state";
import { migrateState } from "../src/domain/migrate";
import { emptyCardStats, emptyStats } from "../src/domain/scoring";
import { FULL_DECK } from "../src/domain/cards";
import type { AppState } from "../src/domain/types";
import { createDefaultState } from "../src/storage/app-store";

function v1Payload() {
  return {
    schemaVersion: 1,
    settings: { selectedStackId: "aronson", direction: "card-to-position" },
    customStacks: [
      {
        id: "custom-1",
        name: "My Stack",
        creator: "Custom",
        order: [...FULL_DECK],
        createdAt: "2026-11-21T12:00:00.000Z",
        updatedAt: "2026-11-21T12:00:00.000Z",
      },
    ],
    stats: {
      mnemonica: {
        stackId: "mnemonica",
        currentStreak: 3,
        bestStreak: 9,
        totalAnswered: 20,
        totalCorrect: 17,
        lastPracticedAt: "2026-11-21T12:00:00.000Z",
        practiceDays: [{ date: "2026-11-21", answered: 20, correct: 17 }],
        recentMisses: [
          {
            card: "7D",
            position: 7,
            direction: "position-to-card",
            at: "2026-11-21T11:59:00.000Z",
          },
        ],
      },
    },
  };
}

describe("schema migration", () => {
  it("migrates v1 stats into the basic bucket and adds defaults", () => {
    const result = migrateState(v1Payload());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.migrated).toBe(true);
    expect(result.state.schemaVersion).toBe(3);
    expect(result.state.settings).toEqual({
      selectedStackId: "aronson",
      direction: "card-to-position",
      mode: "basic",
      reinforcement: false,
      accelerate: false,
      accelerateThresholdTenths: 10,
      endless: false,
      language: "en",
      appearance: "system",
      installCardDismissed: false,
      statsSections: {
        practiceDays: true,
        recentMisses: true,
        cards: true,
      },
    });
    expect(result.state.customStacks).toHaveLength(1);

    const modes = result.state.stats.mnemonica;
    expect(modes?.basic?.mode).toBe("basic");
    expect(modes?.basic?.totalAnswered).toBe(20);
    expect(modes?.basic?.practiceDays).toEqual([
      { date: "2026-11-21", answered: 20, correct: 17 },
    ]);
    expect(modes?.basic?.cards).toEqual({});
    expect(modes?.["card-plus-3"]).toBeUndefined();
  });

  it("leaves a valid v3 payload unchanged", () => {
    const state = createDefaultState();
    const result = migrateState(state);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.migrated).toBe(false);
    expect(result.state).toEqual(state);
  });

  it("migrates a v2 payload to v3 without reordering it", () => {
    const state = createDefaultState();
    state.settings.appearance = "dark";
    state.settings.installCardDismissed = true;
    state.stats.mnemonica = {
      basic: {
        ...emptyStats("mnemonica"),
        totalAnswered: 1,
        totalCorrect: 1,
        cards: { "7D": { ...emptyCardStats(), currentStreak: 1 } },
      },
    };
    const v2 = { ...state, schemaVersion: 2 };
    const result = migrateState(v2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.migrated).toBe(true);
    expect(result.state).toEqual({ ...state, schemaVersion: 3 });
    expect(result.state.settings.appearance).toBe("dark");
    expect(result.state.settings.installCardDismissed).toBe(true);
    expect(result.state.stats.mnemonica?.basic?.totalAnswered).toBe(1);
    expect(result.state.stats.mnemonica?.quartets).toBeUndefined();
  });

  it("refuses a newer schema", () => {
    expect(migrateState({ ...createDefaultState(), schemaVersion: 4 })).toEqual({
      ok: false,
      reason: "newer-schema",
    });
  });

  it("rejects unknown, missing, or malformed versions", () => {
    expect(migrateState({ ...createDefaultState(), schemaVersion: 0 })).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(migrateState({ ...createDefaultState(), schemaVersion: "2" })).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(migrateState("text")).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects a v1 payload whose stats are inconsistent", () => {
    const v1 = v1Payload();
    const stats = v1.stats.mnemonica;
    stats.totalCorrect = stats.totalAnswered + 1;
    expect(migrateState(v1)).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("schema v3 validation", () => {
  function stateWithCard(): AppState {
    const state = createDefaultState();
    state.stats.mnemonica = {
      basic: {
        ...emptyStats("mnemonica"),
        totalAnswered: 1,
        totalCorrect: 1,
        cards: { "7D": { ...emptyCardStats(), currentStreak: 1 } },
      },
    };
    return state;
  }

  it("accepts a valid payload with per-card records", () => {
    expect(parseAppState(stateWithCard())).not.toBeNull();
  });

  it("accepts a quartets bucket with rank records and quartet misses", () => {
    const state = createDefaultState();
    state.stats.mnemonica = {
      quartets: {
        ...emptyStats("mnemonica", "quartets"),
        totalAnswered: 1,
        recentMisses: [
          {
            rank: "7",
            firstCard: "7S",
            distances: [4, 6, 8],
            at: "2026-11-21T12:00:00.000Z",
          },
        ],
        ranks: { "7": { ...emptyCardStats(), currentStreak: 1 } },
      },
    };

    expect(parseAppState(state)).not.toBeNull();
  });

  it("rejects card misses in the quartets mode", () => {
    const state = createDefaultState();
    state.stats.mnemonica = {
      quartets: {
        ...emptyStats("mnemonica", "quartets"),
        recentMisses: [
          {
            card: "7D",
            position: 7,
            direction: "position-to-card",
            at: "2026-11-21T12:00:00.000Z",
          },
        ],
      },
    };

    expect(parseAppState(state)).toBeNull();
  });

  it("rejects quartet misses outside the quartets mode", () => {
    const state = createDefaultState();
    state.stats.mnemonica = {
      basic: {
        ...emptyStats("mnemonica"),
        recentMisses: [
          {
            rank: "7",
            firstCard: "7S",
            distances: [4, 6, 8],
            at: "2026-11-21T12:00:00.000Z",
          },
        ],
      },
    };

    expect(parseAppState(state)).toBeNull();
  });

  it("rejects per-card values that are not safe integers", () => {
    const state = stateWithCard();
    const card = state.stats.mnemonica?.basic?.cards["7D"];
    if (!card) throw new Error("expected card");
    card.elapsedTenths = Number.MAX_SAFE_INTEGER + 1;

    expect(parseAppState(state)).toBeNull();
  });

  it("rejects negative per-card values", () => {
    const state = stateWithCard();
    const card = state.stats.mnemonica?.basic?.cards["7D"];
    if (!card) throw new Error("expected card");
    card.timesMissed = -1;

    expect(parseAppState(state)).toBeNull();
  });

  it("rejects an unknown mode key or a mismatched stats mode", () => {
    const state = stateWithCard();
    const basic = state.stats.mnemonica?.basic;
    if (!basic) throw new Error("expected basic stats");
    basic.mode = "card-plus-3";

    expect(parseAppState(state)).toBeNull();
  });
});
