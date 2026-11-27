import { isCardCode } from "./cards";
import type { QuartetDistances } from "./quartets";
import {
  isAppearance,
  isDirection,
  isMode,
  isRank,
  type AppState,
  type CardStats,
  type CustomStack,
  type MissRecord,
  type Mode,
  type ModeStats,
  type PracticeDay,
  type Settings,
  type StackModes,
} from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeCount(value: unknown): value is number {
  return (
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0
  );
}

function hasValidOrder(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length !== 52) return false;
  if (!value.every(isCardCode)) return false;
  return new Set(value).size === 52;
}

export function isPracticeDay(value: unknown): value is PracticeDay {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    isSafeCount(value.answered) &&
    isSafeCount(value.correct) &&
    value.correct <= value.answered
  );
}

function isQuartetDistances(value: unknown): value is QuartetDistances {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (distance) =>
        typeof distance === "number" &&
        Number.isSafeInteger(distance) &&
        distance >= 1,
    )
  );
}

export function isMissRecord(
  value: unknown,
  mode?: Mode,
): value is MissRecord {
  if (!isRecord(value) || typeof value.at !== "string") return false;

  const quartetShape =
    "rank" in value || "firstCard" in value || "distances" in value;
  if (quartetShape) {
    if (mode !== undefined && mode !== "quartets") return false;
    return (
      isRank(value.rank) &&
      isCardCode(value.firstCard) &&
      isQuartetDistances(value.distances)
    );
  }

  if (mode === "quartets") return false;
  return (
    typeof value.card === "string" &&
    typeof value.position === "number" &&
    Number.isInteger(value.position) &&
    value.position >= 1 &&
    value.position <= 52 &&
    (value.direction === "position-to-card" ||
      value.direction === "card-to-position")
  );
}

export function isCardStats(value: unknown): value is CardStats {
  return (
    isRecord(value) &&
    isSafeCount(value.currentStreak) &&
    isSafeCount(value.timesMissed) &&
    isSafeCount(value.elapsedTenths) &&
    isSafeCount(value.correctTimedAnswers) &&
    typeof value.inReinforcement === "boolean"
  );
}

function isCards(value: unknown): value is Record<string, CardStats> {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([card, stats]) => isCardCode(card) && isCardStats(stats),
    )
  );
}

function isRanks(value: unknown): value is Partial<Record<string, CardStats>> {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([rank, stats]) => isRank(rank) && isCardStats(stats),
    )
  );
}

export function isModeStats(value: unknown): value is ModeStats {
  if (!isRecord(value) || !isMode(value.mode)) return false;
  const mode = value.mode;

  return (
    typeof value.stackId === "string" &&
    isSafeCount(value.currentStreak) &&
    isSafeCount(value.bestStreak) &&
    isSafeCount(value.totalAnswered) &&
    isSafeCount(value.totalCorrect) &&
    value.totalCorrect <= value.totalAnswered &&
    typeof value.lastPracticedAt === "string" &&
    Array.isArray(value.practiceDays) &&
    value.practiceDays.every(isPracticeDay) &&
    Array.isArray(value.recentMisses) &&
    value.recentMisses.every((miss) => isMissRecord(miss, mode)) &&
    isCards(value.cards) &&
    (value.ranks === undefined ||
      (mode === "quartets" && isRanks(value.ranks)))
  );
}

export function isStackModes(value: unknown): value is StackModes {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([mode, stats]) =>
        isMode(mode) && isModeStats(stats) && stats.mode === mode,
    )
  );
}

function isAccelerateThreshold(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

function isStatsSections(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.practiceDays === "boolean" &&
    typeof value.recentMisses === "boolean" &&
    typeof value.cards === "boolean"
  );
}

function isStatsSelection(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.stackId === "string" &&
    value.stackId.length > 0 &&
    isMode(value.mode)
  );
}

export function isSettings(value: unknown): value is Settings {
  return (
    isRecord(value) &&
    typeof value.selectedStackId === "string" &&
    isDirection(value.direction) &&
    isMode(value.mode) &&
    typeof value.reinforcement === "boolean" &&
    typeof value.accelerate === "boolean" &&
    isAccelerateThreshold(value.accelerateThresholdTenths) &&
    typeof value.endless === "boolean" &&
    typeof value.language === "string" &&
    value.language.length > 0 &&
    (value.appearance === undefined || isAppearance(value.appearance)) &&
    (value.installCardDismissed === undefined ||
      typeof value.installCardDismissed === "boolean") &&
    (value.statsSections === undefined || isStatsSections(value.statsSections)) &&
    (value.statsSelection === undefined ||
      isStatsSelection(value.statsSelection))
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
  if (value.schemaVersion !== 3) return null;
  if (!isSettings(value.settings)) return null;
  if (!Array.isArray(value.customStacks)) return null;
  if (!value.customStacks.every(isCustomStack)) return null;
  if (!isRecord(value.stats)) return null;
  if (!Object.values(value.stats).every(isStackModes)) return null;

  return value as unknown as AppState;
}
