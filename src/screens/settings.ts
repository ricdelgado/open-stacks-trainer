import { availableLanguages, languageName, strings } from "../strings";
import { button, el, link, showStatus } from "../ui/elements";
import { storageMessage } from "../ui/storage-messages";
import type { Screen } from "./screen";

export const renderSettings: Screen = (root) => {
  root.className = "screen screen--settings";

  const title = el("h1", "screen-title", strings.headings.settings);
  const lead = el("p", "screen-lead", strings.settingsPage.lead);
  const back = link(
    "#/",
    strings.common.backToMenu,
    "button button--secondary settings-back",
  );

  const nav = el("nav", "menu-nav");
  const language = link("#/settings/language", "", "nav-card");
  language.append(
    el("span", "nav-card__title", strings.settingsPage.language),
    el("span", "nav-card__hint", strings.settingsPage.languageHint),
  );
  nav.append(language);

  root.append(title, lead, back, nav);
};

export const renderSettingsLanguage: Screen = (root, context) => {
  root.className = "screen screen--settings";

  const title = el("h1", "screen-title", strings.headings.settingsLanguage);
  const lead = el("p", "screen-lead", strings.settingsPage.languageLead);
  const back = link(
    "#/settings",
    strings.common.backToSettings,
    "button button--secondary settings-back",
  );

  const status = el("div", "form-status");
  status.setAttribute("aria-live", "polite");

  const list = el("div", "mode-list language-list");
  for (const language of availableLanguages()) {
    const current = context.state.settings.language === language.code;
    const choice = button(
      strings.settingsPage.languageOption(language.name, current),
      current
        ? "button button--primary language-option"
        : "button button--secondary language-option",
    );
    choice.setAttribute("aria-pressed", current ? "true" : "false");
    if (current) {
      choice.setAttribute("aria-current", "true");
    }
    choice.addEventListener("click", () => {
      status.replaceChildren();
      const result = context.updateSettings({ language: language.code });
      if (!result.ok) {
        showStatus(status, storageMessage(result.reason));
        return;
      }
      context.refresh();
    });
    list.append(choice);
  }

  root.append(
    title,
    lead,
    back,
    el(
      "p",
      "field__label",
      strings.settingsPage.languageCurrent(
        languageName(context.state.settings.language),
      ),
    ),
    list,
    status,
  );
};
