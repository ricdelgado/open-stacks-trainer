import { describe, expect, it } from "vitest";
import { DEFAULT_STATS_SECTIONS, withSettings } from "../src/domain/settings";
import { createDefaultState } from "../src/storage/app-store";

describe("settings updates", () => {
  it("keeps the stack when the direction changes afterwards", () => {
    let state = createDefaultState();
    state = withSettings(state, { selectedStackId: "aronson" });
    state = withSettings(state, { direction: "card-to-position" });

    expect(state.settings.selectedStackId).toBe("aronson");
    expect(state.settings.direction).toBe("card-to-position");
  });

  it("keeps the direction when the stack changes afterwards", () => {
    let state = createDefaultState();
    state = withSettings(state, { direction: "position-to-card" });
    state = withSettings(state, { selectedStackId: "memorandum" });

    expect(state.settings.selectedStackId).toBe("memorandum");
    expect(state.settings.direction).toBe("position-to-card");
  });

  it("updates the new v2 toggles without dropping existing settings", () => {
    let state = createDefaultState();
    state = withSettings(state, { mode: "card-plus-3", endless: true });

    expect(state.settings.mode).toBe("card-plus-3");
    expect(state.settings.endless).toBe(true);
    expect(state.settings.selectedStackId).toBe("mnemonica");
    expect(state.settings.direction).toBe("mixed");
  });

  it("defaults the stats sections to expanded", () => {
    expect(createDefaultState().settings.statsSections).toEqual(
      DEFAULT_STATS_SECTIONS,
    );
  });

  it("persists collapsed stats sections", () => {
    let state = createDefaultState();
    state = withSettings(state, {
      statsSections: { practiceDays: false, recentMisses: true, cards: false },
    });

    expect(state.settings.statsSections).toEqual({
      practiceDays: false,
      recentMisses: true,
      cards: false,
    });
  });

  it("persists the reinforcement toggle", () => {
    let state = createDefaultState();
    expect(state.settings.reinforcement).toBe(false);
    state = withSettings(state, { reinforcement: true });
    expect(state.settings.reinforcement).toBe(true);
  });

  it("persists the Endless toggle", () => {
    let state = createDefaultState();
    expect(state.settings.endless).toBe(false);
    state = withSettings(state, { endless: true });
    expect(state.settings.endless).toBe(true);
  });

  it("persists the accelerate toggle and threshold", () => {
    let state = createDefaultState();
    expect(state.settings.accelerate).toBe(false);
    expect(state.settings.accelerateThresholdTenths).toBe(10);
    state = withSettings(state, {
      accelerate: true,
      accelerateThresholdTenths: 20,
    });
    expect(state.settings.accelerate).toBe(true);
    expect(state.settings.accelerateThresholdTenths).toBe(20);
  });

  it("defaults appearance to system and persists a choice", () => {
    let state = createDefaultState();
    expect(state.settings.appearance).toBe("system");
    state = withSettings(state, { appearance: "dark" });
    expect(state.settings.appearance).toBe("dark");
  });
});
