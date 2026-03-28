import { describe, expect, it } from "vitest";
import { timeToOffset } from "../time-to-offset.js";

describe("timeToOffset", () => {
  const rangeStart = new Date(2026, 2, 27, 0, 0); // 00:00
  const rangeEnd = new Date(2026, 2, 27, 24, 0); // 24:00 (= next day 00:00)
  const totalSize = 1440; // 1px per minute

  it("range start returns 0", () => {
    expect(timeToOffset({ time: rangeStart, rangeStart, rangeEnd, totalSize })).toBe(0);
  });

  it("range end returns totalSize", () => {
    expect(timeToOffset({ time: rangeEnd, rangeStart, rangeEnd, totalSize })).toBe(1440);
  });

  it("midpoint returns half of totalSize", () => {
    const midTime = new Date(2026, 2, 27, 12, 0);
    expect(timeToOffset({ time: midTime, rangeStart, rangeEnd, totalSize })).toBe(720);
  });

  it("1-minute precision: 09:01 → 541px", () => {
    const time = new Date(2026, 2, 27, 9, 1);
    expect(timeToOffset({ time, rangeStart, rangeEnd, totalSize })).toBe(541);
  });

  it("proportional calculation with different totalSize", () => {
    const time = new Date(2026, 2, 27, 6, 0); // 6h = 360min
    expect(
      timeToOffset({
        time,
        rangeStart,
        rangeEnd,
        totalSize: 2880, // 2px per minute
      }),
    ).toBe(720);
  });

  it("clamps to 0 for time before range", () => {
    const beforeRange = new Date(2026, 2, 26, 23, 0);
    expect(
      timeToOffset({
        time: beforeRange,
        rangeStart,
        rangeEnd,
        totalSize,
      }),
    ).toBe(0);
  });

  it("clamps to totalSize for time after range", () => {
    const afterRange = new Date(2026, 2, 28, 1, 0);
    expect(
      timeToOffset({
        time: afterRange,
        rangeStart,
        rangeEnd,
        totalSize,
      }),
    ).toBe(1440);
  });
});
