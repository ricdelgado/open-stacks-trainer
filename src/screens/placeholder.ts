import { strings } from "../strings";
import { el, link } from "../ui/elements";
import type { Screen } from "./screen";

export function placeholderScreen(heading: string, message: string): Screen {
  return (root) => {
    root.className = "screen screen--placeholder";
    const title = el("h1", "screen-title", heading);
    const body = el("p", "screen-lead", message);
    const back = link("#/", strings.common.backToMenu, "button button--secondary");
    root.append(title, body, back);
  };
}
