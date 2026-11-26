import type { AppState, Settings } from "./types";
import {
  DEFAULT_ACCELERATE_THRESHOLD_TENTHS,
  type StatsSections,
} from "./types";

export type SettingsToggles = Omit<Settings, "selectedStackId" | "direction">;

export const DEFAULT_STATS_SECTIONS: StatsSections = {
  practiceDays: true,
  recentMisses: true,
  cards: true,
};

export const DEFAULT_SETTINGS_TOGGLES: SettingsToggles = {
  mode: "basic",
  reinforcement: false,
  accelerate: false,
  accelerateThresholdTenths: DEFAULT_ACCELERATE_THRESHOLD_TENTHS,
  endless: false,
  language: "en",
  appearance: "system",
  installCardDismissed: false,
  statsSections: DEFAULT_STATS_SECTIONS,
};

export function withDefaultSettings(settings: Settings): Settings {
  let next = settings;
  if (next.appearance === undefined) {
    next = { ...next, appearance: "system" };
  }
  if (next.installCardDismissed === undefined) {
    next = { ...next, installCardDismissed: false };
  }
  return next;
}

export function withSettings(
  state: AppState,
  patch: Partial<Settings>,
): AppState {
  return {
    ...state,
    settings: { ...state.settings, ...patch },
  };
}
