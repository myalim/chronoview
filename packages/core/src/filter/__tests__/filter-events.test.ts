import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../types/index.js";
import { filterEvents } from "../filter-events.js";

const events: TimelineEvent[] = [
  {
    id: "e1",
    resourceId: "r1",
    start: new Date(),
    end: new Date(),
    title: "Event 1",
    category: "meeting",
  },
  {
    id: "e2",
    resourceId: "r2",
    start: new Date(),
    end: new Date(),
    title: "Event 2",
    category: "task",
  },
  {
    id: "e3",
    resourceId: "r1",
    start: new Date(),
    end: new Date(),
    title: "Event 3",
    category: "task",
  },
  {
    id: "e4",
    resourceId: "r3",
    start: new Date(),
    end: new Date(),
    title: "Event 4",
  },
];

describe("filterEvents", () => {
  it("filters by visibleResourceIds", () => {
    const result = filterEvents(events, {}, ["r1"]);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(["e1", "e3"]);
  });

  it("filters by categories", () => {
    const result = filterEvents(events, { categories: ["meeting"] }, ["r1", "r2", "r3"]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e1");
  });

  it("combines resourceId and category filters", () => {
    const result = filterEvents(events, { categories: ["task"] }, ["r1"]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e3");
  });

  it("returns all matching resource events when categories is undefined", () => {
    const result = filterEvents(events, {}, ["r1", "r2", "r3"]);
    expect(result).toHaveLength(4);
  });

  it("excludes events without category when categories filter is set", () => {
    const result = filterEvents(events, { categories: ["meeting", "task"] }, ["r1", "r2", "r3"]);
    // e4 has no category, should be excluded
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
  });

  it("returns empty when no events match", () => {
    const result = filterEvents(events, { categories: ["nonexistent"] }, ["r1"]);
    expect(result).toHaveLength(0);
  });
});
