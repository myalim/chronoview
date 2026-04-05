/**
 * useScheduleView — Schedule layout orchestrator hook.
 *
 * Takes TimelineConfig and computes the full layout:
 * rows, time slots, event positions, row heights.
 * Does NOT manage navigation, filter, or now indicator — those are injected externally.
 */

import { useMemo, type CSSProperties } from "react";
import {
  getAxisConfig,
  calculateDayRange,
  calculateWeekRange,
  generateTimeSlots,
  calculateEventPosition,
  detectOverlaps,
  calculateVerticalStacks,
  calculateRowHeight,
  resolveColor,
  toPhysicalPosition,
  getCellConfig,
} from "@chronoview/core";
import type {
  TimelineConfig,
  AxisConfig,
  DateRange,
  TimeSlot,
  RowLayout,
  EventLayout,
  Position,
} from "@chronoview/core";

export interface UseScheduleViewReturn {
  rows: RowLayout[];
  timeSlots: TimeSlot[];
  axisConfig: AxisConfig;
  dateRange: DateRange;
  totalMainSize: number;
  totalCrossSize: number;
  getEventStyle: (layout: EventLayout) => CSSProperties;
  getRowStyle: (row: RowLayout) => CSSProperties;
}

const SCHEDULE_AXIS_CONFIG = getAxisConfig("schedule");
const DEFAULT_EVENT_HEIGHT = 36;
const DEFAULT_EVENT_GAP = 4;
const DEFAULT_MIN_ROW_HEIGHT = 48;
const DEFAULT_ROW_PADDING = 4;

export function useScheduleView(config: TimelineConfig): UseScheduleViewReturn {
  const {
    events,
    resources,
    view,
    cellDuration,
    startDate,
    weekStartsOn = 0,
    eventHeight = DEFAULT_EVENT_HEIGHT,
  } = config;

  const cellConfig = useMemo(() => getCellConfig(view, cellDuration), [view, cellDuration]);
  const axisConfig = SCHEDULE_AXIS_CONFIG;

  const dateRange = useMemo(() => {
    const date = startDate ?? new Date();
    if (view === "week") return calculateWeekRange(date, weekStartsOn);
    if (view === "month") {
      // Schedule Month uses actual month boundaries (not calendar-padded range).
      // calculateMonthRange pads to full weeks for Calendar Month grid,
      // but Schedule shows day-columns for only the target month.
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
      return { start: monthStart, end: monthEnd };
    }
    return calculateDayRange(date);
  }, [view, startDate, weekStartsOn]);

  const timeSlots = useMemo(() => {
    if (view === "month") return [];
    return generateTimeSlots({
      startTime: dateRange.start,
      endTime: dateRange.end,
      intervalMinutes: cellConfig.intervalMinutes,
    });
  }, [view, dateRange, cellConfig.intervalMinutes]);

  const totalMainSize = useMemo(() => {
    if (view === "month") {
      const days = Math.round(
        (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
      );
      return days * cellConfig.cellWidthPx;
    }
    return timeSlots.length * cellConfig.cellWidthPx;
  }, [view, timeSlots, dateRange, cellConfig.cellWidthPx]);

  // Filter events to only those overlapping with dateRange to prevent overflow rendering
  const visibleEvents = useMemo(
    () => events.filter((e) => e.end > dateRange.start && e.start < dateRange.end),
    [events, dateRange],
  );

  // Build row layouts: group events by resource, detect overlaps, stack, position
  const rows = useMemo(() => {
    let crossOffset = 0;

    return resources.map((resource) => {
      const resourceEvents = visibleEvents.filter((e) => e.resourceId === resource.id);

      // Detect overlaps and assign lanes via vertical stacking
      const groups = detectOverlaps(resourceEvents);
      const stackedEvents = groups.flatMap((group) => calculateVerticalStacks(group));

      // Calculate max stack count for row height
      const maxStack =
        stackedEvents.length > 0 ? Math.max(...stackedEvents.map((se) => se.lane + 1)) : 0;

      const height = calculateRowHeight({
        maxStackCount: maxStack,
        eventHeight,
        eventGap: DEFAULT_EVENT_GAP,
        minRowHeight: DEFAULT_MIN_ROW_HEIGHT,
        padding: DEFAULT_ROW_PADDING,
      });

      // Build EventLayout for each stacked event
      const eventLayouts: EventLayout[] = stackedEvents.map((se) => {
        const { mainOffset, mainSize } = calculateEventPosition({
          event: se.event,
          rangeStart: dateRange.start,
          rangeEnd: dateRange.end,
          totalMainSize,
        });

        const position: Position = {
          mainOffset,
          mainSize,
          crossOffset:
            crossOffset +
            DEFAULT_ROW_PADDING +
            se.lane * (eventHeight + DEFAULT_EVENT_GAP),
          crossSize: eventHeight,
        };

        const color = resolveColor({
          eventColor: se.event.color,
          resourceColor: resource.color,
        });

        return {
          event: se.event,
          position,
          lane: se.lane,
          totalLanes: se.totalLanes,
          color,
        };
      });

      const row: RowLayout = {
        resource,
        events: eventLayouts,
        height,
        crossOffset,
        crossSize: height,
      };

      crossOffset += height;
      return row;
    });
  }, [resources, visibleEvents, dateRange, totalMainSize, eventHeight]);

  const totalCrossSize = useMemo(() => rows.reduce((sum, r) => sum + r.height, 0), [rows]);

  const getEventStyle = useMemo(() => {
    return (layout: EventLayout): CSSProperties => {
      const physical = toPhysicalPosition(layout.position, axisConfig);
      return {
        position: "absolute",
        left: physical.x,
        top: physical.y,
        width: physical.width,
        height: physical.height,
      };
    };
  }, []);

  const getRowStyle = useMemo(() => {
    return (row: RowLayout): CSSProperties => ({
      height: row.height,
    });
  }, []);

  return {
    rows,
    timeSlots,
    axisConfig,
    dateRange,
    totalMainSize,
    totalCrossSize,
    getEventStyle,
    getRowStyle,
  };
}
