import {
  buildPracticeCalendar,
  CALENDAR_INITIAL_WEEKS,
  CALENDAR_WEEK_STEP,
  CALENDAR_WEEKS,
  defaultCalendarSelection,
  type CalendarDay,
  type PracticeCalendar,
} from "../domain/practice-calendar";
import { accuracyPercent } from "../domain/scoring";
import type { StackModes } from "../domain/types";
import { getLocale, strings } from "../strings";
import { button, el } from "./elements";

export interface PracticeCalendarOptions {
  stats: Record<string, StackModes>;
  now: Date;
}

function parseDateKey(value: string): Date | null {
  const parts = value.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year === undefined || month === undefined || day === undefined) {
    return null;
  }
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString(getLocale(), { month: "short" });
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(getLocale(), {
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString(getLocale(), { dateStyle: "full" });
}

function formatMediumDate(date: Date): string {
  return date.toLocaleDateString(getLocale(), { dateStyle: "medium" });
}

export function formatCalendarRange(
  calendar: Pick<PracticeCalendar, "startDate" | "endDate">,
): string {
  const start = parseDateKey(calendar.startDate);
  const end = parseDateKey(calendar.endDate);
  if (!start || !end) return calendar.startDate;

  if (start.getFullYear() !== end.getFullYear()) {
    return strings.practiceCalendar.range(
      formatMonthYear(start),
      formatMonthYear(end),
    );
  }

  if (start.getMonth() === end.getMonth()) {
    return formatMonthYear(end);
  }

  return strings.practiceCalendar.range(
    formatMonth(start),
    formatMonthYear(end),
  );
}

function addDetail(list: HTMLElement, label: string, value: string): void {
  const item = el("div", "practice-calendar__details-item");
  item.append(
    el("dt", "practice-calendar__details-label", label),
    el("dd", "practice-calendar__details-value", value),
  );
  list.append(item);
}

function renderDay(
  day: CalendarDay,
  selectedDate: string,
  onSelect: (date: string) => void,
): HTMLElement {
  const levelClass = `practice-calendar__level-${day.level}`;

  if (day.future) {
    const cell = el(
      "button",
      `practice-calendar__day practice-calendar__day--future ${levelClass}`,
    );
    cell.disabled = true;
    cell.tabIndex = -1;
    cell.setAttribute("aria-hidden", "true");
    return cell;
  }

  const stateClass = day.practiced
    ? "practice-calendar__day--practiced"
    : "practice-calendar__day--empty";
  const cell = button(
    "",
    `practice-calendar__day ${stateClass} ${levelClass}`,
  );
  cell.dataset.date = day.date;
  cell.setAttribute(
    "aria-pressed",
    day.date === selectedDate ? "true" : "false",
  );

  const parsed = parseDateKey(day.date);
  const dateLabel = parsed ? formatMediumDate(parsed) : day.date;
  cell.setAttribute(
    "aria-label",
    day.practiced
      ? strings.practiceCalendar.dayLabel(
          dateLabel,
          day.answered,
          day.correct,
        )
      : strings.practiceCalendar.dayLabelEmpty(dateLabel),
  );

  cell.addEventListener("click", () => onSelect(day.date));
  cell.addEventListener("focus", () => onSelect(day.date));

  return cell;
}

export function renderPracticeCalendar({
  stats,
  now,
}: PracticeCalendarOptions): HTMLElement {
  let visibleWeeks = CALENDAR_INITIAL_WEEKS;
  let expanded = true;
  let calendar = buildPracticeCalendar(stats, now, { weeks: visibleWeeks });
  let selectedDate = defaultCalendarSelection(calendar);

  const section = el("section", "practice-calendar");
  section.setAttribute("aria-labelledby", "practice-calendar-title");

  const head = el("div", "practice-calendar__head");
  const titles = el("div", "practice-calendar__titles");
  const title = el("h2", "practice-calendar__title");
  title.id = "practice-calendar-title";

  const toggle = button("", "practice-calendar__toggle");
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-controls", "practice-calendar-body");
  const marker = el("span", "practice-calendar__marker");
  marker.setAttribute("aria-hidden", "true");
  toggle.append(
    el(
      "span",
      "practice-calendar__toggle-text",
      strings.practiceCalendar.heading,
    ),
    marker,
  );
  title.append(toggle);

  const range = el("p", "practice-calendar__range");

  const showMore = button(
    strings.practiceCalendar.showMore,
    "button button--secondary button--small practice-calendar__show-more",
  );
  const showMoreRow = el("div", "practice-calendar__show-more-row");
  showMoreRow.append(showMore);

  titles.append(title, showMoreRow, range);
  head.append(titles);

  const body = el("div", "practice-calendar__body");
  body.id = "practice-calendar-body";

  const weekdays = el("div", "practice-calendar__weekdays");
  for (const label of strings.practiceCalendar.weekdays) {
    weekdays.append(el("span", "practice-calendar__weekday", label));
  }

  const grid = el("div", "practice-calendar__grid");
  const details = el("div", "practice-calendar__details");
  details.setAttribute("aria-live", "polite");

  const legend = el("div", "practice-calendar__legend");
  legend.append(
    el("span", "practice-calendar__legend-label", strings.practiceCalendar.less),
  );
  for (let level = 0; level <= 4; level += 1) {
    const swatch = el(
      "span",
      `practice-calendar__swatch practice-calendar__level-${level}`,
    );
    swatch.setAttribute("aria-hidden", "true");
    legend.append(swatch);
  }
  legend.append(
    el("span", "practice-calendar__legend-label", strings.practiceCalendar.more),
  );

  const footer = el("div", "practice-calendar__footer");
  footer.append(legend);

  const empty = el(
    "p",
    "practice-calendar__empty",
    strings.practiceCalendar.empty,
  );

  body.append(weekdays, grid, details, footer, empty);
  section.append(head, body);

  toggle.addEventListener("click", () => {
    expanded = !expanded;
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    body.hidden = !expanded;
  });

  const selectDay = (date: string): void => {
    selectedDate = date;
    for (const node of grid.querySelectorAll<HTMLElement>("[data-date]")) {
      node.setAttribute(
        "aria-pressed",
        node.dataset.date === selectedDate ? "true" : "false",
      );
    }
    renderDetails();
  };

  const renderGrid = (): void => {
    grid.replaceChildren();
    for (const day of calendar.days) {
      grid.append(renderDay(day, selectedDate, selectDay));
    }
  };

  const renderDetails = (): void => {
    const day =
      calendar.days.find((entry) => entry.date === selectedDate) ??
      calendar.days.find((entry) => entry.date === calendar.today);
    if (!day) return;

    const parsed = parseDateKey(day.date);
    const accuracy = day.practiced
      ? accuracyPercent(day.correct, day.answered)
      : null;
    const value = (count: number): string =>
      day.practiced ? String(count) : strings.summary.emptyValue;

    details.replaceChildren();
    details.append(
      el(
        "p",
        "practice-calendar__details-date",
        parsed ? formatFullDate(parsed) : day.date,
      ),
    );

    const list = el("dl", "practice-calendar__details-list");
    addDetail(list, strings.practiceCalendar.answered, value(day.answered));
    addDetail(list, strings.practiceCalendar.correct, value(day.correct));
    addDetail(
      list,
      strings.practiceCalendar.accuracy,
      accuracy === null
        ? strings.summary.emptyValue
        : strings.summary.percent(accuracy),
    );
    details.append(list);
  };

  const render = (): void => {
    calendar = buildPracticeCalendar(stats, now, { weeks: visibleWeeks });
    if (!calendar.days.some((day) => day.date === selectedDate)) {
      selectedDate = defaultCalendarSelection(calendar);
    }

    range.textContent = formatCalendarRange(calendar);
    showMore.hidden = visibleWeeks >= CALENDAR_WEEKS;
    empty.hidden = calendar.hasPractice;
    renderGrid();
    renderDetails();
  };

  showMore.addEventListener("click", () => {
    visibleWeeks = Math.min(
      CALENDAR_WEEKS,
      visibleWeeks + CALENDAR_WEEK_STEP,
    );
    render();
  });

  render();
  return section;
}
