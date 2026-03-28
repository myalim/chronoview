import { describe, expect, it } from "vitest";
import { calculateMonthGrid } from "../calculate-month-grid.js";

describe("calculateMonthGrid", () => {
  it("returns 2D array of dates (weeks × 7 days)", () => {
    const date = new Date(2026, 2, 15); // March 2026
    const grid = calculateMonthGrid(date, 0);

    // Each week has 7 days
    for (const week of grid) {
      expect(week).toHaveLength(7);
    }

    // 4 to 6 weeks depending on the month
    expect(grid.length).toBeGreaterThanOrEqual(4);
    expect(grid.length).toBeLessThanOrEqual(6);
  });

  it("weekStartsOn=0: first day of each week is Sunday", () => {
    const date = new Date(2026, 2, 15);
    const grid = calculateMonthGrid(date, 0);

    for (const week of grid) {
      expect(week[0].getDay()).toBe(0); // Sunday
    }
  });

  it("weekStartsOn=1: first day of each week is Monday", () => {
    const date = new Date(2026, 2, 15);
    const grid = calculateMonthGrid(date, 1);

    for (const week of grid) {
      expect(week[0].getDay()).toBe(1); // Monday
    }
  });

  it("dates are consecutive day-by-day", () => {
    const date = new Date(2026, 2, 15);
    const grid = calculateMonthGrid(date, 0);
    const allDates = grid.flat();

    for (let i = 1; i < allDates.length; i++) {
      const diff = allDates[i].getTime() - allDates[i - 1].getTime();
      // Exactly 1 day apart (in milliseconds)
      expect(diff).toBe(24 * 60 * 60 * 1000);
    }
  });

  it("covers the entire target month", () => {
    const date = new Date(2026, 2, 15); // March 2026
    const grid = calculateMonthGrid(date, 0);
    const allDates = grid.flat();

    // Includes March 1
    expect(allDates.some((d) => d.getMonth() === 2 && d.getDate() === 1)).toBe(true);
    // Includes March 31
    expect(allDates.some((d) => d.getMonth() === 2 && d.getDate() === 31)).toBe(true);
  });

  it("defaults to weekStartsOn=0", () => {
    const date = new Date(2026, 2, 15);
    const grid = calculateMonthGrid(date);
    const gridExplicit = calculateMonthGrid(date, 0);

    expect(grid).toEqual(gridExplicit);
  });
});
