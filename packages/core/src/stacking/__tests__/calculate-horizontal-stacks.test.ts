import { describe, expect, it } from "vitest";
import type { OverlapGroup, TimelineEvent } from "../../types/index.js";
import { calculateHorizontalStacks } from "../calculate-horizontal-stacks.js";

function makeEvent(id: string, startHour: number, endHour: number): TimelineEvent {
  return {
    id,
    resourceId: "r1",
    start: new Date(2026, 2, 27, startHour),
    end: new Date(2026, 2, 27, endHour),
    title: `Event ${id}`,
  };
}

describe("calculateHorizontalStacks", () => {
  it("single event → lane 0, totalLanes 1", () => {
    const group: OverlapGroup = { events: [makeEvent("a", 9, 10)] };
    const result = calculateHorizontalStacks(group);

    expect(result).toHaveLength(1);
    expect(result[0].lane).toBe(0);
    expect(result[0].totalLanes).toBe(1);
  });

  it("two overlapping → 2 lanes (horizontal split)", () => {
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 11), makeEvent("b", 10, 12)],
    };
    const result = calculateHorizontalStacks(group);

    expect(result).toHaveLength(2);
    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(1);
    expect(result[0].totalLanes).toBe(2);
  });

  it("uses same greedy lane assignment as vertical stacks", () => {
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 10), makeEvent("b", 9, 11), makeEvent("c", 10, 12)],
    };
    const result = calculateHorizontalStacks(group);

    // a(9-10) gets lane 0, b(9-11) gets lane 1, c(10-12) gets lane 0 (reuse)
    const aResult = result.find((r) => r.event.id === "a");
    const bResult = result.find((r) => r.event.id === "b");
    const cResult = result.find((r) => r.event.id === "c");

    expect(aResult?.lane).toBe(0);
    expect(bResult?.lane).toBe(1);
    expect(cResult?.lane).toBe(0);
  });
});
