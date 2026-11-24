import { planInserts, type InsertPlan } from "./inserts";
import type { Rng } from "./session";
import type { ModeStats } from "./types";

export const ACCELERATE_MIN_GAP = 2;
export const ACCELERATE_MAX_GAP = 4;

export const ACCELERATE_THRESHOLDS = [5, 10, 20, 30] as const;

export type AccelerateThresholdTenths = (typeof ACCELERATE_THRESHOLDS)[number];

export function isAccelerateThreshold(
  value: number,
): value is AccelerateThresholdTenths {
  return (ACCELERATE_THRESHOLDS as readonly number[]).includes(value);
}

export function accelerateCandidates(
  stats: ModeStats | undefined,
  thresholdTenths: number,
): string[] {
  if (!stats) return [];
  return Object.entries(stats.cards)
    .filter(
      ([, card]) =>
        card.correctTimedAnswers > 0 &&
        card.elapsedTenths > thresholdTenths * card.correctTimedAnswers,
    )
    .map(([card]) => card);
}

export interface AcceleratePlanOptions {
  candidates: readonly string[];
  regularCount: number;
  random: Rng;
}

export function planAccelerateInserts({
  candidates,
  regularCount,
  random,
}: AcceleratePlanOptions): InsertPlan[] {
  return planInserts({
    candidates,
    regularCount,
    minGap: ACCELERATE_MIN_GAP,
    maxGap: ACCELERATE_MAX_GAP,
    random,
  });
}
