import { RANKS, type Rank } from "./cards";
import type { QuartetDistances } from "./quartets";

export const DIRECTIONS = [
  "position-to-card",
  "card-to-position",
  "mixed",
] as const;

export type Direction = (typeof DIRECTIONS)[number];

export const MODES = ["basic", "card-plus-3", "quartets"] as const;

export type Mode = (typeof MODES)[number];

export const APPEARANCES = ["light", "dark", "system"] as const;

export type Appearance = (typeof APPEARANCES)[number];

export const DEFAULT_ACCELERATE_THRESHOLD_TENTHS = 10;

export const REINFORCEMENT_CLEAR_STREAK = 5;

export interface StatsSections {
  practiceDays: boolean;
  recentMisses: boolean;
  cards: boolean;
}

export interface Settings {
  selectedStackId: string;
  direction: Direction;
  mode: Mode;
  reinforcement: boolean;
  accelerate: boolean;
  accelerateThresholdTenths: number;
  endless: boolean;
  language: string;
  appearance?: Appearance;
  installCardDismissed?: boolean;
  statsSections?: StatsSections;
}

export interface CustomStack {
  id: string;
  name: string;
  creator: string;
  order: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PracticeDay {
  date: string;
  answered: number;
  correct: number;
}

export interface CardMissRecord {
  card: string;
  position: number;
  direction: Exclude<Direction, "mixed">;
  at: string;
}

export interface QuartetMissRecord {
  rank: Rank;
  firstCard: string;
  distances: QuartetDistances;
  at: string;
}

export type MissRecord = CardMissRecord | QuartetMissRecord;

export interface CardStats {
  currentStreak: number;
  timesMissed: number;
  elapsedTenths: number;
  correctTimedAnswers: number;
  inReinforcement: boolean;
}

export type RankStats = CardStats;

export interface ModeStats {
  stackId: string;
  mode: Mode;
  currentStreak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  lastPracticedAt: string;
  practiceDays: PracticeDay[];
  recentMisses: MissRecord[];
  cards: Record<string, CardStats>;
  ranks?: Partial<Record<Rank, RankStats>>;
}

export type StackModes = Partial<Record<Mode, ModeStats>>;

export interface AppState {
  schemaVersion: 3;
  settings: Settings;
  customStacks: CustomStack[];
  stats: Record<string, StackModes>;
}

export function isDirection(value: unknown): value is Direction {
  return typeof value === "string" && DIRECTIONS.includes(value as Direction);
}

export function isMode(value: unknown): value is Mode {
  return typeof value === "string" && MODES.includes(value as Mode);
}

export function isAppearance(value: unknown): value is Appearance {
  return (
    typeof value === "string" && APPEARANCES.includes(value as Appearance)
  );
}

export function isRank(value: unknown): value is Rank {
  return typeof value === "string" && RANKS.includes(value as Rank);
}
