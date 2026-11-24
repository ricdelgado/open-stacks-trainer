import { averageElapsedTenths, emptyCardStats } from "./scoring";
import { REINFORCEMENT_CLEAR_STREAK, type Mode, type ModeStats } from "./types";

export const CARD_SORTS = [
  "stack-order",
  "reinforcement",
  "slowest",
  "most-missed",
  "lowest-streak",
] as const;

export type CardSort = (typeof CARD_SORTS)[number];

export interface CardRow {
  position: number;
  card: string;
  currentStreak: number;
  reinforcementStreak: number | null;
  timesMissed: number;
  averageTenths: number | null;
}

export interface CardTableView {
  stackId: string;
  mode: Mode;
  sort: CardSort;
}

export function createCardTableView(
  stackId: string,
  mode: Mode,
): CardTableView {
  return { stackId, mode, sort: "stack-order" };
}

export function changeCardTableStack(
  view: CardTableView,
  stackId: string,
  mode: Mode,
): CardTableView {
  return { ...view, stackId, mode, sort: "stack-order" };
}

export function changeCardTableMode(
  view: CardTableView,
  mode: Mode,
): CardTableView {
  return { ...view, mode, sort: "stack-order" };
}

export function changeCardTableSort(
  view: CardTableView,
  sort: CardSort,
): CardTableView {
  return { ...view, sort };
}

export function isCardSort(value: string): value is CardSort {
  return (CARD_SORTS as readonly string[]).includes(value);
}

export function buildCardRows(
  order: readonly string[],
  stats: ModeStats | undefined,
): CardRow[] {
  return order.map((card, index) => {
    const cardStats = stats?.cards[card] ?? emptyCardStats();
    return {
      position: index + 1,
      card,
      currentStreak: cardStats.currentStreak,
      reinforcementStreak: cardStats.inReinforcement
        ? Math.min(cardStats.currentStreak, REINFORCEMENT_CLEAR_STREAK)
        : null,
      timesMissed: cardStats.timesMissed,
      averageTenths: averageElapsedTenths(cardStats),
    };
  });
}

function byStackOrder(left: CardRow, right: CardRow): number {
  return left.position - right.position;
}

export function sortCardRows(
  rows: readonly CardRow[],
  sort: CardSort,
): CardRow[] {
  const sorted = [...rows];

  switch (sort) {
    case "stack-order":
      return sorted.sort(byStackOrder);
    case "reinforcement":
      return sorted.sort((left, right) => {
        if (
          left.reinforcementStreak === null &&
          right.reinforcementStreak === null
        ) {
          return byStackOrder(left, right);
        }
        if (left.reinforcementStreak === null) return 1;
        if (right.reinforcementStreak === null) return -1;
        return (
          left.reinforcementStreak - right.reinforcementStreak ||
          byStackOrder(left, right)
        );
      });
    case "slowest":
      return sorted.sort((left, right) => {
        if (left.averageTenths === null && right.averageTenths === null) {
          return byStackOrder(left, right);
        }
        if (left.averageTenths === null) return 1;
        if (right.averageTenths === null) return -1;
        return (
          right.averageTenths - left.averageTenths || byStackOrder(left, right)
        );
      });
    case "most-missed":
      return sorted.sort(
        (left, right) =>
          right.timesMissed - left.timesMissed || byStackOrder(left, right),
      );
    case "lowest-streak":
      return sorted.sort(
        (left, right) =>
          left.currentStreak - right.currentStreak || byStackOrder(left, right),
      );
  }
}
