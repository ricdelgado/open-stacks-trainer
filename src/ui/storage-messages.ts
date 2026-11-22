import type { StorageNoticeKind } from "../screens/screen";
import { strings } from "../strings";

export function storageMessage(kind: StorageNoticeKind): string {
  switch (kind) {
    case "corrupt":
      return strings.storage.corrupt;
    case "newer-schema":
      return strings.storage.newer;
    case "unavailable":
      return strings.storage.unavailable;
    case "quota":
      return strings.storage.quota;
    case "blocked":
      return strings.storage.writeBlocked;
  }
}
