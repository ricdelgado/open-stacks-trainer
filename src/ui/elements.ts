export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function link(href: string, text: string, className?: string): HTMLAnchorElement {
  const node = el("a", className, text);
  node.href = href;
  return node;
}

export function button(
  text: string,
  className?: string,
): HTMLButtonElement {
  const node = el("button", className, text);
  node.type = "button";
  return node;
}

export function showStatus(
  container: HTMLElement,
  message: string,
  tone: "error" | "success" | "info" = "error",
): HTMLParagraphElement {
  const node = el("p", `status status--${tone}`, message);
  node.setAttribute("role", tone === "error" ? "alert" : "status");
  container.append(node);
  return node;
}

export function focusMainHeading(root: ParentNode): void {
  const heading = root.querySelector<HTMLElement>("h1");
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus();
}
