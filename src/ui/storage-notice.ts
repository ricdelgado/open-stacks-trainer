import type { AppContext } from "../screens/screen";
import { strings } from "../strings";
import { confirmAction } from "./confirm";
import { el } from "./elements";
import { storageMessage } from "./storage-messages";

export function renderStorageNotice(
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
    const reset = el(
      "button",
      "button button--secondary",
      strings.storage.resetSavedData,
    );
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

export function renderFlash(
  container: HTMLElement,
  context: AppContext,
): void {
  if (!context.flash) return;
  const status = el("p", `status status--${context.flash.tone}`, context.flash.message);
  status.setAttribute(
    "role",
    context.flash.tone === "error" ? "alert" : "status",
  );
  container.append(status);
}
