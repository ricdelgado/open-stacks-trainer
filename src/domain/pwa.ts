import type { Route } from "../router";

export function shouldShowUpdatePill(
  routeName: Route["name"],
  sessionActive: boolean,
): boolean {
  return !(routeName === "train" && sessionActive);
}
