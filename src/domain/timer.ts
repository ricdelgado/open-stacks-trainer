export type TimerClock = () => number;

const defaultClock: TimerClock = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export class RecallTimer {
  private readonly clock: TimerClock;
  private started = false;
  private running = false;
  private accumulatedMs = 0;
  private segmentStart: number | null = null;
  private stoppedMs: number | null = null;

  constructor(clock: TimerClock = defaultClock) {
    this.clock = clock;
  }

  start(): void {
    this.started = true;
    this.running = true;
    this.accumulatedMs = 0;
    this.segmentStart = this.clock();
    this.stoppedMs = null;
  }

  pause(): void {
    if (!this.running || this.segmentStart === null) return;
    this.accumulatedMs += this.clock() - this.segmentStart;
    this.segmentStart = null;
    this.running = false;
  }

  resume(): void {
    if (!this.started || this.running || this.stoppedMs !== null) return;
    this.segmentStart = this.clock();
    this.running = true;
  }

  stop(): number {
    if (this.stoppedMs !== null) return this.stoppedMs;
    this.pause();
    this.stoppedMs = this.accumulatedMs;
    return this.accumulatedMs;
  }

  get elapsedMs(): number {
    if (this.stoppedMs !== null) return this.stoppedMs;
    if (this.running && this.segmentStart !== null) {
      return this.accumulatedMs + (this.clock() - this.segmentStart);
    }
    return this.accumulatedMs;
  }

  get tenths(): number {
    return Math.round(this.elapsedMs / 100);
  }

  get displaySeconds(): number {
    return Math.floor(this.elapsedMs / 1000);
  }

  get isRunning(): boolean {
    return this.running;
  }

  get isStopped(): boolean {
    return this.stoppedMs !== null;
  }
}
