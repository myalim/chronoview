import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../types/index.js";
import { calculateBarSpan } from "../calculate-bar-span.js";

function makeEvent(start: Date, end: Date): TimelineEvent {
  return {
    id: "test",
    resourceId: "r1",
    start,
    end,
    title: "Test",
  };
}

describe("calculateBarSpan", () => {
  // Week: Sun 3/22 ~ Sat 3/28
  const weekStart = new Date(2026, 2, 22);
  const weekEnd = new Date(2026, 2, 28);

  it("single-day event within the week", () => {
    // Wednesday 3/25 (column 3)
    const event = makeEvent(new Date(2026, 2, 25, 9, 0), new Date(2026, 2, 25, 17, 0));
    const result = calculateBarSpan({ event, weekStart, weekEnd });

    expect(result.startColumn).toBe(3);
    expect(result.endColumn).toBe(3);
    expect(result.spanDays).toBe(1);
  });

  it("multi-day event within the week", () => {
    // Mon 3/23 ~ Thu 3/26
    const event = makeEvent(new Date(2026, 2, 23), new Date(2026, 2, 26, 23, 59));
    const result = calculateBarSpan({ event, weekStart, weekEnd });

    expect(result.startColumn).toBe(1);
    expect(result.endColumn).toBe(4);
    expect(result.spanDays).toBe(4);
  });

  it("clamps event starting before week start", () => {
    // Fri 3/20 ~ Tue 3/24
    const event = makeEvent(new Date(2026, 2, 20), new Date(2026, 2, 24, 23, 59));
    const result = calculateBarSpan({ event, weekStart, weekEnd });

    expect(result.startColumn).toBe(0); // clamped to week start
    expect(result.endColumn).toBe(2);
    expect(result.spanDays).toBe(3);
  });

  it("clamps event ending after week end", () => {
    // Thu 3/26 ~ Tue 3/31
    const event = makeEvent(new Date(2026, 2, 26), new Date(2026, 2, 31));
    const result = calculateBarSpan({ event, weekStart, weekEnd });

    expect(result.startColumn).toBe(4);
    expect(result.endColumn).toBe(6); // clamped to week end
    expect(result.spanDays).toBe(3);
  });

  it("event spanning entire week", () => {
    const event = makeEvent(new Date(2026, 2, 20), new Date(2026, 2, 30));
    const result = calculateBarSpan({ event, weekStart, weekEnd });

    expect(result.startColumn).toBe(0);
    expect(result.endColumn).toBe(6);
    expect(result.spanDays).toBe(7);
  });
});
