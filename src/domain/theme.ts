import type { Appearance } from "./types";

export type ResolvedTheme = "light" | "dark";

export function resolveTheme(
  appearance: Appearance | undefined,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (appearance === "light") return "light";
  if (appearance === "dark") return "dark";
  return systemPrefersDark ? "dark" : "light";
}
