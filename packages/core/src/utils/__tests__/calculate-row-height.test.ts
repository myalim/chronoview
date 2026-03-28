import { describe, expect, it } from "vitest";
import { calculateRowHeight } from "../calculate-row-height.js";

describe("calculateRowHeight", () => {
  const eventHeight = 36;
  const eventGap = 4;
  const minRowHeight = 48;

  it("stackCount=0 → minRowHeight", () => {
    expect(
      calculateRowHeight({
        maxStackCount: 0,
        eventHeight,
        eventGap,
        minRowHeight,
      }),
    ).toBe(48);
  });

  it("stackCount=1 → max(48, 36 + 8) = 48", () => {
    // 1 × 36 + 0 × 4 + 2 × 4(padding) = 44 → minRowHeight 48 applies
    expect(
      calculateRowHeight({
        maxStackCount: 1,
        eventHeight,
        eventGap,
        minRowHeight,
      }),
    ).toBe(48);
  });

  it("stackCount=2 → max(48, 2×36 + 1×4 + 8) = 84", () => {
    // 2 × 36 + 1 × 4 + 2 × 4 = 72 + 4 + 8 = 84
    expect(
      calculateRowHeight({
        maxStackCount: 2,
        eventHeight,
        eventGap,
        minRowHeight,
      }),
    ).toBe(84);
  });

  it("stackCount=3 → max(48, 3×36 + 2×4 + 8) = 124", () => {
    // 3 × 36 + 2 × 4 + 2 × 4 = 108 + 8 + 8 = 124
    expect(
      calculateRowHeight({
        maxStackCount: 3,
        eventHeight,
        eventGap,
        minRowHeight,
      }),
    ).toBe(124);
  });

  it("custom padding", () => {
    // 2 × 36 + 1 × 4 + 2 × 8 = 72 + 4 + 16 = 92
    expect(
      calculateRowHeight({
        maxStackCount: 2,
        eventHeight,
        eventGap,
        minRowHeight,
        padding: 8,
      }),
    ).toBe(92);
  });
});
