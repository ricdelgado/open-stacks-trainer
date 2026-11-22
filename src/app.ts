import { builtInStacks, getBuiltInStack } from "./data/stacks";
import { withSettings } from "./domain/settings";
import type { AppState } from "./domain/types";
import { parseRoute, type Route } from "./router";
import { renderMenu } from "./screens/menu";
import { placeholderScreen } from "./screens/placeholder";
import type { AppContext, Screen } from "./screens/screen";
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
      return strings.documentTitles.menu;
  }
}

function definitionFor(route: Route): ScreenDefinition {
  switch (route.name) {
    case "menu":
      return { screen: renderMenu, title: titleFor(route) };
    case "train":
      return {
        screen: placeholderScreen(
          strings.headings.training,
          strings.placeholders.train,
        ),
        title: titleFor(route),
      };
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
      return {
        screen: placeholderScreen(strings.headings.training, strings.placeholders.train),
        title: titleFor(route),
      };
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

  if (route.name === "summary") {
    window.history.replaceState(null, "", "#/");
    return { name: "menu" };
  }

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

  if (loaded.ok && normalized.changed) {
    const result = store.save(state);
    if (!result.ok) saveFailure = result.reason;
  }

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

    const route = normalizeHash(parseRoute(window.location.hash));
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
