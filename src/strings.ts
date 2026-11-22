import type { Rank, Suit } from "./domain/cards";

export const strings = {
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
  },

  menu: {
    startTraining: "Start training",
    howToUse: "How to use this app",
    stackLabel: "Stack",
    stackCreator: (name: string, creator: string) => `${name} — ${creator}`,
    directionLabel: "Direction",
    modeLabel: "Mode",
    modeBasic: "Basic",
    modeQuartets: "Quartets",
    modeAcaan: "ACAAN",
    modeEndless: "Endless",
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
    streak: (current: number) => `Streak ${current}`,
    positionLabel: "Position",
    cardLabel: "Card",
    positionAccessible: (position: number) => `Position ${position}`,
    revealAnnouncement: (answer: string) => `Answer: ${answer}`,
  },

  summary: {
    stackDirection: (stack: string, direction: string) =>
      `${stack} · ${direction}`,
    correct: "Correct",
    missed: "Missed",
    accuracy: "Accuracy",
    sessionBest: "Session-best streak",
    countOutOf: (count: number, total: number) => `${count} / ${total}`,
    missedCards: "Missed cards",
    noMisses: "No misses. Clean session.",
    positionLine: (position: number) => `Position ${position}`,
    percent: (value: number) => `${value}%`,
    emptyValue: "—",
  },

  statsPage: {
    lead: "Only the stacks you have trained appear here, most recent first.",
    dataActions: "Backup and reset",
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
      `Delete training data for "${name}"? Its streaks, practice days, and recent misses will be removed. The stack itself stays.`,
    deleted: (name: string) => `Training data for "${name}" deleted.`,
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

  help: {
    title: "How to use this app",
    close: "Close",
    sections: [
      {
        title: "1. Choose a stack and direction",
        body: "Pick the stack you want to train. Position → card asks for the card at a position. Card → position asks for the position of a card. Mixed chooses a direction for each prompt.",
      },
      {
        title: "2. Recall, then reveal",
        body: "Read the prompt and recall the answer before you tap Answer.",
      },
      {
        title: "3. Grade yourself",
        body: "Tap Got it or Missed after the answer is revealed. Every graded answer is saved immediately.",
      },
      {
        title: "4. Review your progress",
        body: "A session covers all 52 positions once. The summary shows the result and the cards you missed. Stats keeps streaks, practice days, and recent misses.",
      },
      {
        title: "5. Keyboard shortcuts",
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
  },

  placeholders: {
    stats: "No practice yet. Train a stack to see your stats here.",
    myStacks: "Stack management is not available in this preview yet.",
    import: "Stack import is not available in this preview yet.",
    newStack: "The stack editor is not available in this preview yet.",
    editStack: "The stack editor is not available in this preview yet.",
    viewStack: "The stack view is not available in this preview yet.",
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
} as const;

export type Strings = typeof strings;
