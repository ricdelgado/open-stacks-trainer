import stacksJson from "../../data/stacks.json";

export interface BuiltInStack {
  readonly id: string;
  readonly name: string;
  readonly creator: string;
  readonly order: readonly string[];
}

interface BuiltInData {
  readonly formatVersion: number;
  readonly notation: {
    readonly ranks: readonly string[];
    readonly suits: readonly string[];
    readonly suitNames: Readonly<Record<string, string>>;
    readonly position: string;
  };
  readonly stacks: readonly BuiltInStack[];
}

const data = stacksJson as BuiltInData;

export const builtInStacks: readonly BuiltInStack[] = data.stacks.map((stack) =>
  Object.freeze({
    id: stack.id,
    name: stack.name,
    creator: stack.creator,
    order: Object.freeze([...stack.order]),
  }),
);

export const builtInStackIds: readonly string[] = builtInStacks.map(
  (stack) => stack.id,
);

export const ranks: readonly string[] = data.notation.ranks;
export const suits: readonly string[] = data.notation.suits;
export const suitNames: Readonly<Record<string, string>> = data.notation.suitNames;
export const positionConvention: string = data.notation.position;

export function getBuiltInStack(id: string): BuiltInStack | undefined {
  return builtInStacks.find((stack) => stack.id === id);
}

export function getBuiltInStackByName(name: string): BuiltInStack | undefined {
  const normalized = name.trim().toLocaleLowerCase();
  return builtInStacks.find(
    (stack) => stack.name.toLocaleLowerCase() === normalized,
  );
}
