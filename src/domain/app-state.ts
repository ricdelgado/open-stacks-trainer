import { isCardCode } from "./cards";
import {
  isDirection,
  type AppState,
  type CustomStack,
  type MissRecord,
  type PracticeDay,
  type StackStats,
} from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasValidOrder(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length !== 52) return false;
  if (!value.every(isCardCode)) return false;
  return new Set(value).size === 52;
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

export function isStackStats(value: unknown): value is StackStats {
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

export function isCustomStack(value: unknown): value is CustomStack {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    typeof value.creator === "string" &&
    hasValidOrder(value.order) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

export function parseAppState(value: unknown): AppState | null {
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
