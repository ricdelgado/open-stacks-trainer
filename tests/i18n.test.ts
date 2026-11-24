import { afterEach, describe, expect, it, vi } from "vitest";
import { en } from "../src/i18n/en";
import { ptBR } from "../src/i18n/pt-BR";
import {
  availableLanguages,
  getLocale,
  setLanguage,
  strings,
} from "../src/strings";

function shape(value: unknown): unknown {
  if (typeof value === "function") return "function";
  if (Array.isArray(value)) return value.map(shape);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, shape(item)]),
    );
  }
  return typeof value;
}

afterEach(() => {
  setLanguage("en");
  vi.unstubAllGlobals();
});

describe("locale dictionaries", () => {
  it("keeps the Brazilian Portuguese shape equal to English", () => {
    expect(shape(ptBR)).toEqual(shape(en));
  });

  it("keeps every English leaf and function represented", () => {
    const walk = (value: unknown, path: string): string[] => {
      if (typeof value === "function") return [`${path}:function`];
      if (Array.isArray(value)) {
        return value.flatMap((item, index) => walk(item, `${path}[${index}]`));
      }
      if (value !== null && typeof value === "object") {
        return Object.entries(value).flatMap(([key, item]) =>
          walk(item, path ? `${path}.${key}` : key),
        );
      }
      return [`${path}:${typeof value}`];
    };
    expect(walk(ptBR, "")).toEqual(walk(en, ""));
  });
});

describe("language switching", () => {
  it("applies a language immediately through the live strings binding", () => {
    expect(strings.headings.training).toBe("Training");
    setLanguage("pt-BR");
    expect(getLocale()).toBe("pt-BR");
    expect(strings.headings.training).toBe("Treino");
    expect(strings.actions.gotIt).toBe("Acertei");
  });

  it("falls back to English for an unknown language", () => {
    setLanguage("xx");
    expect(getLocale()).toBe("en");
    expect(strings.headings.training).toBe("Training");
  });

  it("lists only complete dictionaries with native names", () => {
    expect(availableLanguages()).toEqual([
      { code: "en", name: "English" },
      { code: "pt-BR", name: "Português (Brasil)" },
    ]);
  });

  it("updates the document language", () => {
    const documentElement = { lang: "en" };
    vi.stubGlobal("document", { documentElement });
    setLanguage("pt-BR");
    expect(documentElement.lang).toBe("pt-BR");
  });

  it("uses the selected locale for decimal formatting", () => {
    setLanguage("pt-BR");
    expect((1.5).toLocaleString(getLocale())).toBe("1,5");
    setLanguage("en");
    expect((1.5).toLocaleString(getLocale())).toBe("1.5");
  });
});
