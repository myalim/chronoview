import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../types/index.js";
import { truncateEvents } from "../truncate-events.js";

function makeEvents(count: number): TimelineEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `e${i + 1}`,
    resourceId: "r1",
    start: new Date(),
    end: new Date(),
    title: `Event ${i + 1}`,
  }));
}

describe("truncateEvents", () => {
  it("returns all events when count <= maxVisible", () => {
    const events = makeEvents(3);
    const result = truncateEvents({ events, maxVisible: 5 });

    expect(result.visible).toHaveLength(3);
    expect(result.hiddenCount).toBe(0);
  });

  it("truncates events when count > maxVisible", () => {
    const events = makeEvents(10);
    const result = truncateEvents({ events, maxVisible: 3 });

    expect(result.visible).toHaveLength(3);
    expect(result.hiddenCount).toBe(7);
  });

  it("returns correct visible events (first N)", () => {
    const events = makeEvents(5);
    const result = truncateEvents({ events, maxVisible: 2 });

    expect(result.visible.map((e) => e.id)).toEqual(["e1", "e2"]);
  });

  it("handles empty events", () => {
    const result = truncateEvents({ events: [], maxVisible: 3 });

    expect(result.visible).toHaveLength(0);
    expect(result.hiddenCount).toBe(0);
  });

  it("handles maxVisible = 0", () => {
    const events = makeEvents(3);
    const result = truncateEvents({ events, maxVisible: 0 });

    expect(result.visible).toHaveLength(0);
    expect(result.hiddenCount).toBe(3);
  });
});
