import { isCardCode } from "./cards";

export const MAX_STACK_NAME_LENGTH = 60;

export type StackNameError = "empty" | "too-long" | "reserved" | "duplicate";

export interface StackNameOptions {
  takenNames: readonly string[];
  reservedNames: readonly string[];
}

export type StackNameResult =
  | { ok: true; name: string }
  | { ok: false; error: StackNameError };

export type StackOrderError =
  | { code: "order-count"; count: number }
  | { code: "order-card"; card: string }
  | { code: "order-duplicate"; card: string };

export type StackOrderResult =
  | { ok: true; order: string[] }
  | { ok: false; error: StackOrderError };

export function normalizeStackName(value: string): string {
  return value.trim();
}

function sameName(left: string, right: string): boolean {
  return left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();
}

export function validateStackName(
  value: string,
  options: StackNameOptions,
): StackNameResult {
  const name = normalizeStackName(value);

  if (name.length === 0) return { ok: false, error: "empty" };
  if (name.length > MAX_STACK_NAME_LENGTH) {
    return { ok: false, error: "too-long" };
  }
  if (options.reservedNames.some((reserved) => sameName(reserved, name))) {
    return { ok: false, error: "reserved" };
  }
  if (options.takenNames.some((taken) => sameName(taken, name))) {
    return { ok: false, error: "duplicate" };
  }

  return { ok: true, name };
}

export function validateStackOrder(order: unknown): StackOrderResult {
  if (!Array.isArray(order)) {
    return { ok: false, error: { code: "order-count", count: 0 } };
  }
  if (order.length !== 52) {
    return { ok: false, error: { code: "order-count", count: order.length } };
  }

  const seen = new Set<string>();
  for (const value of order) {
    if (typeof value !== "string" || !isCardCode(value)) {
      return {
        ok: false,
        error: { code: "order-card", card: String(value) },
      };
    }
    if (seen.has(value)) {
      return {
        ok: false,
        error: { code: "order-duplicate", card: value },
      };
    }
    seen.add(value);
  }

  return { ok: true, order: [...order] };
}
