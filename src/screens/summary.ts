import { accuracyPercent } from "../domain/scoring";
import { getLocale, strings } from "../strings";
import { createCardFace } from "../ui/card-face";
import { button, el, link, showStatus } from "../ui/elements";
import { icon } from "../ui/icons";
import { storageMessage } from "../ui/storage-messages";
import type { Screen } from "./screen";

function statBlock(label: string, value: string): HTMLElement {
  const block = el("div", "summary-stat");
  block.append(
    el("span", "summary-stat__label", label),
    el("span", "summary-stat__value", value),
  );
  return block;
}

function formatAverageTime(tenths: number | null): string {
  if (tenths === null) return strings.summary.emptyValue;
  const formatted = (tenths / 10).toLocaleString(getLocale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return strings.summary.seconds(formatted);
}

export const renderSummary: Screen = (root, context) => {
  const view = context.getSummaryView();
  if (!view) return;

  root.className = "screen screen--summary";

  const heading = el("h1", "screen-title", strings.headings.summary);
  const meta = el(
    "p",
    "summary-meta",
    view.mode === "quartets"
      ? view.stackName
      : strings.summary.stackDirection(
          view.stackName,
          strings.directions[view.direction],
        ),
  );

  const stats = el("div", "summary-stats");
  const percent = accuracyPercent(view.correct, view.answered);
  stats.append(
    statBlock(
      strings.summary.correct,
      strings.summary.countOutOf(view.correct, view.answered),
    ),
    statBlock(
      strings.summary.missed,
      strings.summary.countOutOf(view.missed, view.answered),
    ),
    statBlock(
      strings.summary.accuracy,
      percent === null
        ? strings.summary.emptyValue
        : strings.summary.percent(percent),
    ),
    statBlock(strings.summary.sessionBest, String(view.bestRun)),
    statBlock(
      strings.summary.averageTime,
      formatAverageTime(view.averageTenths),
    ),
  );

  const missedHeading = el("h2", "summary-subtitle", strings.summary.missedCards);
  const missed = el("div", "summary-misses");

  if (view.misses.length === 0) {
    missed.append(el("p", "summary-empty", strings.summary.noMisses));
  } else {
    const list = el("ol", "miss-list");
    for (const miss of view.misses) {
      const item = el("li", "miss-item");
      const details = el("div", "miss-item__details");
      const marker = icon("cross");
      marker.classList.add("miss-marker");

      if ("rank" in miss) {
        details.append(
          el("span", "miss-item__position", strings.quartets.rankNames[miss.rank]),
          el(
            "span",
            "miss-item__direction",
            strings.quartets.distancesLine(miss.distances),
          ),
        );
        item.append(marker, createCardFace(miss.firstCard, "small"), details);
      } else {
        details.append(
          el(
            "span",
            "miss-item__position",
            strings.summary.positionLine(miss.position),
          ),
          el("span", "miss-item__direction", strings.directions[miss.direction]),
        );
        item.append(marker, createCardFace(miss.card, "small"), details);
      }
      list.append(item);
    }
    missed.append(list);
  }

  const actions = el("div", "summary-actions");
  const again = button(
    strings.actions.trainAgain,
    "button button--primary button--wide",
  );
  again.prepend(icon("train"));
  again.addEventListener("click", () => {
    context.trainAgain();
  });
  const menu = link("#/", strings.actions.menu, "button button--secondary button--wide");
  actions.append(again, menu);

  const status = el("div", "form-status");
  if (context.storageNotice) {
    showStatus(status, storageMessage(context.storageNotice));
  }

  root.append(heading, meta, stats, missedHeading, missed, actions, status);
};
