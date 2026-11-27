import {
  ACCELERATE_THRESHOLDS,
  accelerateCandidates,
  isAccelerateThreshold,
} from "../domain/accelerate";
import type { Settings } from "../domain/types";
import { strings } from "../strings";
import { el, showStatus } from "./elements";
import { storageMessage } from "./storage-messages";
import type { AppContext } from "../screens/screen";

function accelerateCount(context: AppContext, thresholdTenths: number): number {
  const { selectedStackId, mode } = context.state.settings;
  return accelerateCandidates(
    context.state.stats[selectedStackId]?.[mode],
    thresholdTenths,
  ).length;
}

function persist(
  context: AppContext,
  status: HTMLElement,
  patch: Partial<Settings>,
): void {
  const result = context.updateSettings(patch);
  status.replaceChildren();
  if (!result.ok) {
    showStatus(status, storageMessage(result.reason));
  }
}

function toggleOption(
  id: string,
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): HTMLLabelElement {
  const option = el("label", "mode-option toggle-option");
  const text = el("span", "mode-option__name", label);
  const switchWrap = el("span", "toggle-switch");
  const input = el("input");
  input.type = "checkbox";
  input.id = id;
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));
  const track = el("span", "toggle-switch__track");
  track.setAttribute("aria-hidden", "true");
  switchWrap.append(input, track);
  option.append(text, switchWrap);
  return option;
}

export function createTrainingSettings(
  context: AppContext,
  status: HTMLElement,
): HTMLElement {
  const container = el("div", "training-settings__body");

  const reinforcementBlock = el("div", "field");
  const reinforcementOption = toggleOption(
    "reinforcement-toggle",
    strings.settingsPage.reinforcement,
    context.state.settings.reinforcement,
    (checked) => persist(context, status, { reinforcement: checked }),
  );
  reinforcementBlock.append(
    reinforcementOption,
    el("p", "field__hint", strings.settingsPage.reinforcementHint),
  );

  const accelerateBlock = el("div", "field");
  const thresholdField = el("fieldset", "field");
  thresholdField.hidden = !context.state.settings.accelerate;
  const thresholdLegend = el(
    "legend",
    "field__label",
    strings.settingsPage.accelerateThreshold,
  );
  const thresholdGroup = el("div", "segmented");
  const thresholdHint = el("p", "field__hint");

  const updateThresholdHint = (): void => {
    const total = accelerateCount(
      context,
      context.state.settings.accelerateThresholdTenths,
    );
    thresholdHint.textContent =
      total === 0
        ? strings.settingsPage.accelerateEmpty
        : strings.settingsPage.accelerateCount(total);
  };

  for (const tenths of ACCELERATE_THRESHOLDS) {
    const option = el("label", "segment");
    const input = el("input");
    input.type = "radio";
    input.name = "accelerate-threshold";
    input.value = String(tenths);
    input.checked = context.state.settings.accelerateThresholdTenths === tenths;
    input.addEventListener("change", () => {
      if (!input.checked) return;
      const value = Number(input.value);
      if (!isAccelerateThreshold(value)) return;
      persist(context, status, { accelerateThresholdTenths: value });
      updateThresholdHint();
    });
    option.append(
      input,
      el(
        "span",
        "segment__text",
        strings.settingsPage.accelerateThresholdLabel(tenths),
      ),
    );
    thresholdGroup.append(option);
  }

  updateThresholdHint();
  thresholdField.append(thresholdLegend, thresholdGroup, thresholdHint);

  const accelerateOption = toggleOption(
    "accelerate-toggle",
    strings.settingsPage.accelerate,
    context.state.settings.accelerate,
    (checked) => {
      persist(context, status, { accelerate: checked });
      thresholdField.hidden = !checked;
    },
  );

  accelerateBlock.append(
    accelerateOption,
    el("p", "field__hint", strings.settingsPage.accelerateHint),
  );

  const accelerateWrap = el("div", "accelerate-settings");
  accelerateWrap.append(accelerateBlock, thresholdField);
  accelerateWrap.hidden = context.state.settings.mode === "quartets";

  container.append(reinforcementBlock, accelerateWrap);
  return container;
}

export function createEndlessSetting(
  context: AppContext,
  status: HTMLElement,
): HTMLElement {
  const group = el("div", "field endless-setting");
  const option = toggleOption(
    "endless-toggle",
    strings.settingsPage.endless,
    context.state.settings.endless,
    (checked) => persist(context, status, { endless: checked }),
  );
  group.append(option);
  return group;
}
