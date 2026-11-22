import type { StackStats } from "./types";
import type { ItemDirection } from "./session";

export interface AnswerRecord {
  card: string;
  position: number;
  direction: ItemDirection;
  correct: boolean;
  at: Date;
}

export interface SessionMiss {
  card: string;
  position: number;
  direction: ItemDirection;
}

export interface SessionProgress {
  answered: number;
  correct: number;
  missed: number;
  currentRun: number;
  bestRun: number;
  misses: readonly SessionMiss[];
}

export function formatLocalDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function emptyStats(stackId: string): StackStats {
  return {
    stackId,
    currentStreak: 0,
    bestStreak: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    lastPracticedAt: "",
    practiceDays: [],
    recentMisses: [],
  };
}

export function applyAnswer(
  stackId: string,
  stats: StackStats | undefined,
  answer: AnswerRecord,
): StackStats {
  const base = stats ?? emptyStats(stackId);
  const date = formatLocalDate(answer.at);
  const at = answer.at.toISOString();

  const existingDay = base.practiceDays.find((day) => day.date === date);
  const practiceDays = existingDay
    ? base.practiceDays.map((day) =>
        day.date === date
          ? {
              ...day,
              answered: day.answered + 1,
              correct: day.correct + (answer.correct ? 1 : 0),
            }
          : day,
      )
    : [
        ...base.practiceDays,
        {
          date,
          answered: 1,
          correct: answer.correct ? 1 : 0,
        },
      ];

  practiceDays.sort((left, right) => right.date.localeCompare(left.date));

  const currentStreak = answer.correct ? base.currentStreak + 1 : 0;
  const recentMisses = answer.correct
    ? base.recentMisses
    : [
        {
          card: answer.card,
          position: answer.position,
          direction: answer.direction,
          at,
        },
        ...base.recentMisses,
      ].slice(0, 20);

  return {
    ...base,
    stackId,
    currentStreak,
    bestStreak: Math.max(base.bestStreak, currentStreak),
    totalAnswered: base.totalAnswered + 1,
    totalCorrect: base.totalCorrect + (answer.correct ? 1 : 0),
    lastPracticedAt: at,
    practiceDays,
    recentMisses,
  };
}

export function createSessionProgress(): SessionProgress {
  return {
    answered: 0,
    correct: 0,
    missed: 0,
    currentRun: 0,
    bestRun: 0,
    misses: [],
  };
}

export function applySessionAnswer(
  progress: SessionProgress,
  answer: AnswerRecord,
): SessionProgress {
  if (answer.correct) {
    const currentRun = progress.currentRun + 1;
    return {
      ...progress,
      answered: progress.answered + 1,
      correct: progress.correct + 1,
      currentRun,
      bestRun: Math.max(progress.bestRun, currentRun),
    };
  }

  return {
    ...progress,
    answered: progress.answered + 1,
    missed: progress.missed + 1,
    currentRun: 0,
    misses: [
      ...progress.misses,
      {
        card: answer.card,
        position: answer.position,
        direction: answer.direction,
      },
    ],
  };
}

export function accuracyPercent(
  correct: number,
  answered: number,
): number | null {
  if (answered === 0) return null;
  return Math.round((correct / answered) * 100);
}
