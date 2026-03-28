import { describe, expect, it } from "vitest";
import { calculateNowPosition } from "../calculate-now-position.js";

describe("calculateNowPosition", () => {
  const rangeStart = new Date(2026, 2, 27, 0, 0);
  const rangeEnd = new Date(2026, 2, 27, 24, 0);
  const totalSize = 1440;

  it("returns proportional offset when now is within range", () => {
    const now = new Date(2026, 2, 27, 12, 0);
    expect(calculateNowPosition({ now, rangeStart, rangeEnd, totalSize })).toBe(720);
  });

  it("returns null when now is before range", () => {
    const now = new Date(2026, 2, 26, 23, 0);
    expect(calculateNowPosition({ now, rangeStart, rangeEnd, totalSize })).toBeNull();
  });

  it("returns null when now is after range", () => {
    const now = new Date(2026, 2, 28, 1, 0);
    expect(calculateNowPosition({ now, rangeStart, rangeEnd, totalSize })).toBeNull();
  });

  it("returns 0 at range start", () => {
    expect(
      calculateNowPosition({
        now: rangeStart,
        rangeStart,
        rangeEnd,
        totalSize,
      }),
    ).toBe(0);
  });
});
