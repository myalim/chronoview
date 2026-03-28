import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../../types/index.js";
import { detectOverlaps } from "../detect-overlaps.js";

function makeEvent(id: string, startHour: number, endHour: number): TimelineEvent {
  return {
    id,
    resourceId: "r1",
    start: new Date(2026, 2, 27, startHour),
    end: new Date(2026, 2, 27, endHour),
    title: `Event ${id}`,
  };
}

describe("detectOverlaps", () => {
  it("non-overlapping events → separate groups", () => {
    const events = [makeEvent("a", 9, 10), makeEvent("b", 11, 12)];
    const groups = detectOverlaps(events);

    expect(groups).toHaveLength(2);
    expect(groups[0].events.map((e) => e.id)).toEqual(["a"]);
    expect(groups[1].events.map((e) => e.id)).toEqual(["b"]);
  });

  it("overlapping events → same group", () => {
    const events = [makeEvent("a", 9, 11), makeEvent("b", 10, 12)];
    const groups = detectOverlaps(events);

    expect(groups).toHaveLength(1);
    expect(groups[0].events.map((e) => e.id).sort()).toEqual(["a", "b"]);
  });

  it("transitive grouping: A↔B, B↔C → {A,B,C}", () => {
    const events = [makeEvent("a", 9, 11), makeEvent("b", 10, 13), makeEvent("c", 12, 14)];
    const groups = detectOverlaps(events);

    expect(groups).toHaveLength(1);
    expect(groups[0].events.map((e) => e.id).sort()).toEqual(["a", "b", "c"]);
  });

  it("adjacent events (end === start) are NOT overlapping", () => {
    const events = [makeEvent("a", 9, 10), makeEvent("b", 10, 11)];
    const groups = detectOverlaps(events);

    expect(groups).toHaveLength(2);
  });

  it("empty events → empty groups", () => {
    expect(detectOverlaps([])).toEqual([]);
  });

  it("single event → single group", () => {
    const groups = detectOverlaps([makeEvent("a", 9, 10)]);

    expect(groups).toHaveLength(1);
    expect(groups[0].events).toHaveLength(1);
  });

  it("complex mix of overlapping and non-overlapping", () => {
    const events = [
      makeEvent("a", 9, 10),
      makeEvent("b", 9, 11), // overlaps a
      makeEvent("c", 12, 13), // separate
      makeEvent("d", 12, 14), // overlaps c
      makeEvent("e", 15, 16), // separate
    ];
    const groups = detectOverlaps(events);

    expect(groups).toHaveLength(3);
  });
});
