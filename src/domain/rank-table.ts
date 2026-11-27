import { RANKS, type Rank } from "./cards";
import { computeQuartets, type QuartetDistances } from "./quartets";
import { averageElapsedTenths, emptyCardStats } from "./scoring";
import {
  REINFORCEMENT_CLEAR_STREAK,
  type ModeStats,
} from "./types";

export const RANK_SORTS = [
  "rank-order",
  "reinforcement",
  "slowest",
  "most-missed",
  "lowest-streak",
] as const;

export type RankSort = (typeof RANK_SORTS)[number];

export interface RankRow {
  rank: Rank;
  firstCard: string;
  distances: QuartetDistances;
  currentStreak: number;
  reinforcementStreak: number | null;
  timesMissed: number;
  averageTenths: number | null;
}

export interface RankTableView {
  stackId: string;
  sort: RankSort;
}

export function createRankTableView(stackId: string): RankTableView {
  return { stackId, sort: "rank-order" };
}

export function changeRankTableStack(
  view: RankTableView,
  stackId: string,
): RankTableView {
  return { ...view, stackId, sort: "rank-order" };
}

export function changeRankTableSort(
  view: RankTableView,
  sort: RankSort,
): RankTableView {
  return { ...view, sort };
}

export function isRankSort(value: string): value is RankSort {
  return (RANK_SORTS as readonly string[]).includes(value);
}

export function buildRankRows(
  order: readonly string[],
  stats: ModeStats | undefined,
): RankRow[] {
  const quartets = new Map(
    computeQuartets(order).map((quartet) => [quartet.rank, quartet]),
  );

  return RANKS.map((rank) => {
    const quartet = quartets.get(rank);
    if (!quartet) throw new Error(`Missing quartet for rank ${rank}.`);
    const rankStats = stats?.ranks?.[rank] ?? emptyCardStats();
    return {
      rank,
      firstCard: quartet.firstCard,
      distances: quartet.distances,
      currentStreak: rankStats.currentStreak,
      reinforcementStreak: rankStats.inReinforcement
        ? Math.min(rankStats.currentStreak, REINFORCEMENT_CLEAR_STREAK)
        : null,
      timesMissed: rankStats.timesMissed,
      averageTenths: averageElapsedTenths(rankStats),
    };
  });
}

function byRankOrder(left: RankRow, right: RankRow): number {
  return RANKS.indexOf(left.rank) - RANKS.indexOf(right.rank);
}

export function sortRankRows(
  rows: readonly RankRow[],
  sort: RankSort,
): RankRow[] {
  const sorted = [...rows];

  switch (sort) {
    case "rank-order":
      return sorted.sort(byRankOrder);
    case "reinforcement":
      return sorted.sort((left, right) => {
        if (
          left.reinforcementStreak === null &&
          right.reinforcementStreak === null
        ) {
          return byRankOrder(left, right);
        }
        if (left.reinforcementStreak === null) return 1;
        if (right.reinforcementStreak === null) return -1;
        return (
          left.reinforcementStreak - right.reinforcementStreak ||
          byRankOrder(left, right)
        );
      });
    case "slowest":
      return sorted.sort((left, right) => {
        if (left.averageTenths === null && right.averageTenths === null) {
          return byRankOrder(left, right);
        }
        if (left.averageTenths === null) return 1;
        if (right.averageTenths === null) return -1;
        return (
          right.averageTenths - left.averageTenths || byRankOrder(left, right)
        );
      });
    case "most-missed":
      return sorted.sort(
        (left, right) =>
          right.timesMissed - left.timesMissed || byRankOrder(left, right),
      );
    case "lowest-streak":
      return sorted.sort(
        (left, right) =>
          left.currentStreak - right.currentStreak || byRankOrder(left, right),
      );
  }
}
