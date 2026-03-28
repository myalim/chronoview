import { describe, expect, it } from "vitest";
import { calculateDayRange } from "../calculate-day-range.js";

describe("calculateDayRange", () => {
  it("returns start-of-day to end-of-day", () => {
    const date = new Date(2026, 2, 27, 15, 30); // 2026-03-27 15:30
    const range = calculateDayRange(date);

    expect(range.start).toEqual(new Date(2026, 2, 27, 0, 0, 0, 0));
    expect(range.end).toEqual(new Date(2026, 2, 27, 23, 59, 59, 999));
  });

  it("normalizes any time input to the same day range", () => {
    const morning = calculateDayRange(new Date(2026, 2, 27, 6, 0));
    const evening = calculateDayRange(new Date(2026, 2, 27, 22, 0));

    expect(morning).toEqual(evening);
  });

  it("handles midnight input", () => {
    const range = calculateDayRange(new Date(2026, 0, 1, 0, 0, 0, 0));

    expect(range.start).toEqual(new Date(2026, 0, 1, 0, 0, 0, 0));
    expect(range.end).toEqual(new Date(2026, 0, 1, 23, 59, 59, 999));
  });
});
