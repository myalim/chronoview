import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../types/index.js";
import { calculateEventPosition } from "../calculate-event-position.js";

// 24-hour range, 1px per minute = 1440px total
const rangeStart = new Date(2026, 2, 27, 0, 0);
const rangeEnd = new Date(2026, 2, 27, 24, 0);
const totalMainSize = 1440;

function makeEvent(start: Date, end: Date): TimelineEvent {
  return {
    id: "test",
    resourceId: "r1",
    start,
    end,
    title: "Test",
  };
}

describe("calculateEventPosition", () => {
  it("full-range event: offset=0, size=totalSize", () => {
    const event = makeEvent(rangeStart, rangeEnd);
    const result = calculateEventPosition({
      event,
      rangeStart,
      rangeEnd,
      totalMainSize,
    });

    expect(result.mainOffset).toBe(0);
    expect(result.mainSize).toBe(1440);
  });

  it("half-range event: proportional calculation", () => {
    const event = makeEvent(new Date(2026, 2, 27, 0, 0), new Date(2026, 2, 27, 12, 0));
    const result = calculateEventPosition({
      event,
      rangeStart,
      rangeEnd,
      totalMainSize,
    });

    expect(result.mainOffset).toBe(0);
    expect(result.mainSize).toBe(720);
  });

  it("mid-range event: correct offset and size", () => {
    const event = makeEvent(new Date(2026, 2, 27, 9, 0), new Date(2026, 2, 27, 10, 0));
    const result = calculateEventPosition({
      event,
      rangeStart,
      rangeEnd,
      totalMainSize,
    });

    expect(result.mainOffset).toBe(540); // 9h × 60
    expect(result.mainSize).toBe(60); // 1h
  });

  it("1-minute precision: 09:01~09:02 → offset=541, size=1", () => {
    const event = makeEvent(new Date(2026, 2, 27, 9, 1), new Date(2026, 2, 27, 9, 2));
    const result = calculateEventPosition({
      event,
      rangeStart,
      rangeEnd,
      totalMainSize,
    });

    expect(result.mainOffset).toBe(541);
    expect(result.mainSize).toBe(1);
  });

  it("clamps event extending before range start", () => {
    const event = makeEvent(
      new Date(2026, 2, 26, 22, 0), // before range
      new Date(2026, 2, 27, 2, 0),
    );
    const result = calculateEventPosition({
      event,
      rangeStart,
      rangeEnd,
      totalMainSize,
    });

    expect(result.mainOffset).toBe(0); // clamped to start
    expect(result.mainSize).toBe(120); // 0:00 ~ 2:00 = 120min
  });

  it("clamps event extending after range end", () => {
    const event = makeEvent(
      new Date(2026, 2, 27, 22, 0),
      new Date(2026, 2, 28, 2, 0), // after range
    );
    const result = calculateEventPosition({
      event,
      rangeStart,
      rangeEnd,
      totalMainSize,
    });

    expect(result.mainOffset).toBe(1320); // 22h × 60
    expect(result.mainSize).toBe(120); // 22:00 ~ 24:00 = 120min
  });
});
