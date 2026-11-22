import { describe, expect, it } from "vitest";
import { getBuiltInStack } from "../src/data/stacks";
import { generateSession } from "../src/domain/session";
import { SessionRunner } from "../src/session/runner";

function runner(): SessionRunner {
  const stack = getBuiltInStack("aronson");
  if (!stack) throw new Error("Missing fixture stack.");
  return new SessionRunner(
    generateSession({
      stackId: stack.id,
      stackName: stack.name,
      order: stack.order,
      direction: "position-to-card",
      random: () => 0.25,
    }),
  );
}

describe("session runner", () => {
  it("cannot grade before reveal", () => {
    const session = runner();
    expect(session.grade(true, new Date())).toBeNull();
    expect(session.progress.answered).toBe(0);
  });

  it("grades once, advances, and ignores a repeated grade", () => {
    const session = runner();
    const firstItem = session.currentItem;
    expect(session.reveal()).toBe(true);
    expect(session.reveal()).toBe(false);

    const graded = session.grade(true, new Date(2026, 10, 21, 12, 0));
    expect(graded?.item).toEqual(firstItem);
    expect(session.progress.answered).toBe(1);
    expect(session.currentItem).not.toEqual(firstItem);
    expect(session.grade(true, new Date())).toBeNull();
    expect(session.progress.answered).toBe(1);
  });

  it("completes after exactly 52 graded items", () => {
    const session = runner();
    for (let index = 0; index < 52; index += 1) {
      expect(session.isComplete).toBe(false);
      expect(session.currentItem).not.toBeNull();
      session.reveal();
      expect(session.grade(index % 5 !== 0, new Date())).not.toBeNull();
    }

    expect(session.isComplete).toBe(true);
    expect(session.currentItem).toBeNull();
    expect(session.progress.answered).toBe(52);
    expect(session.reveal()).toBe(false);
    expect(session.grade(true, new Date())).toBeNull();
  });
});
