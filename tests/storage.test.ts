import { describe, expect, it } from "vitest";
import {
  AppStore,
  createDefaultState,
  SCHEMA_VERSION,
  STORAGE_KEY,
  type StorageLike,
} from "../src/storage/app-store";

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

class FullStorage extends MemoryStorage {
  override setItem(): void {
    const error = new Error("full");
    error.name = "QuotaExceededError";
    throw error;
  }
}

describe("app storage", () => {
  it("returns defaults on first run", () => {
    const store = new AppStore(new MemoryStorage());
    const result = store.load();
    expect(result.ok).toBe(true);
    expect(result.issue).toBeNull();
    expect(result.state).toEqual(createDefaultState());
  });

  it("uses schema v2 defaults for new settings", () => {
    const state = createDefaultState();
    expect(state.schemaVersion).toBe(2);
    expect(state.settings).toMatchObject({
      mode: "basic",
      reinforcement: false,
      accelerate: false,
      accelerateThresholdTenths: 10,
      endless: false,
      language: "en",
    });
  });

  it("saves and loads the same state", () => {
    const storage = new MemoryStorage();
    const store = new AppStore(storage);
    store.load();
    const state = createDefaultState("aronson");
    state.settings.direction = "card-to-position";

    expect(store.save(state)).toEqual({ ok: true });
    expect(new AppStore(storage).load().state).toEqual(state);
  });

  it("reports corrupt JSON and leaves it untouched", () => {
    const storage = new MemoryStorage();
    const raw = "{not json";
    storage.values.set(STORAGE_KEY, raw);
    const store = new AppStore(storage);

    const result = store.load();
    expect(result).toMatchObject({ ok: false, issue: { kind: "corrupt" } });
    expect(store.save(createDefaultState())).toEqual({
      ok: false,
      reason: "blocked",
    });
    expect(storage.values.get(STORAGE_KEY)).toBe(raw);
  });

  it("refuses to overwrite a newer schema", () => {
    const storage = new MemoryStorage();
    const raw = JSON.stringify({ ...createDefaultState(), schemaVersion: 3 });
    storage.values.set(STORAGE_KEY, raw);
    const store = new AppStore(storage);

    expect(store.load()).toMatchObject({
      ok: false,
      issue: { kind: "newer-schema" },
    });
    expect(store.save(createDefaultState())).toEqual({
      ok: false,
      reason: "blocked",
    });
    expect(storage.values.get(STORAGE_KEY)).toBe(raw);
  });

  it("accepts the current schema version", () => {
    const storage = new MemoryStorage();
    storage.values.set(
      STORAGE_KEY,
      JSON.stringify({ ...createDefaultState(), schemaVersion: SCHEMA_VERSION }),
    );
    expect(new AppStore(storage).load().ok).toBe(true);
  });

  it("migrates a v1 payload and writes v2 back to storage", () => {
    const storage = new MemoryStorage();
    const v1 = {
      schemaVersion: 1,
      settings: { selectedStackId: "aronson", direction: "position-to-card" },
      customStacks: [],
      stats: {
        mnemonica: {
          stackId: "mnemonica",
          currentStreak: 4,
          bestStreak: 7,
          totalAnswered: 12,
          totalCorrect: 10,
          lastPracticedAt: "2026-11-21T12:00:00.000Z",
          practiceDays: [{ date: "2026-11-21", answered: 12, correct: 10 }],
          recentMisses: [],
        },
      },
    };
    storage.values.set(STORAGE_KEY, JSON.stringify(v1));

    const result = new AppStore(storage).load();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.schemaVersion).toBe(2);
    expect(result.state.settings.selectedStackId).toBe("aronson");
    expect(result.state.settings.mode).toBe("basic");
    expect(result.state.stats.mnemonica?.basic?.totalAnswered).toBe(12);
    expect(result.state.stats.mnemonica?.["card-plus-3"]).toBeUndefined();

    const written = JSON.parse(storage.values.get(STORAGE_KEY) ?? "{}") as {
      schemaVersion?: number;
    };
    expect(written.schemaVersion).toBe(2);
  });

  it("degrades when storage is unavailable", () => {
    const store = new AppStore(null);
    expect(store.load()).toMatchObject({
      ok: false,
      issue: { kind: "unavailable" },
    });
    expect(store.save(createDefaultState())).toEqual({
      ok: false,
      reason: "unavailable",
    });
  });

  it("reports a full storage quota without crashing", () => {
    const store = new AppStore(new FullStorage());
    store.load();
    expect(store.save(createDefaultState())).toEqual({
      ok: false,
      reason: "quota",
    });
  });

  it("resets corrupt data only through an explicit reset", () => {
    const storage = new MemoryStorage();
    storage.values.set(STORAGE_KEY, "{bad");
    const store = new AppStore(storage);
    store.load();

    expect(store.reset()).toEqual({ ok: true });
    expect(storage.values.has(STORAGE_KEY)).toBe(false);
    expect(store.getIssue()).toBeNull();
  });
});
