import { builtInStacks, getBuiltInStack } from "./data/stacks";
import { applyAnswerToState, type SessionProgress } from "./domain/scoring";
import { generateSession, type GeneratedSession } from "./domain/session";
import { withSettings } from "./domain/settings";
import { withoutStackStats } from "./domain/stats-selection";
import type { AppState, Direction, Mode } from "./domain/types";
import { parseRoute, type Route } from "./router";
import { renderEditor } from "./screens/editor";
import { renderImport } from "./screens/import";
import { renderMenu } from "./screens/menu";
import { renderMyStacks } from "./screens/my-stacks";
import type {
  AppContext,
  FlashMessage,
  GradeOutcome,
  Screen,
} from "./screens/screen";
import { renderStackView } from "./screens/stack-view";
import { renderStats } from "./screens/stats";
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
      return { screen: renderStats, title: titleFor(route) };
    case "my-stacks":
      return { screen: renderMyStacks, title: titleFor(route) };
    case "import":
      return { screen: renderImport, title: titleFor(route) };
    case "stack-new":
      return { screen: renderEditor(null), title: titleFor(route) };
    case "stack-edit":
      return { screen: renderEditor(route.id), title: titleFor(route) };
    case "stack-view":
      return { screen: renderStackView(route.id), title: titleFor(route) };
    case "summary":
      return { screen: renderSummary, title: titleFor(route) };
  }
}

function selectedStackExists(state: AppState): boolean {
  return (
    builtInStacks.some((stack) => stack.id === state.settings.selectedStackId) ||
    state.customStacks.some(
      (stack) => stack.id === state.settings.selectedStackId,
    )
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
  let flash: FlashMessage | null = null;
  let activeSession: SessionRunner | null = null;
  let completedSession: {
    generated: GeneratedSession;
    progress: SessionProgress;
    averageTenths: number | null;
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

  const beginSession = (
    stackId: string,
    direction: Direction,
    mode: Mode,
  ): boolean => {
    const stack = findSessionStack(stackId);
    if (!stack) return false;

    let generated: GeneratedSession;
    try {
      generated = generateSession({ ...stack, direction, mode });
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
    const mode = state.settings.mode;
    if (beginSession(state.settings.selectedStackId, direction, mode)) return;
    const firstStack = builtInStacks[0];
    if (firstStack) beginSession(firstStack.id, direction, mode);
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
    const stackRouteId =
      route.name === "stack-view" || route.name === "stack-edit"
        ? route.id
        : null;
    const missingScreen =
      (route.name === "train" && !activeSession) ||
      (route.name === "summary" && !completedSession) ||
      (route.name === "stack-view" &&
        stackRouteId !== null &&
        !getBuiltInStack(stackRouteId) &&
        !state.customStacks.some((stack) => stack.id === stackRouteId)) ||
      (route.name === "stack-edit" &&
        stackRouteId !== null &&
        !state.customStacks.some((stack) => stack.id === stackRouteId));

    if (missingScreen) {
      window.history.replaceState(null, "", "#/");
      route = { name: "menu" };
    }
    const definition = definitionFor(route);
    document.title = definition.title;

    main.replaceChildren();
    main.className = "screen";

    const flashForRender = flash;
    flash = null;

    const context: AppContext = {
      get state() {
        return state;
      },
      storageNotice: store.getIssue()?.kind ?? saveFailure,
      flash: flashForRender,
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
      restoreState(next) {
        const normalized = normalizeSelection(next);
        state = normalized.state;
        activeSession = null;
        completedSession = null;
        const result = store.save(state);
        saveFailure = result.ok ? null : result.reason;
        return result;
      },
      deleteStackStats(stackId) {
        return persistState({
          ...state,
          stats: withoutStackStats(state.stats, stackId),
        });
      },
      upsertCustomStack(stack) {
        const exists = state.customStacks.some((item) => item.id === stack.id);
        const customStacks = exists
          ? state.customStacks.map((item) =>
              item.id === stack.id ? stack : item,
            )
          : [...state.customStacks, stack];
        return persistState({ ...state, customStacks });
      },
      deleteCustomStack(stackId) {
        const customStacks = state.customStacks.filter(
          (stack) => stack.id !== stackId,
        );
        const stats = withoutStackStats(state.stats, stackId);
        const selectedStackId =
          state.settings.selectedStackId === stackId
            ? DEFAULT_STACK_ID
            : state.settings.selectedStackId;
        return persistState({
          ...state,
          customStacks,
          stats,
          settings: { ...state.settings, selectedStackId },
        });
      },
      deleteAllData() {
        const result = store.reset();
        if (!result.ok) return result;
        state = createDefaultState();
        saveFailure = null;
        activeSession = null;
        completedSession = null;
        go("#/");
        return result;
      },
      setFlash(message) {
        flash = message;
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
          completedSession.generated.mode,
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
      gradeAnswer(correct, elapsedTenths): GradeOutcome | null {
        const runner = activeSession;
        if (!runner) return null;
        const item = runner.currentItem;
        if (!item || !runner.revealed) return null;

        const at = new Date();
        const timedTenths = correct ? elapsedTenths : undefined;
        const graded = runner.grade(correct, at, timedTenths);
        if (!graded) return null;

        const stackId = runner.generated.stackId;
        const mode = runner.generated.mode;
        const nextState = applyAnswerToState(state, stackId, mode, {
          card: item.card,
          position: item.position,
          direction: item.direction,
          correct,
          at,
          elapsedTenths: timedTenths,
        });
        const persistedStreak =
          nextState.stats[stackId]?.[mode]?.currentStreak ?? 0;
        const save = persistState(nextState);

        const complete = runner.isComplete;
        if (complete) {
          completedSession = {
            generated: runner.generated,
            progress: graded.progress,
            averageTenths: runner.sessionAverageTenths,
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
          persistedStreak,
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
          mode: runner.generated.mode,
          item,
          revealed: runner.revealed,
          answered: runner.progress.answered,
          total: runner.generated.items.length,
          persistedStreak:
            state.stats[runner.generated.stackId]?.[runner.generated.mode]
              ?.currentStreak ?? 0,
          sessionBestRun: runner.progress.bestRun,
        };
      },
      getSummaryView() {
        if (!completedSession) return null;
        const { generated, progress, averageTenths } = completedSession;
        return {
          stackId: generated.stackId,
          stackName: generated.stackName,
          direction: generated.direction,
          answered: progress.answered,
          correct: progress.correct,
          missed: progress.missed,
          bestRun: progress.bestRun,
          misses: progress.misses,
          averageTenths,
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
