/**
 * useScheduleView — Schedule layout orchestrator hook.
 *
 * Takes TimelineConfig and computes the full layout:
 * rows, time slots, event positions, row heights, now indicator.
 * Does NOT manage navigation or filter state — those are injected externally.
 */

import { useMemo, type CSSProperties } from "react";
import {
  getAxisConfig,
  calculateDayRange,
  calculateWeekRange,
  calculateMonthRange,
  generateTimeSlots,
  calculateEventPosition,
  detectOverlaps,
  calculateVerticalStacks,
  calculateRowHeight,
  resolveColor,
  calculateNowPosition,
  toPhysicalPosition,
} from "@chronoview/core";
import type {
  TimelineConfig,
  TimelineEvent,
  Resource,
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
  nowPosition: number | null;
}

const DEFAULT_SLOT_WIDTH = 120;
const DEFAULT_TIME_STEP = 30;
const DEFAULT_EVENT_HEIGHT = 36;
const DEFAULT_EVENT_GAP = 4;
const DEFAULT_MIN_ROW_HEIGHT = 48;
const DEFAULT_ROW_PADDING = 4;

export function useScheduleView(config: TimelineConfig): UseScheduleViewReturn {
  const {
    events,
    resources,
    view,
    timeStep = DEFAULT_TIME_STEP,
    startDate,
    showNowIndicator = true,
    weekStartsOn = 0,
  } = config;

  const axisConfig = useMemo(() => getAxisConfig("schedule"), []);

  const dateRange = useMemo(() => {
    const date = startDate ?? new Date();
    if (view === "week") return calculateWeekRange(date, weekStartsOn);
    if (view === "month") return calculateMonthRange(date, weekStartsOn);
    return calculateDayRange(date);
  }, [view, startDate, weekStartsOn]);

  const timeSlots = useMemo(() => {
    if (view === "month") return [];
    return generateTimeSlots({
      startTime: dateRange.start,
      endTime: dateRange.end,
      timeStep,
    });
  }, [view, dateRange, timeStep]);

  const totalMainSize = useMemo(() => {
    if (view === "month") {
      const days = Math.round(
        (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
      );
      return days * 40; // column width for month
    }
    return timeSlots.length * DEFAULT_SLOT_WIDTH;
  }, [view, timeSlots, dateRange]);

  // Build row layouts: group events by resource, detect overlaps, stack, position
  const rows = useMemo(() => {
    let crossOffset = 0;

    return resources.map((resource) => {
      const resourceEvents = events.filter((e) => e.resourceId === resource.id);

      // Detect overlaps and assign lanes via vertical stacking
      const groups = detectOverlaps(resourceEvents);
      const stackedEvents = groups.flatMap((group) => calculateVerticalStacks(group));

      // Calculate max stack count for row height
      const maxStack = stackedEvents.length > 0
        ? Math.max(...stackedEvents.map((se) => se.lane + 1))
        : 0;

      const height = calculateRowHeight({
        maxStackCount: maxStack,
        eventHeight: DEFAULT_EVENT_HEIGHT,
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
          crossOffset: crossOffset + DEFAULT_ROW_PADDING + se.lane * (DEFAULT_EVENT_HEIGHT + DEFAULT_EVENT_GAP),
          crossSize: DEFAULT_EVENT_HEIGHT,
        };

        const color = resolveColor({
          eventColor: se.event.color,
          resourceColor: resource.color,
          defaultColor: "#3b82f6",
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
  }, [resources, events, dateRange, totalMainSize]);

  const totalCrossSize = useMemo(
    () => rows.reduce((sum, r) => sum + r.height, 0),
    [rows],
  );

  const nowPosition = useMemo(() => {
    if (!showNowIndicator) return null;
    return calculateNowPosition({
      now: new Date(),
      rangeStart: dateRange.start,
      rangeEnd: dateRange.end,
      totalSize: totalMainSize,
    });
  }, [showNowIndicator, dateRange, totalMainSize]);

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
  }, [axisConfig]);

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
    nowPosition,
  };
}
