import { strings } from "../strings";
import { button, el } from "./elements";
import { icon } from "./icons";

export function openHelpDialog(): HTMLDialogElement {
  const dialog = el("dialog", "help-dialog");
  dialog.setAttribute("aria-labelledby", "help-dialog-title");

  const panel = el("div", "help-dialog__panel");
  const head = el("div", "help-dialog__head");
  const title = el("h2", "help-dialog__title", strings.help.title);
  title.id = "help-dialog-title";
  const close = button(strings.help.close, "button button--secondary");
  close.prepend(icon("close"));
  close.addEventListener("click", () => {
    dialog.close();
  });
  head.append(title, close);

  const body = el("div", "help-dialog__body");
  for (const section of strings.help.sections) {
    const block = el("section", "help-section");
    const heading = el("h3", "help-section__title", section.title);
    const text = el("p", "help-section__text", section.body);
    block.append(heading, text);
    body.append(block);
  }

  const positionNote = el("p", "help-note", strings.help.positionNote);
  const dataNote = el("p", "help-note", strings.help.dataNote);
  body.append(positionNote, dataNote);

  panel.append(head, body);
  dialog.append(panel);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    dialog.remove();
  });

  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}
