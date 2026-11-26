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
import { icon, type IconName } from "../ui/icons";
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

function actionLink(
  href: string,
  label: string,
  iconName?: IconName,
): HTMLAnchorElement {
  const node = link(href, label, "button button--secondary button--small");
  if (iconName) node.prepend(icon(iconName));
  return node;
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
  const create = link(
    "#/stacks/new",
    strings.myStacksPage.create,
    "button button--primary",
  );
  create.prepend(icon("plus"));
  const importStack = link(
    "#/import",
    strings.myStacksPage.import,
    "button button--secondary",
  );
  importStack.prepend(icon("import"));
  toolbar.append(create, importStack);
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
          "reveal",
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
    const back = link(
      "#/",
      strings.common.backToMenu,
      "button button--secondary stacks-back",
    );
    back.prepend(icon("back"));
    root.append(el("p", "stats-empty", strings.myStacksPage.emptyCustom), back);
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
      "reveal",
    );
    const edit = actionLink(
      `#/stacks/${encodeURIComponent(stack.id)}/edit`,
      strings.myStacksPage.edit,
      "edit",
    );

    const exportButton = button(
      strings.myStacksPage.export,
      "button button--secondary button--small",
    );
    exportButton.prepend(icon("export"));
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
    deleteButton.prepend(icon("trash"));
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
  const back = link(
    "#/",
    strings.common.backToMenu,
    "button button--secondary stacks-back",
  );
  back.prepend(icon("back"));
  root.append(back);
};
