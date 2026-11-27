import { getBuiltInStack } from "../data/stacks";
import {
  backupFileName,
  createBackup,
  parseBackup,
  type BackupError,
} from "../domain/backup";
import { accuracyPercent } from "../domain/scoring";
import { DEFAULT_STATS_SECTIONS } from "../domain/settings";
import {
  buildCardRows,
  changeCardTableMode,
  changeCardTableSort,
  changeCardTableStack,
  createCardTableView,
  isCardSort,
  sortCardRows,
  type CardSort,
  type CardTableView,
} from "../domain/card-table";
import {
  mostRecentMode,
  practicedStacksFor,
  resolveStatsSelection,
  shouldShowModeTabs,
  shouldShowStackSelector,
  type PracticedStack,
} from "../domain/stats-selection";
import {
  buildRankRows,
  isRankSort,
  sortRankRows,
  type RankSort,
} from "../domain/rank-table";
import {
  REINFORCEMENT_CLEAR_STREAK,
  type AppState,
  type Mode,
  type ModeStats,
  type StatsSections,
} from "../domain/types";
import { getLocale, strings } from "../strings";
import { createCardFace } from "../ui/card-face";
import { cardAccessibleLabel } from "../ui/card-labels";
import { confirmAction } from "../ui/confirm";
import { downloadJson } from "../ui/download";
import { button, el, link, showStatus } from "../ui/elements";
import { icon } from "../ui/icons";
import { renderPracticeCalendar } from "../ui/practice-calendar";
import { renderFlash, renderStorageNotice } from "../ui/storage-notice";
import { storageMessage } from "../ui/storage-messages";
import type { Screen } from "./screen";

interface StackDescriptor {
  name: string;
  creator: string | null;
}

function describeStack(
  state: AppState,
  stackId: string,
): StackDescriptor | null {
  const builtIn = getBuiltInStack(stackId);
  if (builtIn) {
    return { name: builtIn.name, creator: builtIn.creator };
  }
  const custom = state.customStacks.find((stack) => stack.id === stackId);
  if (custom) {
    return {
      name: custom.name,
      creator: custom.creator === "Custom" ? null : custom.creator,
    };
  }
  return null;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(getLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPracticeDay(value: string): string {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3) return value;
  const [year, month, day] = parts;
  if (year === undefined || month === undefined || day === undefined) {
    return value;
  }
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(getLocale(), { dateStyle: "medium" });
}

function backupErrorMessage(error: BackupError): string {
  switch (error.code) {
    case "not-backup":
      return strings.backup.errors.notBackup;
    case "newer-format":
      return strings.backup.errors.newerFormat;
    case "newer-schema":
      return strings.backup.errors.newerSchema;
    case "invalid":
      return strings.backup.errors.invalid;
    case "duplicate-name":
      return strings.backup.errors.duplicateName(error.name);
    case "reserved-name":
      return strings.backup.errors.reservedName(error.name);
  }
}

function modeLabel(mode: Mode): string {
  if (mode === "basic") return strings.menu.modeBasic;
  if (mode === "card-plus-3") return strings.menu.modeCardPlus3;
  return strings.menu.modeQuartets;
}

function stackOrderFor(state: AppState, stackId: string): readonly string[] {
  const builtIn = getBuiltInStack(stackId);
  if (builtIn) return builtIn.order;
  return state.customStacks.find((stack) => stack.id === stackId)?.order ?? [];
}

function formatAverageTime(tenths: number | null): string {
  if (tenths === null) return strings.summary.emptyValue;
  const seconds = tenths / 10;
  const formatted = seconds.toLocaleString(getLocale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return strings.summary.seconds(formatted);
}

interface CardTableOptions {
  order: readonly string[];
  stats: ModeStats;
  view: CardTableView;
  onSortChange(sort: CardSort): void;
}

function renderCardTable({
  order,
  stats,
  view,
  onSortChange,
}: CardTableOptions): HTMLElement {
  const rows = buildCardRows(order, stats);

  const content = el("div", "stats-cards__content");
  const head = el("div", "stats-cards__head");
  const lead = el("p", "stats-cards__lead", strings.statsPage.cardsLead);
  const titleBlock = el("div");
  titleBlock.append(lead);

  const sortField = el("div", "field stats-sort");
  const sortLabel = el("label", "field__label", strings.statsPage.sortLabel);
  sortLabel.htmlFor = "stats-sort";
  const sortSelect = el("select", "select");
  sortSelect.id = "stats-sort";
  const sortOptions: readonly { value: CardSort; label: string }[] = [
    { value: "stack-order", label: strings.statsPage.sortStackOrder },
    { value: "reinforcement", label: strings.statsPage.sortReinforcement },
    { value: "slowest", label: strings.statsPage.sortSlowest },
    { value: "most-missed", label: strings.statsPage.sortMostMissed },
    { value: "lowest-streak", label: strings.statsPage.sortLowestStreak },
  ];
  for (const option of sortOptions) {
    const node = el("option", undefined, option.label);
    node.value = option.value;
    sortSelect.append(node);
  }
  sortSelect.value = view.sort;
  sortField.append(sortLabel, sortSelect);
  head.append(titleBlock, sortField);

  const table = el("table", "stats-table");
  const thead = el("thead");
  const headerRow = el("tr");
  const columns: readonly { label: string }[] = [
    { label: strings.statsPage.columnPosition },
    { label: strings.statsPage.columnCard },
    { label: strings.statsPage.columnStreak },
    { label: strings.statsPage.columnReinforcement },
    { label: strings.statsPage.columnTimesMissed },
    { label: strings.statsPage.columnAverageTime },
  ];
  for (const column of columns) {
    const cell = el("th", undefined, column.label);
    cell.scope = "col";
    headerRow.append(cell);
  }
  thead.append(headerRow);

  const tbody = el("tbody");
  const renderRows = (sort: CardSort): void => {
    tbody.replaceChildren();
    for (const row of sortCardRows(rows, sort)) {
      const item = el("tr", "stats-card-row");
      item.tabIndex = 0;
      item.setAttribute(
        "aria-label",
        strings.statsPage.cardRowLabel(
          row.position,
          cardAccessibleLabel(row.card),
        ),
      );

      const position = el("td", undefined, String(row.position));
      position.dataset.label = strings.statsPage.shortPosition;

      const cardCell = el("td");
      cardCell.dataset.label = strings.statsPage.shortCard;
      cardCell.append(createCardFace(row.card, "small"));

      const streak = el("td", undefined, String(row.currentStreak));
      streak.dataset.label = strings.statsPage.shortStreak;

      const reinforcement = el(
        "td",
        undefined,
        row.reinforcementStreak === null
          ? strings.summary.emptyValue
          : strings.statsPage.reinforcementProgress(
              row.reinforcementStreak,
              REINFORCEMENT_CLEAR_STREAK,
            ),
      );
      reinforcement.dataset.label = strings.statsPage.shortReinforcement;

      const missed = el("td", undefined, String(row.timesMissed));
      missed.dataset.label = strings.statsPage.shortTimesMissed;

      const average = el("td", undefined, formatAverageTime(row.averageTenths));
      average.dataset.label = strings.statsPage.shortAverageTime;

      item.append(position, cardCell, streak, reinforcement, missed, average);
      tbody.append(item);
    }
  };

  sortSelect.addEventListener("change", () => {
    if (!isCardSort(sortSelect.value)) return;
    onSortChange(sortSelect.value);
    renderRows(sortSelect.value);
  });

  table.append(thead, tbody);
  renderRows(view.sort);

  const scroll = el("div", "stats-table-scroll");
  scroll.append(table);
  content.append(head, scroll);
  return content;
}

interface RankTableOptions {
  order: readonly string[];
  stats: ModeStats;
  sort: RankSort;
  onSortChange(sort: RankSort): void;
}

function renderRankTable({
  order,
  stats,
  sort,
  onSortChange,
}: RankTableOptions): HTMLElement {
  const rows = buildRankRows(order, stats);

  const content = el("div", "stats-cards__content");
  const head = el("div", "stats-cards__head");
  const lead = el("p", "stats-cards__lead", strings.statsPage.ranksLead);
  const titleBlock = el("div");
  titleBlock.append(lead);

  const sortField = el("div", "field stats-sort");
  const sortLabel = el("label", "field__label", strings.statsPage.sortLabel);
  sortLabel.htmlFor = "stats-rank-sort";
  const sortSelect = el("select", "select");
  sortSelect.id = "stats-rank-sort";
  const sortOptions: readonly { value: RankSort; label: string }[] = [
    { value: "rank-order", label: strings.statsPage.sortRankOrder },
    { value: "reinforcement", label: strings.statsPage.sortReinforcement },
    { value: "slowest", label: strings.statsPage.sortSlowest },
    { value: "most-missed", label: strings.statsPage.sortMostMissed },
    { value: "lowest-streak", label: strings.statsPage.sortLowestStreak },
  ];
  for (const option of sortOptions) {
    const node = el("option", undefined, option.label);
    node.value = option.value;
    sortSelect.append(node);
  }
  sortSelect.value = sort;
  sortField.append(sortLabel, sortSelect);
  head.append(titleBlock, sortField);

  const table = el("table", "stats-table stats-table--ranks");
  const thead = el("thead");
  const headerRow = el("tr");
  const columns: readonly { label: string }[] = [
    { label: strings.statsPage.columnRank },
    { label: strings.statsPage.columnFirstCard },
    { label: strings.statsPage.columnDistances },
    { label: strings.statsPage.columnStreak },
    { label: strings.statsPage.columnReinforcement },
    { label: strings.statsPage.columnTimesMissed },
    { label: strings.statsPage.columnAverageTime },
  ];
  for (const column of columns) {
    const cell = el("th", undefined, column.label);
    cell.scope = "col";
    headerRow.append(cell);
  }
  thead.append(headerRow);

  const tbody = el("tbody");
  const renderRows = (nextSort: RankSort): void => {
    tbody.replaceChildren();
    for (const row of sortRankRows(rows, nextSort)) {
      const item = el("tr", "stats-card-row stats-rank-row");
      item.tabIndex = 0;
      item.setAttribute(
        "aria-label",
        strings.statsPage.rankRowLabel(
          strings.quartets.rankNames[row.rank],
          cardAccessibleLabel(row.firstCard),
        ),
      );

      const rank = el(
        "td",
        "stats-rank-name",
        strings.quartets.rankNames[row.rank],
      );
      rank.dataset.label = strings.statsPage.shortRank;

      const firstCard = el("td");
      firstCard.dataset.label = strings.statsPage.shortFirstCard;
      firstCard.append(createCardFace(row.firstCard, "small"));

      const distances = el(
        "td",
        "stats-rank-distances",
        strings.quartets.distancesLine(row.distances),
      );
      distances.dataset.label = strings.statsPage.shortDistances;

      const streak = el("td", undefined, String(row.currentStreak));
      streak.dataset.label = strings.statsPage.shortStreak;

      const reinforcement = el(
        "td",
        undefined,
        row.reinforcementStreak === null
          ? strings.summary.emptyValue
          : strings.statsPage.reinforcementProgress(
              row.reinforcementStreak,
              REINFORCEMENT_CLEAR_STREAK,
            ),
      );
      reinforcement.dataset.label = strings.statsPage.shortReinforcement;

      const missed = el("td", undefined, String(row.timesMissed));
      missed.dataset.label = strings.statsPage.shortTimesMissed;

      const average = el("td", undefined, formatAverageTime(row.averageTenths));
      average.dataset.label = strings.statsPage.shortAverageTime;

      item.append(
        rank,
        firstCard,
        distances,
        streak,
        reinforcement,
        missed,
        average,
      );
      tbody.append(item);
    }
  };

  sortSelect.addEventListener("change", () => {
    if (!isRankSort(sortSelect.value)) return;
    onSortChange(sortSelect.value);
    renderRows(sortSelect.value);
  });

  table.append(thead, tbody);
  renderRows(sort);

  const scroll = el("div", "stats-table-scroll");
  scroll.append(table);
  content.append(head, scroll);
  return content;
}

function figure(label: string, value: string): HTMLElement {
  const block = el("div", "stats-figure");
  block.append(
    el("span", "stats-figure__label", label),
    el("span", "stats-figure__value", value),
  );
  return block;
}

function renderFigures(modeStats: ModeStats): HTMLElement {
  const accuracy = accuracyPercent(
    modeStats.totalCorrect,
    modeStats.totalAnswered,
  );
  const figures = el("div", "stats-figures");
  figures.append(
    figure(strings.statsPage.currentStreak, String(modeStats.currentStreak)),
    figure(strings.statsPage.bestStreak, String(modeStats.bestStreak)),
    figure(
      strings.statsPage.accuracy,
      accuracy === null
        ? strings.summary.emptyValue
        : strings.summary.percent(accuracy),
    ),
    figure(
      strings.statsPage.totalAnswered,
      String(modeStats.totalAnswered),
    ),
  );
  return figures;
}

function renderPracticeDays(modeStats: ModeStats): HTMLElement {
  if (modeStats.practiceDays.length === 0) {
    return el("p", "stats-empty", strings.statsPage.noPracticeDays);
  }

  const days = el("ul", "stats-day-list");
  const sortedDays = [...modeStats.practiceDays].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
  for (const day of sortedDays) {
    const item = el("li", "stats-day");
    item.append(
      el("span", "stats-day__date", formatPracticeDay(day.date)),
      el(
        "span",
        "stats-day__counts",
        strings.statsPage.dayCounts(day.answered, day.correct),
      ),
    );
    days.append(item);
  }
  return days;
}

function renderMisses(modeStats: ModeStats): HTMLElement {
  if (modeStats.recentMisses.length === 0) {
    return el("p", "stats-empty", strings.statsPage.noMisses);
  }

  const misses = el("ul", "stats-miss-list");
  const sortedMisses = [...modeStats.recentMisses]
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, 20);
  for (const miss of sortedMisses) {
    const item = el("li", "stats-miss");
    const details = el("div", "stats-miss__details");
    const marker = icon("cross");
    marker.classList.add("miss-marker");

    if ("rank" in miss) {
      details.append(
        el(
          "span",
          "stats-miss__direction",
          strings.quartets.rankNames[miss.rank],
        ),
        el(
          "span",
          "stats-miss__meta",
          strings.statsPage.quartetMissMeta(
            strings.quartets.distancesLine(miss.distances),
            formatTimestamp(miss.at),
          ),
        ),
      );
      item.append(marker, createCardFace(miss.firstCard, "small"), details);
    } else {
      details.append(
        el("span", "stats-miss__direction", strings.directions[miss.direction]),
        el(
          "span",
          "stats-miss__meta",
          strings.statsPage.missMeta(miss.position, formatTimestamp(miss.at)),
        ),
      );
      item.append(marker, createCardFace(miss.card, "small"), details);
    }
    misses.append(item);
  }
  return misses;
}

interface CollapsibleOptions {
  title: string;
  expanded: boolean;
  onToggle(expanded: boolean): void;
}

interface CollapsibleParts {
  heading: HTMLElement;
  body: HTMLElement;
}

function createCollapsible({
  title,
  expanded,
  onToggle,
}: CollapsibleOptions): CollapsibleParts {
  const heading = el("h3", "stats-subtitle");
  const toggle = button(title, "stats-section__toggle");
  toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  const marker = el("span", "stats-section__marker");
  marker.setAttribute("aria-hidden", "true");
  toggle.append(marker);

  const body = el("div", "stats-section__body");
  body.hidden = !expanded;

  toggle.addEventListener("click", () => {
    const next = body.hidden !== false;
    body.hidden = !next;
    toggle.setAttribute("aria-expanded", next ? "true" : "false");
    onToggle(next);
  });

  heading.append(toggle);
  return { heading, body };
}

export const renderStats: Screen = (root, context) => {
  const state = context.state;
  root.className = "screen screen--stats";

  const practiced = practicedStacksFor(
    state.stats,
    (stackId) => describeStack(state, stackId)?.name ?? null,
  );

  const heading = el("h1", "screen-title", strings.headings.stats);
  const lead = el("p", "screen-lead", strings.statsPage.lead);
  const backTop = link(
    "#/",
    strings.common.backToMenu,
    "button button--secondary stats-back stats-back--top",
  );
  backTop.prepend(icon("back"));

  root.append(heading, lead, backTop);
  renderStorageNotice(root, context);
  renderFlash(root, context);
  root.append(
    renderPracticeCalendar({ stats: context.state.stats, now: new Date() }),
  );

  const status = el("div", "form-status");
  status.setAttribute("aria-live", "polite");

  const persistStatsSelection = (stackId: string, mode: Mode): void => {
    const result = context.updateSettings({
      statsSelection: { stackId, mode },
    });
    if (!result.ok) {
      status.replaceChildren();
      showStatus(status, storageMessage(result.reason));
    }
  };

  const toggleSection = (key: keyof StatsSections, expanded: boolean): void => {
    const current =
      context.state.settings.statsSections ?? DEFAULT_STATS_SECTIONS;
    const result = context.updateSettings({
      statsSections: { ...current, [key]: expanded },
    });
    status.replaceChildren();
    if (!result.ok) {
      showStatus(status, storageMessage(result.reason));
    }
  };

  const createActions = (): HTMLElement => {
    const actions = el("section", "stats-actions");
    actions.setAttribute("aria-label", strings.statsPage.dataActions);

    const exportButton = button(
      strings.backup.exportMyData,
      "button button--secondary",
    );
    exportButton.prepend(icon("export"));
    exportButton.addEventListener("click", () => {
      status.replaceChildren();
      const now = new Date();
      downloadJson(backupFileName(now), createBackup(context.state, now));
      showStatus(status, strings.backup.exported, "success");
    });

    const fileInput = el("input", "sr-only");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.tabIndex = -1;

    const handleRestoreFile = async (file: File): Promise<void> => {
      status.replaceChildren();

      let text: string;
      try {
        text = await file.text();
      } catch {
        showStatus(status, strings.backup.errors.invalid);
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        showStatus(status, strings.backup.errors.notJson);
        return;
      }

      const backup = parseBackup(parsed);
      if (!backup.ok) {
        showStatus(status, backupErrorMessage(backup.error));
        return;
      }

      if (!confirmAction(strings.backup.restoreConfirm)) return;

      const result = context.restoreState(backup.state);
      if (!result.ok) {
        context.setFlash({
          tone: "error",
          message: storageMessage(result.reason),
        });
      } else {
        context.setFlash({ tone: "success", message: strings.backup.restored });
      }
      context.refresh();
    };

    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file) return;
      void handleRestoreFile(file);
    });

    const restoreButton = button(
      strings.backup.restoreFromFile,
      "button button--secondary",
    );
    restoreButton.prepend(icon("import"));
    restoreButton.addEventListener("click", () => {
      fileInput.click();
    });

    const deleteAll = button(
      strings.backup.deleteAllData,
      "button button--danger",
    );
    deleteAll.prepend(icon("trash"));
    deleteAll.addEventListener("click", () => {
      status.replaceChildren();
      if (!confirmAction(strings.backup.deleteAllConfirmOne)) return;
      if (!confirmAction(strings.backup.deleteAllConfirmTwo)) return;

      const result = context.deleteAllData();
      if (!result.ok) {
        showStatus(status, storageMessage(result.reason));
        return;
      }
      context.setFlash({
        tone: "success",
        message: strings.backup.deleteAllDone,
      });
    });

    actions.append(exportButton, restoreButton, deleteAll, fileInput);
    return actions;
  };

  const backBottom = link(
    "#/",
    strings.common.backToMenu,
    "button button--secondary stats-back",
  );
  backBottom.prepend(icon("back"));

  if (practiced.length === 0) {
    root.append(
      el("p", "stats-empty stats-empty--page", strings.statsPage.empty),
      createActions(),
      backBottom,
      status,
    );
    return;
  }

  const initial = resolveStatsSelection(
    practiced,
    context.state.settings.statsSelection,
  );
  let tableView = createCardTableView(
    initial?.stackId ?? practiced[0]?.stackId ?? "",
    initial?.mode ?? "basic",
  );
  let rankSort: RankSort = "rank-order";

  const currentStack = (): PracticedStack | null =>
    practiced.find((stack) => stack.stackId === tableView.stackId) ??
    practiced[0] ??
    null;

  const tabsHost = el("div", "stats-mode-tabs");
  tabsHost.setAttribute("role", "group");
  tabsHost.setAttribute("aria-label", strings.statsPage.modeTabsLabel);

  const dataHost = el("section", "stats-selected");

  const renderTabs = (): void => {
    tabsHost.replaceChildren();
    const stack = currentStack();
    if (!shouldShowModeTabs(stack ?? undefined)) {
      tabsHost.hidden = true;
      return;
    }
    tabsHost.hidden = false;
    if (!stack) return;

    for (const entry of stack.modes) {
      const active = entry.mode === tableView.mode;
      const tab = button(
        modeLabel(entry.mode),
        active
          ? "button button--small button--primary stats-mode-tab"
          : "button button--small button--secondary stats-mode-tab",
      );
      tab.type = "button";
      tab.setAttribute("aria-pressed", active ? "true" : "false");
      tab.dataset.mode = entry.mode;
      tab.addEventListener("click", () => {
        tableView = changeCardTableMode(tableView, entry.mode);
        rankSort = "rank-order";
        persistStatsSelection(tableView.stackId, tableView.mode);
        renderTabs();
        renderData();
      });
      tabsHost.append(tab);
    }
  };

  const renderData = (): void => {
    dataHost.replaceChildren();
    const stack = currentStack();
    if (!stack) return;

    const selected =
      stack.modes.find((entry) => entry.mode === tableView.mode) ??
      stack.modes[0];
    if (!selected) return;

    const descriptor = describeStack(state, stack.stackId);
    const card = el("article", "stats-stack");

    const head = el("header", "stats-stack__head");
    const titles = el("div", "stats-stack__titles");
    titles.append(
      el("h2", "stats-stack__name", descriptor?.name ?? stack.name),
    );
    if (descriptor?.creator) {
      titles.append(el("p", "stats-stack__creator", descriptor.creator));
    }
    head.append(titles);
    card.append(head);

    card.append(renderFigures(selected.stats));

    const sections =
      context.state.settings.statsSections ?? DEFAULT_STATS_SECTIONS;

    const practiceDays = createCollapsible({
      title: strings.statsPage.practiceDays,
      expanded: sections.practiceDays,
      onToggle: (expanded) => toggleSection("practiceDays", expanded),
    });
    practiceDays.body.append(renderPracticeDays(selected.stats));

    const recentMisses = createCollapsible({
      title: strings.statsPage.recentMisses,
      expanded: sections.recentMisses,
      onToggle: (expanded) => toggleSection("recentMisses", expanded),
    });
    recentMisses.body.append(renderMisses(selected.stats));

    card.append(
      practiceDays.heading,
      practiceDays.body,
      recentMisses.heading,
      recentMisses.body,
    );

    const remove = button(
      strings.statsPage.deleteTrainingData,
      "button button--danger stats-delete",
    );
    remove.prepend(icon("trash"));
    remove.addEventListener("click", () => {
      status.replaceChildren();
      const name = descriptor?.name ?? stack.name;
      if (!confirmAction(strings.statsPage.deleteStackConfirm(name))) return;

      const result = context.deleteStackStats(stack.stackId);
      if (!result.ok) {
        showStatus(status, storageMessage(result.reason));
        return;
      }
      context.setFlash({
        tone: "success",
        message: strings.statsPage.deleted(name),
      });
      context.refresh();
    });
    card.append(remove);

    dataHost.append(card);

    const order = stackOrderFor(state, stack.stackId);
    const quartets = selected.mode === "quartets";
    const tableSection = createCollapsible({
      title: quartets
        ? strings.statsPage.ranksTitle
        : strings.statsPage.cardsTitle,
      expanded: sections.cards,
      onToggle: (expanded) => toggleSection("cards", expanded),
    });
    tableSection.body.append(
      quartets
        ? renderRankTable({
            order,
            stats: selected.stats,
            sort: rankSort,
            onSortChange(sort) {
              rankSort = sort;
            },
          })
        : renderCardTable({
            order,
            stats: selected.stats,
            view: tableView,
            onSortChange(sort) {
              tableView = changeCardTableSort(tableView, sort);
            },
          }),
    );

    const panel = el("section", "stats-cards");
    panel.append(tableSection.heading, tableSection.body);
    tableArea.replaceChildren(panel);
  };

  const selectorField = el("div", "field stats-stack-select");
  if (shouldShowStackSelector(practiced)) {
    const label = el(
      "label",
      "field__label",
      strings.statsPage.stackSelectLabel,
    );
    label.htmlFor = "stats-stack-select";
    const select = el("select", "select");
    select.id = "stats-stack-select";

    for (const stack of practiced) {
      const option = el("option", undefined, stack.name);
      option.value = stack.stackId;
      select.append(option);
    }
    select.value = tableView.stackId;

    select.addEventListener("change", () => {
      const next = practiced.find((stack) => stack.stackId === select.value);
      if (!next) {
        select.value = tableView.stackId;
        return;
      }
      tableView = changeCardTableStack(
        tableView,
        next.stackId,
        mostRecentMode(next),
      );
      rankSort = "rank-order";
      persistStatsSelection(tableView.stackId, tableView.mode);
      renderTabs();
      renderData();
    });

    selectorField.append(label, select);
  } else {
    selectorField.hidden = true;
  }

  const tableArea = el("div", "stats-cards-host");

  root.append(
    selectorField,
    tabsHost,
    dataHost,
    tableArea,
    createActions(),
    backBottom,
    status,
  );

  renderTabs();
  renderData();
};
