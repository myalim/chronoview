import { describe, expect, it } from "vitest";
import type { OverlapGroup, TimelineEvent } from "../../types/index.js";
import { calculateAutoStacks } from "../calculate-auto-stacks.js";

function makeEvent(id: string, startHour: number, endHour: number): TimelineEvent {
  return {
    id,
    resourceId: "r1",
    start: new Date(2026, 2, 27, startHour),
    end: new Date(2026, 2, 27, endHour),
    title: `Event ${id}`,
  };
}

/** Find event by id — asserts presence before returning */
function findById(results: ReturnType<typeof calculateAutoStacks>, id: string) {
  const found = results.find((r) => r.event.id === id);
  expect(found).toBeDefined();
  return found as NonNullable<typeof found>;
}

describe("calculateAutoStacks", () => {
  // indent 겹침: lane = depth (시작 시간 순), totalLanes = maxDepth + 1

  it("single event → lane=0, totalLanes=1", () => {
    const group: OverlapGroup = { events: [makeEvent("a", 9, 10)] };
    const result = calculateAutoStacks(group);

    expect(result).toHaveLength(1);
    expect(result[0].lane).toBe(0);
    expect(result[0].totalLanes).toBe(1);
  });

  it("empty group → empty result", () => {
    const group: OverlapGroup = { events: [] };
    const result = calculateAutoStacks(group);
    expect(result).toHaveLength(0);
  });

  it("two simultaneous events → 2 lanes (depth 0, 1)", () => {
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 10), makeEvent("b", 9, 10)],
    };
    const result = calculateAutoStacks(group);

    expect(result).toHaveLength(2);
    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(1);
    expect(result[0].totalLanes).toBe(2);
  });

  it("staggered overlap A→B→C — increasing depth", () => {
    // A,B,C 모두 동시 겹침: 3개 lane 필요
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 12), makeEvent("b", 10, 11), makeEvent("c", 10, 11)],
    };
    const result = calculateAutoStacks(group);

    const a = findById(result, "a");
    const b = findById(result, "b");
    const c = findById(result, "c");

    // A → lane 0, B → lane 1 (A 점유), C → lane 2 (A,B 점유)
    expect(a.lane).toBe(0);
    expect(b.lane).toBe(1);
    expect(c.lane).toBe(2);
    expect(a.totalLanes).toBe(3);
  });

  it("lane reuse: B ends before C starts → C reuses B's lane", () => {
    // A(9-11), B(9-10), C(10-11)
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 11), makeEvent("b", 9, 10), makeEvent("c", 10, 11)],
    };
    const result = calculateAutoStacks(group);

    const a = findById(result, "a");
    const b = findById(result, "b");
    const c = findById(result, "c");

    expect(a.lane).toBe(0);
    expect(b.lane).toBe(1);
    // C starts at 10:00, B ends at 10:00 → lane 1 is free → C reuses lane 1
    expect(c.lane).toBe(1);
    expect(a.totalLanes).toBe(2);
  });

  it("sequential non-overlapping events → single lane each", () => {
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 10), makeEvent("b", 10, 11)],
    };
    const result = calculateAutoStacks(group);

    expect(result).toHaveLength(2);
    // B starts exactly when A ends → no overlap → same lane
    expect(result[0].lane).toBe(0);
    expect(result[1].lane).toBe(0);
    expect(result[0].totalLanes).toBe(1);
  });

  it("4 overlapping events → 4 lanes", () => {
    const group: OverlapGroup = {
      events: [
        makeEvent("a", 9, 11),
        makeEvent("b", 9, 10),
        makeEvent("c", 9.5, 10.5),
        makeEvent("d", 10, 11.5),
      ],
    };
    const result = calculateAutoStacks(group);

    const a = findById(result, "a");
    const b = findById(result, "b");
    const c = findById(result, "c");
    const d = findById(result, "d");

    expect(a.lane).toBe(0);
    expect(b.lane).toBe(1);
    expect(c.lane).toBe(2);
    // D: A occupies lane 0 (until 11), B ended at 10 → lane 1 free, C occupies lane 2 (until 10:30)
    expect(d.lane).toBe(1);
  });
});
