import type { Rank, Suit } from "../domain/cards";

export const en = {
  appTitle: "Open Stacks Trainer",
  repositoryUrl: "https://github.com/ricdelgado/open-stacks-trainer",
  tagline:
    "Train a memorized card stack, one shuffled pass at a time. Free, private, and phone-friendly.",

  documentTitles: {
    menu: "Open Stacks Trainer",
    train: "Training — Open Stacks Trainer",
    summary: "Session complete — Open Stacks Trainer",
    stats: "Stats — Open Stacks Trainer",
    myStacks: "My Stacks — Open Stacks Trainer",
    import: "Import stack — Open Stacks Trainer",
    newStack: "New stack — Open Stacks Trainer",
    editStack: "Edit stack — Open Stacks Trainer",
    viewStack: "Stack — Open Stacks Trainer",
    settings: "Settings — Open Stacks Trainer",
    settingsLanguage: "Language — Open Stacks Trainer",
  },

  menu: {
    startTraining: "Start training",
    settings: "Settings",
    howToUse: "How to use this app",
    stackLabel: "Stack",
    stackCreator: (name: string, creator: string) => `${name} — ${creator}`,
    directionLabel: "Direction",
    modeLabel: "Mode",
    modeBasic: "Basic",
    modeCardPlus3: "Next 3 cards",
    modeQuartets: "Quartets",
    modeAcaan: "ACAAN",
    modeCyclic: "Cyclic stacks",
    later: "later",
    stats: "Stats",
    statsHint: "Streaks, accuracy, practice days, and recent misses.",
    myStacks: "My Stacks",
    myStacksHint: "Built-in stacks and your own stacks.",
  },

  headings: {
    training: "Training",
    summary: "Session complete",
    stats: "Stats",
    myStacks: "My Stacks",
    importStack: "Import stack",
    newStack: "New stack",
    editStack: "Edit stack",
    stackView: "Stack",
    settings: "Settings",
    settingsLanguage: "Language",
  },

  cards: {
    rankNames: {
      A: "ace",
      "2": "two",
      "3": "three",
      "4": "four",
      "5": "five",
      "6": "six",
      "7": "seven",
      "8": "eight",
      "9": "nine",
      "10": "ten",
      J: "jack",
      Q: "queen",
      K: "king",
    } satisfies Record<Rank, string>,
    suitNames: {
      S: "spades",
      H: "hearts",
      C: "clubs",
      D: "diamonds",
    } satisfies Record<Suit, string>,
    accessibleName: (rank: string, suit: string) => `${rank} of ${suit}`,
  },

  actions: {
    answer: "Answer",
    missed: "Missed",
    gotIt: "Got it",
    trainAgain: "Train again",
    menu: "Menu",
  },

  directions: {
    "position-to-card": "Position → card",
    "card-to-position": "Card → position",
    mixed: "Mixed",
  },

  training: {
    quit: "Quit",
    quitConfirm:
      "Quit this session? Answers you already gave are saved. The rest of this session will be discarded.",
    progress: (answered: number, total: number) => `${answered}/${total}`,
    answeredProgress: (answered: number, total: number) =>
      `Answered ${answered} of ${total}`,
    answeredCount: (answered: number) => `Answered ${answered}`,
    answeredCountLabel: (answered: number) => `Answered ${answered} cards`,
    streak: (current: number) => `Streak ${current}`,
    positionLabel: "Position",
    cardLabel: "Card",
    nextThreeLabel: "Next three cards",
    positionAccessible: (position: number) => `Position ${position}`,
    reinforcementBadge: "Reinforcement",
    accelerateBadge: "Accelerate",
    revealWithTime: (answer: string, seconds: number) =>
      `Answer: ${answer}. Time ${seconds} ${seconds === 1 ? "second" : "seconds"}.`,
    timerSeconds: (seconds: number) => `${seconds}s`,
  },

  summary: {
    stackDirection: (stack: string, direction: string) =>
      `${stack} · ${direction}`,
    correct: "Correct",
    missed: "Missed",
    accuracy: "Accuracy",
    sessionBest: "Session-best streak",
    averageTime: "Average time",
    seconds: (formatted: string) => `${formatted}s`,
    countOutOf: (count: number, total: number) => `${count} / ${total}`,
    missedCards: "Missed cards",
    noMisses: "No misses. Clean session.",
    positionLine: (position: number) => `Position ${position}`,
    percent: (value: number) => `${value}%`,
    emptyValue: "—",
  },

  statsPage: {
    lead:
      "Only the stacks you have trained appear here. Basic and Next 3 cards are tracked separately.",
    dataActions: "Backup and reset",
    stackSelectLabel: "Stack",
    modeTabsLabel: "Mode",
    empty: "No practice yet. Train a stack to see your stats here.",
    currentStreak: "Current streak",
    bestStreak: "Best streak",
    accuracy: "Accuracy",
    totalAnswered: "Total answered",
    practiceDays: "Practice days",
    noPracticeDays: "No practice days yet.",
    dayCounts: (answered: number, correct: number) =>
      `${answered} answered, ${correct} correct`,
    recentMisses: "Recent misses",
    noMisses: "No misses recorded.",
    missMeta: (position: number, at: string) => `Position ${position} · ${at}`,
    deleteTrainingData: "Delete training data",
    deleteStackConfirm: (name: string) =>
      `Delete training data for "${name}"? All modes' streaks, practice days, and recent misses will be removed. The stack itself stays.`,
    deleted: (name: string) => `Training data for "${name}" deleted.`,
    cardsTitle: "Cards",
    cardsLead: "Every card in stack order, including cards you have not answered yet.",
    sortLabel: "Sort",
    sortStackOrder: "Stack order",
    sortReinforcement: "Reinforcement",
    sortSlowest: "Slowest average first",
    sortMostMissed: "Most missed",
    sortLowestStreak: "Lowest streak",
    columnPosition: "Position",
    columnCard: "Card",
    columnStreak: "Current streak",
    columnReinforcement: "Reinforcement",
    columnTimesMissed: "Times missed",
    columnAverageTime: "Average time",
    shortPosition: "Position",
    shortCard: "Card",
    shortStreak: "Streak",
    shortReinforcement: "Reinf.",
    shortTimesMissed: "Missed",
    shortAverageTime: "Avg",
    reinforcementProgress: (current: number, total: number) =>
      `${current}/${total}`,
    cardRowLabel: (position: number, card: string) =>
      `Position ${position}, ${card}`,
  },

  settingsPage: {
    lead: "Choose the app language. More app settings are coming later.",
    trainingSettings: "Training settings",
    language: "Language",
    languageHint: "Choose the language for the interface.",
    languageLead: "Choose the language for the interface. The change applies immediately.",
    languageCurrent: (name: string) => `Current language: ${name}`,
    languageOption: (name: string, current: boolean) =>
      current ? `${name} — current` : name,
    reinforcement: "Reinforcement",
    reinforcementHint:
      "Cards you miss come back more often until you answer them correctly five times in a row.",
    accelerate: "Accelerate",
    accelerateHint:
      "Cards that take longer than your threshold come back more often.",
    accelerateThreshold: "Slow card threshold",
    accelerateThresholdLabel: (tenths: number): string => {
      if (tenths === 5) return "0.5s";
      if (tenths === 20) return "2s";
      if (tenths === 30) return "3s";
      return "1s";
    },
    accelerateEmpty:
      "No cards are above this threshold yet. Timed Got it answers build each card’s average.",
    accelerateCount: (count: number) =>
      count === 1
        ? "1 card is above this threshold."
        : `${count} cards are above this threshold.`,
    endless: "Endless",
  },

  backup: {
    exportMyData: "Export my data",
    restoreFromFile: "Restore from file",
    deleteAllData: "Delete all data",
    exported: "Backup file downloaded.",
    restored: "Backup restored.",
    restoreConfirm:
      "This replaces all your current stats and custom stacks. Export your current data first if you are unsure.",
    deleteAllConfirmOne:
      "Delete all data? This removes all stats, custom stacks, and settings. This cannot be undone.",
    deleteAllConfirmTwo:
      "Are you sure? This cannot be undone. Export a backup first if you want to keep your data.",
    deleteAllDone: "All data deleted.",
    errors: {
      notJson: "That file is not valid JSON. Nothing was changed.",
      notBackup:
        "That file is not an Open Stacks Trainer backup. Nothing was changed.",
      newerFormat:
        "That backup was made by a newer version of the app. Nothing was changed.",
      newerSchema:
        "That backup uses a newer data format. Nothing was changed.",
      invalid: "That backup is incomplete or damaged. Nothing was changed.",
      duplicateName: (name: string) =>
        `That backup has a duplicate stack name: "${name}". Nothing was changed.`,
      reservedName: (name: string) =>
        `That backup uses a reserved stack name: "${name}". Nothing was changed.`,
    },
  },

  stackNameErrors: {
    empty: "Enter a stack name.",
    tooLong: "Stack names can be up to 60 characters.",
    reserved: "That name is reserved for a built-in stack.",
    duplicate: "That stack name is already used.",
  },

  myStacksPage: {
    lead: "Built-in stacks are read-only. Create or import your own stack to train a personal order.",
    builtIn: "Built-in stacks",
    custom: "My stacks",
    emptyCustom: "You have not created any custom stacks yet.",
    view: "View",
    edit: "Edit",
    export: "Export",
    delete: "Delete",
    create: "Create stack",
    import: "Import stack",
    creatorLine: (creator: string) => `Creator: ${creator}`,
    deleteConfirm: (name: string) =>
      `Delete "${name}"? This also deletes its training stats. This cannot be undone.`,
    deleted: (name: string) => `"${name}" deleted.`,
    exported: "Stack file downloaded.",
  },

  stackViewPage: {
    creatorLine: (creator: string) => `Creator: ${creator}`,
    readOnly: "Built-in stack — read only.",
    export: "Export",
    back: "Back to My Stacks",
    exported: "Stack file downloaded.",
  },

  importPage: {
    lead: "Paste 52 cards in notation, a stack export JSON, or a JSON array of 52 card codes.",
    chooseFile: "Choose file",
    fileHint: "Choose a JSON or text file, or paste it below.",
    fileLoaded: "File loaded. Review it, then choose Import stack.",
    fileError: "That file could not be read. Nothing was saved.",
    nameLabel: "Stack name",
    namePlaceholder: "My Stack",
    inputLabel: "Cards or stack JSON",
    inputPlaceholder: "AS 2H 3C ...",
    inputHint:
      "Examples: AS 10♥ KD 7S, or TS,9H,QC. Ranks A–K and suits S/H/C/D or ♠/♥/♣/♦. 10 and T are both accepted.",
    submit: "Import stack",
    imported: "Stack imported.",
    errors: {
      empty: "Paste 52 cards or a stack JSON first. Nothing was saved.",
      malformedJson:
        "That JSON is malformed. Nothing was saved.",
      backupJson:
        "That is a full backup. Use Restore from file on the Stats page instead.",
      notStackJson:
        "That JSON is not a stack export or a list of 52 cards. Nothing was saved.",
      card: (token: string) =>
        `Unknown card: "${token}". Nothing was saved.`,
      count: (count: number) =>
        `Found ${count} cards. A stack needs exactly 52. Nothing was saved.`,
      duplicate: (card: string) =>
        `Duplicate card: ${card}. Nothing was saved.`,
    },
  },

  editor: {
    nameLabel: "Stack name",
    namePlaceholder: "My Stack",
    cardPool: "Cards",
    positions: "Positions",
    positionNote:
      "Position 1 is the top of the face-down deck; position 52 is the bottom.",
    suitTab: (glyph: string, name: string, remaining: number) =>
      `${glyph} ${name} (${remaining} left)`,
    suitHeading: (glyph: string, name: string, remaining: number) =>
      `${glyph} ${name} — ${remaining} left`,
    selectPrompt: "Tap a card to select it, then tap a position.",
    selected: (card: string) => `${card} selected — tap a position`,
    clearSelection: "Clear selection",
    cardAvailable: (card: string) => `${card}, available`,
    cardPlaced: (card: string, position: number) =>
      `${card}, placed at position ${position}`,
    positionEmpty: (position: number) => `Position ${position}, empty`,
    positionFilled: (position: number, card: string) =>
      `Position ${position}, ${card}`,
    assigned: (assigned: number) => `${assigned}/52 assigned`,
    incomplete: "Assign all 52 positions before saving.",
    saveHintName: "Enter a stack name to save.",
    saveHintCards: (remaining: number) =>
      `Assign ${remaining} more ${remaining === 1 ? "card" : "cards"} to save.`,
    saveHintReady: "Ready to save.",
    save: "Save",
    cancel: "Cancel",
    unsavedConfirm:
      "Discard your changes to this stack? Unsaved work will be lost.",
    saved: "Stack saved.",
    creatorLine: (creator: string) => `Creator: ${creator}`,
  },

  help: {
    title: "How to use this app",
    close: "Close",
    sections: [
      {
        title: "1. Choose a stack, direction, and mode",
        body: "Pick the stack you want to train. Position → card asks for the card at a position. Card → position asks for the position of a card. Mixed chooses a direction for each prompt. Basic asks one answer. Next 3 cards asks for the three cards after the front card, wrapping from position 52 back to 1.",
      },
      {
        title: "2. Recall, then reveal",
        body: "Read the prompt and recall the answer before you tap Answer. A quiet timer runs while you think and stops when the answer is revealed.",
      },
      {
        title: "3. Grade yourself",
        body: "Tap Got it or Missed after the answer is revealed. A Got it answer records the recall time. Every graded answer is saved immediately.",
      },
      {
        title: "4. Get extra prompts",
        body: "Open Training settings on the menu, below Direction, and turn on Reinforcement to bring missed cards back until you get them right five times in a row. Turn on Accelerate to bring back cards whose average time is above the slow-card threshold. The indicator beside the timer shows which kind of prompt you are answering.",
      },
      {
        title: "5. Train without a fixed end",
        body: "Turn on Endless in Training settings on the menu. Each batch has two shuffled passes of the stack. The training screen shows Answered N, and Quit opens a summary of the answers you gave.",
      },
      {
        title: "6. Review your progress",
        body: "A normal session covers all 52 positions once. The summary shows the result, average time, and the cards you missed. Stats keeps streaks, practice days, recent misses, and a per-card table you can sort.",
      },
      {
        title: "7. Keyboard shortcuts",
        body: "Space or Enter reveals the answer. After reveal, 1 or N means Missed, and 2 or Y means Got it.",
      },
    ],
    positionNote:
      "Position 1 is the top of the face-down deck; position 52 is the bottom.",
    dataNote:
      "Your stacks and progress stay in this browser. Use Export my data on the Stats page for a backup.",
  },

  footer: {
    aiDisclosure:
      "Built with AI agents — Qwen4-Max High + DeepSeek V4.1 Flash 1017",
    staysLocal: "Your progress stays in this browser.",
  },

  common: {
    backToMenu: "Back to menu",
    backToMyStacks: "Back to My Stacks",
    backToSettings: "Back to Settings",
  },

  storage: {
    corrupt:
      "Saved data in this browser is damaged. Nothing was erased. Reset saved data to start fresh.",
    newer:
      "This browser has saved data from a newer version. It was left unchanged.",
    unavailable:
      "This browser is not allowing saved data. You can keep using the app, but progress will be lost when you close the tab.",
    quota:
      "Browser storage is full. Your latest change may not be saved. Export a backup if you can.",
    writeBlocked:
      "Saved data is protected and was not changed. Resolve the warning above first.",
    resetSavedData: "Reset saved data",
    resetConfirm:
      "Reset saved data? This permanently deletes the damaged data in this browser. This cannot be undone.",
  },
};

export type Strings = typeof en;
