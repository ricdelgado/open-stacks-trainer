import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import stacksJson from "../data/stacks.json";
import checksumsJson from "../data/checksums.json";

interface Stack {
  id: string;
  name: string;
  creator: string;
  order: string[];
}

interface StacksFile {
  formatVersion: number;
  notation: {
    ranks: string[];
    suits: string[];
    position: string;
  };
  stacks: Stack[];
}

interface ChecksumsFile {
  formatVersion: number;
  algorithm: "sha256";
  input: string;
  stacks: Record<string, string>;
}

const data = stacksJson as StacksFile;
const checksums = checksumsJson as ChecksumsFile;

const EXPECTED = {
  mnemonica: { name: "Mnemonica", creator: "Juan Tamariz" },
  aronson: { name: "Aronson", creator: "Simon Aronson" },
  memorandum: { name: "Memorandum", creator: "Woody Aragón" },
} as const;

const LANDMARKS: Record<string, Record<number, string>> = {
  mnemonica: {
    1: "4C",
    7: "AS",
    13: "QC",
    26: "KD",
    27: "2C",
    39: "AD",
    50: "6C",
    52: "9D",
  },
  aronson: {
    1: "JS",
    13: "2D",
    26: "QH",
    27: "5D",
    39: "6H",
    50: "QC",
    52: "9D",
  },
  memorandum: {
    1: "JS",
    13: "10D",
    26: "KH",
    27: "9C",
    39: "KC",
    50: "QC",
    51: "QD",
    52: "9S",
  },
};

const fullDeck = new Set(
  data.notation.ranks.flatMap((rank) =>
    data.notation.suits.map((suit) => `${rank}${suit}`),
  ),
);

function checksum(order: string[]): string {
  return createHash("sha256").update(order.join(" ")).digest("hex");
}

describe("built-in stack data", () => {
  it("uses format version 1", () => {
    expect(data.formatVersion).toBe(1);
    expect(checksums.formatVersion).toBe(1);
    expect(checksums.algorithm).toBe("sha256");
    expect(checksums.input).toBe("order.join(' ')");
  });

  it("states the position convention", () => {
    expect(data.notation.position).toContain("1 = top");
    expect(data.notation.position).toContain("52 = bottom");
  });

  it("contains exactly the three expected stacks", () => {
    expect(data.stacks.map((stack) => stack.id).sort()).toEqual(
      Object.keys(EXPECTED).sort(),
    );
  });

  it("describes a full 52-card deck", () => {
    expect(fullDeck.size).toBe(52);
  });

  for (const stack of data.stacks) {
    describe(stack.id, () => {
      it("has the fixed name and creator", () => {
        expect(stack.name).toBe(EXPECTED[stack.id as keyof typeof EXPECTED].name);
        expect(stack.creator).toBe(
          EXPECTED[stack.id as keyof typeof EXPECTED].creator,
        );
      });

      it("has 52 unique valid cards", () => {
        expect(stack.order).toHaveLength(52);
        expect(new Set(stack.order).size).toBe(52);
        expect(stack.order.every((card) => fullDeck.has(card))).toBe(true);
      });

      it("covers the whole deck", () => {
        expect(new Set(stack.order)).toEqual(fullDeck);
      });

      it("matches the recorded checksum", () => {
        expect(checksum(stack.order)).toBe(checksums.stacks[stack.id]);
      });

      it("matches every landmark position", () => {
        for (const [position, card] of Object.entries(
          LANDMARKS[stack.id] ?? {},
        )) {
          expect(stack.order[Number(position) - 1]).toBe(card);
        }
      });
    });
  }
});
