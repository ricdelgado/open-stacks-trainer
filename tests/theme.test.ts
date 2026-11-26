import { describe, expect, it } from "vitest";
import { resolveTheme } from "../src/domain/theme";

describe("theme resolution", () => {
  it.each([
    ["light", false, "light"],
    ["light", true, "light"],
    ["dark", false, "dark"],
    ["dark", true, "dark"],
    ["system", false, "light"],
    ["system", true, "dark"],
    [undefined, false, "light"],
    [undefined, true, "dark"],
  ] as const)("resolves %s with system dark %s to %s", (appearance, prefersDark, expected) => {
    expect(resolveTheme(appearance, prefersDark)).toBe(expected);
  });
});
