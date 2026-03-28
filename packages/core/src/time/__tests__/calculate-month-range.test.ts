import { describe, expect, it } from "vitest";
import { calculateMonthRange } from "../calculate-month-range.js";

describe("calculateMonthRange", () => {
  it("returns full calendar grid range including prev/next month padding (weekStartsOn=0)", () => {
    // 2026-03: starts on Sunday 3/1, ends on Tuesday 3/31
    const date = new Date(2026, 2, 15);
    const range = calculateMonthRange(date, 0);

    // Grid starts on Sun 3/1 (no prev month padding needed)
    expect(range.start).toEqual(new Date(2026, 2, 1, 0, 0, 0, 0));
    // Grid ends on Sat 4/4
    expect(range.end).toEqual(new Date(2026, 3, 4, 23, 59, 59, 999));
  });

  it("includes prev month padding when month doesn't start on week start day", () => {
    // 2026-04: starts on Wednesday 4/1
    const date = new Date(2026, 3, 15);
    const range = calculateMonthRange(date, 0);

    // Grid starts on Sun 3/29
    expect(range.start).toEqual(new Date(2026, 2, 29, 0, 0, 0, 0));
    // Grid ends on Sat 5/2
    expect(range.end).toEqual(new Date(2026, 4, 2, 23, 59, 59, 999));
  });

  it("weekStartsOn=1 (Monday)", () => {
    // 2026-03: starts on Sunday, ends on Tuesday 3/31
    const date = new Date(2026, 2, 15);
    const range = calculateMonthRange(date, 1);

    // Grid starts on Mon 2/23 (Monday before Sunday 3/1)
    expect(range.start).toEqual(new Date(2026, 1, 23, 0, 0, 0, 0));
    // Grid ends on Sun 4/5 (Sunday after Tuesday 3/31)
    expect(range.end).toEqual(new Date(2026, 3, 5, 23, 59, 59, 999));
  });

  it("handles February in a leap year", () => {
    // 2028-02: leap year, Feb has 29 days, starts on Tuesday
    const date = new Date(2028, 1, 15);
    const range = calculateMonthRange(date, 0);

    // Grid starts on Sun 1/30
    expect(range.start).toEqual(new Date(2028, 0, 30, 0, 0, 0, 0));
    // Grid ends on Sat 3/4
    expect(range.end).toEqual(new Date(2028, 2, 4, 23, 59, 59, 999));
  });

  it("defaults to weekStartsOn=0", () => {
    const date = new Date(2026, 2, 15);
    const range = calculateMonthRange(date);
    const rangeExplicit = calculateMonthRange(date, 0);

    expect(range).toEqual(rangeExplicit);
  });
});
