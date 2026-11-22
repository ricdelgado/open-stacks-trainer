#!/usr/bin/env node
/**
 * Verifies the built-in stack data against the committed checksums,
 * the full 52-card deck, and known landmark positions.
 *
 * Run: node scripts/verify-stacks.mjs
 * Exit code 0 = all good; 1 = a check failed.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const LANDMARKS = {
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

const EXPECTED = {
  mnemonica: { name: "Mnemonica", creator: "Juan Tamariz" },
  aronson: { name: "Aronson", creator: "Simon Aronson" },
  memorandum: { name: "Memorandum", creator: "Woody Aragón" },
};

const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  try {
    return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
  } catch (error) {
    fail(`Could not read ${relativePath}: ${error.message}`);
    return null;
  }
}

function checksum(order) {
  return createHash("sha256").update(order.join(" ")).digest("hex");
}

const data = readJson("data/stacks.json");
const checksums = readJson("data/checksums.json");

if (data && checksums) {
  if (data.formatVersion !== 1) {
    fail(`data/stacks.json formatVersion must be 1, got ${data.formatVersion}`);
  }
  if (checksums.formatVersion !== 1) {
    fail(
      `data/checksums.json formatVersion must be 1, got ${checksums.formatVersion}`,
    );
  }
  if (checksums.algorithm !== "sha256") {
    fail(`Checksum algorithm must be sha256, got ${checksums.algorithm}`);
  }
  if (checksums.input !== "order.join(' ')") {
    fail(`Checksum input must be order.join(' '), got ${checksums.input}`);
  }

  const notation = data.notation ?? {};
  const ranks = Array.isArray(notation.ranks) ? notation.ranks : [];
  const suits = Array.isArray(notation.suits) ? notation.suits : [];
  const fullDeck = new Set(ranks.flatMap((rank) => suits.map((suit) => rank + suit)));

  if (fullDeck.size !== 52) {
    fail(`Notation must describe a full deck; got ${fullDeck.size} cards`);
  }
  if (
    typeof notation.position !== "string" ||
    !notation.position.includes("1 = top") ||
    !notation.position.includes("52 = bottom")
  ) {
    fail(
      "Notation must state the position convention: 1 = top of the face-down deck, 52 = bottom",
    );
  }

  const expectedIds = ["mnemonica", "aronson", "memorandum"];
  const stacks = Array.isArray(data.stacks) ? data.stacks : [];
  const actualIds = stacks.map((stack) => stack.id);

  if (stacks.length !== expectedIds.length) {
    fail(
      `Expected ${expectedIds.length} built-in stacks, got ${stacks.length}`,
    );
  }
  for (const id of expectedIds) {
    if (!actualIds.includes(id)) fail(`Missing built-in stack: ${id}`);
  }
  if (checksums.stacks === null || typeof checksums.stacks !== "object") {
    fail("data/checksums.json must contain a stacks object");
  }

  const seenOrders = new Map();

  for (const stack of stacks) {
    const label =
      typeof stack.id === "string" && stack.id ? stack.id : "(no id)";
    const name =
      typeof stack.name === "string" ? stack.name : "(invalid name)";
    const creator =
      typeof stack.creator === "string" ? stack.creator : "(invalid creator)";

    if (typeof stack.name !== "string" || stack.name.trim() === "") {
      fail(`${label}: name must be a non-empty string`);
    } else if (EXPECTED[label] && stack.name !== EXPECTED[label].name) {
      fail(`${label}: name must be "${EXPECTED[label].name}", got "${stack.name}"`);
    }
    if (typeof stack.creator !== "string" || stack.creator.trim() === "") {
      fail(`${label}: creator must be a non-empty string`);
    } else if (EXPECTED[label] && stack.creator !== EXPECTED[label].creator) {
      fail(
        `${label}: creator must be "${EXPECTED[label].creator}", got "${stack.creator}"`,
      );
    }
    if (!Array.isArray(stack.order)) {
      fail(`${label}: order must be an array`);
      continue;
    }
    if (stack.order.length !== 52) {
      fail(`${label}: order must have 52 cards, got ${stack.order.length}`);
      continue;
    }

    const unique = new Set(stack.order);
    if (unique.size !== 52) {
      const duplicates = stack.order.filter(
        (card, index) => stack.order.indexOf(card) !== index,
      );
      fail(`${label}: duplicate cards: ${[...new Set(duplicates)].join(", ")}`);
    }

    const unknown = stack.order.filter((card) => !fullDeck.has(card));
    if (unknown.length > 0) {
      fail(`${label}: unknown cards: ${unknown.join(", ")}`);
    }

    const missing = [...fullDeck].filter((card) => !unique.has(card));
    if (missing.length > 0) {
      fail(`${label}: missing cards: ${missing.join(", ")}`);
    }

    const expectedHash = checksums.stacks?.[label];
    const actualHash = checksum(stack.order);
    if (!expectedHash) {
      fail(`${label}: no checksum recorded in data/checksums.json`);
    } else if (expectedHash !== actualHash) {
      fail(
        `${label}: checksum mismatch\n  expected ${expectedHash}\n  actual   ${actualHash}`,
      );
    }

    if (seenOrders.has(actualHash)) {
      fail(`${label}: order is identical to ${seenOrders.get(actualHash)}`);
    } else {
      seenOrders.set(actualHash, label);
    }

    for (const [positionText, card] of Object.entries(LANDMARKS[label] ?? {})) {
      const position = Number(positionText);
      const actual = stack.order[position - 1];
      if (actual !== card) {
        fail(
          `${label}: landmark position ${position} must be ${card}, got ${actual}`,
        );
      }
    }

    notes.push(
      `${label.padEnd(11)} ${name.padEnd(11)} by ${creator.padEnd(15)} ` +
        `#1=${stack.order[0]} #26=${stack.order[25]} #52=${stack.order[51]} ` +
        `${actualHash.slice(0, 12)}…`,
    );
  }
}

if (failures.length > 0) {
  console.error("Stack data verification FAILED:\n");
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error(
    "\nDo not edit the data or checksums to silence this. A failing check means the data changed.",
  );
  process.exit(1);
}

console.log("Stack data verification passed.\n");
for (const note of notes) console.log(`  ${note}`);
console.log(`\nAll ${notes.length} built-in stacks are complete, unique, and checksum-clean.`);
