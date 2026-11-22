import type { AppState, Settings } from "./types";

export function withSettings(
  state: AppState,
  patch: Partial<Settings>,
): AppState {
  return {
    ...state,
    settings: { ...state.settings, ...patch },
  };
}
