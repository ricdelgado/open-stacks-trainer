import { formatLocalDate } from "./scoring";
import type { ModeStats, StackModes } from "./types";

export const CALENDAR_WEEKS = 26;
export const CALENDAR_INITIAL_WEEKS = 4;
export const CALENDAR_WEEK_STEP = 4;
export const CALENDAR_DAYS_PER_WEEK = 7;

const MILLISECONDS_PER_DAY = 86_400_000;

export const CALENDAR_LEVELS = [0, 1, 2, 3, 4] as const;

export type CalendarLevel = (typeof CALENDAR_LEVELS)[number];

export interface PracticeCounts {
  answered: number;
  correct: number;
}

export interface CalendarDay {
  date: string;
  answered: number;
  correct: number;
  level: CalendarLevel;
  weekIndex: number;
  weekdayIndex: number;
  future: boolean;
  beforeFirstPractice: boolean;
  practiced: boolean;
}

export interface PracticeCalendar {
  days: CalendarDay[];
  weeks: CalendarDay[][];
  weeksShown: number;
  startDate: string;
  endDate: string;
  today: string;
  earliestDate: string | null;
  maxAnswered: number;
  totalAnswered: number;
  totalCorrect: number;
  hasPractice: boolean;
}

export interface CalendarOptions {
  weeks?: number;
}

function parseDateKey(value: string): Date | null {
  const parts = value.split("-");
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function dayIndex(date: Date): number {
  return Math.round(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
      MILLISECONDS_PER_DAY,
  );
}

function dateFromDayIndex(index: number): Date {
  const utc = new Date(index * MILLISECONDS_PER_DAY);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function aggregatePracticeDays(
  stats: Record<string, StackModes>,
): Map<string, PracticeCounts> {
  const totals = new Map<string, PracticeCounts>();

  for (const stackModes of Object.values(stats)) {
    if (!stackModes) continue;
    for (const modeStats of Object.values(stackModes) as (
      | ModeStats
      | undefined
    )[]) {
      if (!modeStats) continue;
      for (const day of modeStats.practiceDays) {
        if (!parseDateKey(day.date)) continue;
        const current = totals.get(day.date);
        if (current) {
          current.answered += day.answered;
          current.correct += day.correct;
        } else {
          totals.set(day.date, {
            answered: day.answered,
            correct: day.correct,
          });
        }
      }
    }
  }

  return totals;
}

export function intensityLevel(
  answered: number,
  maxAnswered: number,
): CalendarLevel {
  if (answered <= 0 || maxAnswered <= 0) return 0;

  const ratio = answered / maxAnswered;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function defaultCalendarSelection(calendar: PracticeCalendar): string {
  const today = calendar.days.find((day) => day.date === calendar.today);
  if (today && today.answered > 0) return today.date;

  for (const day of [...calendar.days].reverse()) {
    if (day.practiced && !day.future) return day.date;
  }

  return calendar.today;
}

export function buildPracticeCalendar(
  stats: Record<string, StackModes>,
  today: Date,
  options: CalendarOptions = {},
): PracticeCalendar {
  const aggregated = aggregatePracticeDays(stats);
  const dates = [...aggregated.keys()].sort();
  const earliestDate = dates[0] ?? null;

  const todayKey = formatLocalDate(today);
  const todayIndex = dayIndex(today);
  const currentWeekStart = todayIndex - weekdayIndex(today);

  const requestedWeeks = options.weeks ?? CALENDAR_WEEKS;
  const weeksShown = Number.isFinite(requestedWeeks)
    ? Math.min(CALENDAR_WEEKS, Math.max(1, Math.trunc(requestedWeeks)))
    : CALENDAR_WEEKS;
  const startIndex = currentWeekStart - (weeksShown - 1) * CALENDAR_DAYS_PER_WEEK;
  const endIndex = currentWeekStart + CALENDAR_DAYS_PER_WEEK - 1;

  const days: CalendarDay[] = [];
  for (let weekIndex = 0; weekIndex < weeksShown; weekIndex += 1) {
    for (
      let weekday = 0;
      weekday < CALENDAR_DAYS_PER_WEEK;
      weekday += 1
    ) {
      const index = startIndex + weekIndex * CALENDAR_DAYS_PER_WEEK + weekday;
      const date = formatLocalDate(dateFromDayIndex(index));
      const practice = aggregated.get(date);
      const answered = practice?.answered ?? 0;
      const correct = practice?.correct ?? 0;

      days.push({
        date,
        answered,
        correct,
        level: 0,
        weekIndex,
        weekdayIndex: weekday,
        future: index > todayIndex,
        beforeFirstPractice:
          earliestDate !== null && date < earliestDate,
        practiced: answered > 0,
      });
    }
  }

  let maxAnswered = 0;
  let totalAnswered = 0;
  let totalCorrect = 0;
  for (const day of days) {
    if (day.answered > maxAnswered) maxAnswered = day.answered;
    totalAnswered += day.answered;
    totalCorrect += day.correct;
  }
  for (const day of days) {
    day.level = intensityLevel(day.answered, maxAnswered);
  }

  const weeks: CalendarDay[][] = [];
  for (let weekIndex = 0; weekIndex < weeksShown; weekIndex += 1) {
    weeks.push(
      days.slice(
        weekIndex * CALENDAR_DAYS_PER_WEEK,
        (weekIndex + 1) * CALENDAR_DAYS_PER_WEEK,
      ),
    );
  }

  return {
    days,
    weeks,
    weeksShown,
    startDate: formatLocalDate(dateFromDayIndex(startIndex)),
    endDate: formatLocalDate(dateFromDayIndex(endIndex)),
    today: todayKey,
    earliestDate,
    maxAnswered,
    totalAnswered,
    totalCorrect,
    hasPractice: aggregated.size > 0,
  };
}
