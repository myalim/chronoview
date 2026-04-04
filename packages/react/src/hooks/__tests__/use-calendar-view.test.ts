import { renderHook } from "@testing-library/react";
import type { EventLayout, Resource, TimelineConfig, TimelineEvent } from "@chronoview/core";
import { describe, expect, it } from "vitest";
import { useCalendarView } from "../use-calendar-view.js";

// Fixed date: Saturday 2026-03-28
const baseDate = new Date(2026, 2, 28, 0, 0, 0, 0);

const resources: Resource[] = [
  { id: "r1", title: "Room A", color: "#ef4444" },
  { id: "r2", title: "Room B", color: "#3b82f6" },
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
    layout: "calendar",
    startDate: baseDate,
    ...overrides,
  };
}

/** Find event layout by id — asserts presence before returning */
function findEvent(layouts: EventLayout[], id: string) {
  const found = layouts.find((e) => e.event.id === id);
  expect(found).toBeDefined();
  return found as NonNullable<typeof found>;
}

describe("useCalendarView", () => {
  // ─── Day view ───

  describe("day view", () => {
    it("returns a single column", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));

      expect(result.current.columns).toHaveLength(1);
      expect(result.current.monthGrid).toBeNull();
    });

    it("column date matches startDate", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));
      const col = result.current.columns[0];

      expect(col.date.getFullYear()).toBe(2026);
      expect(col.date.getMonth()).toBe(2);
      expect(col.date.getDate()).toBe(28);
      expect(col.dayOfWeek).toBe(6); // Saturday
    });

    it("generates 24 time slots with default 60-min interval", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));
      expect(result.current.timeSlots).toHaveLength(24);
    });

    it("totalMainSize = (slots + 2 padding) × slotHeight", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));
      // 24 slots × 60px + 2 padding slots × 60px = 1560
      expect(result.current.totalMainSize).toBe(1560);
      expect(result.current.slotHeight).toBe(60);
      expect(result.current.contentOffset).toBe(60);
    });

    it("assigns events to the column with correct positions", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));
      const col = result.current.columns[0];

      // 3 events: e1(9-10), e2(9:30-11), e3(14-15)
      expect(col.events).toHaveLength(3);

      // e1 and e2 overlap → 2 lanes
      const e1 = findEvent(col.events, "e1");
      const e2 = findEvent(col.events, "e2");
      expect(e1.totalLanes).toBe(2);
      expect(e2.totalLanes).toBe(2);
      expect(e1.lane).not.toBe(e2.lane);

      // e3 is alone → 1 lane
      const e3 = findEvent(col.events, "e3");
      expect(e3.totalLanes).toBe(1);
      expect(e3.lane).toBe(0);
    });

    it("resolves event color from resource", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));
      const col = result.current.columns[0];

      const e1 = findEvent(col.events, "e1");
      expect(e1.color).toBe("#ef4444"); // From resource r1
    });

    it("sets spanColumns on stacked events (auto mode)", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));
      const col = result.current.columns[0];

      // e3 is alone in its overlap group → spanColumns=1 (single lane)
      const e3 = findEvent(col.events, "e3");
      expect(e3.spanColumns).toBe(1);
    });

    it("filters out events outside dateRange", () => {
      const outOfRangeEvent: TimelineEvent = {
        id: "out",
        resourceId: "r1",
        start: new Date(2026, 2, 29, 9, 0),
        end: new Date(2026, 2, 29, 10, 0),
        title: "Next day",
      };
      const { result } = renderHook(() =>
        useCalendarView(createConfig({ events: [...events, outOfRangeEvent] })),
      );
      const col = result.current.columns[0];
      expect(col.events.find((e) => e.event.id === "out")).toBeUndefined();
    });
  });

  // ─── Week view ───

  describe("week view", () => {
    it("returns 7 columns", () => {
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "week" })));
      expect(result.current.columns).toHaveLength(7);
      expect(result.current.monthGrid).toBeNull();
    });

    it("distributes events to correct day columns", () => {
      // baseDate = 2026-03-28 (Saturday), weekStartsOn=0 (Sunday)
      // Week: 2026-03-22 (Sun) to 2026-03-28 (Sat)
      // Events are on 2026-03-28 → last column (index 6)
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "week" })));
      const cols = result.current.columns;

      // Only the Saturday column (index 6) should have events
      for (let i = 0; i < 6; i++) {
        expect(cols[i].events).toHaveLength(0);
      }
      expect(cols[6].events).toHaveLength(3);
    });

    it("stacks overlapping events independently per column", () => {
      const mondayEvents: TimelineEvent[] = [
        {
          id: "m1",
          resourceId: "r1",
          start: new Date(2026, 2, 23, 9, 0),
          end: new Date(2026, 2, 23, 10, 0),
          title: "Monday event",
        },
      ];
      const { result } = renderHook(() =>
        useCalendarView(createConfig({ view: "week", events: [...events, ...mondayEvents] })),
      );
      const cols = result.current.columns;

      // Monday column (index 1) has 1 event → 1 lane
      const monCol = cols[1];
      expect(monCol.events).toHaveLength(1);
      expect(monCol.events[0].totalLanes).toBe(1);

      // Saturday column (index 6) has overlapping → 2 lanes
      const satCol = cols[6];
      const e1 = findEvent(satCol.events, "e1");
      expect(e1.totalLanes).toBe(2);
    });

    it("shares same timeSlots across all columns", () => {
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "week" })));
      expect(result.current.timeSlots).toHaveLength(24);
    });
  });

  // ─── Month view ───

  describe("month view", () => {
    it("returns month grid with 4-6 weeks", () => {
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "month" })));

      expect(result.current.columns).toHaveLength(0);
      expect(result.current.monthGrid).not.toBeNull();

      const grid = result.current.monthGrid;
      expect(grid?.weeks.length).toBeGreaterThanOrEqual(4);
      expect(grid?.weeks.length).toBeLessThanOrEqual(6);
      for (const week of grid?.weeks ?? []) {
        expect(week).toHaveLength(7);
      }
    });

    it("assigns events to correct cells", () => {
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "month" })));
      const weeks = result.current.monthGrid?.weeks ?? [];

      // Find the cell for 2026-03-28
      let targetCell: (typeof weeks)[0][0] | undefined;
      for (const week of weeks) {
        for (const cell of week) {
          if (cell.date.getDate() === 28 && cell.date.getMonth() === 2) {
            targetCell = cell;
          }
        }
      }

      expect(targetCell).toBeDefined();
      expect(targetCell?.events).toHaveLength(3);
      expect(targetCell?.isCurrentMonth).toBe(true);
    });

    it("provides visibleEvents and weekIndex for each cell", () => {
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "month" })));
      const weeks = result.current.monthGrid?.weeks ?? [];

      // Every cell should have a weekIndex matching its position
      for (let wi = 0; wi < weeks.length; wi++) {
        for (const cell of weeks[wi]) {
          expect(cell.weekIndex).toBe(wi);
        }
      }

      // Find the cell with events
      let targetCell: (typeof weeks)[0][0] | undefined;
      for (const week of weeks) {
        for (const cell of week) {
          if (cell.date.getDate() === 28 && cell.date.getMonth() === 2) {
            targetCell = cell;
          }
        }
      }

      // visibleEvents should be the truncated subset
      expect(targetCell?.visibleEvents).toBeDefined();
      expect(targetCell?.visibleEvents.length).toBe(targetCell?.visibleCount);
    });

    it("truncates events in list mode", () => {
      const manyEvents: TimelineEvent[] = Array.from({ length: 5 }, (_, i) => ({
        id: `many-${i}`,
        resourceId: "r1",
        start: new Date(2026, 2, 28, 9 + i, 0),
        end: new Date(2026, 2, 28, 10 + i, 0),
        title: `Event ${i}`,
      }));

      const { result } = renderHook(() =>
        useCalendarView(createConfig({ view: "month", monthMode: "list", events: manyEvents })),
      );

      const weeks = result.current.monthGrid?.weeks ?? [];
      let targetCell: (typeof weeks)[0][0] | undefined;
      for (const week of weeks) {
        for (const cell of week) {
          if (cell.date.getDate() === 28 && cell.date.getMonth() === 2) {
            targetCell = cell;
          }
        }
      }

      expect(targetCell?.visibleCount).toBe(3);
      expect(targetCell?.hiddenCount).toBe(2);
    });

    it("calculates per-week bar stacks in bar mode", () => {
      const { result } = renderHook(() =>
        useCalendarView(createConfig({ view: "month", monthMode: "bar" })),
      );
      const weekBars = result.current.monthGrid?.weekBars;
      expect(weekBars).toBeDefined();
      expect(weekBars?.length).toBeGreaterThan(0);
      // At least one week should have bars (events are on 2026-03-28)
      const hasNonEmpty = weekBars?.some((bars) => bars.length > 0);
      expect(hasNonEmpty).toBe(true);
    });

    it("does not calculate bars in list mode", () => {
      const { result } = renderHook(() =>
        useCalendarView(createConfig({ view: "month", monthMode: "list" })),
      );
      expect(result.current.monthGrid?.weekBars).toBeUndefined();
    });

    it("totalMainSize is 0 for month view", () => {
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "month" })));
      expect(result.current.totalMainSize).toBe(0);
    });

    it("timeSlots is empty for month view", () => {
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "month" })));
      expect(result.current.timeSlots).toHaveLength(0);
    });
  });

  // ─── getEventStyle ───

  describe("getEventStyle", () => {
    it("returns valid CSS properties", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));
      const col = result.current.columns[0];
      const layout = col.events[0];

      const style = result.current.getEventStyle(layout, 0, 1);

      expect(style.position).toBe("absolute");
      expect(typeof style.top).toBe("number");
      expect(typeof style.height).toBe("number");
      expect(typeof style.left).toBe("string");
      expect(typeof style.width).toBe("string");
    });

    it("calculates correct left/width for single column", () => {
      const { result } = renderHook(() => useCalendarView(createConfig()));
      const col = result.current.columns[0];
      const e3 = findEvent(col.events, "e3");
      const style = result.current.getEventStyle(e3, 0, 1);

      expect(style.left).toBe("0%");
      expect(style.width).toBe("100%");
    });

    it("calculates correct left/width for week view multi-column", () => {
      const { result } = renderHook(() => useCalendarView(createConfig({ view: "week" })));
      const cols = result.current.columns;
      const satCol = cols[6];
      const e3 = findEvent(satCol.events, "e3");

      const style = result.current.getEventStyle(e3, 6, 7);
      const leftNum = Number.parseFloat(style.left as string);
      const widthNum = Number.parseFloat(style.width as string);
      expect(leftNum).toBeCloseTo((6 * 100) / 7, 5);
      expect(widthNum).toBeCloseTo(100 / 7, 5);
    });
  });
});
