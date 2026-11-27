import {
  applySessionAnswer,
  averageTenths,
  createSessionProgress,
  type SessionProgress,
} from "../domain/scoring";
import type { GeneratedSession, SessionItem } from "../domain/session";

export interface GradedItem {
  item: SessionItem;
  progress: SessionProgress;
}

export interface SessionRunnerOptions {
  endless?: boolean;
  nextBatch?: (previousFrontCard: string) => GeneratedSession | null;
}

export class SessionRunner {
  readonly generated: GeneratedSession;
  private batch: GeneratedSession;
  private endless: boolean;
  private readonly nextBatch:
    | ((previousFrontCard: string) => GeneratedSession | null)
    | null;
  private index = 0;
  private answerRevealed = false;
  private sessionProgress = createSessionProgress();
  private correctElapsedTenths = 0;
  private correctTimedAnswers = 0;

  constructor(
    generated: GeneratedSession,
    options: SessionRunnerOptions = {},
  ) {
    this.generated = generated;
    this.batch = generated;
    this.endless = options.endless ?? false;
    this.nextBatch = options.nextBatch ?? null;
  }

  get currentItem(): SessionItem | null {
    return this.batch.items[this.index] ?? null;
  }

  get isEndless(): boolean {
    return this.endless;
  }

  get revealed(): boolean {
    return this.answerRevealed;
  }

  get progress(): SessionProgress {
    return this.sessionProgress;
  }

  get sessionAverageTenths(): number | null {
    return averageTenths(this.correctElapsedTenths, this.correctTimedAnswers);
  }

  get isComplete(): boolean {
    if (this.endless) return false;
    return this.index >= this.batch.items.length;
  }

  reveal(): boolean {
    if (!this.currentItem || this.answerRevealed) return false;
    this.answerRevealed = true;
    return true;
  }

  grade(correct: boolean, at: Date, elapsedTenths?: number): GradedItem | null {
    const item = this.currentItem;
    if (!item || !this.answerRevealed) return null;

    if (
      correct &&
      elapsedTenths !== undefined &&
      Number.isSafeInteger(elapsedTenths) &&
      elapsedTenths >= 0
    ) {
      this.correctElapsedTenths += elapsedTenths;
      this.correctTimedAnswers += 1;
    }

    const answer = {
      card: item.card,
      position: item.position,
      direction: item.direction,
      rank: item.rank,
      firstCard: item.firstCard,
      distances: item.distances,
      correct,
      at,
    };

    this.sessionProgress = applySessionAnswer(this.sessionProgress, answer);
    this.index += 1;
    this.answerRevealed = false;

    if (this.index >= this.batch.items.length && this.endless) {
      const next = this.nextBatch?.(item.rank ?? item.card) ?? null;
      if (next && next.items.length > 0) {
        this.batch = next;
        this.index = 0;
      } else {
        this.endless = false;
      }
    }

    return { item, progress: this.sessionProgress };
  }
}
