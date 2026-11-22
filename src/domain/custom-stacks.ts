import type { CustomStack } from "./types";

export interface CustomStackInput {
  name: string;
  creator?: string;
  order: readonly string[];
}

export function newCustomStackId(): string {
  const uuid =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  return `custom-${uuid}`;
}

export function createCustomStack(
  input: CustomStackInput,
  now: Date,
  id: string = newCustomStackId(),
): CustomStack {
  const timestamp = now.toISOString();
  return {
    id,
    name: input.name,
    creator: input.creator ?? "Custom",
    order: [...input.order],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateCustomStack(
  existing: CustomStack,
  input: CustomStackInput,
  now: Date,
): CustomStack {
  return {
    ...existing,
    name: input.name,
    order: [...input.order],
    updatedAt: now.toISOString(),
  };
}
