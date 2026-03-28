import { describe, expect, it } from "vitest";
import { calculateVisibleRange } from "../calculate-visible-range.js";

describe("calculateVisibleRange", () => {
  // 10 items, 100px each
  const itemSizes = Array.from({ length: 10 }, () => 100);

  it("scroll at top → first items visible", () => {
    const result = calculateVisibleRange({
      scrollOffset: 0,
      viewportSize: 300,
      itemSizes,
    });

    expect(result.startIndex).toBe(0);
    expect(result.endIndex).toBe(2); // 0-299 → items 0,1,2
  });

  it("scroll in middle → correct visible range", () => {
    const result = calculateVisibleRange({
      scrollOffset: 250,
      viewportSize: 300,
      itemSizes,
    });

    // 250-549 → items 2,3,4,5
    expect(result.startIndex).toBe(2);
    expect(result.endIndex).toBe(5);
  });

  it("scroll at bottom → last items visible", () => {
    const result = calculateVisibleRange({
      scrollOffset: 700,
      viewportSize: 300,
      itemSizes,
    });

    // 700-999 → items 7,8,9
    expect(result.startIndex).toBe(7);
    expect(result.endIndex).toBe(9);
  });

  it("applies overscan buffer", () => {
    const result = calculateVisibleRange({
      scrollOffset: 300,
      viewportSize: 200,
      itemSizes,
      overscan: 2,
    });

    // visible: 300-499 → items 3,4
    // overscan: startIndex = max(0, 3-2) = 1, endIndex = min(9, 4+2) = 6
    expect(result.startIndex).toBe(1);
    expect(result.endIndex).toBe(6);
    expect(result.overscan).toBe(2);
  });

  it("handles empty items", () => {
    const result = calculateVisibleRange({
      scrollOffset: 0,
      viewportSize: 300,
      itemSizes: [],
    });

    expect(result.startIndex).toBe(0);
    expect(result.endIndex).toBe(0);
  });

  it("handles variable-height items", () => {
    const varSizes = [50, 100, 150, 200, 50]; // cumulative: 0,50,150,300,500,550
    const result = calculateVisibleRange({
      scrollOffset: 100,
      viewportSize: 250,
      itemSizes: varSizes,
    });

    // 100-349 → item 1(50-150), item 2(150-300), item 3(300-500)
    expect(result.startIndex).toBe(1);
    expect(result.endIndex).toBe(3);
  });

  it("defaults overscan to 0", () => {
    const result = calculateVisibleRange({
      scrollOffset: 0,
      viewportSize: 300,
      itemSizes,
    });

    expect(result.overscan).toBe(0);
  });
});
