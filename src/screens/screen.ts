import type { AppState, Settings } from "../domain/types";
import type {
  LoadIssueKind,
  SaveFailureReason,
  SaveResult,
} from "../storage/app-store";

export type StorageNoticeKind = LoadIssueKind | SaveFailureReason;

export interface AppContext {
  readonly state: AppState;
  readonly storageNotice: StorageNoticeKind | null;
  updateState(next: AppState): SaveResult;
  updateSettings(patch: Partial<Settings>): SaveResult;
  resetStorage(): SaveResult;
  refresh(): void;
}

export type ScreenCleanup = () => void;
export type Screen = (
  root: HTMLElement,
  context: AppContext,
) => ScreenCleanup | void;
