import { RANKS, parseCardCode, type Rank } from "./cards";
import { validateStackOrder } from "./stack-validation";

export type { Rank } from "./cards";

export type QuartetDistances = readonly [number, number, number];

export interface Quartet {
  rank: Rank;
  firstCard: string;
  distances: QuartetDistances;
  positions: readonly [number, number, number, number];
}

function positionsForRank(order: readonly string[], rank: Rank): number[] {
  const positions: number[] = [];
  order.forEach((card, index) => {
    if (parseCardCode(card)?.rank === rank) positions.push(index + 1);
  });
  return positions;
}

function quartetFromPositions(
  order: readonly string[],
  rank: Rank,
  positions: readonly number[],
): Quartet {
  const [p0, p1, p2, p3] = positions as [number, number, number, number];
  const gaps = [p1 - p0, p2 - p1, p3 - p2, 52 - (p3 - p0)];
  const maxGap = Math.max(...gaps);
  const candidates = gaps
    .map((gap, index) => ({ gap, index }))
    .filter(({ gap }) => gap === maxGap);
  const cut = candidates.reduce((chosen, candidate) => {
    const chosenNext = positions[(chosen + 1) % 4] ?? 0;
    const candidateNext = positions[(candidate.index + 1) % 4] ?? 0;
    return candidateNext < chosenNext ? candidate.index : chosen;
  }, candidates[0]?.index ?? 0);
  const firstIndex = (cut + 1) % 4;
  const firstCard = order[(positions[firstIndex] ?? 0) - 1] ?? "";
  const distances = [0, 1, 2].map(
    (offset) => gaps[(firstIndex + offset) % 4] ?? 0,
  ) as unknown as QuartetDistances;
  const orderedPositions = [0, 1, 2, 3].map(
    (offset) => positions[(firstIndex + offset) % 4] ?? 0,
  ) as unknown as Quartet["positions"];

  return {
    rank,
    firstCard,
    distances,
    positions: orderedPositions,
  };
}

function validatedOrder(order: readonly string[]): string[] {
  const result = validateStackOrder(order);
  if (!result.ok) {
    throw new Error("Invalid stack order");
  }
  return result.order;
}

export function computeQuartets(order: readonly string[]): Quartet[] {
  const validOrder = validatedOrder(order);
  return RANKS.map((rank) =>
    quartetFromPositions(
      validOrder,
      rank,
      positionsForRank(validOrder, rank),
    ),
  );
}

export function quartetForRank(
  order: readonly string[],
  rank: Rank,
): Quartet {
  const validOrder = validatedOrder(order);
  return quartetFromPositions(
    validOrder,
    rank,
    positionsForRank(validOrder, rank),
  );
}
