import { describe, expect, it } from "vitest";
import {
  backupFileName,
  createBackup,
  parseBackup,
  type BackupFile,
} from "../src/domain/backup";
import { FULL_DECK } from "../src/domain/cards";
import { emptyCardStats, emptyStats } from "../src/domain/scoring";
import type { AppState, CustomStack } from "../src/domain/types";
import { createDefaultState } from "../src/storage/app-store";

function customStack(
  id: string,
  name: string,
  order: readonly string[] = FULL_DECK,
): CustomStack {
  return {
    id,
    name,
    creator: "Custom",
    order: [...order],
    createdAt: "2026-11-21T12:00:00.000Z",
    updatedAt: "2026-11-21T12:00:00.000Z",
  };
}

function stateWithPractice(): AppState {
  const state = createDefaultState("custom-1");
  state.settings.direction = "card-to-position";
  state.customStacks = [customStack("custom-1", "My Stack")];
  state.stats["custom-1"] = {
    basic: {
      ...emptyStats("custom-1"),
      currentStreak: 2,
      bestStreak: 5,
      totalAnswered: 10,
      totalCorrect: 8,
      lastPracticedAt: "2026-11-21T12:00:00.000Z",
      practiceDays: [{ date: "2026-11-21", answered: 10, correct: 8 }],
      recentMisses: [
        {
          card: "7D",
          position: 7,
          direction: "position-to-card",
          at: "2026-11-21T11:59:00.000Z",
        },
      ],
    },
  };
  return state;
}

function backupFor(state: AppState): BackupFile {
  return createBackup(state, new Date(2026, 10, 21, 12, 0, 0));
}

describe("backup export and restore", () => {
  it("creates a versioned backup with settings, customs, and stats", () => {
    const state = stateWithPractice();
    const backup = backupFor(state);

    expect(backup).toMatchObject({
      format: "open-stacks-trainer-backup",
      formatVersion: 1,
      schemaVersion: 3,
      exportedAt: new Date(2026, 10, 21, 12, 0, 0).toISOString(),
    });
    expect(backup.customStacks).toEqual(state.customStacks);
    expect(backup.stats["custom-1"]).toEqual(state.stats["custom-1"]);
  });

  it("round-trips a backup into the same state", () => {
    const state = stateWithPractice();
    const result = parseBackup(backupFor(state));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state).toEqual(state);
  });

  it("deep-copies nested mode and card stats", () => {
    const state = stateWithPractice();
    const basic = state.stats["custom-1"]?.basic;
    if (!basic) throw new Error("expected basic stats");
    basic.cards["7D"] = emptyCardStats();

    const backup = backupFor(state);
    const backupCard = backup.stats["custom-1"]?.basic?.cards["7D"];
    if (!backupCard) throw new Error("expected backup card");
    backupCard.timesMissed = 99;

    expect(basic.cards["7D"]?.timesMissed).toBe(0);
  });

  it("replaces rather than merges when parsing a backup", () => {
    const current = stateWithPractice();
    current.stats.mnemonica = {
      basic: {
        ...emptyStats("mnemonica"),
        totalAnswered: 3,
        totalCorrect: 1,
        lastPracticedAt: "2026-11-22T08:00:00.000Z",
      },
    };
    current.customStacks.push(customStack("custom-2", "Other Stack"));

    const backupState = createDefaultState("aronson");
    const result = parseBackup(backupFor(backupState));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.customStacks).toEqual([]);
    expect(result.state.stats).toEqual({});
    expect(result.state.settings.selectedStackId).toBe("aronson");
  });

  it("defaults a missing appearance in an older v2 backup", () => {
    const backup = backupFor(stateWithPractice());
    const settings = { ...backup.settings };
    delete (settings as { appearance?: unknown }).appearance;

    const result = parseBackup({ ...backup, settings });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.settings.appearance).toBe("system");
  });

  it("defaults a missing install-card dismissal in an older v2 backup", () => {
    const backup = backupFor(stateWithPractice());
    const settings = { ...backup.settings };
    delete (settings as { installCardDismissed?: unknown })
      .installCardDismissed;

    const result = parseBackup({ ...backup, settings });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.settings.installCardDismissed).toBe(false);
  });

  it("migrates a schema v1 backup into schema v3", () => {
    const v1 = {
      format: "open-stacks-trainer-backup",
      formatVersion: 1,
      schemaVersion: 1,
      exportedAt: "2026-11-21T12:00:00.000Z",
      settings: { selectedStackId: "mnemonica", direction: "mixed" },
      customStacks: [],
      stats: {
        mnemonica: {
          stackId: "mnemonica",
          currentStreak: 3,
          bestStreak: 9,
          totalAnswered: 20,
          totalCorrect: 17,
          lastPracticedAt: "2026-11-21T12:00:00.000Z",
          practiceDays: [{ date: "2026-11-21", answered: 20, correct: 17 }],
          recentMisses: [],
        },
      },
    };

    const result = parseBackup(v1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.schemaVersion).toBe(3);
    expect(result.state.settings.mode).toBe("basic");
    const basic = result.state.stats.mnemonica?.basic;
    expect(basic?.totalAnswered).toBe(20);
    expect(basic?.cards).toEqual({});
  });

  it("migrates a schema v2 backup into schema v3", () => {
    const state = stateWithPractice();
    const backup = { ...backupFor(state), schemaVersion: 2 };
    const result = parseBackup(backup);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.schemaVersion).toBe(3);
    expect(result.state.stats["custom-1"]).toEqual(state.stats["custom-1"]);
  });

  it("round-trips quartet ranks and distances without aliasing", () => {
    const state = createDefaultState();
    state.stats.mnemonica = {
      quartets: {
        ...emptyStats("mnemonica", "quartets"),
        totalAnswered: 1,
        totalCorrect: 1,
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

    const backup = backupFor(state);
    const result = parseBackup(backup);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state).toEqual(state);

    const backupRank = backup.stats.mnemonica?.quartets?.ranks?.["7"];
    if (backupRank) backupRank.timesMissed = 99;
    const backupMiss = backup.stats.mnemonica?.quartets?.recentMisses[0];
    if (backupMiss && "distances" in backupMiss) {
      (backupMiss.distances as unknown as number[])[0] = 99;
    }
    expect(state.stats.mnemonica?.quartets?.ranks?.["7"]?.timesMissed).toBe(0);
    expect(
      state.stats.mnemonica?.quartets?.recentMisses[0],
    ).toMatchObject({ distances: [4, 6, 8] });
  });

  it("names the backup file with the local date", () => {
    expect(backupFileName(new Date(2026, 10, 21, 12, 0, 0))).toBe(
      "open-stacks-trainer-backup-2026-11-21.json",
    );
  });

  it("refuses a file that is not a backup", () => {
    expect(parseBackup({ format: "open-stacks-trainer-stack" })).toEqual({
      ok: false,
      error: { code: "not-backup" },
    });
    expect(parseBackup("text")).toEqual({
      ok: false,
      error: { code: "invalid" },
    });
  });

  it("refuses a newer format version", () => {
    const backup = { ...backupFor(stateWithPractice()), formatVersion: 2 };
    expect(parseBackup(backup)).toEqual({
      ok: false,
      error: { code: "newer-format" },
    });
  });

  it("refuses a newer schema version", () => {
    const backup = { ...backupFor(stateWithPractice()), schemaVersion: 4 };
    expect(parseBackup(backup)).toEqual({
      ok: false,
      error: { code: "newer-schema" },
    });
  });

  it("rejects incomplete or damaged backups", () => {
    const backup = backupFor(stateWithPractice());
    expect(parseBackup({ ...backup, exportedAt: undefined })).toEqual({
      ok: false,
      error: { code: "invalid" },
    });
    expect(parseBackup({ ...backup, stats: null })).toEqual({
      ok: false,
      error: { code: "invalid" },
    });

    const badOrder = [
      { ...customStack("custom-1", "My Stack"), order: FULL_DECK.slice(0, 51) },
    ];
    expect(parseBackup({ ...backup, customStacks: badOrder })).toEqual({
      ok: false,
      error: { code: "invalid" },
    });
  });

  it("rejects duplicate custom names case-insensitively", () => {
    const backup = backupFor(stateWithPractice());
    expect(
      parseBackup({
        ...backup,
        customStacks: [
          customStack("custom-1", "My Stack"),
          customStack("custom-2", "my stack"),
        ],
      }),
    ).toEqual({
      ok: false,
      error: { code: "duplicate-name", name: "my stack" },
    });
  });

  it("rejects a custom name that collides with a built-in", () => {
    const backup = backupFor(stateWithPractice());
    expect(
      parseBackup({
        ...backup,
        customStacks: [customStack("custom-1", "Mnemonica")],
      }),
    ).toEqual({
      ok: false,
      error: { code: "reserved-name", name: "Mnemonica" },
    });
  });

  it("rejects duplicate custom IDs", () => {
    const backup = backupFor(stateWithPractice());
    expect(
      parseBackup({
        ...backup,
        customStacks: [
          customStack("custom-1", "My Stack"),
          customStack("custom-1", "Other Stack"),
        ],
      }),
    ).toEqual({
      ok: false,
      error: { code: "invalid" },
    });
  });
});
