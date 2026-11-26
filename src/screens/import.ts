import { builtInStacks } from "../data/stacks";
import { createCustomStack } from "../domain/custom-stacks";
import {
  parseImportText,
  type ImportError,
} from "../domain/stack-transfer";
import {
  validateStackName,
  type StackNameError,
} from "../domain/stack-validation";
import { strings } from "../strings";
import { button, el, link, showStatus } from "../ui/elements";
import { icon } from "../ui/icons";
import { renderStorageNotice } from "../ui/storage-notice";
import { storageMessage } from "../ui/storage-messages";
import type { Screen } from "./screen";

function importErrorMessage(error: ImportError): string {
  switch (error.code) {
    case "empty":
      return strings.importPage.errors.empty;
    case "malformed-json":
      return strings.importPage.errors.malformedJson;
    case "backup-json":
      return strings.importPage.errors.backupJson;
    case "not-stack-json":
      return strings.importPage.errors.notStackJson;
    case "card":
      return strings.importPage.errors.card(error.token);
    case "order-count":
      return strings.importPage.errors.count(error.count);
    case "duplicate":
      return strings.importPage.errors.duplicate(error.card);
  }
}

function nameErrorMessage(error: StackNameError): string {
  switch (error) {
    case "empty":
      return strings.stackNameErrors.empty;
    case "too-long":
      return strings.stackNameErrors.tooLong;
    case "reserved":
      return strings.stackNameErrors.reserved;
    case "duplicate":
      return strings.stackNameErrors.duplicate;
  }
}

export const renderImport: Screen = (root, context) => {
  root.className = "screen screen--import";

  const heading = el("h1", "screen-title", strings.headings.importStack);
  const lead = el("p", "screen-lead", strings.importPage.lead);
  root.append(heading, lead);

  renderStorageNotice(root, context);

  const form = el("form", "import-form");
  form.noValidate = true;

  const nameField = el("div", "field");
  const nameLabel = el("label", "field__label", strings.importPage.nameLabel);
  nameLabel.htmlFor = "import-name";
  const nameInput = el("input", "text-input");
  nameInput.id = "import-name";
  nameInput.type = "text";
  nameInput.maxLength = 60;
  nameInput.placeholder = strings.importPage.namePlaceholder;
  nameInput.autocomplete = "off";
  nameField.append(nameLabel, nameInput);

  const cardsField = el("div", "field");
  const cardsLabel = el("label", "field__label", strings.importPage.inputLabel);
  cardsLabel.htmlFor = "import-cards";
  const textarea = el("textarea", "textarea");
  textarea.id = "import-cards";
  textarea.rows = 8;
  textarea.spellcheck = false;
  textarea.placeholder = strings.importPage.inputPlaceholder;
  const hint = el("p", "field__hint", strings.importPage.inputHint);
  cardsField.append(cardsLabel, textarea, hint);

  const fileField = el("div", "field");
  const fileInput = el("input", "sr-only");
  fileInput.type = "file";
  fileInput.accept = ".json,.txt,application/json,text/plain";
  fileInput.tabIndex = -1;
  const chooseFile = button(
    strings.importPage.chooseFile,
    "button button--secondary",
  );
  chooseFile.addEventListener("click", () => {
    fileInput.click();
  });
  fileField.append(
    chooseFile,
    fileInput,
    el("p", "field__hint", strings.importPage.fileHint),
  );

  const status = el("div", "form-status");
  status.setAttribute("aria-live", "polite");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    status.replaceChildren();

    void (async () => {
      try {
        textarea.value = await file.text();
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        showStatus(status, strings.importPage.fileLoaded, "success");
      } catch {
        showStatus(status, strings.importPage.fileError);
      }
    })();
  });

  const submit = el(
    "button",
    "button button--primary button--wide",
    strings.importPage.submit,
  );
  submit.prepend(icon("import"));
  submit.type = "submit";

  form.append(nameField, fileField, cardsField, submit, status);
  root.append(form);

  const back = link(
    "#/my-stacks",
    strings.common.backToMyStacks,
    "button button--secondary",
  );
  back.prepend(icon("back"));
  root.append(back);

  textarea.addEventListener("input", () => {
    if (nameInput.value.trim().length > 0) return;
    const parsed = parseImportText(textarea.value);
    if (parsed.ok && parsed.name) {
      nameInput.value = parsed.name;
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.replaceChildren();

    const parsed = parseImportText(textarea.value);
    if (!parsed.ok) {
      showStatus(status, importErrorMessage(parsed.error));
      return;
    }

    const desiredName = nameInput.value.trim() || parsed.name || "";
    const checked = validateStackName(desiredName, {
      reservedNames: builtInStacks.map((stack) => stack.name),
      takenNames: context.state.customStacks.map((stack) => stack.name),
    });
    if (!checked.ok) {
      showStatus(status, nameErrorMessage(checked.error));
      return;
    }

    const stack = createCustomStack(
      {
        name: checked.name,
        creator: parsed.creator,
        order: parsed.order,
      },
      new Date(),
    );
    const result = context.upsertCustomStack(stack);
    if (!result.ok) {
      showStatus(status, storageMessage(result.reason));
      return;
    }

    context.setFlash({
      tone: "success",
      message: strings.importPage.imported,
    });
    window.location.hash = "#/my-stacks";
  });
};
