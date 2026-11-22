import { describe, expect, it } from "vitest";
import { FULL_DECK } from "../src/domain/cards";
import {
  createStackExport,
  parseImportText,
  slugifyStackName,
  stackExportFileName,
} from "../src/domain/stack-transfer";

const SUIT_GLYPHS: Record<string, string> = {
  S: "♠",
  H: "♥",
  C: "♣",
  D: "♦",
};

function toGlyphs(codes: readonly string[]): string[] {
  return codes.map((code) => {
    const suit = code.slice(-1);
    return `${code.slice(0, -1)}${SUIT_GLYPHS[suit]}`;
  });
}

describe("stack import parser", () => {
  it("accepts letter notation in any case", () => {
    const input = FULL_DECK.map((card) => card.toLowerCase()).join(" ");
    expect(parseImportText(input)).toEqual({
      ok: true,
      name: null,
      creator: "Custom",
      order: [...FULL_DECK],
    });
  });

  it("accepts suit glyphs", () => {
    const input = toGlyphs(FULL_DECK).join(" ");
    expect(parseImportText(input)).toMatchObject({
      ok: true,
      order: [...FULL_DECK],
    });
  });

  it("normalizes T to 10", () => {
    const input = FULL_DECK.map((card) =>
      card.startsWith("10") ? `T${card.slice(-1)}` : card,
    ).join(" ");
    expect(parseImportText(input)).toMatchObject({
      ok: true,
      order: [...FULL_DECK],
    });
  });

  it("accepts mixed separators", () => {
    const input = FULL_DECK.map((card, index) => {
      const separator = index % 3 === 0 ? "," : index % 3 === 1 ? ";" : "\n";
      return `${card}${separator}`;
    }).join(" ");
    expect(parseImportText(input)).toMatchObject({
      ok: true,
      order: [...FULL_DECK],
    });
  });

  it("accepts a stack export JSON and keeps its name and creator", () => {
    const json = JSON.stringify(
      createStackExport({
        name: "My Stack",
        creator: "Custom",
        order: FULL_DECK,
      }),
    );
    expect(parseImportText(json)).toEqual({
      ok: true,
      name: "My Stack",
      creator: "Custom",
      order: [...FULL_DECK],
    });
  });

  it("accepts a raw JSON array of cards", () => {
    expect(parseImportText(JSON.stringify(FULL_DECK))).toEqual({
      ok: true,
      name: null,
      creator: "Custom",
      order: [...FULL_DECK],
    });
  });

  it("rejects the wrong count", () => {
    expect(parseImportText(FULL_DECK.slice(0, 51).join(" "))).toEqual({
      ok: false,
      error: { code: "order-count", count: 51 },
    });
  });

  it("rejects an unknown card and names it", () => {
    const tokens = [...FULL_DECK.slice(0, 51), "XX"];
    expect(parseImportText(tokens.join(" "))).toEqual({
      ok: false,
      error: { code: "card", token: "XX" },
    });
  });

  it("rejects a duplicate and names it", () => {
    const tokens = [...FULL_DECK];
    tokens[1] = tokens[0] as string;
    expect(parseImportText(tokens.join(" "))).toEqual({
      ok: false,
      error: { code: "duplicate", card: tokens[0] },
    });
  });

  it("rejects malformed JSON instead of treating it as text", () => {
    expect(parseImportText("{not json")).toEqual({
      ok: false,
      error: { code: "malformed-json" },
    });
  });

  it("rejects a full backup with the restore hint", () => {
    expect(
      parseImportText(
        JSON.stringify({ format: "open-stacks-trainer-backup" }),
      ),
    ).toEqual({
      ok: false,
      error: { code: "backup-json" },
    });
  });

  it("rejects JSON that is neither a stack nor an array", () => {
    expect(parseImportText(JSON.stringify({ hello: "world" }))).toEqual({
      ok: false,
      error: { code: "not-stack-json" },
    });
  });

  it("rejects empty input", () => {
    expect(parseImportText("   ")).toEqual({
      ok: false,
      error: { code: "empty" },
    });
  });
});

describe("stack export file name", () => {
  it("creates a versioned stack export", () => {
    expect(
      createStackExport({
        name: "My Stack",
        creator: "Custom",
        order: FULL_DECK,
      }),
    ).toEqual({
      format: "open-stacks-trainer-stack",
      formatVersion: 1,
      name: "My Stack",
      creator: "Custom",
      order: [...FULL_DECK],
    });
  });

  it("derives a slug from the stack name", () => {
    expect(slugifyStackName("My Stack!")).toBe("my-stack");
    expect(slugifyStackName("  Memorándum Personal  ")).toBe(
      "memorandum-personal",
    );
    expect(slugifyStackName("!!!")).toBe("stack");
  });

  it("adds the -stack.json suffix", () => {
    expect(stackExportFileName("My Stack")).toBe("my-stack-stack.json");
  });
});
