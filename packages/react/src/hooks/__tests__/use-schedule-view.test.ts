import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScheduleView } from "../use-schedule-view.js";
import type { TimelineConfig, Resource, TimelineEvent } from "@chronoview/core";

// Fixed date for deterministic tests
const baseDate = new Date(2026, 2, 28, 0, 0, 0, 0);

const resources: Resource[] = [
  { id: "r1", title: "Room A" },
  { id: "r2", title: "Room B" },
  { id: "r3", title: "Room C" },
];

const events: TimelineEvent[] = [
  {
    id: "e1",
    resourceId: "r1",
    start: new Date(2026, 2, 28, 9, 0),
    end: new Date(2026, 2, 28, 10, 0),
    title: "Morning meeting",
  },
  {
    id: "e2",
    resourceId: "r1",
    start: new Date(2026, 2, 28, 9, 30),
    end: new Date(2026, 2, 28, 11, 0),
    title: "Overlapping event",
  },
  {
    id: "e3",
    resourceId: "r2",
    start: new Date(2026, 2, 28, 14, 0),
    end: new Date(2026, 2, 28, 15, 0),
    title: "Afternoon session",
  },
];

function createConfig(overrides?: Partial<TimelineConfig>): TimelineConfig {
  return {
    events,
    resources,
    view: "day",
    layout: "schedule",
    startDate: baseDate,
    ...overrides,
  };
}

describe("useScheduleView", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes correct number of rows (one per resource)", () => {
    const { result } = renderHook(() => useScheduleView(createConfig()));

    expect(result.current.rows).toHaveLength(3);
    expect(result.current.rows[0].resource.id).toBe("r1");
    expect(result.current.rows[1].resource.id).toBe("r2");
    expect(result.current.rows[2].resource.id).toBe("r3");
  });

  it("computes time slots for day view", () => {
    const config = createConfig({ cellDuration: { day: 60 } });
    const { result } = renderHook(() => useScheduleView(config));

    // Day view: 24 hours with 60min cells = 24 slots
    expect(result.current.timeSlots).toHaveLength(24);
    expect(result.current.timeSlots[0].label).toBeDefined();
  });

  it("returns empty time slots for month view", () => {
    const config = createConfig({ view: "month" });
    const { result } = renderHook(() => useScheduleView(config));

    // Month view does not generate time slots
    expect(result.current.timeSlots).toHaveLength(0);
  });

  it("computes row heights based on event stacking", () => {
    const { result } = renderHook(() => useScheduleView(createConfig()));

    // r1 has 2 overlapping events -> higher row due to stacking
    const row1 = result.current.rows[0];
    // r3 has 0 events -> min row height
    const row3 = result.current.rows[2];

    // Row with stacked events should be taller than empty row
    expect(row1.height).toBeGreaterThanOrEqual(row3.height);
    // Empty row should have minimum height (DEFAULT_MIN_ROW_HEIGHT = 48)
    expect(row3.height).toBe(48);
  });

  it("r1 has event layouts for its 2 events", () => {
    const { result } = renderHook(() => useScheduleView(createConfig()));

    const row1 = result.current.rows[0];
    expect(row1.events).toHaveLength(2);

    // Overlapping events should be assigned different lanes
    const lanes = row1.events.map((e) => e.lane);
    expect(new Set(lanes).size).toBe(2);
  });

  it("getEventStyle returns absolute position CSS", () => {
    const { result } = renderHook(() => useScheduleView(createConfig()));

    const row1 = result.current.rows[0];
    const style = result.current.getEventStyle(row1.events[0]);

    expect(style.position).toBe("absolute");
    expect(typeof style.left).toBe("number");
    expect(typeof style.top).toBe("number");
    expect(typeof style.width).toBe("number");
    expect(typeof style.height).toBe("number");
  });

  it("getRowStyle returns height", () => {
    const { result } = renderHook(() => useScheduleView(createConfig()));

    const row = result.current.rows[0];
    const style = result.current.getRowStyle(row);

    expect(style.height).toBe(row.height);
  });

  it("totalCrossSize equals sum of all row heights", () => {
    const { result } = renderHook(() => useScheduleView(createConfig()));

    const expectedTotal = result.current.rows.reduce((sum, r) => sum + r.height, 0);
    expect(result.current.totalCrossSize).toBe(expectedTotal);
  });

  it("totalMainSize is constant per view, independent of cellDuration", () => {
    const config60 = createConfig({ cellDuration: { day: 60 } });
    const config30 = createConfig({ cellDuration: { day: 30 } });
    const config15 = createConfig({ cellDuration: { day: 15 } });
    const { result: r60 } = renderHook(() => useScheduleView(config60));
    const { result: r30 } = renderHook(() => useScheduleView(config30));
    const { result: r15 } = renderHook(() => useScheduleView(config15));

    // Day totalMainSize = 2880px regardless of cellDuration
    expect(r60.current.totalMainSize).toBe(2880);
    expect(r30.current.totalMainSize).toBe(2880);
    expect(r15.current.totalMainSize).toBe(2880);
  });

  it("week view totalMainSize = 1680px", () => {
    const config = createConfig({ view: "week" });
    const { result } = renderHook(() => useScheduleView(config));

    expect(result.current.totalMainSize).toBe(1680);
  });
});
