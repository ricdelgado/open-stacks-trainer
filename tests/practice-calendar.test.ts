import { describe, expect, it } from "vitest";
import {
  buildPracticeCalendar,
  CALENDAR_INITIAL_WEEKS,
  CALENDAR_WEEK_STEP,
  CALENDAR_WEEKS,
  defaultCalendarSelection,
  intensityLevel,
  type PracticeCalendar,
} from "../src/domain/practice-calendar";
import { emptyStats, formatLocalDate } from "../src/domain/scoring";
import type { Mode, PracticeDay, StackModes } from "../src/domain/types";

interface PracticeEntry {
  stackId: string;
  mode: Mode;
  days: PracticeDay[];
}

function statsWith(entries: PracticeEntry[]): Record<string, StackModes> {
  const stats: Record<string, StackModes> = {};
  for (const entry of entries) {
    const stack = stats[entry.stackId] ?? {};
    stack[entry.mode] = {
      ...emptyStats(entry.stackId, entry.mode),
      practiceDays: entry.days,
    };
    stats[entry.stackId] = stack;
  }
  return stats;
}

function practiceDay(
  date: string,
  answered: number,
  correct = answered,
): PracticeDay {
  return { date, answered, correct };
}

function dateKey(date: Date): string {
  return formatLocalDate(date);
}

function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function daysBefore(date: Date, days: number): Date {
  const clone = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  clone.setDate(clone.getDate() - days);
  return clone;
}

function dayByDate(
  calendar: PracticeCalendar,
  date: string,
): PracticeCalendar["days"][number] {
  const found = calendar.days.find((day) => day.date === date);
  if (!found) throw new Error(`missing calendar day ${date}`);
  return found;
}

describe("practice calendar aggregation", () => {
  it("sums every stack and mode on the same date", () => {
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [practiceDay("2026-11-25", 10, 8)],
      },
      {
        stackId: "mnemonica",
        mode: "card-plus-3",
        days: [practiceDay("2026-11-25", 5)],
      },
      {
        stackId: "aronson",
        mode: "basic",
        days: [practiceDay("2026-11-25", 1, 0)],
      },
      {
        stackId: "aronson",
        mode: "quartets",
        days: [practiceDay("2026-11-25", 13)],
      },
    ]);

    const calendar = buildPracticeCalendar(stats, new Date(2026, 10, 26));

    expect(dayByDate(calendar, "2026-11-25")).toMatchObject({
      answered: 29,
      correct: 26,
      practiced: true,
    });
    expect(calendar.totalAnswered).toBe(29);
    expect(calendar.totalCorrect).toBe(26);
  });

  it("ignores modes that have no practice days", () => {
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [practiceDay("2026-11-25", 7)],
      },
      { stackId: "mnemonica", mode: "card-plus-3", days: [] },
      { stackId: "aronson", mode: "quartets", days: [] },
    ]);

    const calendar = buildPracticeCalendar(stats, new Date(2026, 10, 26));

    expect(calendar.totalAnswered).toBe(7);
    expect(calendar.hasPractice).toBe(true);
  });

  it("reports the empty state when there are no practice days", () => {
    const calendar = buildPracticeCalendar({}, new Date(2026, 10, 26));

    expect(calendar.hasPractice).toBe(false);
    expect(calendar.earliestDate).toBeNull();
    expect(calendar.maxAnswered).toBe(0);
    expect(calendar.totalAnswered).toBe(0);
    expect(calendar.totalCorrect).toBe(0);
    expect(calendar.days.every((day) => day.level === 0)).toBe(true);
  });
});

describe("practice calendar window", () => {
  it("shows 26 weeks ending with the current week and includes today", () => {
    const today = new Date(2026, 10, 26);
    const calendar = buildPracticeCalendar({}, today);

    expect(calendar.weeksShown).toBe(CALENDAR_WEEKS);
    expect(calendar.days).toHaveLength(CALENDAR_WEEKS * 7);
    expect(calendar.weeks).toHaveLength(CALENDAR_WEEKS);
    expect(calendar.weeks.every((week) => week.length === 7)).toBe(true);
    expect(calendar.startDate).toBe("2026-06-01");
    expect(calendar.endDate).toBe("2026-11-29");
    expect(calendar.today).toBe("2026-11-26");
    expect(calendar.days[0]?.weekdayIndex).toBe(0);
    expect(dayByDate(calendar, "2026-11-26").future).toBe(false);
  });

  it("labels every day with week and weekday coordinates", () => {
    const calendar = buildPracticeCalendar({}, new Date(2026, 10, 26));

    calendar.days.forEach((day, index) => {
      expect(day.weekIndex).toBe(Math.floor(index / 7));
      expect(day.weekdayIndex).toBe(index % 7);
      expect(typeof day.date).toBe("string");
      expect(typeof day.answered).toBe("number");
      expect(typeof day.correct).toBe("number");
      expect(day.level).toBeGreaterThanOrEqual(0);
      expect(day.level).toBeLessThanOrEqual(4);
    });
  });

  it("handles a month boundary when today is the first of the month", () => {
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [practiceDay("2026-11-30", 6)],
      },
    ]);

    const calendar = buildPracticeCalendar(stats, new Date(2026, 11, 1));

    expect(calendar.startDate).toBe("2026-06-08");
    expect(calendar.endDate).toBe("2026-12-06");
    expect(dayByDate(calendar, "2026-11-30").answered).toBe(6);
    expect(dayByDate(calendar, "2026-12-01").future).toBe(false);
  });

  it("starts on Monday across a year boundary", () => {
    const calendar = buildPracticeCalendar({}, new Date(2026, 0, 1));

    expect(calendar.startDate).toBe("2025-07-07");
    expect(calendar.endDate).toBe("2026-01-04");
    expect(weekdayIndex(new Date(2025, 6, 7))).toBe(0);
    expect(calendar.days[0]?.weekdayIndex).toBe(0);
  });

  it("marks the remaining days of the current week as future on a Monday", () => {
    const calendar = buildPracticeCalendar({}, new Date(2026, 10, 23));

    expect(dayByDate(calendar, "2026-11-23").future).toBe(false);
    expect(dayByDate(calendar, "2026-11-24").future).toBe(true);
    expect(dayByDate(calendar, "2026-11-29").future).toBe(true);
    expect(calendar.endDate).toBe("2026-11-29");
  });

  it("has no future days when today is Sunday", () => {
    const calendar = buildPracticeCalendar({}, new Date(2026, 10, 29));
    const currentWeek = calendar.days.slice(-7);

    expect(currentWeek).toHaveLength(7);
    expect(currentWeek.every((day) => !day.future)).toBe(true);
    expect(dayByDate(calendar, "2026-11-29").future).toBe(false);
  });

  it("includes a leap day", () => {
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [practiceDay("2028-02-29", 4, 3)],
      },
    ]);

    const calendar = buildPracticeCalendar(stats, new Date(2028, 2, 2));

    expect(dayByDate(calendar, "2028-02-29")).toMatchObject({
      answered: 4,
      correct: 3,
      practiced: true,
    });
  });
});

describe("practice calendar intensity", () => {
  it("maps answer ratios to the five levels", () => {
    expect(intensityLevel(0, 100)).toBe(0);
    expect(intensityLevel(25, 100)).toBe(1);
    expect(intensityLevel(26, 100)).toBe(2);
    expect(intensityLevel(50, 100)).toBe(2);
    expect(intensityLevel(51, 100)).toBe(3);
    expect(intensityLevel(75, 100)).toBe(3);
    expect(intensityLevel(76, 100)).toBe(4);
    expect(intensityLevel(100, 100)).toBe(4);
  });

  it("returns level 0 everywhere when the window has no answers", () => {
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [practiceDay("2026-11-25", 0)],
      },
    ]);

    const calendar = buildPracticeCalendar(stats, new Date(2026, 10, 26));

    expect(calendar.maxAnswered).toBe(0);
    expect(calendar.days.every((day) => day.level === 0)).toBe(true);
  });

  it("scales levels against the busiest visible day", () => {
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [
          practiceDay("2026-11-18", 100),
          practiceDay("2026-11-19", 25),
          practiceDay("2026-11-20", 50),
          practiceDay("2026-11-21", 75),
          practiceDay("2026-11-22", 1),
        ],
      },
    ]);

    const calendar = buildPracticeCalendar(stats, new Date(2026, 10, 26));

    expect(calendar.maxAnswered).toBe(100);
    expect(dayByDate(calendar, "2026-11-18").level).toBe(4);
    expect(dayByDate(calendar, "2026-11-19").level).toBe(1);
    expect(dayByDate(calendar, "2026-11-20").level).toBe(2);
    expect(dayByDate(calendar, "2026-11-21").level).toBe(3);
    expect(dayByDate(calendar, "2026-11-22").level).toBe(1);
    expect(dayByDate(calendar, "2026-11-23").level).toBe(0);
  });
});

describe("practice calendar window sizing", () => {
  it("shows four weeks ending with the current week", () => {
    const today = new Date(2026, 10, 26);
    const calendar = buildPracticeCalendar({}, today, {
      weeks: CALENDAR_INITIAL_WEEKS,
    });

    expect(calendar.weeksShown).toBe(4);
    expect(calendar.days).toHaveLength(28);
    expect(calendar.weeks).toHaveLength(4);
    expect(calendar.startDate).toBe("2026-11-02");
    expect(calendar.endDate).toBe("2026-11-29");
    expect(calendar.days[0]?.weekdayIndex).toBe(0);
    expect(dayByDate(calendar, "2026-11-26").future).toBe(false);
  });

  it("adds four weeks per step", () => {
    const today = new Date(2026, 10, 26);

    for (const weeks of [4, 8, 12, 16, 20, 24]) {
      const calendar = buildPracticeCalendar({}, today, { weeks });
      expect(calendar.weeksShown).toBe(weeks);
      expect(calendar.days).toHaveLength(weeks * 7);
    }
  });

  it("caps the window at 26 weeks", () => {
    const today = new Date(2026, 10, 26);
    const calendar = buildPracticeCalendar({}, today, {
      weeks: CALENDAR_WEEKS + CALENDAR_WEEK_STEP,
    });

    expect(calendar.weeksShown).toBe(CALENDAR_WEEKS);
    expect(calendar.days).toHaveLength(CALENDAR_WEEKS * 7);
  });

  it("recomputes levels against the visible maximum", () => {
    const today = new Date(2026, 10, 26);
    const old = daysBefore(today, 10 * 7);
    const recent = daysBefore(today, 1);
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [
          practiceDay(dateKey(old), 100),
          practiceDay(dateKey(recent), 10),
        ],
      },
    ]);

    const short = buildPracticeCalendar(stats, today, { weeks: 4 });
    expect(short.maxAnswered).toBe(10);
    expect(dayByDate(short, dateKey(recent)).level).toBe(4);
    expect(short.days.some((day) => day.date === dateKey(old))).toBe(false);

    const full = buildPracticeCalendar(stats, today, {
      weeks: CALENDAR_WEEKS,
    });
    expect(full.maxAnswered).toBe(100);
    expect(dayByDate(full, dateKey(recent)).level).toBe(1);
    expect(dayByDate(full, dateKey(old)).level).toBe(4);
  });

  it("marks days before the earliest practice as placeholders", () => {
    const today = new Date(2026, 10, 26);
    const earliest = daysBefore(today, 10 * 7);
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [practiceDay(dateKey(earliest), 5)],
      },
    ]);

    const calendar = buildPracticeCalendar(stats, today, {
      weeks: CALENDAR_WEEKS,
    });
    const earliestWeek =
      calendar.weeks[dayByDate(calendar, dateKey(earliest)).weekIndex] ?? [];

    expect(calendar.days[0]?.beforeFirstPractice).toBe(true);
    expect(
      earliestWeek
        .slice(0, weekdayIndex(earliest))
        .every((day) => day.beforeFirstPractice),
    ).toBe(true);
    expect(earliestWeek[weekdayIndex(earliest)]?.date).toBe(
      dateKey(earliest),
    );
    expect(earliestWeek[weekdayIndex(earliest)]?.beforeFirstPractice).toBe(
      false,
    );
  });
});

describe("practice calendar default selection", () => {
  it("selects today when today has practice", () => {
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [
          practiceDay("2026-11-25", 9),
          practiceDay("2026-11-26", 4),
        ],
      },
    ]);

    const calendar = buildPracticeCalendar(stats, new Date(2026, 10, 26));

    expect(defaultCalendarSelection(calendar)).toBe("2026-11-26");
  });

  it("selects the latest practiced day when today has none", () => {
    const stats = statsWith([
      {
        stackId: "mnemonica",
        mode: "basic",
        days: [
          practiceDay("2026-11-24", 3),
          practiceDay("2026-11-25", 8),
        ],
      },
    ]);

    const calendar = buildPracticeCalendar(stats, new Date(2026, 10, 26));

    expect(defaultCalendarSelection(calendar)).toBe("2026-11-25");
  });

  it("falls back to today when nothing has been practiced", () => {
    const calendar = buildPracticeCalendar({}, new Date(2026, 10, 26));

    expect(defaultCalendarSelection(calendar)).toBe("2026-11-26");
  });
});
