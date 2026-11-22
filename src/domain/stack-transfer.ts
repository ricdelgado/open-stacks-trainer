import { BACKUP_FORMAT } from "./backup";
import { isCardCode } from "./cards";
import { isRecord } from "./app-state";
import { validateStackOrder } from "./stack-validation";

export const STACK_EXPORT_FORMAT = "open-stacks-trainer-stack";
export const STACK_EXPORT_FORMAT_VERSION = 1;

export interface StackExportFile {
  format: typeof STACK_EXPORT_FORMAT;
  formatVersion: number;
  name: string;
  creator: string;
  order: string[];
}

export interface StackExportInput {
  name: string;
  creator: string;
  order: readonly string[];
}

export function createStackExport(input: StackExportInput): StackExportFile {
  return {
    format: STACK_EXPORT_FORMAT,
    formatVersion: STACK_EXPORT_FORMAT_VERSION,
    name: input.name,
    creator: input.creator,
    order: [...input.order],
  };
}

export function slugifyStackName(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base.length > 0 ? base : "stack";
}

export function stackExportFileName(name: string): string {
  return `${slugifyStackName(name)}-stack.json`;
}

export type ImportError =
  | { code: "empty" }
  | { code: "malformed-json" }
  | { code: "backup-json" }
  | { code: "not-stack-json" }
  | { code: "card"; token: string }
  | { code: "order-count"; count: number }
  | { code: "duplicate"; card: string };

export interface ImportSuccess {
  name: string | null;
  creator: string;
  order: string[];
}

export type ImportParseResult =
  | ({ ok: true } & ImportSuccess)
  | { ok: false; error: ImportError };

const SUIT_SYMBOLS: Record<string, string> = {
  "♠": "S",
  "♥": "H",
  "♣": "C",
  "♦": "D",
};

function normalizeCardToken(token: string): string | null {
  const value = token.trim();
  if (value.length < 2) return null;

  const suitChar = value.slice(-1);
  const suit = SUIT_SYMBOLS[suitChar] ?? suitChar.toUpperCase();
  let rank = value.slice(0, -1).toUpperCase();
  if (rank === "T") rank = "10";

  const code = `${rank}${suit}`;
  return isCardCode(code) ? code : null;
}

function fromTokens(
  tokens: readonly unknown[],
  name: string | null,
  creator: string,
): ImportParseResult {
  const order: string[] = [];
  for (const token of tokens) {
    const code =
      typeof token === "string" ? normalizeCardToken(token) : null;
    if (!code) {
      return {
        ok: false,
        error: { code: "card", token: String(token) },
      };
    }
    order.push(code);
  }

  const checked = validateStackOrder(order);
  if (!checked.ok) {
    switch (checked.error.code) {
      case "order-count":
        return {
          ok: false,
          error: { code: "order-count", count: checked.error.count },
        };
      case "order-duplicate":
        return {
          ok: false,
          error: { code: "duplicate", card: checked.error.card },
        };
      case "order-card":
        return {
          ok: false,
          error: { code: "card", token: checked.error.card },
        };
    }
  }

  return { ok: true, name, creator, order: checked.order };
}

function cleanOptional(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function parseImportText(input: string): ImportParseResult {
  const text = input.trim();
  if (text.length === 0) return { ok: false, error: { code: "empty" } };

  const first = text[0];
  if (first === "{" || first === "[") {
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      return { ok: false, error: { code: "malformed-json" } };
    }

    if (Array.isArray(value)) {
      return fromTokens(value, null, "Custom");
    }

    if (!isRecord(value)) {
      return { ok: false, error: { code: "not-stack-json" } };
    }

    if (value.format === BACKUP_FORMAT) {
      return { ok: false, error: { code: "backup-json" } };
    }

    if (Array.isArray(value.order)) {
      const name = cleanOptional(value.name);
      const creator = cleanOptional(value.creator) ?? "Custom";
      return fromTokens(value.order, name, creator);
    }

    return { ok: false, error: { code: "not-stack-json" } };
  }

  const tokens = text.split(/[\s,;]+/u).filter((token) => token.length > 0);
  return fromTokens(tokens, null, "Custom");
}
