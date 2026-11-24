import { en, type Strings } from "./en";
import { ptBR } from "./pt-BR";

export type { Strings } from "./en";

export interface LanguageOption {
  code: string;
  name: string;
}

const dictionaries: Record<string, Strings> = {
  en,
  "pt-BR": ptBR,
};

const languageNames: Record<string, string> = {
  en: "English",
  "pt-BR": "Português (Brasil)",
  es: "Español",
  it: "Italiano",
  ja: "日本語",
};

const languageOrder = ["en", "pt-BR", "es", "it", "ja"];

let currentLanguage = "en";

export let strings: Strings = en;

export function setLanguage(language: string): void {
  const next = dictionaries[language] ? language : "en";
  currentLanguage = next;
  strings = dictionaries[next] ?? en;
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }
}

export function getLocale(): string {
  return currentLanguage;
}

export function languageName(code: string): string {
  return languageNames[code] ?? code;
}

export function availableLanguages(): LanguageOption[] {
  return languageOrder
    .filter((code) => dictionaries[code] !== undefined)
    .map((code) => ({ code, name: languageName(code) }));
}
