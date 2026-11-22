import { builtInStacks } from "../data/stacks";
import { DIRECTIONS, type Settings } from "../domain/types";
import { strings } from "../strings";
import { confirmAction } from "../ui/confirm";
import { button, el, link, showStatus } from "../ui/elements";
import { openHelpDialog } from "../ui/help-dialog";
import type { AppContext, Screen } from "./screen";

function storageMessage(
  kind: "corrupt" | "newer-schema" | "unavailable" | "quota" | "blocked",
): string {
  switch (kind) {
    case "corrupt":
      return strings.storage.corrupt;
    case "newer-schema":
      return strings.storage.newer;
    case "unavailable":
      return strings.storage.unavailable;
    case "quota":
      return strings.storage.quota;
    case "blocked":
      return strings.storage.writeBlocked;
  }
}

function renderStorageNotice(
  container: HTMLElement,
  context: AppContext,
): void {
  if (!context.storageNotice) return;

  const notice = el("div", "notice notice--error");
  const message = el(
    "p",
    "notice__text",
    storageMessage(context.storageNotice),
  );
  message.setAttribute("role", "alert");
  notice.append(message);

  if (context.storageNotice === "corrupt") {
    const reset = el("button", "button button--secondary", strings.storage.resetSavedData);
    reset.type = "button";
    reset.addEventListener("click", () => {
      if (!confirmAction(strings.storage.resetConfirm)) return;
      const result = context.resetStorage();
      if (result.ok) {
        context.refresh();
        return;
      }
      message.textContent = storageMessage(result.reason);
    });
    notice.append(reset);
  }

  container.append(notice);
}

export const renderMenu: Screen = (root, context) => {
  root.className = "screen screen--menu";

  const header = el("header", "menu-hero");
  const title = el("h1", "menu-title", strings.appTitle);
  const tagline = el("p", "menu-tagline", strings.tagline);

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

  header.append(title, tagline, help);
  root.append(header);

  renderStorageNotice(root, context);

  const startPanel = el("section", "start-panel");
  startPanel.setAttribute("aria-label", strings.menu.startTraining);

  const start = link(
    "#/train",
    strings.menu.startTraining,
    "button button--primary button--large",
  );
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
  startPanel.append(directionGroup);
  startPanel.append(formStatus);
  root.append(startPanel);

  select.addEventListener("change", () => {
    const stack = builtInStacks.find((item) => item.id === select.value);
    if (!stack) {
      select.value = context.state.settings.selectedStackId;
      return;
    }
    applySettings({ selectedStackId: stack.id });
  });

  const modeGroup = el("fieldset", "field mode-group");
  const modeLegend = el("legend", "field__label", strings.menu.modeLabel);
  modeGroup.append(modeLegend);
  const modeList = el("div", "mode-list");

  const basic = el("label", "mode-option");
  const basicInput = el("input");
  basicInput.type = "radio";
  basicInput.name = "mode";
  basicInput.value = "basic";
  basicInput.checked = true;
  const basicText = el("span", "mode-option__name", strings.menu.modeBasic);
  basic.append(basicInput, basicText);
  modeList.append(basic);

  const futureModes: readonly string[] = [
    strings.menu.modeQuartets,
    strings.menu.modeAcaan,
    strings.menu.modeEndless,
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
    option.append(input, text, badge);
    modeList.append(option);
  }

  modeGroup.append(modeList);
  root.append(modeGroup);

  const nav = el("nav", "menu-nav");
  const statsLink = link("#/stats", "", "nav-card");
  statsLink.append(
    el("span", "nav-card__title", strings.menu.stats),
    el("span", "nav-card__hint", strings.menu.statsHint),
  );
  const stacksLink = link("#/my-stacks", "", "nav-card");
  stacksLink.append(
    el("span", "nav-card__title", strings.menu.myStacks),
    el("span", "nav-card__hint", strings.menu.myStacksHint),
  );
  nav.append(statsLink, stacksLink);
  root.append(nav);

  return () => {
    if (helpDialog) {
      helpDialog.close();
      helpDialog = null;
    }
  };
};
