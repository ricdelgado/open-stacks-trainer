import {
  isDirection,
  type AppState,
  type CustomStack,
  type MissRecord,
  type PracticeDay,
  type StackStats,
} from "../domain/types";

export const STORAGE_KEY = "open-stacks-trainer";
export const SCHEMA_VERSION = 1;
export const DEFAULT_STACK_ID = "mnemonica";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type LoadIssueKind = "corrupt" | "newer-schema" | "unavailable";
export type SaveFailureReason = "blocked" | "quota" | "unavailable";

export interface StorageIssue {
  kind: LoadIssueKind;
}

export type LoadResult =
  | { ok: true; state: AppState; issue: null }
  | { ok: false; state: AppState; issue: StorageIssue };

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: SaveFailureReason };

export function createDefaultState(
  selectedStackId: string = DEFAULT_STACK_ID,
): AppState {
  return {
    schemaVersion: 1,
    settings: {
      selectedStackId,
      direction: "mixed",
    },
    customStacks: [],
    stats: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPracticeDay(value: unknown): value is PracticeDay {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    typeof value.answered === "number" &&
    Number.isInteger(value.answered) &&
    value.answered >= 0 &&
    typeof value.correct === "number" &&
    Number.isInteger(value.correct) &&
    value.correct >= 0 &&
    value.correct <= value.answered
  );
}

function isMissRecord(value: unknown): value is MissRecord {
  return (
    isRecord(value) &&
    typeof value.card === "string" &&
    typeof value.position === "number" &&
    Number.isInteger(value.position) &&
    value.position >= 1 &&
    value.position <= 52 &&
    (value.direction === "position-to-card" ||
      value.direction === "card-to-position") &&
    typeof value.at === "string"
  );
}

function isStackStats(value: unknown): value is StackStats {
  return (
    isRecord(value) &&
    typeof value.stackId === "string" &&
    typeof value.currentStreak === "number" &&
    Number.isInteger(value.currentStreak) &&
    value.currentStreak >= 0 &&
    typeof value.bestStreak === "number" &&
    Number.isInteger(value.bestStreak) &&
    value.bestStreak >= 0 &&
    typeof value.totalAnswered === "number" &&
    Number.isInteger(value.totalAnswered) &&
    value.totalAnswered >= 0 &&
    typeof value.totalCorrect === "number" &&
    Number.isInteger(value.totalCorrect) &&
    value.totalCorrect >= 0 &&
    value.totalCorrect <= value.totalAnswered &&
    typeof value.lastPracticedAt === "string" &&
    Array.isArray(value.practiceDays) &&
    value.practiceDays.every(isPracticeDay) &&
    Array.isArray(value.recentMisses) &&
    value.recentMisses.every(isMissRecord)
  );
}

function isCustomStack(value: unknown): value is CustomStack {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.creator === "string" &&
    Array.isArray(value.order) &&
    value.order.length === 52 &&
    value.order.every((card) => typeof card === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function parseState(value: unknown): AppState | null {
  if (!isRecord(value)) return null;
  if (!isRecord(value.settings)) return null;
  if (typeof value.settings.selectedStackId !== "string") return null;
  if (!isDirection(value.settings.direction)) return null;
  if (!Array.isArray(value.customStacks)) return null;
  if (!value.customStacks.every(isCustomStack)) return null;
  if (!isRecord(value.stats)) return null;
  if (!Object.values(value.stats).every(isStackStats)) return null;

  return value as unknown as AppState;
}

function resolveBrowserStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
}

export class AppStore {
  private readonly storage: StorageLike | null;
  private issue: StorageIssue | null = null;

  constructor(storage: StorageLike | null = resolveBrowserStorage()) {
    this.storage = storage;
  }

  load(): LoadResult {
    if (!this.storage) {
      this.issue = { kind: "unavailable" };
      return { ok: false, state: createDefaultState(), issue: this.issue };
    }

    let raw: string | null;
    try {
      raw = this.storage.getItem(STORAGE_KEY);
    } catch {
      this.issue = { kind: "unavailable" };
      return { ok: false, state: createDefaultState(), issue: this.issue };
    }

    if (raw === null || raw.trim() === "") {
      this.issue = null;
      return { ok: true, state: createDefaultState(), issue: null };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.issue = { kind: "corrupt" };
      return { ok: false, state: createDefaultState(), issue: this.issue };
    }

    if (!isRecord(parsed) || typeof parsed.schemaVersion !== "number") {
      this.issue = { kind: "corrupt" };
      return { ok: false, state: createDefaultState(), issue: this.issue };
    }

    if (parsed.schemaVersion > SCHEMA_VERSION) {
      this.issue = { kind: "newer-schema" };
      return { ok: false, state: createDefaultState(), issue: this.issue };
    }

    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      this.issue = { kind: "corrupt" };
      return { ok: false, state: createDefaultState(), issue: this.issue };
    }

    const state = parseState(parsed);
    if (!state) {
      this.issue = { kind: "corrupt" };
      return { ok: false, state: createDefaultState(), issue: this.issue };
    }

    this.issue = null;
    return { ok: true, state, issue: null };
  }

  getIssue(): StorageIssue | null {
    return this.issue;
  }

  save(state: AppState): SaveResult {
    if (this.issue && this.issue.kind !== "unavailable") {
      return { ok: false, reason: "blocked" };
    }
    if (!this.storage) {
      return { ok: false, reason: "unavailable" };
    }

    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        reason: isQuotaError(error) ? "quota" : "unavailable",
      };
    }
  }

  reset(): SaveResult {
    if (!this.storage) {
      this.issue = { kind: "unavailable" };
      return { ok: false, reason: "unavailable" };
    }

    try {
      this.storage.removeItem(STORAGE_KEY);
      this.issue = null;
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        reason: isQuotaError(error) ? "quota" : "unavailable",
      };
    }
  }
}
