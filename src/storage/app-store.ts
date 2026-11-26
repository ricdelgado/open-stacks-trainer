import { migrateState } from "../domain/migrate";
import {
  DEFAULT_SETTINGS_TOGGLES,
  withDefaultAppearance,
} from "../domain/settings";
import type { AppState } from "../domain/types";

export const STORAGE_KEY = "open-stacks-trainer";
export const SCHEMA_VERSION = 2;
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
    schemaVersion: 2,
    settings: {
      selectedStackId,
      direction: "mixed",
      ...DEFAULT_SETTINGS_TOGGLES,
    },
    customStacks: [],
    stats: {},
  };
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

    const migration = migrateState(parsed);
    if (!migration.ok) {
      this.issue = {
        kind: migration.reason === "newer-schema" ? "newer-schema" : "corrupt",
      };
      return { ok: false, state: createDefaultState(), issue: this.issue };
    }

    if (migration.migrated) {
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(migration.state));
      } catch {
        // Keep the migrated state in memory; the untouched v1 payload remains
        // and will migrate again on the next load.
      }
    }

    const state: AppState = {
      ...migration.state,
      settings: withDefaultAppearance(migration.state.settings),
    };

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
