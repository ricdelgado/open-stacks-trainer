import { describe, expect, it } from "vitest";
import { withSettings } from "../src/domain/settings";
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
});
