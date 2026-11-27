import { isRecord, parseAppState } from "./app-state";
import { DEFAULT_SETTINGS_TOGGLES } from "./settings";
import {
  isDirection,
  type AppState,
  type ModeStats,
  type StackModes,
} from "./types";

export type MigrationFailure = "newer-schema" | "invalid";

export type MigrationResult =
  | { ok: true; state: AppState; migrated: boolean }
  | { ok: false; reason: MigrationFailure };

function invalid(): MigrationResult {
  return { ok: false, reason: "invalid" };
}

function migrateFromV1(value: Record<string, unknown>): MigrationResult {
  const rawSettings = value.settings;
  if (!isRecord(rawSettings)) return invalid();
  if (typeof rawSettings.selectedStackId !== "string") return invalid();
  if (!isDirection(rawSettings.direction)) return invalid();
  if (!isRecord(value.stats)) return invalid();

  const stats: Record<string, StackModes> = {};
  for (const [stackId, rawStats] of Object.entries(value.stats)) {
    if (!isRecord(rawStats)) return invalid();
    stats[stackId] = {
      basic: {
        ...rawStats,
        stackId,
        mode: "basic",
        cards: {},
      } as ModeStats,
    };
  }

  const state = parseAppState({
    schemaVersion: 3,
    settings: {
      selectedStackId: rawSettings.selectedStackId,
      direction: rawSettings.direction,
      ...DEFAULT_SETTINGS_TOGGLES,
    },
    customStacks: value.customStacks,
    stats,
  });

  return state ? { ok: true, state, migrated: true } : invalid();
}

export function migrateState(value: unknown): MigrationResult {
  if (!isRecord(value)) return invalid();

  const version = value.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version)) {
    return invalid();
  }
  if (version > 3) return { ok: false, reason: "newer-schema" };
  if (version === 3) {
    const state = parseAppState(value);
    return state ? { ok: true, state, migrated: false } : invalid();
  }
  if (version === 2) {
    const state = parseAppState({ ...value, schemaVersion: 3 });
    return state ? { ok: true, state, migrated: true } : invalid();
  }
  if (version === 1) return migrateFromV1(value);

  return invalid();
}
