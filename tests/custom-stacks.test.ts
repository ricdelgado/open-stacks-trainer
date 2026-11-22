import { describe, expect, it } from "vitest";
import { FULL_DECK } from "../src/domain/cards";
import {
  createCustomStack,
  updateCustomStack,
} from "../src/domain/custom-stacks";
import { emptyStats } from "../src/domain/scoring";
import {
  AppStore,
  createDefaultState,
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

describe("custom stacks", () => {
  it("creates a stack with a stable ID and timestamps", () => {
    const now = new Date("2026-11-21T12:00:00.000Z");
    const stack = createCustomStack(
      { name: "My Stack", order: FULL_DECK },
      now,
      "custom-1",
    );

    expect(stack).toEqual({
      id: "custom-1",
      name: "My Stack",
      creator: "Custom",
      order: [...FULL_DECK],
      createdAt: "2026-11-21T12:00:00.000Z",
      updatedAt: "2026-11-21T12:00:00.000Z",
    });
  });

  it("renames without changing the ID, creator, or creation time", () => {
    const created = createCustomStack(
      { name: "My Stack", order: FULL_DECK },
      new Date("2026-11-21T12:00:00.000Z"),
      "custom-1",
    );
    const renamed = updateCustomStack(
      created,
      { name: "Renamed Stack", order: FULL_DECK },
      new Date("2026-11-22T12:00:00.000Z"),
    );

    expect(renamed.id).toBe("custom-1");
    expect(renamed.creator).toBe("Custom");
    expect(renamed.createdAt).toBe("2026-11-21T12:00:00.000Z");
    expect(renamed.name).toBe("Renamed Stack");
    expect(renamed.updatedAt).toBe("2026-11-22T12:00:00.000Z");
  });

  it("keeps stats when a custom stack is renamed and saved", () => {
    const storage = new MemoryStorage();
    const store = new AppStore(storage);
    store.load();

    const stack = createCustomStack(
      { name: "My Stack", order: FULL_DECK },
      new Date("2026-11-21T12:00:00.000Z"),
      "custom-1",
    );
    const state = createDefaultState("custom-1");
    state.customStacks = [stack];
    state.stats["custom-1"] = {
      ...emptyStats("custom-1"),
      currentStreak: 4,
      bestStreak: 9,
      totalAnswered: 12,
      totalCorrect: 10,
      lastPracticedAt: "2026-11-21T12:00:00.000Z",
    };
    expect(store.save(state)).toEqual({ ok: true });

    const loaded = new AppStore(storage).load();
    expect(loaded.ok).toBe(true);
    const current = loaded.state.customStacks[0];
    expect(current).toBeDefined();
    if (!current) return;

    const renamed = updateCustomStack(
      current,
      { name: "Renamed Stack", order: current.order },
      new Date("2026-11-22T12:00:00.000Z"),
    );
    expect(
      new AppStore(storage).save({
        ...loaded.state,
        customStacks: [renamed],
      }),
    ).toEqual({ ok: true });

    const reloaded = new AppStore(storage).load();
    expect(reloaded.state.customStacks[0]?.id).toBe("custom-1");
    expect(reloaded.state.stats["custom-1"]?.totalAnswered).toBe(12);
  });
});
