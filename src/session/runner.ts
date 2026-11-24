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

export class SessionRunner {
  readonly generated: GeneratedSession;
  private index = 0;
  private answerRevealed = false;
  private sessionProgress = createSessionProgress();
  private correctElapsedTenths = 0;
  private correctTimedAnswers = 0;

  constructor(generated: GeneratedSession) {
    this.generated = generated;
  }

  get currentItem(): SessionItem | null {
    return this.generated.items[this.index] ?? null;
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
    return this.index >= this.generated.items.length;
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
      correct,
      at,
    };

    this.sessionProgress = applySessionAnswer(this.sessionProgress, answer);
    this.index += 1;
    this.answerRevealed = false;

    return { item, progress: this.sessionProgress };
  }
}
