import { builtInStacks } from "../data/stacks";
import {
  createStackExport,
  stackExportFileName,
} from "../domain/stack-transfer";
import type { CustomStack } from "../domain/types";
import { strings } from "../strings";
import { confirmAction } from "../ui/confirm";
import { downloadJson } from "../ui/download";
import { button, el, link, showStatus } from "../ui/elements";
import { renderFlash, renderStorageNotice } from "../ui/storage-notice";
import { storageMessage } from "../ui/storage-messages";
import type { Screen } from "./screen";

function stackRow(
  name: string,
  creator: string,
  actions: readonly HTMLElement[],
): HTMLElement {
  const row = el("li", "stack-row");
  const details = el("div", "stack-row__details");
  details.append(
    el("span", "stack-row__name", name),
    el("span", "stack-row__creator", strings.myStacksPage.creatorLine(creator)),
  );
  const controls = el("div", "stack-row__actions");
  controls.append(...actions);
  row.append(details, controls);
  return row;
}

function actionLink(href: string, label: string): HTMLAnchorElement {
  return link(href, label, "button button--secondary button--small");
}

export const renderMyStacks: Screen = (root, context) => {
  root.className = "screen screen--my-stacks";

  const heading = el("h1", "screen-title", strings.headings.myStacks);
  const lead = el("p", "screen-lead", strings.myStacksPage.lead);
  root.append(heading, lead);

  renderStorageNotice(root, context);
  renderFlash(root, context);

  const status = el("div", "form-status");
  status.setAttribute("aria-live", "polite");

  const toolbar = el("div", "stacks-toolbar");
  toolbar.append(
    link(
      "#/stacks/new",
      strings.myStacksPage.create,
      "button button--primary",
    ),
    link(
      "#/import",
      strings.myStacksPage.import,
      "button button--secondary",
    ),
  );
  root.append(toolbar, status);

  const builtInHeading = el(
    "h2",
    "summary-subtitle",
    strings.myStacksPage.builtIn,
  );
  const builtInList = el("ul", "stack-list");
  for (const stack of builtInStacks) {
    builtInList.append(
      stackRow(stack.name, stack.creator, [
        actionLink(
          `#/stacks/${encodeURIComponent(stack.id)}/view`,
          strings.myStacksPage.view,
        ),
      ]),
    );
  }
  root.append(builtInHeading, builtInList);

  const customHeading = el(
    "h2",
    "summary-subtitle",
    strings.myStacksPage.custom,
  );
  root.append(customHeading);

  if (context.state.customStacks.length === 0) {
    root.append(
      el("p", "stats-empty", strings.myStacksPage.emptyCustom),
      link(
        "#/",
        strings.common.backToMenu,
        "button button--secondary stacks-back",
      ),
    );
    return;
  }

  const exportStack = (stack: CustomStack): void => {
    status.replaceChildren();
    downloadJson(
      stackExportFileName(stack.name),
      createStackExport(stack),
    );
    showStatus(status, strings.myStacksPage.exported, "success");
  };

  const deleteStack = (stack: CustomStack): void => {
    status.replaceChildren();
    if (!confirmAction(strings.myStacksPage.deleteConfirm(stack.name))) return;

    const result = context.deleteCustomStack(stack.id);
    if (!result.ok) {
      showStatus(status, storageMessage(result.reason));
      return;
    }
    context.setFlash({
      tone: "success",
      message: strings.myStacksPage.deleted(stack.name),
    });
    context.refresh();
  };

  const customList = el("ul", "stack-list");
  for (const stack of context.state.customStacks) {
    const view = actionLink(
      `#/stacks/${encodeURIComponent(stack.id)}/view`,
      strings.myStacksPage.view,
    );
    const edit = actionLink(
      `#/stacks/${encodeURIComponent(stack.id)}/edit`,
      strings.myStacksPage.edit,
    );

    const exportButton = button(
      strings.myStacksPage.export,
      "button button--secondary button--small",
    );
    exportButton.setAttribute(
      "aria-label",
      `${strings.myStacksPage.export} ${stack.name}`,
    );
    exportButton.addEventListener("click", () => {
      exportStack(stack);
    });

    const deleteButton = button(
      strings.myStacksPage.delete,
      "button button--danger button--small",
    );
    deleteButton.setAttribute(
      "aria-label",
      `${strings.myStacksPage.delete} ${stack.name}`,
    );
    deleteButton.addEventListener("click", () => {
      deleteStack(stack);
    });

    customList.append(
      stackRow(stack.name, stack.creator, [
        view,
        edit,
        exportButton,
        deleteButton,
      ]),
    );
  }
  root.append(customList);
  root.append(
    link(
      "#/",
      strings.common.backToMenu,
      "button button--secondary stacks-back",
    ),
  );
};
