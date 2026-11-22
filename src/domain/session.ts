import { isCardCode } from "./cards";
import type { Direction } from "./types";

export type Rng = () => number;
export type ItemDirection = Exclude<Direction, "mixed">;

export interface SessionItem {
  position: number;
  card: string;
  direction: ItemDirection;
}

export interface GeneratedSession {
  stackId: string;
  stackName: string;
  direction: Direction;
  items: readonly SessionItem[];
}

export interface GenerateSessionOptions {
  stackId: string;
  stackName: string;
  order: readonly string[];
  direction: Direction;
  random?: Rng;
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

export function generateSession({
  stackId,
  stackName,
  order,
  direction,
  random = Math.random,
}: GenerateSessionOptions): GeneratedSession {
  assertValidOrder(order);

  const positions = Array.from({ length: 52 }, (_, index) => index + 1);
  const shuffledPositions = shuffle(positions, random);

  let directions: readonly ItemDirection[] | null = null;
  if (direction === "mixed") {
    directions = shuffle(
      [
        ...Array<ItemDirection>(26).fill("position-to-card"),
        ...Array<ItemDirection>(26).fill("card-to-position"),
      ],
      random,
    );
  }

  const items = shuffledPositions.map((position, index): SessionItem => {
    const card = order[position - 1];
    if (card === undefined) {
      throw new Error(`Missing card at position ${position}.`);
    }

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

    return {
      position,
      card,
      direction: itemDirection,
    };
  });

  return { stackId, stackName, direction, items };
}
