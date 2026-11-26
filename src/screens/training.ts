import { RecallTimer } from "../domain/timer";
import { cardAccessibleLabel } from "../ui/card-labels";
import { strings } from "../strings";
import { confirmAction } from "../ui/confirm";
import { createCardFace } from "../ui/card-face";
import { button, el, showStatus } from "../ui/elements";
import { icon } from "../ui/icons";
import { storageMessage } from "../ui/storage-messages";
import type { Screen, TrainingView } from "./screen";

function createPositionFace(position: number): HTMLElement {
  const face = el("span", "position-face position-face--large");
  face.setAttribute("role", "img");
  face.setAttribute("aria-label", strings.training.positionAccessible(position));
  face.append(el("span", "position-face__number", String(position)));
  return face;
}

function frontIsPosition(view: TrainingView): boolean {
  return view.item.direction === "position-to-card";
}

function answerDescription(view: TrainingView): string {
  if (view.mode === "card-plus-3") {
    return (view.item.nextCards ?? [])
      .map((card) => cardAccessibleLabel(card))
      .join(", ");
  }
  return frontIsPosition(view)
    ? cardAccessibleLabel(view.item.card)
    : strings.training.positionAccessible(view.item.position);
}

export const renderTraining: Screen = (root, context) => {
  const initial = context.getTrainingView();
  if (!initial) return;

  root.className = "screen screen--training";

  const header = el("header", "training-header");
  const heading = el("h1", "screen-title", strings.headings.training);
  const quit = button(strings.training.quit, "button button--secondary button--small");
  quit.addEventListener("click", () => {
    if (confirmAction(strings.training.quitConfirm)) {
      context.quitSession();
    }
  });
  header.append(heading, quit);

  const stackName = el("p", "training-stack", initial.stackName);

  const timer = new RecallTimer();
  const stats = el("div", "training-stats");
  const progress = el("p", "training-progress");
  progress.setAttribute("aria-live", "polite");
  const streak = el("p", "training-streak");
  const direction = el("p", "training-direction");
  const modeLabel = el("p", "training-mode");
  const timerText = el("p", "training-timer");
  timerText.setAttribute("aria-hidden", "true");
  const insertLabel = el("p", "training-insert");
  insertLabel.hidden = true;
  stats.append(progress, streak, direction, modeLabel, timerText, insertLabel);

  const updateTimerText = (): void => {
    timerText.textContent = strings.training.timerSeconds(timer.displaySeconds);
  };

  const live = el("p", "sr-only");
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");

  const play = el("section", "training-play");
  play.tabIndex = -1;
  const status = el("div", "form-status");
  if (context.storageNotice) {
    showStatus(status, storageMessage(context.storageNotice));
  }

  const renderPrompt = (focusPlay: boolean): void => {
    const view = context.getTrainingView();
    if (!view) return;

    progress.textContent = view.endless
      ? strings.training.answeredCount(view.answered)
      : strings.training.progress(view.answered, view.total);
    progress.setAttribute(
      "aria-label",
      view.endless
        ? strings.training.answeredCountLabel(view.answered)
        : strings.training.answeredProgress(view.answered, view.total),
    );
    streak.textContent = strings.training.streak(view.persistedStreak);
    direction.textContent = strings.directions[view.item.direction];
    modeLabel.textContent =
      view.mode === "card-plus-3" ? strings.menu.modeCardPlus3 : "";
    modeLabel.hidden = view.mode !== "card-plus-3";
    insertLabel.hidden = view.item.insert === undefined;
    insertLabel.textContent =
      view.item.insert === "accelerate"
        ? strings.training.accelerateBadge
        : strings.training.reinforcementBadge;
    live.textContent = view.revealed
      ? strings.training.revealWithTime(
          answerDescription(view),
          timer.displaySeconds,
        )
      : "";
    updateTimerText();

    const pair = el("div", "prompt-pair");
    const frontSide = el("div", "prompt-side");
    frontSide.append(
      el(
        "p",
        "prompt-side__label",
        frontIsPosition(view)
          ? strings.training.positionLabel
          : strings.training.cardLabel,
      ),
      frontIsPosition(view)
        ? createPositionFace(view.item.position)
        : createCardFace(view.item.card, "large"),
    );

    const backSide = el("div", "prompt-side prompt-side--answer");
    if (view.mode === "card-plus-3") {
      backSide.append(
        el("p", "prompt-side__label", strings.training.nextThreeLabel),
      );
      const triple = el("div", "card-triple");
      for (const card of view.item.nextCards ?? []) {
        triple.append(createCardFace(card, "small"));
      }
      backSide.append(triple);
    } else {
      backSide.append(
        el(
          "p",
          "prompt-side__label",
          frontIsPosition(view)
            ? strings.training.cardLabel
            : strings.training.positionLabel,
        ),
        frontIsPosition(view)
          ? createCardFace(view.item.card, "large")
          : createPositionFace(view.item.position),
      );
    }

    if (!view.revealed) {
      backSide.classList.add("prompt-side--hidden");
      backSide.setAttribute("aria-hidden", "true");
    }

    pair.append(frontSide, backSide);

    const controls = el(
      "div",
      view.revealed ? "training-controls training-controls--grade" : "training-controls",
    );
    if (!view.revealed) {
      const answer = button(
        strings.actions.answer,
        "button button--primary button--wide",
      );
      answer.dataset.action = "answer";
      answer.prepend(icon("reveal"));
      answer.addEventListener("click", reveal);
      controls.append(answer);
    } else {
      const missed = button(
        strings.actions.missed,
        "button button--secondary button--wide",
      );
      missed.dataset.action = "missed";
      missed.prepend(icon("cross"));
      missed.addEventListener("click", () => grade(false));

      const gotIt = button(
        strings.actions.gotIt,
        "button button--primary button--wide",
      );
      gotIt.dataset.action = "got-it";
      gotIt.prepend(icon("check"));
      gotIt.addEventListener("click", () => grade(true));

      controls.append(missed, gotIt);
    }

    play.replaceChildren(pair, controls);

    if (focusPlay) {
      play.focus({ preventScroll: true });
    }
  };

  const reveal = (): void => {
    if (!context.revealAnswer()) return;
    timer.stop();
    renderPrompt(true);
  };

  const grade = (correct: boolean): void => {
    const outcome = context.gradeAnswer(
      correct,
      correct ? timer.tenths : undefined,
    );
    if (!outcome) return;
    if (outcome.complete) return;

    status.replaceChildren();
    if (!outcome.save.ok) {
      showStatus(status, storageMessage(outcome.save.reason));
    }
    timer.start();
    renderPrompt(true);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.repeat) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const target = event.target instanceof HTMLElement ? event.target : null;
    if (
      target?.isContentEditable ||
      target?.closest("input, textarea, select, dialog[open]")
    ) {
      return;
    }

    const view = context.getTrainingView();
    if (!view) return;
    const key = event.key.toLowerCase();

    if (!view.revealed) {
      if (key !== " " && key !== "enter") return;
      if (target?.closest("button, a")) return;
      event.preventDefault();
      reveal();
      return;
    }

    if (key === "1" || key === "n") {
      event.preventDefault();
      grade(false);
    } else if (key === "2" || key === "y") {
      event.preventDefault();
      grade(true);
    }
  };

  const onVisibilityChange = (): void => {
    if (document.hidden) {
      timer.pause();
    } else {
      timer.resume();
    }
    updateTimerText();
  };

  const timerInterval = window.setInterval(() => {
    if (timer.isRunning) updateTimerText();
  }, 250);

  window.addEventListener("keydown", onKeyDown);
  document.addEventListener("visibilitychange", onVisibilityChange);
  root.append(header, stackName, stats, play, live, status);
  timer.start();
  renderPrompt(false);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.clearInterval(timerInterval);
  };
};
