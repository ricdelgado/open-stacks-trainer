import type { Rng } from "./session";

export interface InsertPlan {
  afterRegular: number;
  card: string;
}

export interface InsertPlanOptions {
  candidates: readonly string[];
  regularCount: number;
  minGap: number;
  maxGap: number;
  random: Rng;
}

function uniqueCandidates(candidates: readonly string[]): string[] {
  return [...new Set(candidates)];
}

function pickCard(
  pool: readonly string[],
  previous: string | null,
  random: Rng,
): string {
  const index = Math.floor(random() * pool.length);
  const picked = pool[index];
  if (picked === undefined) {
    throw new Error("Insert pool index out of range.");
  }
  if (pool.length > 1 && picked === previous) {
    const next = pool[(index + 1) % pool.length];
    if (next === undefined) {
      throw new Error("Insert pool index out of range.");
    }
    return next;
  }
  return picked;
}

function gap(random: Rng, minGap: number, maxGap: number): number {
  const span = maxGap - minGap + 1;
  return minGap + Math.floor(random() * span);
}

export function planInserts({
  candidates,
  regularCount,
  minGap,
  maxGap,
  random,
}: InsertPlanOptions): InsertPlan[] {
  const pool = uniqueCandidates(candidates);
  if (pool.length === 0 || regularCount === 0) return [];

  const inserts: InsertPlan[] = [];
  let afterRegular = gap(random, minGap, maxGap);
  let previous: string | null = null;

  while (afterRegular < regularCount) {
    const card = pickCard(pool, previous, random);
    inserts.push({ afterRegular, card });
    previous = card;
    afterRegular += gap(random, minGap, maxGap);
  }

  return inserts;
}
