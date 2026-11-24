import { getBuiltInStack } from "../data/stacks";
import {
  backupFileName,
  createBackup,
  parseBackup,
  type BackupError,
} from "../domain/backup";
import { accuracyPercent } from "../domain/scoring";
import type { AppState, ModeStats } from "../domain/types";
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

function figure(label: string, value: string): HTMLElement {
  const block = el("div", "stats-figure");
  block.append(
    el("span", "stats-figure__label", label),
    el("span", "stats-figure__value", value),
  );
  return block;
}

function renderStatsCard(
  stackId: string,
  stackStats: ModeStats,
  descriptor: StackDescriptor,
  onDelete: (stackId: string, name: string) => void,
): HTMLElement {
  const card = el("article", "stats-stack");

  const head = el("header", "stats-stack__head");
  const titles = el("div", "stats-stack__titles");
  titles.append(el("h2", "stats-stack__name", descriptor.name));
  if (descriptor.creator) {
    titles.append(el("p", "stats-stack__creator", descriptor.creator));
  }
  head.append(titles);
  card.append(head);

  const accuracy = accuracyPercent(
    stackStats.totalCorrect,
    stackStats.totalAnswered,
  );
  const figures = el("div", "stats-figures");
  figures.append(
    figure(strings.statsPage.currentStreak, String(stackStats.currentStreak)),
    figure(strings.statsPage.bestStreak, String(stackStats.bestStreak)),
    figure(
      strings.statsPage.accuracy,
      accuracy === null ? strings.summary.emptyValue : strings.summary.percent(accuracy),
    ),
    figure(
      strings.statsPage.totalAnswered,
      String(stackStats.totalAnswered),
    ),
  );
  card.append(figures);

  const daysHeading = el(
    "h3",
    "stats-subtitle",
    strings.statsPage.practiceDays,
  );
  card.append(daysHeading);

  if (stackStats.practiceDays.length === 0) {
    card.append(el("p", "stats-empty", strings.statsPage.noPracticeDays));
  } else {
    const days = el("ul", "stats-day-list");
    const sortedDays = [...stackStats.practiceDays].sort((left, right) =>
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
    card.append(days);
  }

  const missesHeading = el(
    "h3",
    "stats-subtitle",
    strings.statsPage.recentMisses,
  );
  card.append(missesHeading);

  if (stackStats.recentMisses.length === 0) {
    card.append(el("p", "stats-empty", strings.statsPage.noMisses));
  } else {
    const misses = el("ul", "stats-miss-list");
    const sortedMisses = [...stackStats.recentMisses]
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
          strings.statsPage.missMeta(
            miss.position,
            formatTimestamp(miss.at),
          ),
        ),
      );
      item.append(createCardFace(miss.card, "small"), details);
      misses.append(item);
    }
    card.append(misses);
  }

  const remove = button(
    strings.statsPage.deleteTrainingData,
    "button button--danger stats-delete",
  );
  remove.addEventListener("click", () => {
    onDelete(stackId, descriptor.name);
  });
  card.append(remove);

  return card;
}

export const renderStats: Screen = (root, context) => {
  const state = context.state;
  root.className = "screen screen--stats";

  const heading = el("h1", "screen-title", strings.headings.stats);
  const lead = el("p", "screen-lead", strings.statsPage.lead);
  root.append(heading, lead);

  renderStorageNotice(root, context);
  renderFlash(root, context);

  const status = el("div", "form-status");
  status.setAttribute("aria-live", "polite");

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
    context.setFlash({ tone: "success", message: strings.backup.deleteAllDone });
  });

  actions.append(exportButton, restoreButton, deleteAll, fileInput);
  root.append(actions, status);

  const practiced = Object.entries(state.stats)
    .map(([stackId, modes]) => ({ stackId, stats: modes.basic }))
    .filter(
      (
        entry,
      ): entry is {
        stackId: string;
        stats: ModeStats;
      } => entry.stats !== undefined && entry.stats.totalAnswered > 0,
    )
    .map((entry) => ({
      ...entry,
      descriptor: describeStack(state, entry.stackId),
    }))
    .filter(
      (
        entry,
      ): entry is {
        stackId: string;
        stats: ModeStats;
        descriptor: StackDescriptor;
      } => entry.descriptor !== null,
    )
    .sort(
      (left, right) =>
        right.stats.lastPracticedAt.localeCompare(
          left.stats.lastPracticedAt,
        ) || left.descriptor.name.localeCompare(right.descriptor.name),
    );

  const back = link(
    "#/",
    strings.common.backToMenu,
    "button button--secondary stats-back",
  );

  if (practiced.length === 0) {
    root.append(
      el("p", "stats-empty stats-empty--page", strings.statsPage.empty),
      back,
    );
    return;
  }

  const onDelete = (stackId: string, name: string): void => {
    status.replaceChildren();
    if (!confirmAction(strings.statsPage.deleteStackConfirm(name))) return;

    const result = context.deleteStackStats(stackId);
    if (!result.ok) {
      showStatus(status, storageMessage(result.reason));
      return;
    }
    context.setFlash({ tone: "success", message: strings.statsPage.deleted(name) });
    context.refresh();
  };

  const list = el("div", "stats-list");
  for (const entry of practiced) {
    list.append(
      renderStatsCard(
        entry.stackId,
        entry.stats,
        entry.descriptor,
        onDelete,
      ),
    );
  }
  root.append(list, back);
};
