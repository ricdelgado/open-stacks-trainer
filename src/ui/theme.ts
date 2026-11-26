import { resolveTheme, type ResolvedTheme } from "../domain/theme";
import type { Appearance } from "../domain/types";

const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: "#FAF6EE",
  dark: "#14110D",
};

export function systemPrefersDark(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyAppearance(
  appearance: Appearance | undefined,
): ResolvedTheme {
  const resolved = resolveTheme(appearance, systemPrefersDark());
  document.documentElement.dataset.theme = resolved;
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (meta) meta.content = THEME_COLORS[resolved];
  return resolved;
}

export function watchSystemTheme(onChange: () => void): () => void {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => {};
  }
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const listener = (): void => onChange();
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
