import { getBuiltInStack } from "../data/stacks";
import {
  ACCELERATE_THRESHOLDS,
  accelerateCandidates,
  isAccelerateThreshold,
} from "../domain/accelerate";
import type { Mode, Settings } from "../domain/types";
import { strings } from "../strings";
import { el, showStatus } from "./elements";
import { storageMessage } from "./storage-messages";
import type { AppContext } from "../screens/screen";

function modeLabel(mode: Mode): string {
  return mode === "basic" ? strings.menu.modeBasic : strings.menu.modeCardPlus3;
}

function stackNameFor(context: AppContext, stackId: string): string {
  const builtIn = getBuiltInStack(stackId);
  if (builtIn) return builtIn.name;
  return (
    context.state.customStacks.find((stack) => stack.id === stackId)?.name ??
    stackId
  );
}

function reinforcementCount(context: AppContext): number {
  const { selectedStackId, mode } = context.state.settings;
  const cards = context.state.stats[selectedStackId]?.[mode]?.cards ?? {};
  return Object.values(cards).filter((card) => card.inReinforcement).length;
}

function accelerateCount(context: AppContext, thresholdTenths: number): number {
  const { selectedStackId, mode } = context.state.settings;
  return accelerateCandidates(
    context.state.stats[selectedStackId]?.[mode],
    thresholdTenths,
  ).length;
}

export function createTrainingSettings(
  context: AppContext,
  status: HTMLElement,
): HTMLElement {
  const persist = (patch: Partial<Settings>): void => {
    const result = context.updateSettings(patch);
    status.replaceChildren();
    if (!result.ok) {
      showStatus(status, storageMessage(result.reason));
    }
  };

  const container = el("div", "training-settings__body");

  const reinforcementGroup = el("fieldset", "field");
  const reinforcementLegend = el(
    "legend",
    "field__label",
    strings.settingsPage.reinforcement,
  );
  const reinforcementOption = el("label", "mode-option");
  const reinforcementInput = el("input");
  reinforcementInput.type = "checkbox";
  reinforcementInput.id = "reinforcement-toggle";
  reinforcementInput.checked = context.state.settings.reinforcement;
  reinforcementInput.addEventListener("change", () => {
    persist({ reinforcement: reinforcementInput.checked });
  });

  reinforcementOption.append(
    reinforcementInput,
    el("span", "mode-option__name", strings.settingsPage.reinforcementToggle),
  );
  reinforcementGroup.append(
    reinforcementLegend,
    reinforcementOption,
    el("p", "field__hint", strings.settingsPage.reinforcementHint),
  );

  const count = reinforcementCount(context);
  const { selectedStackId, mode } = context.state.settings;
  const reinforcementList = el("div", "settings-list");
  reinforcementList.append(
    el(
      "p",
      "field__label",
      strings.settingsPage.reinforcementSummary(
        stackNameFor(context, selectedStackId),
        modeLabel(mode),
      ),
    ),
    el(
      "p",
      "field__hint",
      count === 0
        ? strings.settingsPage.reinforcementEmpty
        : strings.settingsPage.reinforcementCount(count),
    ),
  );

  const accelerateGroup = el("fieldset", "field");
  const accelerateLegend = el(
    "legend",
    "field__label",
    strings.settingsPage.accelerate,
  );
  const accelerateOption = el("label", "mode-option");
  const accelerateInput = el("input");
  accelerateInput.type = "checkbox";
  accelerateInput.id = "accelerate-toggle";
  accelerateInput.checked = context.state.settings.accelerate;

  const thresholdField = el("fieldset", "field");
  thresholdField.hidden = !accelerateInput.checked;
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
      persist({ accelerateThresholdTenths: value });
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

  accelerateInput.addEventListener("change", () => {
    persist({ accelerate: accelerateInput.checked });
    thresholdField.hidden = !accelerateInput.checked;
  });

  accelerateOption.append(
    accelerateInput,
    el("span", "mode-option__name", strings.settingsPage.accelerateToggle),
  );
  accelerateGroup.append(
    accelerateLegend,
    accelerateOption,
    el("p", "field__hint", strings.settingsPage.accelerateHint),
  );

  const endlessGroup = el("fieldset", "field");
  const endlessLegend = el(
    "legend",
    "field__label",
    strings.settingsPage.endless,
  );
  const endlessOption = el("label", "mode-option");
  const endlessInput = el("input");
  endlessInput.type = "checkbox";
  endlessInput.id = "endless-toggle";
  endlessInput.checked = context.state.settings.endless;
  endlessInput.addEventListener("change", () => {
    persist({ endless: endlessInput.checked });
  });
  endlessOption.append(
    endlessInput,
    el("span", "mode-option__name", strings.settingsPage.endlessToggle),
  );
  endlessGroup.append(
    endlessLegend,
    endlessOption,
    el("p", "field__hint", strings.settingsPage.endlessHint),
  );

  container.append(
    reinforcementGroup,
    reinforcementList,
    accelerateGroup,
    thresholdField,
    endlessGroup,
  );
  return container;
}
