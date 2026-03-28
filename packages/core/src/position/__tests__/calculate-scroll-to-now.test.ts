import { describe, expect, it } from "vitest";
import { calculateScrollToNow } from "../calculate-scroll-to-now.js";

describe("calculateScrollToNow", () => {
  const rangeStart = new Date(2026, 2, 27, 0, 0);
  const rangeEnd = new Date(2026, 2, 27, 24, 0);
  const totalSize = 1440;
  const viewportSize = 200;

  it("centers current time in viewport", () => {
    const now = new Date(2026, 2, 27, 12, 0); // offset = 720
    const result = calculateScrollToNow({
      now,
      rangeStart,
      rangeEnd,
      totalSize,
      viewportSize,
    });

    // 720 - 200/2 = 620
    expect(result).toBe(620);
  });

  it("clamps to 0 when now is near range start", () => {
    const now = new Date(2026, 2, 27, 0, 30); // offset = 30
    const result = calculateScrollToNow({
      now,
      rangeStart,
      rangeEnd,
      totalSize,
      viewportSize,
    });

    // 30 - 100 = -70 → clamped to 0
    expect(result).toBe(0);
  });

  it("clamps to max scroll when now is near range end", () => {
    const now = new Date(2026, 2, 27, 23, 50); // offset = 1430
    const result = calculateScrollToNow({
      now,
      rangeStart,
      rangeEnd,
      totalSize,
      viewportSize,
    });

    // 1430 - 100 = 1330, maxScroll = 1440 - 200 = 1240 → clamped to 1240
    expect(result).toBe(1240);
  });

  it("returns 0 when viewport is larger than total size", () => {
    const now = new Date(2026, 2, 27, 12, 0);
    const result = calculateScrollToNow({
      now,
      rangeStart,
      rangeEnd,
      totalSize: 100,
      viewportSize: 200,
    });

    expect(result).toBe(0);
  });
});
