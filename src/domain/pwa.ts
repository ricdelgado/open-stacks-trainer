import type { Route } from "../router";

export function shouldShowUpdatePill(
  routeName: Route["name"],
  sessionActive: boolean,
): boolean {
  return !(routeName === "train" && sessionActive);
}

export type InstallPlatform = "android" | "ios" | "other";

export interface InstallCardState {
  platform: InstallPlatform;
  standalone: boolean;
  dismissed: boolean;
  promptAvailable: boolean;
}

export function shouldShowInstallCard({
  platform,
  standalone,
  dismissed,
  promptAvailable,
}: InstallCardState): boolean {
  if (standalone || dismissed) return false;
  if (platform === "ios") return true;
  return platform === "android" && promptAvailable;
}
