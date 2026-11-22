import { builtInStacks, getBuiltInStack } from "./data/stacks";
import { applyAnswer, type SessionProgress } from "./domain/scoring";
import { generateSession, type GeneratedSession } from "./domain/session";
import { withSettings } from "./domain/settings";
import type { AppState, Direction } from "./domain/types";
import { parseRoute, type Route } from "./router";
import { renderMenu } from "./screens/menu";
import { placeholderScreen } from "./screens/placeholder";
import type { AppContext, GradeOutcome, Screen } from "./screens/screen";
import { renderSummary } from "./screens/summary";
import { renderTraining } from "./screens/training";
import { SessionRunner } from "./session/runner";
import {
  AppStore,
  createDefaultState,
  DEFAULT_STACK_ID,
  type SaveFailureReason,
} from "./storage/app-store";
import { strings } from "./strings";
import { el, focusMainHeading, link } from "./ui/elements";

interface ScreenDefinition {
  screen: Screen;
  title: string;
}

function titleFor(route: Route): string {
  switch (route.name) {
    case "menu":
      return strings.documentTitles.menu;
    case "train":
      return strings.documentTitles.train;
    case "stats":
      return strings.documentTitles.stats;
    case "my-stacks":
      return strings.documentTitles.myStacks;
    case "import":
      return strings.documentTitles.import;
    case "stack-new":
      return strings.documentTitles.newStack;
    case "stack-edit":
      return strings.documentTitles.editStack;
    case "stack-view":
      return strings.documentTitles.viewStack;
    case "summary":
      return strings.documentTitles.summary;
  }
}

function definitionFor(route: Route): ScreenDefinition {
  switch (route.name) {
    case "menu":
      return { screen: renderMenu, title: titleFor(route) };
    case "train":
      return { screen: renderTraining, title: titleFor(route) };
    case "stats":
      return {
        screen: placeholderScreen(
          strings.headings.stats,
          strings.placeholders.stats,
        ),
        title: titleFor(route),
      };
    case "my-stacks":
      return {
        screen: placeholderScreen(
          strings.headings.myStacks,
          strings.placeholders.myStacks,
        ),
        title: titleFor(route),
      };
    case "import":
      return {
        screen: placeholderScreen(
          strings.headings.importStack,
          strings.placeholders.import,
        ),
        title: titleFor(route),
      };
    case "stack-new":
      return {
        screen: placeholderScreen(
          strings.headings.newStack,
          strings.placeholders.newStack,
        ),
        title: titleFor(route),
      };
    case "stack-edit":
      return {
        screen: placeholderScreen(
          strings.headings.editStack,
          strings.placeholders.editStack,
        ),
        title: titleFor(route),
      };
    case "stack-view":
      return {
        screen: placeholderScreen(
          strings.headings.stackView,
          strings.placeholders.viewStack,
        ),
        title: titleFor(route),
      };
    case "summary":
      return { screen: renderSummary, title: titleFor(route) };
  }
}

function selectedStackExists(state: AppState): boolean {
  return builtInStacks.some(
    (stack) => stack.id === state.settings.selectedStackId,
  );
}

function normalizeSelection(state: AppState): {
  state: AppState;
  changed: boolean;
} {
  if (selectedStackExists(state)) return { state, changed: false };
  return {
    state: {
      ...state,
      settings: { ...state.settings, selectedStackId: DEFAULT_STACK_ID },
    },
    changed: true,
  };
}

function normalizeHash(route: Route): Route {
  const hash = window.location.hash;

  if (route.name === "stack-edit" && getBuiltInStack(route.id)) {
    window.history.replaceState(
      null,
      "",
      `#/stacks/${encodeURIComponent(route.id)}/view`,
    );
    return { name: "stack-view", id: route.id };
  }

  if (
    route.name === "menu" &&
    hash !== "" &&
    hash !== "#" &&
    hash !== "#/"
  ) {
    window.history.replaceState(null, "", "#/");
  } else if (hash === "" || hash === "#") {
    window.history.replaceState(null, "", "#/");
  }

  return route;
}

function createFooter(): HTMLElement {
  const footer = el("footer", "site-footer");
  const disclosure = link(
    strings.repositoryUrl,
    strings.footer.aiDisclosure,
    "site-footer__link",
  );
  disclosure.target = "_blank";
  disclosure.rel = "noopener noreferrer";
  const local = el("p", "site-footer__note", strings.footer.staysLocal);
  footer.append(disclosure, local);
  return footer;
}

export function startApp(appRoot: HTMLElement): void {
  const store = new AppStore();
  const loaded = store.load();
  const normalized = normalizeSelection(loaded.state);
  let state = normalized.state;
  let saveFailure: SaveFailureReason | null = null;
  let activeSession: SessionRunner | null = null;
  let completedSession: {
    generated: GeneratedSession;
    progress: SessionProgress;
  } | null = null;

  if (loaded.ok && normalized.changed) {
    const result = store.save(state);
    if (!result.ok) saveFailure = result.reason;
  }

  const go = (path: string): void => {
    window.location.hash = path;
  };

  const findSessionStack = (
    stackId: string,
  ): { stackId: string; stackName: string; order: readonly string[] } | null => {
    const builtIn = getBuiltInStack(stackId);
    if (builtIn) {
      return {
        stackId: builtIn.id,
        stackName: builtIn.name,
        order: builtIn.order,
      };
    }
    const custom = state.customStacks.find((stack) => stack.id === stackId);
    if (custom) {
      return {
        stackId: custom.id,
        stackName: custom.name,
        order: custom.order,
      };
    }
    return null;
  };

  const beginSession = (stackId: string, direction: Direction): boolean => {
    const stack = findSessionStack(stackId);
    if (!stack) return false;

    let generated: GeneratedSession;
    try {
      generated = generateSession({ ...stack, direction });
    } catch {
      return false;
    }

    activeSession = new SessionRunner(generated);
    completedSession = null;
    go("#/train");
    return true;
  };

  const startSession = (): void => {
    const direction = state.settings.direction;
    if (beginSession(state.settings.selectedStackId, direction)) return;
    const firstStack = builtInStacks[0];
    if (firstStack) beginSession(firstStack.id, direction);
  };

  appRoot.classList.add("app");
  const main = el("main", "screen");
  main.id = "main";
  appRoot.replaceChildren(main, createFooter());

  let cleanup: (() => void) | null = null;

  const persistState = (next: AppState) => {
    state = next;
    const result = store.save(state);
    saveFailure = result.ok ? null : result.reason;
    return result;
  };

  const render = (moveFocus: boolean): void => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    let route = normalizeHash(parseRoute(window.location.hash));
    if (
      (route.name === "train" && !activeSession) ||
      (route.name === "summary" && !completedSession)
    ) {
      window.history.replaceState(null, "", "#/");
      route = { name: "menu" };
    }
    const definition = definitionFor(route);
    document.title = definition.title;

    main.replaceChildren();
    main.className = "screen";

    const context: AppContext = {
      get state() {
        return state;
      },
      storageNotice: store.getIssue()?.kind ?? saveFailure,
      updateState(next) {
        return persistState(next);
      },
      updateSettings(patch) {
        return persistState(withSettings(state, patch));
      },
      resetStorage() {
        const result = store.reset();
        if (result.ok) {
          state = createDefaultState();
          saveFailure = null;
        }
        return result;
      },
      refresh() {
        render(false);
      },
      startSession,
      trainAgain() {
        if (!completedSession) return;
        beginSession(
          completedSession.generated.stackId,
          completedSession.generated.direction,
        );
      },
      quitSession() {
        activeSession = null;
        completedSession = null;
        go("#/");
      },
      revealAnswer() {
        return activeSession?.reveal() ?? false;
      },
      gradeAnswer(correct): GradeOutcome | null {
        const runner = activeSession;
        if (!runner) return null;
        const item = runner.currentItem;
        if (!item || !runner.revealed) return null;

        const at = new Date();
        const graded = runner.grade(correct, at);
        if (!graded) return null;

        const stackId = runner.generated.stackId;
        const stats = applyAnswer(stackId, state.stats[stackId], {
          card: item.card,
          position: item.position,
          direction: item.direction,
          correct,
          at,
        });
        const save = persistState({
          ...state,
          stats: { ...state.stats, [stackId]: stats },
        });

        const complete = runner.isComplete;
        if (complete) {
          completedSession = {
            generated: runner.generated,
            progress: graded.progress,
          };
          activeSession = null;
          go("#/summary");
        }

        return {
          item,
          correct,
          complete,
          save,
          progress: graded.progress,
          persistedStreak: stats.currentStreak,
        };
      },
      getTrainingView() {
        const runner = activeSession;
        const item = runner?.currentItem;
        if (!runner || !item) return null;
        return {
          stackId: runner.generated.stackId,
          stackName: runner.generated.stackName,
          configuredDirection: runner.generated.direction,
          item,
          revealed: runner.revealed,
          answered: runner.progress.answered,
          total: runner.generated.items.length,
          persistedStreak:
            state.stats[runner.generated.stackId]?.currentStreak ?? 0,
          sessionBestRun: runner.progress.bestRun,
        };
      },
      getSummaryView() {
        if (!completedSession) return null;
        const { generated, progress } = completedSession;
        return {
          stackId: generated.stackId,
          stackName: generated.stackName,
          direction: generated.direction,
          answered: progress.answered,
          correct: progress.correct,
          missed: progress.missed,
          bestRun: progress.bestRun,
          misses: progress.misses,
        };
      },
    };

    const result = definition.screen(main, context);
    cleanup = typeof result === "function" ? result : null;

    if (moveFocus) {
      focusMainHeading(main);
      window.scrollTo(0, 0);
    }
  };

  window.addEventListener("hashchange", () => {
    render(true);
  });

  render(true);
}
