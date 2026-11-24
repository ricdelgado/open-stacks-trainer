import type { AppState, Settings } from "./types";
import { DEFAULT_ACCELERATE_THRESHOLD_TENTHS } from "./types";

export type SettingsToggles = Omit<Settings, "selectedStackId" | "direction">;

export const DEFAULT_SETTINGS_TOGGLES: SettingsToggles = {
  mode: "basic",
  reinforcement: false,
  accelerate: false,
  accelerateThresholdTenths: DEFAULT_ACCELERATE_THRESHOLD_TENTHS,
  endless: false,
  language: "en",
};

export function withSettings(
  state: AppState,
  patch: Partial<Settings>,
): AppState {
  return {
    ...state,
    settings: { ...state.settings, ...patch },
  };
}
