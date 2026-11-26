import { describe, expect, it } from "vitest";
import { parseRoute } from "../src/router";

describe("hash router", () => {
  it.each([
    ["", "menu"],
    ["#", "menu"],
    ["#/", "menu"],
    ["#/train", "train"],
    ["#/stats", "stats"],
    ["#/my-stacks", "my-stacks"],
    ["#/import", "import"],
    ["#/settings", "settings"],
    ["#/settings/training", "settings"],
    ["#/settings/language", "settings-language"],
    ["#/settings/appearance", "settings-appearance"],
    ["#/stacks/new", "stack-new"],
  ])("maps %s to %s", (hash, name) => {
    expect(parseRoute(hash).name).toBe(name);
  });

  it("reads stack view and edit ids", () => {
    expect(parseRoute("#/stacks/mnemonica/view")).toEqual({
      name: "stack-view",
      id: "mnemonica",
    });
    expect(parseRoute("#/stacks/custom-abc/edit")).toEqual({
      name: "stack-edit",
      id: "custom-abc",
    });
  });

  it("decodes ids once", () => {
    expect(parseRoute("#/stacks/custom%2Dabc/view")).toEqual({
      name: "stack-view",
      id: "custom-abc",
    });
  });

  it("sends unknown and malformed routes to the menu", () => {
    expect(parseRoute("#/nope")).toEqual({ name: "menu" });
    expect(parseRoute("#/stacks/%E0%A4%A/view")).toEqual({ name: "menu" });
    expect(parseRoute("#/stacks/a/view/extra")).toEqual({ name: "menu" });
  });
});
