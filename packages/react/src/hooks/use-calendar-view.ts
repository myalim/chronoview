import { type CSSProperties, useMemo } from "react";
import {
  type AxisConfig,
  type CalendarMonthLayoutResult,
  type DateRange,
  type DayColumnLayout,
  type EventLayout,
  type MonthBarLayout,
  type MonthCellLayout,
  type Position,
  type TimeSlot,
  type TimelineConfig,
  calculateAutoStacks,
  calculateBarStacks,
  calculateDayRange,
  calculateEventPosition,
  calculateHorizontalStacks,
  calculateMonthGrid,
  calculateMonthRange,
  calculateWeekRange,
  detectOverlaps,
  generateTimeSlots,
  getAxisConfig,
  getCellConfig,
  resolveColor,
  truncateEvents,
} from "@chronoview/core";

// Calendar uses vertical main axis (time flows top → bottom)
const CALENDAR_AXIS_CONFIG = getAxisConfig("calendar");

/** Default max visible events per cell in month list mode */
const DEFAULT_MAX_VISIBLE = 3;

export interface UseCalendarViewReturn {
  /** Day/Week: date-keyed columns with positioned events. Empty for month. */
  columns: DayColumnLayout[];
  /** Month: layout result with week×day grid + optional bars. null for day/week. */
  monthGrid: CalendarMonthLayoutResult | null;
  /** Time slots for day/week (shared across columns). Empty for month. */
  timeSlots: TimeSlot[];
  /** Axis config (calendar: mainAxis=vertical, crossAxis=horizontal) */
  axisConfig: AxisConfig;
  /** Computed date range */
  dateRange: DateRange;
  /** Total main axis size in px (height for day/week) */
  totalMainSize: number;
  /** Generate CSS style for a calendar event (day/week only) */
  getEventStyle: (layout: EventLayout, columnIndex: number, totalColumns: number) => CSSProperties;
}

/**
 * Calendar layout hook — computes day columns (day/week) or month grid (month).
 *
 * Pure `useMemo` computation, no internal state.
 * Follows the same pattern as `useScheduleView`.
 */
export function useCalendarView(config: TimelineConfig): UseCalendarViewReturn {
  const {
    events,
    resources,
    view,
    cellDuration,
    stackMode,
    monthMode = "bar",
    startDate,
    weekStartsOn = 0,
  } = config;

  const axisConfig = CALENDAR_AXIS_CONFIG;

  // Calendar day/week both use day-level time slots (each column = one day)
  const cellConfig = useMemo(() => getCellConfig("day", cellDuration), [cellDuration]);

  const dateRange = useMemo(() => {
    const date = startDate ?? new Date();
    if (view === "week") return calculateWeekRange(date, weekStartsOn);
    if (view === "month") return calculateMonthRange(date, weekStartsOn);
    return calculateDayRange(date);
  }, [view, startDate, weekStartsOn]);

  // Time slots for a single day (used by both day and week views)
  const timeSlots = useMemo(() => {
    if (view === "month") return [];
    // Generate slots for a single day (all columns share the same time axis)
    const dayDate = startDate ?? new Date();
    const dayRange = calculateDayRange(dayDate);
    return generateTimeSlots({
      startTime: dayRange.start,
      endTime: dayRange.end,
      intervalMinutes: cellConfig.intervalMinutes,
    });
  }, [view, startDate, cellConfig.intervalMinutes]);

  // Total height of the time axis (day/week)
  const totalMainSize = useMemo(() => {
    if (view === "month") return 0;
    return timeSlots.length * cellConfig.cellWidthPx;
  }, [view, timeSlots, cellConfig.cellWidthPx]);

  // Filter events to dateRange to prevent overflow rendering
  const visibleEvents = useMemo(
    () => events.filter((e) => e.end > dateRange.start && e.start < dateRange.end),
    [events, dateRange],
  );

  // Build resource color map for resolveColor
  const resourceColorMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const r of resources) {
      map.set(r.id, r.color);
    }
    return map;
  }, [resources]);

  // ─── Day/Week: column-based layout ───
  const columns = useMemo((): DayColumnLayout[] => {
    if (view === "month") return [];

    const today = new Date();
    const resolvedStackMode = stackMode ?? "auto";

    // Generate day columns
    const dates: Date[] = [];
    if (view === "day") {
      dates.push(new Date(dateRange.start));
    } else {
      // week: 7 day columns
      const d = new Date(dateRange.start);
      while (d < dateRange.end) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    }

    return dates.map((date) => {
      // Per-day time range for event position calculation
      const dayRange = calculateDayRange(date);

      // Filter events for this day
      const dayEvents = visibleEvents.filter(
        (e) => e.end > dayRange.start && e.start < dayRange.end,
      );

      // Detect overlaps and stack
      const groups = detectOverlaps(dayEvents);
      const stackedEvents = groups.flatMap((group) => {
        if (resolvedStackMode === "auto") return calculateAutoStacks(group);
        if (resolvedStackMode === "horizontal") return calculateHorizontalStacks(group);
        // "none" or "vertical": no horizontal stacking
        return group.events.map((event) => ({
          event,
          lane: 0,
          totalLanes: 1,
          spanColumns: 1,
        }));
      });

      // Build EventLayout for each stacked event
      const eventLayouts: EventLayout[] = stackedEvents.map((se) => {
        const { mainOffset, mainSize } = calculateEventPosition({
          event: se.event,
          rangeStart: dayRange.start,
          rangeEnd: dayRange.end,
          totalMainSize,
        });

        const position: Position = {
          mainOffset,
          mainSize,
          crossOffset: 0, // Determined by lane in getEventStyle
          crossSize: 0,
        };

        const color = resolveColor({
          eventColor: se.event.color,
          resourceColor: resourceColorMap.get(se.event.resourceId),
          defaultColor: "#3b82f6",
        });

        return {
          event: se.event,
          position,
          lane: se.lane,
          totalLanes: se.totalLanes,
          color,
          spanColumns: se.spanColumns,
        };
      });

      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      return {
        date,
        dayOfWeek: date.getDay(),
        isToday,
        events: eventLayouts,
      };
    });
  }, [view, dateRange, visibleEvents, totalMainSize, stackMode, resourceColorMap]);

  // ─── Month: grid layout ───
  const monthGrid = useMemo((): CalendarMonthLayoutResult | null => {
    if (view !== "month") return null;

    const date = startDate ?? new Date();
    const grid = calculateMonthGrid(date, weekStartsOn);
    const today = new Date();
    const currentMonth = date.getMonth();
    const maxVisible = DEFAULT_MAX_VISIBLE;

    // Build MonthCellLayout for each cell
    const weeks: MonthCellLayout[][] = grid.map((weekDates) =>
      weekDates.map((cellDate) => {
        // Find events on this date
        const dayStart = new Date(
          cellDate.getFullYear(),
          cellDate.getMonth(),
          cellDate.getDate(),
          0,
          0,
          0,
          0,
        );
        const dayEnd = new Date(
          cellDate.getFullYear(),
          cellDate.getMonth(),
          cellDate.getDate() + 1,
          0,
          0,
          0,
          0,
        );

        const cellEvents = visibleEvents.filter((e) => e.end > dayStart && e.start < dayEnd);

        const truncated = truncateEvents({ events: cellEvents, maxVisible });

        const isToday =
          cellDate.getFullYear() === today.getFullYear() &&
          cellDate.getMonth() === today.getMonth() &&
          cellDate.getDate() === today.getDate();

        return {
          date: cellDate,
          isToday,
          isCurrentMonth: cellDate.getMonth() === currentMonth,
          events: cellEvents,
          visibleCount: truncated.visible.length,
          hiddenCount: truncated.hiddenCount,
        };
      }),
    );

    // Bar mode: calculate bar stacks per week
    let bars: MonthBarLayout[] | undefined;
    if (monthMode === "bar") {
      bars = grid.flatMap((weekDates) => {
        const weekEvents = visibleEvents.filter((e) => {
          const weekStart = weekDates[0];
          const weekEnd = new Date(
            weekDates[6].getFullYear(),
            weekDates[6].getMonth(),
            weekDates[6].getDate() + 1,
          );
          return e.end > weekStart && e.start < weekEnd;
        });
        return calculateBarStacks(weekEvents, weekDates);
      });
    }

    const todayDate =
      today.getMonth() === currentMonth &&
      today.getFullYear() === date.getFullYear()
        ? today
        : null;

    return { weeks, bars, todayDate };
  }, [view, startDate, weekStartsOn, visibleEvents, monthMode]);

  // ─── Style factory ───
  const getEventStyle = useMemo(() => {
    return (layout: EventLayout, columnIndex: number, totalColumns: number): CSSProperties => {
      // mainAxis=vertical: mainOffset → top, mainSize → height
      const colWidthPct = 100 / totalColumns;
      const laneWidthPct = colWidthPct / layout.totalLanes;
      const leftPct = columnIndex * colWidthPct + layout.lane * laneWidthPct;
      const widthPct = (layout.spanColumns ?? 1) * laneWidthPct;

      return {
        position: "absolute" as const,
        top: layout.position.mainOffset,
        height: Math.max(20, layout.position.mainSize),
        left: `${leftPct}%`,
        width: `${widthPct}%`,
      };
    };
  }, []);

  return {
    columns,
    monthGrid,
    timeSlots,
    axisConfig,
    dateRange,
    totalMainSize,
    getEventStyle,
  };
}
