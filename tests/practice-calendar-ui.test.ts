import { afterEach, describe, expect, it } from "vitest";
import { setLanguage } from "../src/strings";
import { formatCalendarRange } from "../src/ui/practice-calendar";

afterEach(() => {
  setLanguage("en");
});

describe("practice calendar range label", () => {
  it("shows two months within one year", () => {
    expect(
      formatCalendarRange({
        startDate: "2026-06-01",
        endDate: "2026-11-29",
      }),
    ).toBe("Jun – Nov 2026");
  });

  it("shows a single month when start and end share it", () => {
    expect(
      formatCalendarRange({
        startDate: "2026-11-02",
        endDate: "2026-11-29",
      }),
    ).toBe("Nov 2026");
  });

  it("shows both years when they differ", () => {
    expect(
      formatCalendarRange({
        startDate: "2025-12-29",
        endDate: "2026-01-04",
      }),
    ).toBe("Dec 2025 – Jan 2026");
  });

  it("localizes the month names", () => {
    setLanguage("pt-BR");
    const label = formatCalendarRange({
      startDate: "2026-06-01",
      endDate: "2026-11-29",
    });

    expect(label).toContain("jun.");
    expect(label).toContain("nov.");
    expect(label).toContain("2026");
  });
});
