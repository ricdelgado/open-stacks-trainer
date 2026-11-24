import { describe, expect, it } from "vitest";
import { RecallTimer } from "../src/domain/timer";

function fakeClock() {
  let now = 0;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

describe("recall timer", () => {
  it("starts at zero and rounds elapsed time to tenths", () => {
    const clock = fakeClock();
    const timer = new RecallTimer(clock.now);

    timer.start();
    expect(timer.elapsedMs).toBe(0);
    expect(timer.tenths).toBe(0);
    expect(timer.displaySeconds).toBe(0);

    clock.advance(1234);
    expect(timer.elapsedMs).toBe(1234);
    expect(timer.tenths).toBe(12);
    expect(timer.displaySeconds).toBe(1);
  });

  it("rounds tenths and floors the displayed seconds", () => {
    const clock = fakeClock();
    const timer = new RecallTimer(clock.now);

    timer.start();
    clock.advance(1250);
    expect(timer.tenths).toBe(13);
    expect(timer.displaySeconds).toBe(1);

    clock.advance(750);
    expect(timer.tenths).toBe(20);
    expect(timer.displaySeconds).toBe(2);
  });

  it("freezes the elapsed time on stop", () => {
    const clock = fakeClock();
    const timer = new RecallTimer(clock.now);

    timer.start();
    clock.advance(2000);
    expect(timer.stop()).toBe(2000);

    clock.advance(5000);
    expect(timer.elapsedMs).toBe(2000);
    expect(timer.tenths).toBe(20);
    expect(timer.isStopped).toBe(true);
    expect(timer.stop()).toBe(2000);
  });

  it("pauses and resumes without counting hidden time", () => {
    const clock = fakeClock();
    const timer = new RecallTimer(clock.now);

    timer.start();
    clock.advance(1000);
    timer.pause();
    expect(timer.isRunning).toBe(false);

    clock.advance(5000);
    expect(timer.elapsedMs).toBe(1000);

    timer.resume();
    clock.advance(500);
    expect(timer.elapsedMs).toBe(1500);
    expect(timer.tenths).toBe(15);
  });

  it("does not resume after stop", () => {
    const clock = fakeClock();
    const timer = new RecallTimer(clock.now);

    timer.start();
    clock.advance(800);
    timer.stop();
    timer.resume();
    clock.advance(5000);

    expect(timer.elapsedMs).toBe(800);
  });

  it("resets when started again for a new prompt", () => {
    const clock = fakeClock();
    const timer = new RecallTimer(clock.now);

    timer.start();
    clock.advance(3000);
    timer.stop();
    timer.start();
    expect(timer.elapsedMs).toBe(0);
    expect(timer.isStopped).toBe(false);

    clock.advance(400);
    expect(timer.tenths).toBe(4);
  });
});
