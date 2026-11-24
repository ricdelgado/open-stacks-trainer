import type { Rank, Suit } from "../domain/cards";
import type { Strings } from "./en";

export const ptBR = {
  appTitle: "Open Stacks Trainer",
  repositoryUrl: "https://github.com/ricdelgado/open-stacks-trainer",
  tagline:
    "Treine um baralho memorizado, uma passagem embaralhada por vez. Grátis, privado e feito para celular.",

  documentTitles: {
    menu: "Open Stacks Trainer",
    train: "Treino — Open Stacks Trainer",
    summary: "Sessão concluída — Open Stacks Trainer",
    stats: "Estatísticas — Open Stacks Trainer",
    myStacks: "Meus baralhos — Open Stacks Trainer",
    import: "Importar baralho — Open Stacks Trainer",
    newStack: "Novo baralho — Open Stacks Trainer",
    editStack: "Editar baralho — Open Stacks Trainer",
    viewStack: "Baralho — Open Stacks Trainer",
    settings: "Configurações — Open Stacks Trainer",
    settingsLanguage: "Idioma — Open Stacks Trainer",
  },

  menu: {
    startTraining: "Começar treino",
    settings: "Configurações",
    howToUse: "Como usar este app",
    stackLabel: "Baralho",
    stackCreator: (name: string, creator: string) => `${name} — ${creator}`,
    directionLabel: "Direção",
    modeLabel: "Modo",
    modeBasic: "Básico",
    modeCardPlus3: "Card +3",
    modeQuartets: "Quartetos",
    modeAcaan: "ACAAN",
    modeCyclic: "Baralhos cíclicos",
    later: "depois",
    stats: "Estatísticas",
    statsHint: "Sequências, precisão, dias de treino e erros recentes.",
    myStacks: "Meus baralhos",
    myStacksHint: "Baralhos incluídos e os seus.",
  },

  headings: {
    training: "Treino",
    summary: "Sessão concluída",
    stats: "Estatísticas",
    myStacks: "Meus baralhos",
    importStack: "Importar baralho",
    newStack: "Novo baralho",
    editStack: "Editar baralho",
    stackView: "Baralho",
    settings: "Configurações",
    settingsLanguage: "Idioma",
  },

  cards: {
    rankNames: {
      A: "ás",
      "2": "dois",
      "3": "três",
      "4": "quatro",
      "5": "cinco",
      "6": "seis",
      "7": "sete",
      "8": "oito",
      "9": "nove",
      "10": "dez",
      J: "valete",
      Q: "dama",
      K: "rei",
    } satisfies Record<Rank, string>,
    suitNames: {
      S: "espadas",
      H: "copas",
      C: "paus",
      D: "ouros",
    } satisfies Record<Suit, string>,
    accessibleName: (rank: string, suit: string) => `${rank} de ${suit}`,
  },

  actions: {
    answer: "Ver resposta",
    missed: "Errei",
    gotIt: "Acertei",
    trainAgain: "Treinar de novo",
    menu: "Menu",
  },

  directions: {
    "position-to-card": "Posição → carta",
    "card-to-position": "Carta → posição",
    mixed: "Misto",
  },

  training: {
    quit: "Sair",
    quitConfirm:
      "Sair desta sessão? As respostas já dadas foram salvas. O restante desta sessão será descartado.",
    progress: (answered: number, total: number) => `${answered}/${total}`,
    answeredProgress: (answered: number, total: number) =>
      `Respondidas ${answered} de ${total}`,
    answeredCount: (answered: number) => `Respondidas ${answered}`,
    answeredCountLabel: (answered: number) =>
      `Respondidas ${answered} cartas`,
    streak: (current: number) => `Sequência ${current}`,
    positionLabel: "Posição",
    cardLabel: "Carta",
    nextThreeLabel: "Próximas três cartas",
    positionAccessible: (position: number) => `Posição ${position}`,
    reinforcementBadge: "Reforço",
    accelerateBadge: "Aceleração",
    revealWithTime: (answer: string, seconds: number) =>
      `Resposta: ${answer}. Tempo: ${seconds} ${
        seconds === 1 ? "segundo" : "segundos"
      }.`,
    timerSeconds: (seconds: number) => `${seconds}s`,
  },

  summary: {
    stackDirection: (stack: string, direction: string) =>
      `${stack} · ${direction}`,
    correct: "Acertos",
    missed: "Erros",
    accuracy: "Precisão",
    sessionBest: "Melhor sequência da sessão",
    averageTime: "Tempo médio",
    seconds: (formatted: string) => `${formatted}s`,
    countOutOf: (count: number, total: number) => `${count} / ${total}`,
    missedCards: "Cartas erradas",
    noMisses: "Nenhum erro. Sessão limpa.",
    positionLine: (position: number) => `Posição ${position}`,
    percent: (value: number) => `${value}%`,
    emptyValue: "—",
  },

  statsPage: {
    lead:
      "Só aparecem aqui os baralhos que você treinou. Básico e Card +3 são registrados separadamente.",
    dataActions: "Backup e redefinição",
    stackSelectLabel: "Baralho",
    modeTabsLabel: "Modo",
    empty:
      "Ainda não há treino. Treine um baralho para ver suas estatísticas aqui.",
    currentStreak: "Sequência atual",
    bestStreak: "Melhor sequência",
    accuracy: "Precisão",
    totalAnswered: "Total de respostas",
    practiceDays: "Dias de treino",
    noPracticeDays: "Nenhum dia de treino ainda.",
    dayCounts: (answered: number, correct: number) =>
      `${answered} respondidas, ${correct} corretas`,
    recentMisses: "Erros recentes",
    noMisses: "Nenhum erro registrado.",
    missMeta: (position: number, at: string) => `Posição ${position} · ${at}`,
    deleteTrainingData: "Apagar dados de treino",
    deleteStackConfirm: (name: string) =>
      `Apagar os dados de treino de “${name}”? As sequências, dias de treino e erros recentes de todos os modos serão removidos. O baralho em si permanece.`,
    deleted: (name: string) =>
      `Dados de treino de “${name}” apagados.`,
    cardsTitle: "Cartas",
    cardsLead:
      "Todas as cartas na ordem do baralho, incluindo as que você ainda não respondeu.",
    sortLabel: "Ordenar",
    sortStackOrder: "Ordem do baralho",
    sortReinforcement: "Reforço",
    sortSlowest: "Mais lentas primeiro",
    sortMostMissed: "Mais erradas",
    sortLowestStreak: "Menor sequência",
    columnPosition: "Posição",
    columnCard: "Carta",
    columnStreak: "Sequência atual",
    columnReinforcement: "Reforço",
    columnTimesMissed: "Vezes erradas",
    columnAverageTime: "Tempo médio",
    shortPosition: "Posição",
    shortCard: "Carta",
    shortStreak: "Sequência",
    shortReinforcement: "Reforço",
    shortTimesMissed: "Erros",
    shortAverageTime: "Média",
    reinforcementProgress: (current: number, total: number) =>
      `${current}/${total}`,
    cardRowLabel: (position: number, card: string) =>
      `Posição ${position}, ${card}`,
  },

  settingsPage: {
    lead: "Escolha o idioma do app. Mais configurações virão depois.",
    trainingSettings: "Configurações de treino",
    language: "Idioma",
    languageHint: "Escolha o idioma da interface.",
    languageLead:
      "Escolha o idioma da interface. A mudança é aplicada na hora.",
    languageCurrent: (name: string) => `Idioma atual: ${name}`,
    languageOption: (name: string, current: boolean) =>
      current ? `${name} — atual` : name,
    reinforcement: "Reforço",
    reinforcementToggle: "Ativar reforço",
    reinforcementHint:
      "Cartas que você errar voltam com mais frequência até você acertar cinco vezes seguidas.",
    reinforcementSummary: (stack: string, mode: string) =>
      `Lista de reforço: ${stack} · ${mode}`,
    reinforcementCount: (count: number) =>
      count === 1
        ? "1 carta está aguardando reforço."
        : `${count} cartas estão aguardando reforço.`,
    reinforcementEmpty:
      "Nenhuma carta aguardando reforço. Uma carta errada entra na lista depois de ser avaliada.",
    accelerate: "Aceleração",
    accelerateToggle: "Ativar aceleração",
    accelerateHint:
      "Cartas que levam mais tempo que o seu limite voltam com mais frequência.",
    accelerateThreshold: "Limite de carta lenta",
    accelerateThresholdLabel: (tenths: number): string => {
      if (tenths === 5) return "0,5s";
      if (tenths === 20) return "2s";
      if (tenths === 30) return "3s";
      return "1s";
    },
    accelerateEmpty:
      "Nenhuma carta acima deste limite ainda. Respostas Acertei com tempo formam a média de cada carta.",
    accelerateCount: (count: number) =>
      count === 1
        ? "1 carta está acima deste limite."
        : `${count} cartas estão acima deste limite.`,
    endless: "Sem fim",
    endlessToggle: "Ativar sem fim",
    endlessHint:
      "Continue treinando em lotes de duas passagens embaralhadas até sair. Uma carta errada ou lenta ainda gera prompts extras.",
  },

  backup: {
    exportMyData: "Exportar meus dados",
    restoreFromFile: "Restaurar de arquivo",
    deleteAllData: "Apagar todos os dados",
    exported: "Arquivo de backup baixado.",
    restored: "Backup restaurado.",
    restoreConfirm:
      "Isto substitui todas as suas estatísticas e baralhos personalizados atuais. Exporte seus dados primeiro se não tiver certeza.",
    deleteAllConfirmOne:
      "Apagar todos os dados? Isto remove todas as estatísticas, baralhos personalizados e configurações. Não é possível desfazer.",
    deleteAllConfirmTwo:
      "Tem certeza? Não é possível desfazer. Exporte um backup primeiro se quiser manter seus dados.",
    deleteAllDone: "Todos os dados foram apagados.",
    errors: {
      notJson: "Esse arquivo não é um JSON válido. Nada foi alterado.",
      notBackup:
        "Esse arquivo não é um backup do Open Stacks Trainer. Nada foi alterado.",
      newerFormat:
        "Esse backup foi feito por uma versão mais nova do app. Nada foi alterado.",
      newerSchema:
        "Esse backup usa um formato de dados mais novo. Nada foi alterado.",
      invalid:
        "Esse backup está incompleto ou danificado. Nada foi alterado.",
      duplicateName: (name: string) =>
        `Esse backup tem um nome de baralho duplicado: “${name}”. Nada foi alterado.`,
      reservedName: (name: string) =>
        `Esse backup usa um nome de baralho reservado: “${name}”. Nada foi alterado.`,
    },
  },

  stackNameErrors: {
    empty: "Digite um nome para o baralho.",
    tooLong: "O nome do baralho pode ter até 60 caracteres.",
    reserved: "Esse nome é reservado para um baralho incluído.",
    duplicate: "Esse nome de baralho já está em uso.",
  },

  myStacksPage: {
    lead:
      "Os baralhos incluídos são somente leitura. Crie ou importe um baralho para treinar uma ordem pessoal.",
    builtIn: "Baralhos incluídos",
    custom: "Meus baralhos",
    emptyCustom: "Você ainda não criou baralhos personalizados.",
    view: "Ver",
    edit: "Editar",
    export: "Exportar",
    delete: "Apagar",
    create: "Criar baralho",
    import: "Importar baralho",
    creatorLine: (creator: string) => `Criador: ${creator}`,
    deleteConfirm: (name: string) =>
      `Apagar “${name}”? Isto também apaga as estatísticas de treino. Não é possível desfazer.`,
    deleted: (name: string) => `“${name}” apagado.`,
    exported: "Arquivo do baralho baixado.",
  },

  stackViewPage: {
    creatorLine: (creator: string) => `Criador: ${creator}`,
    readOnly: "Baralho incluído — somente leitura.",
    export: "Exportar",
    back: "Voltar para Meus baralhos",
    exported: "Arquivo do baralho baixado.",
  },

  importPage: {
    lead:
      "Cole 52 cartas em notação, um JSON de exportação de baralho ou um array JSON de 52 códigos de carta.",
    chooseFile: "Escolher arquivo",
    fileHint: "Escolha um arquivo JSON ou de texto, ou cole abaixo.",
    fileLoaded: "Arquivo carregado. Revise e depois escolha Importar baralho.",
    fileError: "Não foi possível ler esse arquivo. Nada foi salvo.",
    nameLabel: "Nome do baralho",
    namePlaceholder: "Meu baralho",
    inputLabel: "Cartas ou JSON do baralho",
    inputPlaceholder: "AS 2H 3C ...",
    inputHint:
      "Exemplos: AS 10♥ KD 7S, ou TS,9H,QC. Valores de A–K e naipes S/H/C/D ou ♠/♥/♣/♦. 10 e T são aceitos.",
    submit: "Importar baralho",
    imported: "Baralho importado.",
    errors: {
      empty: "Cole 52 cartas ou um JSON de baralho primeiro. Nada foi salvo.",
      malformedJson: "Esse JSON está malformado. Nada foi salvo.",
      backupJson:
        "Isso é um backup completo. Use Restaurar de arquivo na página Estatísticas.",
      notStackJson:
        "Esse JSON não é uma exportação de baralho nem uma lista de 52 cartas. Nada foi salvo.",
      card: (token: string) =>
        `Carta desconhecida: “${token}”. Nada foi salvo.`,
      count: (count: number) =>
        `Encontrei ${count} cartas. Um baralho precisa de exatamente 52. Nada foi salvo.`,
      duplicate: (card: string) =>
        `Carta duplicada: ${card}. Nada foi salvo.`,
    },
  },

  editor: {
    nameLabel: "Nome do baralho",
    namePlaceholder: "Meu baralho",
    cardPool: "Cartas",
    positions: "Posições",
    positionNote:
      "A posição 1 é o topo do baralho virado para baixo; a posição 52 é o fundo.",
    suitTab: (glyph: string, name: string, remaining: number) =>
      `${glyph} ${name} (${remaining} restantes)`,
    suitHeading: (glyph: string, name: string, remaining: number) =>
      `${glyph} ${name} — ${remaining} restantes`,
    selectPrompt: "Toque em uma carta para selecionar e depois toque em uma posição.",
    selected: (card: string) => `${card} selecionada — toque em uma posição`,
    clearSelection: "Limpar seleção",
    cardAvailable: (card: string) => `${card}, disponível`,
    cardPlaced: (card: string, position: number) =>
      `${card}, colocada na posição ${position}`,
    positionEmpty: (position: number) => `Posição ${position}, vazia`,
    positionFilled: (position: number, card: string) =>
      `Posição ${position}, ${card}`,
    assigned: (assigned: number) => `${assigned}/52 atribuídas`,
    incomplete: "Atribua todas as 52 posições antes de salvar.",
    saveHintName: "Digite um nome para o baralho para salvar.",
    saveHintCards: (remaining: number) =>
      remaining === 1
        ? "Falta 1 carta para salvar."
        : `Faltam ${remaining} cartas para salvar.`,
    saveHintReady: "Pronto para salvar.",
    save: "Salvar",
    cancel: "Cancelar",
    unsavedConfirm:
      "Descartar suas mudanças neste baralho? O trabalho não salvo será perdido.",
    saved: "Baralho salvo.",
    creatorLine: (creator: string) => `Criador: ${creator}`,
  },

  help: {
    title: "Como usar este app",
    close: "Fechar",
    sections: [
      {
        title: "1. Escolha um baralho, uma direção e um modo",
        body: "Escolha o baralho que quer treinar. Posição → carta pede a carta de uma posição. Carta → posição pede a posição de uma carta. Misto escolhe uma direção para cada prompt. Básico pede uma resposta. Card +3 pede as três cartas depois da carta da frente, voltando da posição 52 para a 1.",
      },
      {
        title: "2. Lembre e revele",
        body: "Leia o prompt e lembre a resposta antes de tocar em Ver resposta. Um cronômetro discreto conta enquanto você pensa e para quando a resposta é revelada.",
      },
      {
        title: "3. Avalie você mesmo",
        body: "Toque em Acertei ou Errei depois de revelar a resposta. Um Acertei registra o tempo de lembrança. Toda resposta avaliada é salva na hora.",
      },
      {
        title: "4. Receba prompts extras",
        body: "Abra Configurações de treino no menu, abaixo de Direção, e ative Reforço para trazer de volta cartas erradas até você acertar cinco vezes seguidas. Ative Aceleração para trazer de volta cartas com tempo médio acima do limite de carta lenta. O indicador ao lado do cronômetro mostra o tipo de prompt.",
      },
      {
        title: "5. Treine sem um fim fixo",
        body: "Ative Sem fim em Configurações de treino no menu. Cada lote tem duas passagens embaralhadas do baralho. A tela de treino mostra Respondidas N, e Sair abre um resumo das respostas dadas.",
      },
      {
        title: "6. Reveja seu progresso",
        body: "Uma sessão normal cobre todas as 52 posições uma vez. O resumo mostra o resultado, o tempo médio e as cartas erradas. Estatísticas guarda sequências, dias de treino, erros recentes e uma tabela por carta que você pode ordenar.",
      },
      {
        title: "7. Atalhos de teclado",
        body: "Espaço ou Enter revela a resposta. Depois de revelar, 1 ou N significa Errei, e 2 ou Y significa Acertei.",
      },
    ],
    positionNote:
      "A posição 1 é o topo do baralho virado para baixo; a posição 52 é o fundo.",
    dataNote:
      "Seus baralhos e seu progresso ficam neste navegador. Use Exportar meus dados na página Estatísticas para fazer um backup.",
  },

  footer: {
    aiDisclosure:
      "Feito com agentes de IA — Qwen4-Max High + DeepSeek V4.1 Flash 1017",
    staysLocal: "Seu progresso fica neste navegador.",
  },

  common: {
    backToMenu: "Voltar ao menu",
    backToMyStacks: "Voltar para Meus baralhos",
    backToSettings: "Voltar para Configurações",
  },

  storage: {
    corrupt:
      "Os dados salvos neste navegador estão danificados. Nada foi apagado. Redefina os dados salvos para começar de novo.",
    newer:
      "Este navegador tem dados salvos de uma versão mais nova. Eles foram deixados intactos.",
    unavailable:
      "Este navegador não está permitindo dados salvos. Você pode continuar usando o app, mas o progresso será perdido ao fechar a aba.",
    quota:
      "O armazenamento do navegador está cheio. Sua última mudança pode não ter sido salva. Exporte um backup se puder.",
    writeBlocked:
      "Os dados salvos estão protegidos e não foram alterados. Resolva o aviso acima primeiro.",
    resetSavedData: "Redefinir dados salvos",
    resetConfirm:
      "Redefinir dados salvos? Isto apaga permanentemente os dados danificados neste navegador. Não é possível desfazer.",
  },
} satisfies Strings;
