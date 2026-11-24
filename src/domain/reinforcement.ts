import { planInserts, type InsertPlan } from "./inserts";
import type { Rng } from "./session";

export const REINFORCEMENT_MIN_GAP = 3;
export const REINFORCEMENT_MAX_GAP = 8;

export type ReinforcementInsert = InsertPlan;

export interface ReinforcementPlanOptions {
  candidates: readonly string[];
  regularCount: number;
  random: Rng;
}

export function reinforcementGap(random: Rng): number {
  const span = REINFORCEMENT_MAX_GAP - REINFORCEMENT_MIN_GAP + 1;
  return REINFORCEMENT_MIN_GAP + Math.floor(random() * span);
}

export function planReinforcementInserts({
  candidates,
  regularCount,
  random,
}: ReinforcementPlanOptions): ReinforcementInsert[] {
  return planInserts({
    candidates,
    regularCount,
    minGap: REINFORCEMENT_MIN_GAP,
    maxGap: REINFORCEMENT_MAX_GAP,
    random,
  });
}
