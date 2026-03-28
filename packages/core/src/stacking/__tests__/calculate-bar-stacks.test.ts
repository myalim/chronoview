import { eachDayOfInterval } from "date-fns";
import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../types/index.js";
import { calculateBarStacks } from "../calculate-bar-stacks.js";

function makeEvent(id: string, start: Date, end: Date, color?: string): TimelineEvent {
  return {
    id,
    resourceId: "r1",
    start,
    end,
    title: `Event ${id}`,
    color,
  };
}

describe("calculateBarStacks", () => {
  // Week: Sun 3/22 ~ Sat 3/28
  const weekDates = eachDayOfInterval({
    start: new Date(2026, 2, 22),
    end: new Date(2026, 2, 28),
  });

  it("single-day event → one bar, row 0", () => {
    const events = [makeEvent("a", new Date(2026, 2, 25, 9, 0), new Date(2026, 2, 25, 17, 0))];
    const bars = calculateBarStacks(events, weekDates);

    expect(bars).toHaveLength(1);
    expect(bars[0].startColumn).toBe(3); // Wed
    expect(bars[0].endColumn).toBe(3);
    expect(bars[0].row).toBe(0);
  });

  it("multi-day event → one bar spanning multiple columns", () => {
    const events = [makeEvent("a", new Date(2026, 2, 23), new Date(2026, 2, 26, 23, 59))];
    const bars = calculateBarStacks(events, weekDates);

    expect(bars).toHaveLength(1);
    expect(bars[0].startColumn).toBe(1); // Mon
    expect(bars[0].endColumn).toBe(4); // Thu
  });

  it("non-overlapping bars → same row", () => {
    const events = [
      makeEvent("a", new Date(2026, 2, 22), new Date(2026, 2, 23, 23, 59)),
      makeEvent("b", new Date(2026, 2, 25), new Date(2026, 2, 26, 23, 59)),
    ];
    const bars = calculateBarStacks(events, weekDates);

    expect(bars).toHaveLength(2);
    // Non-overlapping, so both should be in row 0
    expect(bars[0].row).toBe(0);
    expect(bars[1].row).toBe(0);
  });

  it("overlapping bars → different rows", () => {
    const events = [
      makeEvent("a", new Date(2026, 2, 22), new Date(2026, 2, 25, 23, 59)),
      makeEvent("b", new Date(2026, 2, 24), new Date(2026, 2, 27, 23, 59)),
    ];
    const bars = calculateBarStacks(events, weekDates);

    expect(bars).toHaveLength(2);
    expect(bars[0].row).toBe(0);
    expect(bars[1].row).toBe(1); // Overlapping, so different row
  });

  it("preserves event color in bar", () => {
    const events = [makeEvent("a", new Date(2026, 2, 25), new Date(2026, 2, 25, 17, 0), "#ff0000")];
    const bars = calculateBarStacks(events, weekDates);

    expect(bars[0].color).toBe("#ff0000");
  });

  it("empty events → empty bars", () => {
    expect(calculateBarStacks([], weekDates)).toEqual([]);
  });
});
