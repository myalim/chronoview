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

/** Helper with minute-level precision */
function makeEventMin(
  id: string,
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number,
): TimelineEvent {
  return {
    id,
    resourceId: "r1",
    start: new Date(2026, 2, 27, startHour, startMin),
    end: new Date(2026, 2, 27, endHour, endMin),
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
  it("single event → lane=0, totalLanes=1, spanColumns=1", () => {
    const group: OverlapGroup = { events: [makeEvent("a", 9, 10)] };
    const result = calculateAutoStacks(group);

    expect(result).toHaveLength(1);
    expect(result[0].lane).toBe(0);
    expect(result[0].totalLanes).toBe(1);
    expect(result[0].spanColumns).toBe(1);
  });

  it("empty group → empty result", () => {
    const group: OverlapGroup = { events: [] };
    const result = calculateAutoStacks(group);
    expect(result).toHaveLength(0);
  });

  it("two simultaneous events → no expansion possible", () => {
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 10), makeEvent("b", 9, 10)],
    };
    const result = calculateAutoStacks(group);

    expect(result).toHaveLength(2);
    for (const r of result) {
      expect(r.totalLanes).toBe(2);
      expect(r.spanColumns).toBe(1);
    }
  });

  it("staggered overlap A→B, then C after B — no expansion possible", () => {
    // A(9-11) → lane 0, B(9-10) → lane 1
    // C(10-11): lane 0 occupied by A (ends 11), lane 1 free (B ended at 10) → lane 1
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 11), makeEvent("b", 9, 10), makeEvent("c", 10, 11)],
    };
    const result = calculateAutoStacks(group);

    const a = findById(result, "a");
    const b = findById(result, "b");
    const c = findById(result, "c");

    expect(a.lane).toBe(0);
    expect(b.lane).toBe(1);
    expect(c.lane).toBe(1);
    expect(a.spanColumns).toBe(1);
    expect(b.spanColumns).toBe(1);
    expect(c.spanColumns).toBe(1);
  });

  it("event alone after others end → expands to full width", () => {
    // A(9-10) lane 0, B(9-10) lane 1 → 2 lanes
    // C(10-11) gets lane 0 (both free). lane 1 is empty during C → expand
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 10), makeEvent("b", 9, 10), makeEvent("c", 10, 11)],
    };
    const result = calculateAutoStacks(group);

    const c = findById(result, "c");
    expect(c.lane).toBe(0);
    expect(c.totalLanes).toBe(2);
    expect(c.spanColumns).toBe(2);
  });

  it("5 events with max 3 concurrent — calendar-day.md example", () => {
    // A(9:00-10:30) B(9:00-10:00) C(9:00-9:30) D(9:30-11:00) E(10:00-11:00)
    const group: OverlapGroup = {
      events: [
        makeEventMin("a", 9, 0, 10, 30),
        makeEventMin("b", 9, 0, 10, 0),
        makeEventMin("c", 9, 0, 9, 30),
        makeEventMin("d", 9, 30, 11, 0),
        makeEventMin("e", 10, 0, 11, 0),
      ],
    };
    const result = calculateAutoStacks(group);

    expect(result.every((r) => r.totalLanes === 3)).toBe(true);

    const ra = findById(result, "a");
    const rb = findById(result, "b");
    const rc = findById(result, "c");
    const rd = findById(result, "d");
    const re = findById(result, "e");

    expect(ra.lane).toBe(0);
    expect(rb.lane).toBe(1);
    expect(rc.lane).toBe(2);
    expect(rd.lane).toBe(2);
    expect(re.lane).toBe(1);

    // All lanes are neighbor-occupied → no expansion
    expect(ra.spanColumns).toBe(1);
    expect(rb.spanColumns).toBe(1);
    expect(rc.spanColumns).toBe(1);
    expect(rd.spanColumns).toBe(1);
    expect(re.spanColumns).toBe(1);
  });

  it("sequential non-overlapping events → each gets full width", () => {
    const group: OverlapGroup = {
      events: [makeEvent("a", 9, 10), makeEvent("b", 10, 11)],
    };
    const result = calculateAutoStacks(group);

    expect(result).toHaveLength(2);
    expect(result[0].totalLanes).toBe(1);
    expect(result[0].spanColumns).toBe(1);
    expect(result[1].spanColumns).toBe(1);
  });

  it("rightward expansion with gap in the middle", () => {
    // 3 lanes: A(9-11) lane0, B(9-10) lane1, C(9-10) lane2
    // D(10-11) gets lane1. lane 2 is empty during D → expand
    const group: OverlapGroup = {
      events: [
        makeEvent("a", 9, 11),
        makeEvent("b", 9, 10),
        makeEvent("c", 9, 10),
        makeEvent("d", 10, 11),
      ],
    };
    const result = calculateAutoStacks(group);

    const rd = findById(result, "d");
    expect(rd.lane).toBe(1);
    expect(rd.totalLanes).toBe(3);
    expect(rd.spanColumns).toBe(2);
  });

  it("expansion stops at first occupied column", () => {
    // 3 lanes: A(9-11) lane0, B(9-11) lane1, C(9-10) lane2
    // D(10-11) gets lane2. B(lane1) checks lane2: C+D occupy it → blocked
    const group: OverlapGroup = {
      events: [
        makeEvent("a", 9, 11),
        makeEvent("b", 9, 11),
        makeEvent("c", 9, 10),
        makeEvent("d", 10, 11),
      ],
    };
    const result = calculateAutoStacks(group);

    const ra = findById(result, "a");
    const rb = findById(result, "b");
    expect(ra.spanColumns).toBe(1);
    expect(rb.spanColumns).toBe(1);
  });
});
