type IconPart =
  | { tag: "path"; d: string; filled?: boolean }
  | {
      tag: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      filled?: boolean;
    };

export type IconName =
  | "train"
  | "stacks"
  | "stats"
  | "settings"
  | "reveal"
  | "check"
  | "cross"
  | "plus"
  | "import"
  | "export"
  | "edit"
  | "trash"
  | "back"
  | "install"
  | "offline"
  | "update"
  | "close"
  | "chevron"
  | "bolt";

const ICONS: Record<IconName, readonly IconPart[]> = {
  train: [{ tag: "path", d: "M8 5l11 7-11 7z", filled: true }],
  stacks: [
    { tag: "rect", x: 4, y: 7, width: 13, height: 14, rx: 3 },
    { tag: "path", d: "M8 4h10a2 2 0 0 1 2 2v10" },
  ],
  stats: [
    { tag: "rect", x: 4, y: 12, width: 4, height: 8, rx: 1.5 },
    { tag: "rect", x: 10, y: 7, width: 4, height: 13, rx: 1.5 },
    { tag: "rect", x: 16, y: 4, width: 4, height: 16, rx: 1.5 },
  ],
  settings: [
    { tag: "path", d: "M3 8h9" },
    { tag: "rect", x: 12, y: 6, width: 4, height: 4, rx: 1 },
    { tag: "path", d: "M16 8h5" },
    { tag: "path", d: "M3 16h5" },
    { tag: "rect", x: 8, y: 14, width: 4, height: 4, rx: 1 },
    { tag: "path", d: "M12 16h9" },
  ],
  reveal: [
    {
      tag: "path",
      d: "M2 12c2.5-4 6-6 10-6s7.5 2 10 6c-2.5 4-6 6-10 6S4.5 16 2 12z",
    },
    { tag: "rect", x: 10, y: 10, width: 4, height: 4, rx: 1 },
  ],
  check: [{ tag: "path", d: "M5 12.5l4.5 4.5L19 7" }],
  cross: [{ tag: "path", d: "M6 6l12 12M18 6L6 18" }],
  plus: [{ tag: "path", d: "M12 5v14M5 12h14" }],
  import: [
    { tag: "path", d: "M12 3v11" },
    { tag: "path", d: "M8 10l4 4 4-4" },
    {
      tag: "path",
      d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
    },
  ],
  export: [
    { tag: "path", d: "M12 14V3" },
    { tag: "path", d: "M8 7l4-4 4 4" },
    {
      tag: "path",
      d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
    },
  ],
  edit: [
    {
      tag: "path",
      d: "M4 20l4-1L18.5 8.5a2.5 2.5 0 0 0-3.5-3.5L4.5 15.5 4 20z",
    },
    { tag: "path", d: "M13 6l4 4" },
  ],
  trash: [
    { tag: "path", d: "M4 7h16" },
    { tag: "path", d: "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" },
    {
      tag: "path",
      d: "M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13",
    },
    { tag: "path", d: "M10 11v6M14 11v6" },
  ],
  back: [
    { tag: "path", d: "M19 12H5" },
    { tag: "path", d: "M11 6l-6 6 6 6" },
  ],
  install: [
    { tag: "rect", x: 7, y: 2.5, width: 10, height: 19, rx: 2.5 },
    { tag: "path", d: "M12 7v6" },
    { tag: "path", d: "M9.5 10.5L12 13l2.5-2.5" },
    { tag: "path", d: "M10.5 18h3" },
  ],
  offline: [
    { tag: "path", d: "M3 3l18 18" },
    { tag: "path", d: "M5 12a10 10 0 0 1 4.2-2.6" },
    { tag: "path", d: "M12 5a10 10 0 0 1 7 7" },
    { tag: "path", d: "M8.5 15.5a5 5 0 0 1 7 0" },
    { tag: "rect", x: 11, y: 18, width: 2, height: 2, rx: 0.5, filled: true },
  ],
  update: [
    { tag: "path", d: "M4 12a8 8 0 0 1 13.7-5.7" },
    { tag: "path", d: "M17.7 2.5v4h-4" },
    { tag: "path", d: "M20 12a8 8 0 0 1-13.7 5.7" },
    { tag: "path", d: "M6.3 21.5v-4h4" },
  ],
  close: [{ tag: "path", d: "M6 6l12 12M18 6L6 18" }],
  chevron: [{ tag: "path", d: "M6 9l6 6 6-6" }],
  bolt: [{ tag: "path", d: "M13 2 4 14h6l-1 8 9-12h-6z", filled: true }],
};

const SVG_NS = "http://www.w3.org/2000/svg";

export function icon(name: IconName): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.classList.add("icon");

  for (const part of ICONS[name]) {
    const node =
      part.tag === "path"
        ? document.createElementNS(SVG_NS, "path")
        : document.createElementNS(SVG_NS, "rect");
    if (part.tag === "path") {
      node.setAttribute("d", part.d);
    } else {
      node.setAttribute("x", String(part.x));
      node.setAttribute("y", String(part.y));
      node.setAttribute("width", String(part.width));
      node.setAttribute("height", String(part.height));
      if (part.rx !== undefined) node.setAttribute("rx", String(part.rx));
    }
    if (part.filled) {
      node.setAttribute("fill", "currentColor");
      node.setAttribute("stroke", "none");
    }
    svg.append(node);
  }

  return svg;
}
