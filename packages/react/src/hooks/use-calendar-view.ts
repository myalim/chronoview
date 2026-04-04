import { type CSSProperties, useMemo } from "react";
import {
  type CalendarMonthLayoutResult,
  type DayColumnLayout,
  type EventLayout,
  type MonthBarLayout,
  type Position,
  type TimeSlot,
  type TimelineConfig,
  buildMonthCellLayouts,
  calculateAutoStacks,
  calculateBarStacks,
  calculateDayRange,
  calculateEventPosition,
  calculateMonthGrid,
  calculateMonthRange,
  calculateWeekRange,
  detectOverlaps,
  generateTimeSlots,
  getCellConfig,
  resolveColor,
} from "@chronoview/core";

/** Default max visible events per cell in month list mode */
const DEFAULT_MAX_VISIBLE = 3;

/** Calendar slot height in px — Google Calendar style (~60px/hour) */
const CALENDAR_SLOT_HEIGHT = 60;

/** Number of empty padding slots above/below the time grid (Google Calendar style) */
const PADDING_SLOTS = 1;

export interface UseCalendarViewReturn {
  /** Day/Week: date-keyed columns with positioned events. Empty for month. */
  columns: DayColumnLayout[];
  /** Month: layout result with week×day grid + optional bars. null for day/week. */
  monthGrid: CalendarMonthLayoutResult | null;
  /** Time slots for day/week (shared across columns). Empty for month. */
  timeSlots: TimeSlot[];
  /** Total main axis size in px (height for day/week, includes padding) */
  totalMainSize: number;
  /** Slot height in px (Calendar: 60px per hour) */
  slotHeight: number;
  /** Padding offset above content area (1 slot height) — grid lines/sidebar labels start here */
  contentOffset: number;
  /** Generate CSS style for a calendar event (day/week only) */
  getEventStyle: (layout: EventLayout, columnIndex: number, totalColumns: number) => CSSProperties;
}

/**
 * Calendar layout hook — computes day columns (day/week) or month grid (month).
 *
 * Pure `useMemo` computation, no internal state.
 * Follows the same pattern as `useScheduleView`:
 * - Hook owns ALL layout computation (positions, stacking, bars, truncation)
 * - Component only manages state + renders UI
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

  // Calendar slot height and padding (Google Calendar style)
  const slotHeight = CALENDAR_SLOT_HEIGHT;
  const contentOffset = view === "month" ? 0 : PADDING_SLOTS * slotHeight;

  // Content area (event positions) + padding above/below
  const contentSize = timeSlots.length * slotHeight;
  const totalMainSize = view === "month" ? 0 : contentSize + 2 * contentOffset;

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
        // "none" or "vertical": no stacking
        return group.events.map((event) => ({
          event,
          lane: 0,
          totalLanes: 1,
          spanColumns: 1,
        }));
      });

      // Build EventLayout for each stacked event
      const eventLayouts: EventLayout[] = stackedEvents.map((se) => {
        // Event positions are relative to the content area, then offset by padding
        const { mainOffset, mainSize } = calculateEventPosition({
          event: se.event,
          rangeStart: dayRange.start,
          rangeEnd: dayRange.end,
          totalMainSize: contentSize,
        });

        const position: Position = {
          mainOffset: mainOffset + contentOffset,
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
  }, [view, dateRange, visibleEvents, contentSize, contentOffset, stackMode, resourceColorMap]);

  // ─── Month: grid layout (delegates to pure functions) ───
  const monthGrid = useMemo((): CalendarMonthLayoutResult | null => {
    if (view !== "month") return null;

    const date = startDate ?? new Date();
    const grid = calculateMonthGrid(date, weekStartsOn);
    const today = new Date();
    const currentMonth = date.getMonth();

    // 셀 레이아웃: 날짜별 이벤트 필터 + truncation
    const weeks = buildMonthCellLayouts(
      grid, visibleEvents, currentMonth, DEFAULT_MAX_VISIBLE, today,
    );

    // Bar 레이아웃: 주별 bar stacking (calculateBarStacks 직접 호출)
    let weekBars: MonthBarLayout[][] | undefined;
    if (monthMode === "bar") {
      weekBars = grid.map((weekDates) => {
        const weekStart = weekDates[0];
        const weekEnd = new Date(
          weekDates[6].getFullYear(),
          weekDates[6].getMonth(),
          weekDates[6].getDate() + 1,
        );
        const weekEvents = visibleEvents.filter(
          (e) => e.end > weekStart && e.start < weekEnd,
        );
        return calculateBarStacks(weekEvents, weekDates);
      });
    }

    const todayDate =
      today.getMonth() === currentMonth &&
      today.getFullYear() === date.getFullYear()
        ? today
        : null;

    return { weeks, weekBars, todayDate };
  }, [view, startDate, weekStartsOn, visibleEvents, monthMode]);

  // ─── Style factory ───
  // indent 겹침 방식 (Google Calendar 스타일):
  // lane = depth, totalLanes = maxDepth + 1
  // depth가 높을수록 오른쪽으로 들여쓰기 + 높은 z-index (전면 노출)
  const getEventStyle = useMemo(() => {
    return (layout: EventLayout, columnIndex: number, totalColumns: number): CSSProperties => {
      const colWidthPct = 100 / totalColumns;
      const maxDepth = layout.totalLanes - 1;
      // indent 비율: 겹침 없으면 0, 있으면 열 너비를 (maxDepth + 1.5)로 분할
      const indentPct = maxDepth > 0 ? colWidthPct / (maxDepth + 1.5) : 0;
      const leftPct = columnIndex * colWidthPct + layout.lane * indentPct;
      const widthPct = colWidthPct - layout.lane * indentPct;

      return {
        position: "absolute" as const,
        top: layout.position.mainOffset,
        height: Math.max(20, layout.position.mainSize),
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        zIndex: 20 + layout.lane,
      };
    };
  }, []);

  return {
    columns,
    monthGrid,
    timeSlots,
    totalMainSize,
    slotHeight,
    contentOffset,
    getEventStyle,
  };
}
