import type { SessionMiss, SessionProgress } from "../domain/scoring";
import type { SessionItem } from "../domain/session";
import type {
  AppState,
  CustomStack,
  Direction,
  Mode,
  Settings,
} from "../domain/types";
import type {
  LoadIssueKind,
  SaveFailureReason,
  SaveResult,
} from "../storage/app-store";

export type StorageNoticeKind = LoadIssueKind | SaveFailureReason;

export interface FlashMessage {
  tone: "success" | "info" | "error";
  message: string;
}

export interface TrainingView {
  stackId: string;
  stackName: string;
  configuredDirection: Direction;
  mode: Mode;
  item: SessionItem;
  revealed: boolean;
  answered: number;
  total: number;
  endless: boolean;
  persistedStreak: number;
  sessionBestRun: number;
}

export interface GradeOutcome {
  item: SessionItem;
  correct: boolean;
  complete: boolean;
  save: SaveResult;
  progress: SessionProgress;
  persistedStreak: number;
}

export interface SessionSummaryView {
  stackId: string;
  stackName: string;
  mode: Mode;
  direction: Direction;
  answered: number;
  correct: number;
  missed: number;
  bestRun: number;
  misses: readonly SessionMiss[];
  averageTenths: number | null;
}

export interface AppContext {
  readonly state: AppState;
  readonly storageNotice: StorageNoticeKind | null;
  readonly flash: FlashMessage | null;
  updateState(next: AppState): SaveResult;
  updateSettings(patch: Partial<Settings>): SaveResult;
  resetStorage(): SaveResult;
  restoreState(next: AppState): SaveResult;
  upsertCustomStack(stack: CustomStack): SaveResult;
  deleteCustomStack(stackId: string): SaveResult;
  deleteStackStats(stackId: string): SaveResult;
  deleteAllData(): SaveResult;
  setFlash(message: FlashMessage): void;
  refresh(): void;
  startSession(): void;
  trainAgain(): void;
  quitSession(): void;
  revealAnswer(): boolean;
  gradeAnswer(correct: boolean, elapsedTenths?: number): GradeOutcome | null;
  getTrainingView(): TrainingView | null;
  getSummaryView(): SessionSummaryView | null;
}

export type ScreenCleanup = () => void;
export type Screen = (
  root: HTMLElement,
  context: AppContext,
) => ScreenCleanup | void;
