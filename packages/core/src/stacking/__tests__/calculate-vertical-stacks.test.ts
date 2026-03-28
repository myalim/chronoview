import { describe, expect, it } from "vitest";
import type { OverlapGroup, TimelineEvent } from "../../types/index.js";
import { calculateVerticalStacks } from "../calculate-vertical-stacks.js";

function makeEvent(id: string, startHour: number, endHour: number): TimelineEvent {
  return {
    id,
    resourceId: "r1",
    start: new Date(2026, 2, 27, startHour),
    end: new Date(2026, 2, 27, endHour),
    title: `Event ${id}`,
  };
}

describe("calculateVerticalStacks", () => {
  it("single event → lane 0, totalLanes 1", () => {
    const group: OverlapGroup = { events: [makeEvent("a", 9, 10)] };
    const result = calculateVerticalStacks(group);

    expect(result).toHaveLength(1);
    expect(result[0].lane).toBe(0);
    expect(result[0].totalLanes).toBe(1);
  });

  it("two overlapping events → 2 lanes", () => {
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 11), makeEvent("b", 10, 12)],
    };
    const result = calculateVerticalStacks(group);

    expect(result).toHaveLength(2);
    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(1);
    expect(result[0].totalLanes).toBe(2);
    expect(result[1].totalLanes).toBe(2);
  });

  it("three overlapping events → 3 lanes", () => {
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 12), makeEvent("b", 10, 13), makeEvent("c", 11, 14)],
    };
    const result = calculateVerticalStacks(group);

    expect(result).toHaveLength(3);
    const lanes = result.map((r) => r.lane).sort();
    expect(lanes).toEqual([0, 1, 2]);
    for (const r of result) {
      expect(r.totalLanes).toBe(3);
    }
  });

  it("greedy lane reuse: non-overlapping events share a lane", () => {
    // a: 9-10, b: 9-11, c: 10-12 (c doesn't overlap a, can reuse lane 0)
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 10), makeEvent("b", 9, 11), makeEvent("c", 10, 12)],
    };
    const result = calculateVerticalStacks(group);

    const aResult = result.find((r) => r.event.id === "a");
    const cResult = result.find((r) => r.event.id === "c");

    // a and c don't overlap, so they can share lane 0
    expect(aResult?.lane).toBe(0);
    expect(cResult?.lane).toBe(0);
  });

  it("empty group → empty result", () => {
    const group: OverlapGroup = { events: [] };
    expect(calculateVerticalStacks(group)).toEqual([]);
  });
});
