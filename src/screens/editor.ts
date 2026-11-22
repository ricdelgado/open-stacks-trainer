import { builtInStacks } from "../data/stacks";
import {
  RANKS,
  SUITS,
  cardFaceText,
  isRedCard,
  suitGlyph,
  type Suit,
} from "../domain/cards";
import {
  createCustomStack,
  updateCustomStack,
} from "../domain/custom-stacks";
import {
  validateStackName,
  type StackNameError,
} from "../domain/stack-validation";
import type { CustomStack } from "../domain/types";
import { strings } from "../strings";
import { cardAccessibleLabel } from "../ui/card-labels";
import { confirmAction } from "../ui/confirm";
import { button, el, showStatus } from "../ui/elements";
import { renderStorageNotice } from "../ui/storage-notice";
import { storageMessage } from "../ui/storage-messages";
import type { Screen } from "./screen";

interface EditorModel {
  id: string | null;
  name: string;
  creator: string;
  grid: (string | null)[];
  selected: string | null;
  activeSuit: Suit;
  dirty: boolean;
}

function nameErrorMessage(error: StackNameError): string {
  switch (error) {
    case "empty":
      return strings.stackNameErrors.empty;
    case "too-long":
      return strings.stackNameErrors.tooLong;
    case "reserved":
      return strings.stackNameErrors.reserved;
    case "duplicate":
      return strings.stackNameErrors.duplicate;
  }
}

function suitName(suit: Suit): string {
  return strings.cards.suitNames[suit];
}

function remainingForSuit(model: EditorModel, suit: Suit): number {
  return model.grid.reduce(
    (count, card) =>
      count + (card !== null && card.endsWith(suit) ? 1 : 0),
    0,
  );
}

export function renderEditor(stackId: string | null): Screen {
  return (root, context) => {
    let existing: CustomStack | null = null;
    if (stackId) {
      existing =
        context.state.customStacks.find((stack) => stack.id === stackId) ??
        null;
      if (!existing) return;
    }

    const model: EditorModel = {
      id: existing?.id ?? null,
      name: existing?.name ?? "",
      creator: existing?.creator ?? "Custom",
      grid: existing ? [...existing.order] : Array<string | null>(52).fill(null),
      selected: null,
      activeSuit: "S",
      dirty: false,
    };

    root.className = "screen screen--editor";

    const heading = el(
      "h1",
      "screen-title",
      stackId ? strings.headings.editStack : strings.headings.newStack,
    );
    root.append(heading);
    renderStorageNotice(root, context);

    const form = el("form", "editor-form");
    form.noValidate = true;

    const nameField = el("div", "field");
    const nameLabel = el("label", "field__label", strings.editor.nameLabel);
    nameLabel.htmlFor = "editor-name";
    const nameInput = el("input", "text-input");
    nameInput.id = "editor-name";
    nameInput.type = "text";
    nameInput.maxLength = 60;
    nameInput.placeholder = strings.editor.namePlaceholder;
    nameInput.autocomplete = "off";
    nameInput.value = model.name;
    const creatorNote = el(
      "p",
      "field__hint",
      strings.editor.creatorLine(model.creator),
    );
    const nameHint = el("p", "field__hint field__hint--error");
    nameHint.setAttribute("aria-live", "polite");
    nameField.append(nameLabel, nameInput, creatorNote, nameHint);

    const bar = el("div", "editor-bar");
    const barText = el("p", "editor-bar__text");
    barText.setAttribute("aria-live", "polite");
    const clearSelection = button(
      strings.editor.clearSelection,
      "button button--secondary button--small",
    );
    clearSelection.type = "button";
    bar.append(barText, clearSelection);

    const tabs = el("div", "suit-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", strings.editor.cardPool);

    const pool = el("div", "suit-pool");
    pool.setAttribute("aria-label", strings.editor.cardPool);

    const poolHeading = el("h2", "summary-subtitle", strings.editor.cardPool);
    const progress = el("p", "editor-progress");
    progress.setAttribute("aria-live", "polite");
    const saveHint = el("p", "editor-save-hint");
    saveHint.setAttribute("aria-live", "polite");
    const gridHeading = el("h2", "summary-subtitle", strings.editor.positions);
    const grid = el("div", "editor-grid");
    const note = el("p", "field__hint", strings.editor.positionNote);

    const actions = el("div", "editor-actions");
    const save = el(
      "button",
      "button button--primary button--wide",
      strings.editor.save,
    );
    save.type = "submit";
    const cancel = button(
      strings.editor.cancel,
      "button button--secondary button--wide",
    );
    cancel.type = "button";
    actions.append(save, cancel);

    const status = el("div", "form-status");
    status.setAttribute("aria-live", "polite");

    form.append(
      nameField,
      bar,
      tabs,
      poolHeading,
      pool,
      progress,
      gridHeading,
      grid,
      note,
      saveHint,
      actions,
      status,
    );
    root.append(form);

    const validateName = () =>
      validateStackName(model.name, {
        reservedNames: builtInStacks.map((stack) => stack.name),
        takenNames: context.state.customStacks
          .filter((stack) => stack.id !== model.id)
          .map((stack) => stack.name),
      });

    const assignedCount = (): number =>
      model.grid.reduce(
        (count, card) => count + (card === null ? 0 : 1),
        0,
      );

    const positionOfCard = (card: string): number =>
      model.grid.indexOf(card) + 1;

    const focusElement = (selector: string): void => {
      root
        .querySelector<HTMLButtonElement>(selector)
        ?.focus({ preventScroll: true });
    };

    const renderBar = (): void => {
      if (model.selected) {
        barText.textContent = strings.editor.selected(
          cardFaceText(model.selected),
        );
        clearSelection.disabled = false;
      } else {
        barText.textContent = strings.editor.selectPrompt;
        clearSelection.disabled = true;
      }
    };

    const renderTabs = (): void => {
      tabs.replaceChildren();
      for (const suit of SUITS) {
        const glyph = suitGlyph(suit);
        const remaining = remainingForSuit(model, suit);
        const tab = el("button", "suit-tab");
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", String(model.activeSuit === suit));
        tab.setAttribute(
          "aria-label",
          strings.editor.suitTab(glyph, suitName(suit), remaining),
        );
        const glyphText = el("span", "suit-tab__glyph", glyph);
        if (suit === "H" || suit === "D") {
          glyphText.classList.add("suit-tab__glyph--red");
        }
        const count = el("span", "suit-tab__count", String(remaining));
        tab.append(glyphText, count);
        tab.dataset.suit = suit;
        tab.addEventListener("click", () => {
          model.activeSuit = suit;
          renderTabs();
          renderPool();
          focusElement(`.suit-tab[data-suit="${suit}"]`);
        });
        tabs.append(tab);
      }
    };

    const selectCard = (code: string): void => {
      if (positionOfCard(code) > 0) return;
      model.selected = model.selected === code ? null : code;
      model.activeSuit = code.slice(-1) as Suit;
      renderBar();
      renderTabs();
      renderPool();
      focusElement(`.card-chip[data-card="${code}"]`);
    };

    const clearSelected = (): void => {
      model.selected = null;
      renderBar();
      renderTabs();
      renderPool();
    };

    const handlePosition = (position: number): void => {
      const index = position - 1;
      const current = model.grid[index] ?? null;

      if (!model.selected && current === null) return;

      if (!model.selected && current !== null) {
        model.grid[index] = null;
      } else if (model.selected) {
        model.grid[index] = model.selected;
        model.selected = null;
      }

      model.dirty = true;
      renderBar();
      renderTabs();
      renderPool();
      renderGrid();
      updateState();
      focusElement(`.position-cell[data-position="${position}"]`);
    };

    const renderPool = (): void => {
      pool.replaceChildren();
      for (const suit of SUITS) {
        const glyph = suitGlyph(suit);
        const remaining = remainingForSuit(model, suit);
        const row = el(
          "section",
          `suit-row${
            model.activeSuit === suit ? " suit-row--active" : ""
          }`,
        );
        row.dataset.suitRow = suit;
        row.append(
          el(
            "h3",
            "suit-row__head",
            strings.editor.suitHeading(glyph, suitName(suit), remaining),
          ),
        );

        const cards = el("div", "card-pool");
        for (const rank of RANKS) {
          const code = `${rank}${suit}`;
          const position = positionOfCard(code);
          const selected = model.selected === code;
          const chip = el("button", "card-chip");
          chip.type = "button";
          chip.dataset.card = code;
          chip.disabled = position > 0;
          chip.setAttribute("aria-pressed", String(selected));
          chip.setAttribute(
            "aria-label",
            position > 0
              ? strings.editor.cardPlaced(
                  cardAccessibleLabel(code),
                  position,
                )
              : strings.editor.cardAvailable(cardAccessibleLabel(code)),
          );

          const face = el("span", "card-chip__face", cardFaceText(code));
          if (isRedCard(code)) face.classList.add("card-chip__face--red");
          chip.append(face);

          if (position > 0) {
            chip.classList.add("card-chip--used");
            chip.append(
              el("span", "card-chip__position", String(position)),
            );
          }
          if (selected) chip.classList.add("card-chip--selected");

          chip.addEventListener("click", () => {
            selectCard(code);
          });
          cards.append(chip);
        }
        row.append(cards);
        pool.append(row);
      }
    };

    const renderGrid = (): void => {
      grid.replaceChildren();
      model.grid.forEach((card, index) => {
        const position = index + 1;
        const cell = el("button", "position-cell");
        cell.type = "button";
        cell.dataset.position = String(position);
        cell.append(
          el("span", "position-cell__number", String(position)),
        );

        if (card) {
          cell.classList.add("position-cell--filled");
          const label = el(
            "span",
            "position-cell__card",
            cardFaceText(card),
          );
          if (isRedCard(card)) {
            label.classList.add("position-cell__card--red");
          }
          cell.append(label);
          cell.setAttribute(
            "aria-label",
            strings.editor.positionFilled(
              position,
              cardAccessibleLabel(card),
            ),
          );
        } else {
          cell.setAttribute(
            "aria-label",
            strings.editor.positionEmpty(position),
          );
        }

        cell.addEventListener("click", () => {
          handlePosition(position);
        });
        grid.append(cell);
      });
    };

    const updateState = (): void => {
      const assigned = assignedCount();
      progress.textContent = strings.editor.assigned(assigned);

      const checked = validateName();
      const trimmed = model.name.trim();
      if (trimmed.length > 0 && !checked.ok) {
        nameHint.textContent = nameErrorMessage(checked.error);
      } else {
        nameHint.textContent = "";
      }

      if (!checked.ok) {
        saveHint.textContent =
          checked.error === "empty"
            ? strings.editor.saveHintName
            : nameErrorMessage(checked.error);
      } else if (assigned !== 52) {
        saveHint.textContent = strings.editor.saveHintCards(52 - assigned);
      } else {
        saveHint.textContent = strings.editor.saveHintReady;
      }

      save.disabled = assigned !== 52 || !checked.ok;
    };

    nameInput.addEventListener("input", () => {
      model.name = nameInput.value;
      if (nameInput.value.length > 0) model.dirty = true;
      updateState();
    });

    clearSelection.addEventListener("click", () => {
      clearSelected();
    });

    cancel.addEventListener("click", () => {
      if (model.dirty && !confirmAction(strings.editor.unsavedConfirm)) return;
      model.dirty = false;
      window.location.hash = "#/my-stacks";
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.replaceChildren();

      const checked = validateName();
      if (!checked.ok) {
        showStatus(status, nameErrorMessage(checked.error));
        return;
      }
      if (assignedCount() !== 52) {
        showStatus(status, strings.editor.incomplete);
        return;
      }

      const order = model.grid.filter(
        (card): card is string => typeof card === "string",
      );
      const now = new Date();
      let stack: CustomStack;

      if (model.id) {
        const current = context.state.customStacks.find(
          (item) => item.id === model.id,
        );
        if (!current) return;
        stack = updateCustomStack(
          current,
          { name: checked.name, order },
          now,
        );
      } else {
        stack = createCustomStack(
          { name: checked.name, creator: model.creator, order },
          now,
        );
      }

      const result = context.upsertCustomStack(stack);
      if (!result.ok) {
        showStatus(status, storageMessage(result.reason));
        return;
      }

      model.dirty = false;
      context.setFlash({
        tone: "success",
        message: strings.editor.saved,
      });
      window.location.hash = "#/my-stacks";
    });

    const onBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (!model.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    renderBar();
    renderTabs();
    renderPool();
    renderGrid();
    updateState();

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  };
}
