import { describe, expect, it } from "vitest";
import {
  shouldShowInstallCard,
  type InstallCardState,
} from "../src/domain/pwa";

function state(patch: Partial<InstallCardState>): InstallCardState {
  return {
    platform: "other",
    standalone: false,
    dismissed: false,
    promptAvailable: false,
    ...patch,
  };
}

describe("install card visibility", () => {
  it.each([
    [state({ platform: "android", promptAvailable: true }), true],
    [state({ platform: "android", promptAvailable: false }), false],
    [state({ platform: "ios" }), true],
    [state({ platform: "ios", promptAvailable: true }), true],
    [state({ platform: "other", promptAvailable: true }), false],
    [state({ platform: "android", standalone: true, promptAvailable: true }), false],
    [state({ platform: "ios", standalone: true }), false],
    [state({ platform: "android", dismissed: true, promptAvailable: true }), false],
    [state({ platform: "ios", dismissed: true }), false],
  ] as const)("case %#", (input, expected) => {
    expect(shouldShowInstallCard(input)).toBe(expected);
  });
});
