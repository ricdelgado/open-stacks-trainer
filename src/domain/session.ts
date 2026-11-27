import { planAccelerateInserts } from "./accelerate";
import { RANKS, isCardCode, type Rank } from "./cards";
import type { InsertPlan } from "./inserts";
import { computeQuartets, type Quartet, type QuartetDistances } from "./quartets";
import { planReinforcementInserts } from "./reinforcement";
import type { Direction, Mode } from "./types";

export type Rng = () => number;
export type ItemDirection = Exclude<Direction, "mixed">;
export type InsertKind = "reinforcement" | "accelerate";

export interface SessionItem {
  position: number;
  card: string;
  direction?: ItemDirection;
  nextCards?: readonly string[];
  rank?: Rank;
  firstCard?: string;
  distances?: QuartetDistances;
  positions?: readonly [number, number, number, number];
  insert?: InsertKind;
}

export interface GeneratedSession {
  stackId: string;
  stackName: string;
  direction: Direction;
  mode: Mode;
  items: readonly SessionItem[];
}

export interface GenerateSessionOptions {
  stackId: string;
  stackName: string;
  order: readonly string[];
  direction: Direction;
  mode?: Mode;
  reinforcementCandidates?: readonly string[];
  accelerateCandidates?: readonly string[];
  random?: Rng;
}

export interface GenerateEndlessBatchOptions extends GenerateSessionOptions {
  previousFrontCard?: string | null;
}

export function shuffle<T>(values: readonly T[], random: Rng): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index];
    const swap = result[swapIndex];
    if (current === undefined || swap === undefined) {
      throw new Error("Shuffle index out of range.");
    }
    result[index] = swap;
    result[swapIndex] = current;
  }
  return result;
}

function assertValidOrder(order: readonly string[]): void {
  if (order.length !== 52) {
    throw new Error(`A stack must have 52 cards, got ${order.length}.`);
  }
  if (!order.every(isCardCode)) {
    throw new Error("A stack contains an invalid card.");
  }
  if (new Set(order).size !== 52) {
    throw new Error("A stack contains duplicate cards.");
  }
}

function cardAt(order: readonly string[], index: number): string {
  const wrapped = ((index % 52) + 52) % 52;
  const card = order[wrapped];
  if (card === undefined) {
    throw new Error(`Missing card at stack index ${wrapped}.`);
  }
  return card;
}

function buildItem(
  order: readonly string[],
  position: number,
  itemDirection: ItemDirection,
  mode: Mode,
  insert?: InsertKind,
): SessionItem {
  const card = order[position - 1];
  if (card === undefined) {
    throw new Error(`Missing card at position ${position}.`);
  }

  const item: SessionItem = {
    position,
    card,
    direction: itemDirection,
  };

  if (mode === "card-plus-3") {
    item.nextCards = [
      cardAt(order, position),
      cardAt(order, position + 1),
      cardAt(order, position + 2),
    ];
  }

  if (insert) item.insert = insert;

  return item;
}

function insertDirection(direction: Direction, random: Rng): ItemDirection {
  if (direction !== "mixed") return direction;
  return random() < 0.5 ? "position-to-card" : "card-to-position";
}

function mixedDirections(random: Rng): ItemDirection[] {
  return shuffle(
    [
      ...Array<ItemDirection>(26).fill("position-to-card"),
      ...Array<ItemDirection>(26).fill("card-to-position"),
    ],
    random,
  );
}

function buildQuartetItem(quartet: Quartet, insert?: InsertKind): SessionItem {
  const item: SessionItem = {
    position: quartet.positions[0],
    card: quartet.firstCard,
    rank: quartet.rank,
    firstCard: quartet.firstCard,
    distances: quartet.distances,
    positions: quartet.positions,
  };
  if (insert) item.insert = insert;
  return item;
}

function quartetsByRank(order: readonly string[]): Map<Rank, Quartet> {
  return new Map(computeQuartets(order).map((quartet) => [quartet.rank, quartet]));
}

function shuffleRanks(random: Rng): Rank[] {
  return shuffle([...RANKS], random);
}

function buildQuartetPass(order: readonly string[], random: Rng): SessionItem[] {
  const quartets = quartetsByRank(order);
  return shuffleRanks(random).map((rank) => {
    const quartet = quartets.get(rank);
    if (!quartet) throw new Error(`Missing quartet for rank ${rank}.`);
    return buildQuartetItem(quartet);
  });
}

function applyQuartetInserts(
  regularItems: readonly SessionItem[],
  quartets: Map<Rank, Quartet>,
  reinforcementCandidates: readonly string[],
  random: Rng,
): SessionItem[] {
  const knownRanks = new Set<string>(RANKS);
  const pool = [...new Set(reinforcementCandidates)].filter((rank) =>
    knownRanks.has(rank),
  );
  const plans = planReinforcementInserts({
    candidates: pool,
    regularCount: regularItems.length,
    random,
  });

  const items: SessionItem[] = [];
  let cursor = 0;

  for (let index = 0; index < regularItems.length; index += 1) {
    const regularItem = regularItems[index];
    if (!regularItem) {
      throw new Error(`Missing regular quartet item ${index}.`);
    }
    items.push(regularItem);

    const regularsSeen = index + 1;
    const nextRank = regularItems[index + 1]?.rank;
    while (
      cursor < plans.length &&
      plans[cursor]?.afterRegular === regularsSeen
    ) {
      const insert = plans[cursor];
      if (!insert) break;

      let rank = insert.card as Rank;
      if (pool.length > 1) {
        const previousRank = items.at(-1)?.rank;
        const avoid = new Set<string>();
        if (previousRank) avoid.add(previousRank);
        if (nextRank) avoid.add(nextRank);
        rank = chooseAdjacentSafeCard(rank, pool, avoid) as Rank;
      }

      const quartet = quartets.get(rank);
      if (!quartet) {
        throw new Error(`Missing quartet for inserted rank ${rank}.`);
      }
      items.push(buildQuartetItem(quartet, "reinforcement"));
      cursor += 1;
    }
  }

  return items;
}

function buildRegularItems(
  order: readonly string[],
  positions: readonly number[],
  direction: Direction,
  mode: Mode,
  random: Rng,
): SessionItem[] {
  const directions = direction === "mixed" ? mixedDirections(random) : null;

  return positions.map((position, index): SessionItem => {
    let itemDirection: ItemDirection;
    if (directions) {
      const mixedDirection = directions[index];
      if (!mixedDirection) {
        throw new Error(`Missing direction for item ${index}.`);
      }
      itemDirection = mixedDirection;
    } else if (direction !== "mixed") {
      itemDirection = direction;
    } else {
      throw new Error("Mixed direction was not generated.");
    }

    return buildItem(order, position, itemDirection, mode);
  });
}

function swapFirstTwo(items: SessionItem[]): void {
  const first = items[0];
  const second = items[1];
  if (!first || !second) return;
  items[0] = second;
  items[1] = first;
}

function chooseAdjacentSafeCard(
  planned: string,
  pool: readonly string[],
  avoid: ReadonlySet<string>,
): string {
  if (!avoid.has(planned)) return planned;
  return pool.find((card) => !avoid.has(card)) ?? planned;
}

interface ApplyInsertsOptions {
  regularItems: readonly SessionItem[];
  order: readonly string[];
  direction: Direction;
  mode: Mode;
  random: Rng;
  reinforcementCandidates: readonly string[];
  accelerateCandidates: readonly string[];
  avoidAdjacent?: boolean;
}

function applyInserts({
  regularItems,
  order,
  direction,
  mode,
  random,
  reinforcementCandidates,
  accelerateCandidates,
  avoidAdjacent = false,
}: ApplyInsertsOptions): SessionItem[] {
  const knownCards = new Set(order);
  const knownCandidates = (candidates: readonly string[]) =>
    candidates.filter((card) => knownCards.has(card));

  const reinforcementPool = knownCandidates(reinforcementCandidates);
  const acceleratePool = knownCandidates(accelerateCandidates);

  const reinforcementInserts = planReinforcementInserts({
    candidates: reinforcementPool,
    regularCount: regularItems.length,
    random,
  });
  const accelerateInserts = planAccelerateInserts({
    candidates: acceleratePool,
    regularCount: regularItems.length,
    random,
  });

  const items: SessionItem[] = [];
  const reinforcementCursor = { value: 0 };
  const accelerateCursor = { value: 0 };

  const pushDueInserts = (
    plans: readonly InsertPlan[],
    cursor: { value: number },
    kind: InsertKind,
    pool: readonly string[],
    regularsSeen: number,
    nextRegularCard: string | undefined,
  ): void => {
    while (
      cursor.value < plans.length &&
      plans[cursor.value]?.afterRegular === regularsSeen
    ) {
      const insert = plans[cursor.value];
      if (!insert) break;

      let card = insert.card;
      if (avoidAdjacent) {
        const previousCard = items.at(-1)?.card;
        const avoid = new Set<string>();
        if (previousCard !== undefined) avoid.add(previousCard);
        if (nextRegularCard !== undefined) avoid.add(nextRegularCard);
        card = chooseAdjacentSafeCard(card, pool, avoid);
      }

      const position = order.indexOf(card) + 1;
      items.push(
        buildItem(
          order,
          position,
          insertDirection(direction, random),
          mode,
          kind,
        ),
      );
      cursor.value += 1;
    }
  };

  for (let index = 0; index < regularItems.length; index += 1) {
    const regularItem = regularItems[index];
    if (!regularItem) {
      throw new Error(`Missing regular item ${index}.`);
    }
    items.push(regularItem);

    const regularsSeen = index + 1;
    const nextRegularCard = regularItems[index + 1]?.card;
    pushDueInserts(
      reinforcementInserts,
      reinforcementCursor,
      "reinforcement",
      reinforcementPool,
      regularsSeen,
      nextRegularCard,
    );
    pushDueInserts(
      accelerateInserts,
      accelerateCursor,
      "accelerate",
      acceleratePool,
      regularsSeen,
      nextRegularCard,
    );
  }

  return items;
}

export function generateSession({
  stackId,
  stackName,
  order,
  direction,
  mode = "basic",
  reinforcementCandidates = [],
  accelerateCandidates = [],
  random = Math.random,
}: GenerateSessionOptions): GeneratedSession {
  assertValidOrder(order);

  if (mode === "quartets") {
    const regularItems = buildQuartetPass(order, random);
    return {
      stackId,
      stackName,
      direction,
      mode,
      items: applyQuartetInserts(
        regularItems,
        quartetsByRank(order),
        reinforcementCandidates,
        random,
      ),
    };
  }

  const positions = Array.from({ length: 52 }, (_, index) => index + 1);
  const regularItems = buildRegularItems(
    order,
    shuffle(positions, random),
    direction,
    mode,
    random,
  );

  const items = applyInserts({
    regularItems,
    order,
    direction,
    mode,
    random,
    reinforcementCandidates,
    accelerateCandidates,
  });

  return { stackId, stackName, direction, mode, items };
}

export function generateEndlessBatch({
  stackId,
  stackName,
  order,
  direction,
  mode = "basic",
  reinforcementCandidates = [],
  accelerateCandidates = [],
  previousFrontCard = null,
  random = Math.random,
}: GenerateEndlessBatchOptions): GeneratedSession {
  assertValidOrder(order);

  if (mode === "quartets") {
    const firstPass = buildQuartetPass(order, random);
    const secondPass = buildQuartetPass(order, random);

    if (firstPass.at(-1)?.rank === secondPass[0]?.rank) {
      swapFirstTwo(secondPass);
    }

    const regularItems = [...firstPass, ...secondPass];

    if (
      previousFrontCard !== null &&
      regularItems[0]?.rank === previousFrontCard
    ) {
      swapFirstTwo(regularItems);
    }

    return {
      stackId,
      stackName,
      direction,
      mode,
      items: applyQuartetInserts(
        regularItems,
        quartetsByRank(order),
        reinforcementCandidates,
        random,
      ),
    };
  }

  const positions = Array.from({ length: 52 }, (_, index) => index + 1);
  const firstPass = buildRegularItems(
    order,
    shuffle(positions, random),
    direction,
    mode,
    random,
  );
  const secondPass = buildRegularItems(
    order,
    shuffle(positions, random),
    direction,
    mode,
    random,
  );

  if (firstPass.at(-1)?.card === secondPass[0]?.card) {
    swapFirstTwo(secondPass);
  }

  const regularItems = [...firstPass, ...secondPass];

  if (
    previousFrontCard !== null &&
    regularItems[0]?.card === previousFrontCard
  ) {
    swapFirstTwo(regularItems);
  }

  const items = applyInserts({
    regularItems,
    order,
    direction,
    mode,
    random,
    reinforcementCandidates,
    accelerateCandidates,
    avoidAdjacent: true,
  });

  return { stackId, stackName, direction, mode, items };
}
