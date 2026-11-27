import { builtInStacks } from "../data/stacks";
import { withDefaultSettings } from "./settings";
import { formatLocalDate } from "./scoring";
import { isRecord } from "./app-state";
import { migrateState } from "./migrate";
import { validateStackName } from "./stack-validation";
import type {
  AppState,
  CardStats,
  CustomStack,
  Mode,
  ModeStats,
  StackModes,
} from "./types";

export const BACKUP_FORMAT = "open-stacks-trainer-backup";
export const BACKUP_FORMAT_VERSION = 1;
export const SUPPORTED_SCHEMA_VERSION = 3;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  schemaVersion: number;
  exportedAt: string;
  settings: AppState["settings"];
  customStacks: CustomStack[];
  stats: Record<string, StackModes>;
}

export type BackupError =
  | { code: "not-backup" }
  | { code: "newer-format" }
  | { code: "newer-schema" }
  | { code: "invalid" }
  | { code: "reserved-name"; name: string }
  | { code: "duplicate-name"; name: string };

export type BackupParseResult =
  | { ok: true; state: AppState }
  | { ok: false; error: BackupError };

function copyCardStats(card: CardStats): CardStats {
  return { ...card };
}

function copyModeStats(stats: ModeStats): ModeStats {
  return {
    ...stats,
    practiceDays: stats.practiceDays.map((day) => ({ ...day })),
    recentMisses: stats.recentMisses.map((miss) =>
      "distances" in miss
        ? { ...miss, distances: [...miss.distances] as typeof miss.distances }
        : { ...miss },
    ),
    cards: Object.fromEntries(
      Object.entries(stats.cards).map(([card, value]) => [
        card,
        copyCardStats(value),
      ]),
    ),
    ...(stats.ranks
      ? {
          ranks: Object.fromEntries(
            Object.entries(stats.ranks).map(([rank, value]) => [
              rank,
              copyCardStats(value),
            ]),
          ),
        }
      : {}),
  };
}

function copyStackModes(modes: StackModes): StackModes {
  const copy: StackModes = {};
  for (const [mode, stats] of Object.entries(modes)) {
    if (stats) copy[mode as Mode] = copyModeStats(stats);
  }
  return copy;
}

export function createBackup(state: AppState, exportedAt: Date): BackupFile {
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: SUPPORTED_SCHEMA_VERSION,
    exportedAt: exportedAt.toISOString(),
    settings: { ...state.settings },
    customStacks: state.customStacks.map((stack) => ({
      ...stack,
      order: [...stack.order],
    })),
    stats: Object.fromEntries(
      Object.entries(state.stats).map(([stackId, modes]) => [
        stackId,
        copyStackModes(modes),
      ]),
    ),
  };
}

export function backupFileName(date: Date): string {
  return `open-stacks-trainer-backup-${formatLocalDate(date)}.json`;
}

function invalid(): BackupParseResult {
  return { ok: false, error: { code: "invalid" } };
}

function validateCustomStackNames(
  customStacks: readonly CustomStack[],
): BackupError | null {
  const reservedNames = builtInStacks.map((stack) => stack.name);
  const seenNames: string[] = [];
  const seenIds = new Set<string>();

  for (const stack of customStacks) {
    if (seenIds.has(stack.id)) return { code: "invalid" };
    seenIds.add(stack.id);

    const checked = validateStackName(stack.name, {
      reservedNames,
      takenNames: seenNames,
    });
    if (!checked.ok) {
      if (checked.error === "reserved") {
        return { code: "reserved-name", name: stack.name.trim() };
      }
      if (checked.error === "duplicate") {
        return { code: "duplicate-name", name: stack.name.trim() };
      }
      return { code: "invalid" };
    }
    seenNames.push(checked.name);
  }

  return null;
}

export function parseBackup(value: unknown): BackupParseResult {
  if (!isRecord(value)) return invalid();
  if (value.format !== BACKUP_FORMAT) {
    return { ok: false, error: { code: "not-backup" } };
  }

  if (typeof value.formatVersion !== "number") return invalid();
  if (value.formatVersion > BACKUP_FORMAT_VERSION) {
    return { ok: false, error: { code: "newer-format" } };
  }
  if (value.formatVersion !== BACKUP_FORMAT_VERSION) return invalid();

  if (typeof value.exportedAt !== "string") return invalid();

  const migration = migrateState({
    schemaVersion: value.schemaVersion,
    settings: value.settings,
    customStacks: value.customStacks,
    stats: value.stats,
  });
  if (!migration.ok) {
    return migration.reason === "newer-schema"
      ? { ok: false, error: { code: "newer-schema" } }
      : invalid();
  }

  const nameError = validateCustomStackNames(migration.state.customStacks);
  if (nameError) return { ok: false, error: nameError };

  return {
    ok: true,
    state: {
      ...migration.state,
      settings: withDefaultSettings(migration.state.settings),
    },
  };
}
