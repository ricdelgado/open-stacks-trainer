import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync("src/styles.css", "utf8");

describe("component shape language", () => {
  it("keeps only the switch thumb and mode selector circular", () => {
    const circular = styles.match(/border-radius:\s*50%/g) ?? [];
    expect(circular).toHaveLength(3);
    expect(styles).toMatch(
      /\.toggle-switch__track::after\s*\{[^}]*border-radius:\s*50%/s,
    );
    expect(styles).toMatch(
      /\.mode-option__mark\s*\{[^}]*border-radius:\s*50%/s,
    );
  });

  it("keeps the dot grid background", () => {
    expect(styles).toContain(
      "radial-gradient(var(--dot) 1.1px, transparent 1.1px)",
    );
  });
});
