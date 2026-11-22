import { describe, expect, it } from "vitest";
import { FULL_DECK } from "../src/domain/cards";
import {
  MAX_STACK_NAME_LENGTH,
  validateStackName,
  validateStackOrder,
} from "../src/domain/stack-validation";

const noOptions = { takenNames: [], reservedNames: [] };

describe("stack name validation", () => {
  it("trims the name", () => {
    expect(validateStackName("  My Stack  ", noOptions)).toEqual({
      ok: true,
      name: "My Stack",
    });
  });

  it("rejects an empty name", () => {
    expect(validateStackName("   ", noOptions)).toEqual({
      ok: false,
      error: "empty",
    });
  });

  it("rejects a name longer than the maximum", () => {
    const name = "a".repeat(MAX_STACK_NAME_LENGTH + 1);
    expect(validateStackName(name, noOptions)).toEqual({
      ok: false,
      error: "too-long",
    });
  });

  it("accepts a name exactly at the maximum length", () => {
    const name = "a".repeat(MAX_STACK_NAME_LENGTH);
    expect(validateStackName(name, noOptions)).toEqual({ ok: true, name });
  });

  it("rejects a reserved name case-insensitively", () => {
    expect(
      validateStackName("  mnemonica ", {
        takenNames: [],
        reservedNames: ["Mnemonica", "Aronson", "Memorandum"],
      }),
    ).toEqual({ ok: false, error: "reserved" });
  });

  it("rejects a taken name case-insensitively", () => {
    expect(
      validateStackName("my STACK", {
        takenNames: ["My Stack"],
        reservedNames: [],
      }),
    ).toEqual({ ok: false, error: "duplicate" });
  });
});

describe("stack order validation", () => {
  it("accepts the full deck", () => {
    const result = validateStackOrder([...FULL_DECK]);
    expect(result).toEqual({ ok: true, order: [...FULL_DECK] });
  });

  it("rejects the wrong count", () => {
    expect(validateStackOrder(FULL_DECK.slice(0, 51))).toEqual({
      ok: false,
      error: { code: "order-count", count: 51 },
    });
    expect(validateStackOrder(null)).toEqual({
      ok: false,
      error: { code: "order-count", count: 0 },
    });
  });

  it("rejects an unknown card", () => {
    const order = [...FULL_DECK];
    order[0] = "1S";
    expect(validateStackOrder(order)).toEqual({
      ok: false,
      error: { code: "order-card", card: "1S" },
    });
  });

  it("rejects a duplicate card", () => {
    const order = [...FULL_DECK];
    order[0] = order[1] as string;
    expect(validateStackOrder(order)).toEqual({
      ok: false,
      error: { code: "order-duplicate", card: order[1] },
    });
  });
});
