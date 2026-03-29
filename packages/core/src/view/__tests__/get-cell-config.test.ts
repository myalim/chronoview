import { describe, expect, it } from "vitest";
import { getCellConfig } from "../get-cell-config.js";

describe("getCellConfig", () => {
  // ─── Day view ───

  it("day default (60min) → 24 cells × 120px = 2880", () => {
    const config = getCellConfig("day");
    expect(config.intervalMinutes).toBe(60);
    expect(config.cellWidthPx).toBe(120);
  });

  it("day 30min → 48 cells × 60px = 2880", () => {
    const config = getCellConfig("day", { day: 30 });
    expect(config.intervalMinutes).toBe(30);
    expect(config.cellWidthPx).toBe(60);
  });

  it("day 15min → 96 cells × 30px = 2880", () => {
    const config = getCellConfig("day", { day: 15 });
    expect(config.intervalMinutes).toBe(15);
    expect(config.cellWidthPx).toBe(30);
  });

  it("day totalMainSize is constant across all cellDurations", () => {
    const durations = [15, 30, 60] as const;
    for (const d of durations) {
      const config = getCellConfig("day", { day: d });
      const cells = (24 * 60) / d;
      expect(cells * config.cellWidthPx).toBe(2880);
    }
  });

  // ─── Week view ───

  it("week default (6h) → 28 cells × 60px = 1680", () => {
    const config = getCellConfig("week", { week: 6 });
    expect(config.intervalMinutes).toBe(360);
    expect(config.cellWidthPx).toBe(60);
  });

  it("week 3h → 56 cells × 30px = 1680", () => {
    const config = getCellConfig("week", { week: 3 });
    expect(config.intervalMinutes).toBe(180);
    expect(config.cellWidthPx).toBe(30);
  });

  it("week 4h → 42 cells × 40px = 1680", () => {
    const config = getCellConfig("week", { week: 4 });
    expect(config.intervalMinutes).toBe(240);
    expect(config.cellWidthPx).toBe(40);
  });

  it("week 12h → 14 cells × 120px = 1680", () => {
    const config = getCellConfig("week", { week: 12 });
    expect(config.intervalMinutes).toBe(720);
    expect(config.cellWidthPx).toBe(120);
  });

  it("week totalMainSize is constant across all cellDurations", () => {
    const durations = [3, 4, 6, 8, 12] as const;
    for (const d of durations) {
      const config = getCellConfig("week", { week: d });
      const cells = 168 / d;
      expect(cells * config.cellWidthPx).toBe(1680);
    }
  });

  // ─── Month view ───

  it("month → fixed 40px, intervalMinutes 0", () => {
    const config = getCellConfig("month");
    expect(config.cellWidthPx).toBe(40);
    expect(config.intervalMinutes).toBe(0);
  });

  // ─── Defaults ───

  it("week without cellDuration uses default 6h", () => {
    const config = getCellConfig("week");
    expect(config.intervalMinutes).toBe(360);
    expect(config.cellWidthPx).toBe(60);
  });

  it("ignores irrelevant view key in config", () => {
    // day view ignores week config
    const config = getCellConfig("day", { week: 3 });
    expect(config.intervalMinutes).toBe(60); // day default
  });
});
