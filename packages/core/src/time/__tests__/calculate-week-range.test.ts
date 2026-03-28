import { describe, expect, it } from "vitest";
import { calculateWeekRange } from "../calculate-week-range.js";

describe("calculateWeekRange", () => {
  // 2026-03-27 is a Friday

  it("weekStartsOn=0 (Sunday): returns Sunday to Saturday", () => {
    const date = new Date(2026, 2, 27); // Friday
    const range = calculateWeekRange(date, 0);

    // 2026-03-22 (Sun) ~ 2026-03-28 (Sat)
    expect(range.start).toEqual(new Date(2026, 2, 22, 0, 0, 0, 0));
    expect(range.end).toEqual(new Date(2026, 2, 28, 23, 59, 59, 999));
  });

  it("weekStartsOn=1 (Monday): returns Monday to Sunday", () => {
    const date = new Date(2026, 2, 27); // Friday
    const range = calculateWeekRange(date, 1);

    // 2026-03-23 (Mon) ~ 2026-03-29 (Sun)
    expect(range.start).toEqual(new Date(2026, 2, 23, 0, 0, 0, 0));
    expect(range.end).toEqual(new Date(2026, 2, 29, 23, 59, 59, 999));
  });

  it("defaults to weekStartsOn=0 when omitted", () => {
    const date = new Date(2026, 2, 27);
    const range = calculateWeekRange(date);

    expect(range.start).toEqual(new Date(2026, 2, 22, 0, 0, 0, 0));
  });

  it("handles week spanning month boundary", () => {
    const date = new Date(2026, 3, 1); // 2026-04-01 (Wed)
    const range = calculateWeekRange(date, 0);

    // 2026-03-29 (Sun) ~ 2026-04-04 (Sat)
    expect(range.start).toEqual(new Date(2026, 2, 29, 0, 0, 0, 0));
    expect(range.end).toEqual(new Date(2026, 3, 4, 23, 59, 59, 999));
  });

  it("handles week spanning year boundary", () => {
    const date = new Date(2025, 11, 31); // 2025-12-31 (Wed)
    const range = calculateWeekRange(date, 0);

    // 2025-12-28 (Sun) ~ 2026-01-03 (Sat)
    expect(range.start).toEqual(new Date(2025, 11, 28, 0, 0, 0, 0));
    expect(range.end).toEqual(new Date(2026, 0, 3, 23, 59, 59, 999));
  });
});
