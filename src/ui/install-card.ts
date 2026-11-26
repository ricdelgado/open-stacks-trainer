import { shouldShowInstallCard } from "../domain/pwa";
import {
  getInstallState,
  promptInstall,
  subscribeToInstall,
} from "../pwa";
import { strings } from "../strings";
import { button, el, showStatus } from "./elements";
import { icon } from "./icons";

export type DismissResult =
  | { ok: true }
  | { ok: false; message: string };

export interface InstallCardOptions {
  dismissed: boolean;
  onDismiss(): DismissResult;
}

export function mountInstallCard(
  host: HTMLElement,
  options: InstallCardOptions,
): () => void {
  const render = (): void => {
    host.replaceChildren();

    const installState = getInstallState();
    const visible =
      import.meta.env.PROD &&
      shouldShowInstallCard({
        platform: installState.platform,
        standalone: installState.standalone,
        dismissed: options.dismissed,
        promptAvailable: installState.promptAvailable,
      });

    host.hidden = !visible;
    if (!visible) return;

    const card = el("section", "install-card");
    card.setAttribute("aria-labelledby", "install-card-title");

    const head = el("div", "install-card__head");
    const iconBox = el("span", "install-card__icon");
    iconBox.append(icon("install"));

    const copy = el("div", "install-card__copy");
    const title = el("h2", "install-card__title", strings.install.title);
    title.id = "install-card-title";
    const text = el(
      "p",
      "install-card__text",
      installState.platform === "ios"
        ? strings.install.iosText
        : strings.install.androidText,
    );
    copy.append(title, text);

    const dismiss = button("", "install-card__dismiss");
    dismiss.setAttribute("aria-label", strings.install.dismiss);
    dismiss.append(icon("close"));
    head.append(iconBox, copy, dismiss);
    card.append(head);

    const status = el("div", "form-status");

    if (installState.platform === "ios") {
      const steps = el("ol", "install-card__steps");
      steps.append(
        el("li", undefined, strings.install.iosStepShare),
        el("li", undefined, strings.install.iosStepAdd),
      );
      card.append(steps);
    } else {
      const action = button(
        strings.install.install,
        "button button--primary install-card__action",
      );
      action.prepend(icon("install"));
      action.addEventListener("click", () => {
        status.replaceChildren();
        void promptInstall().then((outcome) => {
          if (outcome === "unavailable") {
            showStatus(status, strings.install.unavailable);
            return;
          }
          host.hidden = true;
          host.replaceChildren();
        });
      });
      card.append(action);
    }

    dismiss.addEventListener("click", () => {
      status.replaceChildren();
      const result = options.onDismiss();
      if (!result.ok) {
        showStatus(status, result.message);
        return;
      }
      host.hidden = true;
      host.replaceChildren();
    });

    card.append(status);
    host.append(card);
  };

  render();
  return subscribeToInstall(render);
}
