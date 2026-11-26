import { getBuiltInStack } from "../data/stacks";
import {
  createStackExport,
  stackExportFileName,
} from "../domain/stack-transfer";
import type { AppState } from "../domain/types";
import { strings } from "../strings";
import { createCardFace } from "../ui/card-face";
import { downloadJson } from "../ui/download";
import { button, el, link, showStatus } from "../ui/elements";
import { icon } from "../ui/icons";
import type { Screen } from "./screen";

function findStack(
  state: AppState,
  id: string,
): { id: string; name: string; creator: string; order: readonly string[] } | null {
  const builtIn = getBuiltInStack(id);
  if (builtIn) {
    return {
      id: builtIn.id,
      name: builtIn.name,
      creator: builtIn.creator,
      order: builtIn.order,
    };
  }
  const custom = state.customStacks.find((stack) => stack.id === id);
  return custom ?? null;
}

export function renderStackView(id: string): Screen {
  return (root, context) => {
    const stack = findStack(context.state, id);
    if (!stack) return;

    root.className = "screen screen--stack-view";

    const heading = el("h1", "screen-title", stack.name);
    const creator = el(
      "p",
      "stack-view__creator",
      strings.stackViewPage.creatorLine(stack.creator),
    );
    root.append(heading, creator);

    if (getBuiltInStack(stack.id)) {
      root.append(el("p", "stack-view__note", strings.stackViewPage.readOnly));
    }

    const status = el("div", "form-status");
    status.setAttribute("aria-live", "polite");

    const actions = el("div", "stack-view__actions");
    const exportButton = button(
      strings.stackViewPage.export,
      "button button--secondary",
    );
    exportButton.prepend(icon("export"));
    exportButton.addEventListener("click", () => {
      status.replaceChildren();
      downloadJson(
        stackExportFileName(stack.name),
        createStackExport(stack),
      );
      showStatus(status, strings.stackViewPage.exported, "success");
    });
    const back = link(
      "#/my-stacks",
      strings.stackViewPage.back,
      "button button--secondary",
    );
    back.prepend(icon("back"));
    actions.append(exportButton, back);
    root.append(actions, status);

    const list = el("ol", "stack-order");
    stack.order.forEach((card, index) => {
      const item = el("li", "stack-order__item");
      item.append(
        el("span", "stack-order__position", String(index + 1)),
        createCardFace(card, "small"),
      );
      list.append(item);
    });
    root.append(list);
  };
}
