import { describe, expect, it } from "vitest";
import { shouldShowUpdatePill } from "../src/domain/pwa";

describe("update pill visibility", () => {
  it.each([
    ["train", true, false],
    ["train", false, true],
    ["menu", true, true],
    ["summary", true, true],
    ["stats", true, true],
    ["my-stacks", true, true],
    ["import", true, true],
    ["settings", true, true],
    ["settings-language", true, true],
    ["settings-appearance", true, true],
    ["stack-view", true, true],
    ["stack-edit", true, true],
    ["stack-new", true, true],
  ] as const)(
    "route %s with active session %s shows %s",
    (routeName, sessionActive, expected) => {
      expect(shouldShowUpdatePill(routeName, sessionActive)).toBe(expected);
    },
  );
});
