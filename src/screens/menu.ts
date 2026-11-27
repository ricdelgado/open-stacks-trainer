import { builtInStacks } from "../data/stacks";
import { DIRECTIONS, type Settings } from "../domain/types";
import { strings } from "../strings";
import { button, el, link, showStatus } from "../ui/elements";
import { icon } from "../ui/icons";
import { mountInstallCard } from "../ui/install-card";
import { openHelpDialog } from "../ui/help-dialog";
import { renderFlash, renderStorageNotice } from "../ui/storage-notice";
import {
  createEndlessSetting,
  createTrainingSettings,
} from "../ui/training-settings";
import { storageMessage } from "../ui/storage-messages";
import type { Screen } from "./screen";

export const renderMenu: Screen = (root, context) => {
  root.className = "screen screen--menu";

  const header = el("header", "menu-hero");
  const title = el("h1", "menu-title", strings.appTitle);
  const tagline = el("p", "menu-tagline", strings.tagline);
  const titleRow = el("div", "menu-title-row");
  titleRow.append(title);

  const streakCount =
    context.state.stats[context.state.settings.selectedStackId]?.[
      context.state.settings.mode
    ]?.currentStreak ?? 0;
  if (streakCount > 0) {
    const badge = el("span", "streak-badge");
    badge.setAttribute(
      "aria-label",
      strings.menu.currentStreak(streakCount),
    );
    badge.append(
      icon("bolt"),
      el("span", "streak-badge__value", String(streakCount)),
    );
    titleRow.append(badge);
  }

  const settings = link(
    "#/settings",
    strings.menu.settings,
    "button button--secondary menu-settings",
  );
  settings.prepend(icon("settings"));

  let helpDialog: HTMLDialogElement | null = null;
  const help = button(
    strings.menu.howToUse,
    "button button--secondary menu-help",
  );
  help.addEventListener("click", () => {
    helpDialog = openHelpDialog();
    helpDialog.addEventListener(
      "close",
      () => {
        helpDialog = null;
      },
      { once: true },
    );
  });

  header.append(titleRow, tagline);
  root.append(header);

  renderStorageNotice(root, context);
  renderFlash(root, context);

  const startPanel = el("section", "start-panel");
  startPanel.setAttribute("aria-label", strings.menu.startTraining);

  const start = button(
    strings.menu.startTraining,
    "button button--primary button--large",
  );
  start.prepend(icon("train"));
  start.addEventListener("click", () => {
    context.startSession();
  });
  startPanel.append(start);

  const formStatus = el("div", "form-status");
  formStatus.setAttribute("aria-live", "polite");

  const stackField = el("div", "field");
  const stackLabel = el("label", "field__label", strings.menu.stackLabel);
  stackLabel.htmlFor = "stack-select";
  const select = el("select", "select");
  select.id = "stack-select";
  select.name = "stack";

  for (const stack of builtInStacks) {
    const option = el(
      "option",
      undefined,
      strings.menu.stackCreator(stack.name, stack.creator),
    );
    option.value = stack.id;
    select.append(option);
  }

  for (const stack of context.state.customStacks) {
    const option = el(
      "option",
      undefined,
      strings.menu.stackCreator(stack.name, stack.creator),
    );
    option.value = stack.id;
    select.append(option);
  }

  select.value = context.state.settings.selectedStackId;
  stackField.append(stackLabel, select);
  startPanel.append(stackField);

  const directionGroup = el("fieldset", "field direction-group");
  const directionLegend = el("legend", "field__label", strings.menu.directionLabel);
  directionGroup.append(directionLegend);
  const segments = el("div", "segmented");

  const applySettings = (patch: Partial<Settings>): void => {
    const result = context.updateSettings(patch);
    formStatus.replaceChildren();
    if (!result.ok) {
      showStatus(formStatus, storageMessage(result.reason));
    }
  };

  for (const direction of DIRECTIONS) {
    const label = el("label", "segment");
    const input = el("input");
    input.type = "radio";
    input.name = "direction";
    input.value = direction;
    input.checked = context.state.settings.direction === direction;
    const text = el("span", "segment__text", strings.directions[direction]);
    label.append(input, text);
    segments.append(label);

    input.addEventListener("change", () => {
      if (!input.checked) return;
      applySettings({ direction });
    });
  }

  directionGroup.append(segments);
  directionGroup.hidden = context.state.settings.mode === "quartets";
  const directionNote = el(
    "p",
    "field__hint",
    strings.menu.quartetsNoDirection,
  );
  directionNote.hidden = context.state.settings.mode !== "quartets";

  const trainingSettings = el("details", "training-settings");
  const trainingSummary = el(
    "summary",
    "training-settings__summary",
    strings.settingsPage.trainingSettings,
  );
  trainingSummary.setAttribute("aria-expanded", "false");
  const chevron = icon("chevron");
  chevron.classList.add("training-settings__chevron");
  trainingSummary.append(chevron);
  trainingSettings.append(
    trainingSummary,
    createTrainingSettings(context, formStatus),
  );
  trainingSettings.addEventListener("toggle", () => {
    trainingSummary.setAttribute(
      "aria-expanded",
      trainingSettings.open ? "true" : "false",
    );
  });

  startPanel.append(
    directionGroup,
    directionNote,
    createEndlessSetting(context, formStatus),
    trainingSettings,
    formStatus,
  );
  root.append(startPanel);

  select.addEventListener("change", () => {
    const known =
      builtInStacks.some((item) => item.id === select.value) ||
      context.state.customStacks.some((item) => item.id === select.value);
    if (!known) {
      select.value = context.state.settings.selectedStackId;
      return;
    }
    applySettings({ selectedStackId: select.value });
  });

  const modeGroup = el("fieldset", "field mode-group");
  const modeLegend = el("legend", "field__label", strings.menu.modeLabel);
  modeGroup.append(modeLegend);
  const modeList = el("div", "mode-list");

  const modeChoices = [
    { value: "basic", label: strings.menu.modeBasic },
    { value: "card-plus-3", label: strings.menu.modeCardPlus3 },
    { value: "quartets", label: strings.menu.modeQuartets },
  ] as const;

  for (const choice of modeChoices) {
    const option = el("label", "mode-option");
    const input = el("input");
    input.type = "radio";
    input.name = "mode";
    input.value = choice.value;
    input.checked = context.state.settings.mode === choice.value;
    input.addEventListener("change", () => {
      if (!input.checked) return;
      const quartets = choice.value === "quartets";
      directionGroup.hidden = quartets;
      directionNote.hidden = !quartets;
      const accelerateSettings =
        startPanel.querySelector<HTMLElement>(".accelerate-settings");
      if (accelerateSettings) accelerateSettings.hidden = quartets;
      applySettings({ mode: choice.value });
    });
    option.append(
      input,
      el("span", "mode-option__mark"),
      el("span", "mode-option__name", choice.label),
    );
    modeList.append(option);
  }

  const futureModes: readonly string[] = [
    strings.menu.modeAcaan,
    strings.menu.modeCyclic,
  ];

  for (const name of futureModes) {
    const option = el("label", "mode-option mode-option--disabled");
    const input = el("input");
    input.type = "radio";
    input.name = "mode";
    input.disabled = true;
    const text = el("span", "mode-option__name", name);
    const badge = el("span", "badge", strings.menu.later);
    option.append(input, el("span", "mode-option__mark"), text, badge);
    modeList.append(option);
  }

  modeGroup.append(modeList);
  const installHost = el("div", "install-card-host");
  root.append(modeGroup, installHost);

  const installCleanup = mountInstallCard(installHost, {
    dismissed: context.state.settings.installCardDismissed ?? false,
    onDismiss() {
      const result = context.updateSettings({ installCardDismissed: true });
      if (!result.ok) {
        return { ok: false, message: storageMessage(result.reason) };
      }
      context.refresh();
      return { ok: true };
    },
  });

  const bottom = el("div", "menu-bottom-actions");
  const statsLink = link(
    "#/stats",
    strings.menu.stats,
    "button button--secondary menu-nav-button",
  );
  statsLink.prepend(icon("stats"));
  const stacksLink = link(
    "#/my-stacks",
    strings.menu.myStacks,
    "button button--secondary menu-nav-button",
  );
  stacksLink.prepend(icon("stacks"));
  bottom.append(statsLink, stacksLink, help, settings);
  root.append(bottom);

  return () => {
    installCleanup();
    if (helpDialog) {
      helpDialog.close();
      helpDialog = null;
    }
  };
};
