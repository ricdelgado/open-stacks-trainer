export const DIRECTIONS = [
  "position-to-card",
  "card-to-position",
  "mixed",
] as const;

export type Direction = (typeof DIRECTIONS)[number];

export interface Settings {
  selectedStackId: string;
  direction: Direction;
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

export interface MissRecord {
  card: string;
  position: number;
  direction: Exclude<Direction, "mixed">;
  at: string;
}

export interface StackStats {
  stackId: string;
  currentStreak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  lastPracticedAt: string;
  practiceDays: PracticeDay[];
  recentMisses: MissRecord[];
}

export interface AppState {
  schemaVersion: 1;
  settings: Settings;
  customStacks: CustomStack[];
  stats: Record<string, StackStats>;
}

export function isDirection(value: unknown): value is Direction {
  return typeof value === "string" && DIRECTIONS.includes(value as Direction);
}
