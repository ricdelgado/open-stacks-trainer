import { getBuiltInStack } from "../data/stacks";
import {
  backupFileName,
  createBackup,
  parseBackup,
  type BackupError,
} from "../domain/backup";
import { accuracyPercent } from "../domain/scoring";
import {
  defaultSelection,
  mostRecentMode,
  practicedStacksFor,
  shouldShowModeTabs,
  shouldShowStackSelector,
  type PracticedStack,
} from "../domain/stats-selection";
import type { AppState, Mode, ModeStats } from "../domain/types";
import { strings } from "../strings";
import { createCardFace } from "../ui/card-face";
import { confirmAction } from "../ui/confirm";
import { downloadJson } from "../ui/download";
import { button, el, link, showStatus } from "../ui/elements";
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
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
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
  return mode === "basic" ? strings.menu.modeBasic : strings.menu.modeCardPlus3;
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
  const block = el("div");
  block.append(
    el("h3", "stats-subtitle", strings.statsPage.practiceDays),
  );

  if (modeStats.practiceDays.length === 0) {
    block.append(el("p", "stats-empty", strings.statsPage.noPracticeDays));
    return block;
  }

  const days = el("ul", "stats-day-list");
  const sortedDays = [...modeStats.practiceDays].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
  for (const day of sortedDays) {
    const item = el("li", "stats-day");
    item.append(
      el("span", "stats-day__date", day.date),
      el(
        "span",
        "stats-day__counts",
        strings.statsPage.dayCounts(day.answered, day.correct),
      ),
    );
    days.append(item);
  }
  block.append(days);
  return block;
}

function renderMisses(modeStats: ModeStats): HTMLElement {
  const block = el("div");
  block.append(
    el("h3", "stats-subtitle", strings.statsPage.recentMisses),
  );

  if (modeStats.recentMisses.length === 0) {
    block.append(el("p", "stats-empty", strings.statsPage.noMisses));
    return block;
  }

  const misses = el("ul", "stats-miss-list");
  const sortedMisses = [...modeStats.recentMisses]
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, 20);
  for (const miss of sortedMisses) {
    const item = el("li", "stats-miss");
    const details = el("div", "stats-miss__details");
    details.append(
      el("span", "stats-miss__direction", strings.directions[miss.direction]),
      el(
        "span",
        "stats-miss__meta",
        strings.statsPage.missMeta(miss.position, formatTimestamp(miss.at)),
      ),
    );
    item.append(createCardFace(miss.card, "small"), details);
    misses.append(item);
  }
  block.append(misses);
  return block;
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

  root.append(heading, lead, backTop);
  renderStorageNotice(root, context);
  renderFlash(root, context);

  const status = el("div", "form-status");
  status.setAttribute("aria-live", "polite");

  const createActions = (): HTMLElement => {
    const actions = el("section", "stats-actions");
    actions.setAttribute("aria-label", strings.statsPage.dataActions);

    const exportButton = button(
      strings.backup.exportMyData,
      "button button--secondary",
    );
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
    restoreButton.addEventListener("click", () => {
      fileInput.click();
    });

    const deleteAll = button(
      strings.backup.deleteAllData,
      "button button--danger",
    );
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

  if (practiced.length === 0) {
    root.append(
      el("p", "stats-empty stats-empty--page", strings.statsPage.empty),
      createActions(),
      backBottom,
      status,
    );
    return;
  }

  const initial = defaultSelection(practiced);
  let selectedStackId = initial?.stackId ?? practiced[0]?.stackId ?? "";
  let selectedMode: Mode = initial?.mode ?? "basic";

  const currentStack = (): PracticedStack | null =>
    practiced.find((stack) => stack.stackId === selectedStackId) ??
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
      const active = entry.mode === selectedMode;
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
        selectedMode = entry.mode;
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
      stack.modes.find((entry) => entry.mode === selectedMode) ?? stack.modes[0];
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
    card.append(renderPracticeDays(selected.stats));
    card.append(renderMisses(selected.stats));

    const remove = button(
      strings.statsPage.deleteTrainingData,
      "button button--danger stats-delete",
    );
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
    select.value = selectedStackId;

    select.addEventListener("change", () => {
      const next = practiced.find((stack) => stack.stackId === select.value);
      if (!next) {
        select.value = selectedStackId;
        return;
      }
      selectedStackId = next.stackId;
      selectedMode = mostRecentMode(next);
      renderTabs();
      renderData();
    });

    selectorField.append(label, select);
  } else {
    selectorField.hidden = true;
  }

  const tableArea = el("div", "stats-cards");

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
