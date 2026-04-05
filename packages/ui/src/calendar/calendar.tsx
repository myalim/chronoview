/**
 * Calendar — Connected component that wires hooks to presentational UI.
 *
 * Composes useDateNavigation + useTimelineFilter + useCalendarView + useNowIndicator
 * + useScrollToNow from @chronoview/react with CalendarView, TimeSidebar,
 * CalendarDayHeader, CalendarGridLines, CalendarNowIndicator, CalendarMonthGrid, EventCard.
 *
 * Three views: Day (single column), Week (7 columns), Month (date grid).
 * Month has two modes: "bar" (horizontal event bars) and "list" (event list per cell).
 *
 * Usage:
 *   <Calendar events={events} resources={resources} />
 *   <Calendar events={events} resources={resources} view="week" />
 *   <Calendar events={events} resources={resources} view="month" monthMode="list" />
 */

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  useDateNavigation,
  useTimelineFilter,
  useCalendarView,
  useNowIndicator,
  useScrollToNow,
} from "@chronoview/react";
import type {
  View,
  TimelineEvent,
  Resource,
  CellDurationConfig,
  StackMode,
  MonthMode,
  MonthBarLayout,
} from "@chronoview/core";
import {
  getDefaultAvailableViews,
  calculateDayRange,
  resolveColor,
} from "@chronoview/core";
import { startOfDay } from "date-fns";

import { CalendarShell } from "./calendar-shell.js";
import { CalendarView } from "./calendar-view.js";
import { CalendarDayHeader, type DayHeaderCell } from "./calendar-day-header.js";
import { TimeSidebar } from "./time-sidebar.js";
import { CalendarGridLines } from "./calendar-grid-lines.js";
import { CalendarNowIndicator } from "./calendar-now-indicator.js";
import { CalendarMonthGrid, type MonthCellInfo } from "./calendar-month-grid.js";
import {
  EventCard,
  type EventCardProps,
  type EventCardSize,
} from "../schedule/event-card.js";
import { Toolbar } from "../common/toolbar.js";
import { FilterChips } from "../common/filter-chips.js";
import { useEventDetail } from "../schedule/use-event-detail.js";
import { EventTooltip } from "../schedule/event-tooltip.js";
import { EventPopover } from "../schedule/event-popover.js";
import { formatTime, formatTimeLabel } from "../utils/format-time.js";
import { DateDetailPopup } from "./date-detail-popup.js";
import { type CalendarLabels, resolveLabels } from "./calendar-labels.js";

// ─── Constants ───

/** Bar mode layout constants (shared with calendar-month.stories.tsx) */
const BAR_HEIGHT = 24;
const BAR_GAP = 4;
const DATE_NUMBER_HEIGHT = 28;
const COL_PCT = 100 / 7;

/** Boundary gap between sticky areas and floating elements */
const BOUNDARY_GAP = 12;

export interface CalendarProps<TData = unknown> {
  /** Event data */
  events: TimelineEvent<TData>[];
  /** Resource data (used for color/filtering only, not for rows) */
  resources: Resource[];

  // ─── View Configuration ───
  /** Initial view (default: "day") */
  view?: View;
  /** Initial start date for uncontrolled mode (default: today). Ignored when `date` is provided. */
  startDate?: Date;
  /** Controlled current date. When provided, Calendar delegates date state to the consumer. */
  date?: Date;
  /** Called when the displayed date changes (prev/next/goToDate). Required for controlled mode. */
  onDateChange?: (date: Date) => void;
  /** Per-view cell duration (day: minutes for slot height) */
  cellDuration?: CellDurationConfig;
  /** Week start day (0=Sun, 1=Mon) */
  weekStartsOn?: 0 | 1;
  /** Available views for ViewToggle (default: ["day","week","month"]) */
  availableViews?: View[];
  /** Calendar Month display mode (default: "bar") */
  monthMode?: MonthMode;
  /** Stack mode for Day/Week overlapping events (default: "auto") */
  stackMode?: StackMode;

  // ─── Features ───
  /** Show now indicator in Day/Week (default: true) */
  showNowIndicator?: boolean;
  /** Show toolbar with date nav + view toggle (default: true) */
  showToolbar?: boolean;
  /** Show filter chips panel (default: false) */
  showFilter?: boolean;
  /** Show empty label in Month cells with no events (default: false) */
  showEmptyLabel?: boolean;
  /** Customizable text labels for i18n support. Partial overrides merge with Korean defaults. */
  labels?: Partial<CalendarLabels>;

  // ─── Custom Rendering ───
  /** Per-event EventCard props override (Day/Week views). Merges with computed defaults. */
  eventProps?: (
    event: TimelineEvent<TData>,
  ) => Partial<Omit<EventCardProps, "style">>;
  /**
   * Custom month cell content (replaces default bar/list rendering).
   * When provided, renderWeekOverlay (bar overlays) is also suppressed.
   */
  renderMonthCell?: (
    date: Date,
    events: TimelineEvent<TData>[],
    info: MonthCellInfo,
  ) => ReactNode;

  // ─── Event Detail ───
  /** Render custom content inside the click popover. */
  renderEventDetail?: (
    event: TimelineEvent<TData>,
    helpers: { close: () => void },
  ) => ReactNode;
  /** Disable the built-in hover tooltip. Default: false. */
  disableTooltip?: boolean;

  // ─── Event Handlers ───
  onEventClick?: (event: TimelineEvent<TData>) => void;
  onEventHover?: (event: TimelineEvent<TData>) => void;
  onViewChange?: (view: View) => void;

  // ─── Style ───
  /** Event card size preset (Day/Week views). Default: "md". */
  eventSize?: EventCardSize;
  /** Theme override. Default: follows system preference. */
  theme?: "light" | "dark";
  className?: string;
}

export function Calendar<TData = unknown>({
  events,
  resources,
  view: initialView = "day",
  startDate,
  date,
  onDateChange,
  cellDuration,
  weekStartsOn = 0,
  availableViews,
  monthMode = "bar",
  stackMode,
  showNowIndicator = true,
  showToolbar = true,
  showFilter = false,
  showEmptyLabel = false,
  labels: labelOverrides,
  eventProps,
  renderMonthCell,
  renderEventDetail,
  disableTooltip = false,
  onEventClick,
  onEventHover,
  onViewChange,
  eventSize,
  theme,
  className,
}: CalendarProps<TData>) {
  // ─── Labels (i18n) ───
  const labels = useMemo(() => resolveLabels(labelOverrides), [labelOverrides]);
  // ─── View State ───
  const [currentView, setCurrentView] = useState<View>(initialView);

  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  const handleViewChange = useCallback(
    (v: View) => {
      setCurrentView(v);
      onViewChange?.(v);
    },
    [onViewChange],
  );

  // ─── Date Navigation ───
  const { currentDate, goToPrev, goToNext, goToDate, goToToday } =
    useDateNavigation({
      initialDate: startDate,
      date,
      onDateChange,
      view: currentView,
    });

  // ─── Filter ───
  const {
    filteredEvents,
    filteredResources,
    filter,
    toggleResource,
    selectAllResources,
    deselectAllResources,
  } = useTimelineFilter({ events, resources });

  // ─── Calendar Layout ───
  const {
    columns,
    monthGrid,
    timeSlots,
    totalMainSize,
    contentSize,
    slotHeight,
    contentOffset,
    getEventStyle,
  } = useCalendarView({
    events: filteredEvents as TimelineEvent[],
    resources: filteredResources,
    view: currentView,
    layout: "calendar",
    cellDuration,
    stackMode,
    monthMode,
    startDate: currentDate,
    weekStartsOn,
  });

  // ─── Now Indicator (Day/Week only) ───
  // Calendar time axis is a single day — uses today's dayRange, not the full week/month dateRange.
  // Recalculates when the date portion changes (render-time only; no automatic midnight refresh).
  const today = new Date();
  const todayDateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  // biome-ignore lint/correctness/useExhaustiveDependencies: todayDateKey ensures recalculation when the date portion changes
  const todayDayRange = useMemo(() => calculateDayRange(new Date()), [todayDateKey]);
  const { position: rawNowPosition } = useNowIndicator({
    rangeStart: todayDayRange.start,
    rangeEnd: todayDayRange.end,
    totalSize: contentSize,
    enabled: showNowIndicator && currentView !== "month",
  });
  const nowPosition = rawNowPosition != null ? rawNowPosition + contentOffset : null;

  // ─── Container Ref (popover boundary + scrollToNow target) ───
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Scroll to Now (Day/Week only, auto on mount) ───
  useScrollToNow({
    containerRef,
    rangeStart: todayDayRange.start,
    rangeEnd: todayDayRange.end,
    totalSize: contentSize,
    contentOffset,
    direction: "vertical",
    scrollOnMount: currentView !== "month",
  });

  // ─── Layout Insets (floating-ui boundaryPadding) ───
  const layoutInsetsRef = useRef({ sidebarWidth: 0, headerHeight: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const styles = getComputedStyle(el);
    layoutInsetsRef.current = {
      sidebarWidth:
        parseFloat(
          styles.getPropertyValue("--cv-size-calendar-sidebar-width"),
        ) || 0,
      headerHeight:
        parseFloat(
          styles.getPropertyValue("--cv-size-time-header-height"),
        ) || 0,
    };
  }, []);

  // ─── Event Detail (tooltip/popover) ───
  const detail = useEventDetail<TData>({
    tooltipEnabled: !disableTooltip,
    popoverEnabled: !!renderEventDetail,
  });

  // ─── Month list mode popup state ───
  const [popupDate, setPopupDate] = useState<Date | null>(null);

  // Reset popup when view/date changes — intentional extra deps to
  // clear popup on navigation, not just on setter identity change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentView and currentDate are intentional triggers
  useEffect(() => {
    setPopupDate(null);
  }, [currentView, currentDate]);

  // ─── Derived Data ───
  const resourceNameMap = useMemo(
    () => new Map(resources.map((r) => [r.id, r.title])),
    [resources],
  );

  /** Resolve event color: event.color → resource.color → DEFAULT_EVENT_COLOR */
  const resourceColorMap = useMemo(
    () => new Map(resources.map((r) => [r.id, r.color])),
    [resources],
  );
  const resolveEventColor = (e: TimelineEvent) =>
    resolveColor({ eventColor: e.color, resourceColor: resourceColorMap.get(e.resourceId) });

  const themeClass = theme ?? undefined;

  const selectedResourceIds =
    filter.resourceIds ?? resources.map((r) => r.id);

  const resolvedAvailableViews =
    availableViews ?? getDefaultAvailableViews("calendar");

  // ─── Boundary Padding ───
  const { sidebarWidth, headerHeight } = layoutInsetsRef.current;
  const headerHeightPx =
    currentView === "week" ? headerHeight * 2 : headerHeight;

  const boundaryPadding = {
    left: sidebarWidth + BOUNDARY_GAP,
    top: headerHeightPx + BOUNDARY_GAP,
    right: BOUNDARY_GAP,
    bottom: BOUNDARY_GAP,
  };

  // ─── Shared sub-components ───
  const toolbar = showToolbar ? (
    <Toolbar
      currentDate={currentDate}
      view={currentView}
      layout="calendar"
      onPrev={goToPrev}
      onNext={goToNext}
      onToday={goToToday}
      onGoToDate={goToDate}
      weekStartsOn={weekStartsOn}
      onViewChange={handleViewChange}
      availableViews={resolvedAvailableViews}
    />
  ) : undefined;

  const filterPanel = showFilter ? (
    <FilterChips
      resources={resources}
      selectedIds={selectedResourceIds}
      onToggle={toggleResource}
      onSelectAll={selectAllResources}
      onDeselectAll={deselectAllResources}
    />
  ) : undefined;

  // ─── Month View ───
  if (currentView === "month" && monthGrid) {
    // MonthCellLayout[][] → Date[][] (CalendarMonthGrid expects Date[][])
    const gridDates = monthGrid.weeks.map((week) =>
      week.map((cell) => cell.date),
    );

    // Build a map of cell data for quick lookup in renderCellContent
    const cellMap = new Map<string, (typeof monthGrid.weeks)[0][0]>();
    for (const week of monthGrid.weeks) {
      for (const cell of week) {
        cellMap.set(dateKey(cell.date), cell);
      }
    }

    // All events visible in the current month grid (for the detail list below)
    const gridStart = gridDates[0][0];
    const gridEnd = gridDates[gridDates.length - 1][6];
    const gridEvents = (filteredEvents as TimelineEvent<TData>[]).filter(
      (e) => {
        const eStart = startOfDay(e.start).getTime();
        const eEnd = startOfDay(e.end).getTime();
        return eStart <= gridEnd.getTime() && eEnd >= gridStart.getTime();
      },
    );

    return (
      <CalendarShell toolbar={toolbar} filterPanel={filterPanel} theme={theme} className={className}>
        <div className="relative mt-3">
          <CalendarMonthGrid
            weeks={gridDates}
            currentMonth={currentDate.getMonth()}
            today={monthGrid.todayDate ?? undefined}
            showEmptyLabel={showEmptyLabel}
            emptyLabel={labels.empty}
            weekdayLabels={labels.weekdays}
            hasEvents={(d) => {
              const cell = cellMap.get(dateKey(d));
              return cell ? cell.events.length > 0 : false;
            }}
            renderWeekOverlay={
              renderMonthCell || monthMode !== "bar" || !monthGrid.weekBars
                ? undefined
                : (_weekDates, weekIndex) => {
                    const bars = monthGrid.weekBars?.[weekIndex];
                    if (!bars || bars.length === 0) return null;
                    return renderBarOverlay(bars, weekIndex);
                  }
            }
            renderCellContent={(cellDate, info) => {
              const cell = cellMap.get(dateKey(cellDate));
              const cellEvents = (cell?.events ?? []) as TimelineEvent<TData>[];

              if (renderMonthCell) {
                return renderMonthCell(cellDate, cellEvents, info);
              }

              if (!info.isCurrentMonth) return null;

              // Bar mode: reserve vertical space for the bar overlay
              if (monthMode === "bar" && monthGrid.weekBars) {
                const bars = monthGrid.weekBars[cell?.weekIndex ?? 0] ?? [];
                const maxRows = bars.length > 0 ? Math.max(...bars.map((b) => b.row)) + 1 : 0;
                const spacerHeight =
                  maxRows > 0 ? maxRows * (BAR_HEIGHT + BAR_GAP) : 0;
                if (spacerHeight === 0) return null;
                return <div style={{ height: spacerHeight }} />;
              }

              // List mode: use visibleEvents/hiddenCount computed by the hook
              if (cellEvents.length === 0) return null;
              const visible = cell?.visibleEvents ?? [];
              const { hiddenCount } = cell ?? { hiddenCount: 0 };

              return (
                <div className="flex flex-col gap-0.5">
                  {visible.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-1 min-w-0"
                    >
                      <span
                        className="shrink-0 w-2 h-2 rounded-full"
                        style={{ background: resolveEventColor(e) }}
                      />
                      <span className="truncate text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]">
                        {formatTime(e.start)}
                      </span>
                      <span className="truncate text-[length:var(--cv-font-size-sm)] text-[var(--cv-color-text)]">
                        {e.title}
                      </span>
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      className="text-left text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-today-border)] hover:underline cursor-pointer"
                      onClick={() => setPopupDate(cellDate)}
                    >
                      {labels.moreEvents(hiddenCount)}
                    </button>
                  )}
                </div>
              );
            }}
          />

          {/* List mode: date detail popup */}
          {monthMode === "list" && popupDate && (
            <DateDetailPopup
              date={popupDate}
              events={eventsOnDate(
                filteredEvents as TimelineEvent<TData>[],
                popupDate,
              )}
              onClose={() => setPopupDate(null)}
              resolveColor={resolveEventColor}
              formatHeader={labels.formatPopupHeader}
              closeLabel={labels.close}
            />
          )}
        </div>

        {/* Bar mode: detail event list below the grid */}
        {monthMode === "bar" && gridEvents.length > 0 && (
          <div className="mt-[var(--cv-spacing-lg)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] p-[var(--cv-spacing-lg)]">
            <h3 className="text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-bold)] text-[var(--cv-color-text-secondary)] mb-[var(--cv-spacing-sm)]">
              {labels.eventListTitle}
            </h3>
            <div className="flex flex-col gap-[var(--cv-spacing-sm)]">
              {gridEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-[var(--cv-spacing-sm)]"
                >
                  <span
                    className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                    style={{ background: resolveEventColor(e) }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-medium)]">
                      {e.title}
                    </div>
                    <div className="text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]">
                      {labels.formatDate(e.start)} {formatTime(e.start)} –{" "}
                      {labels.formatDate(e.end)} {formatTime(e.end)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CalendarShell>
    );
  }

  // ─── Day/Week View ───

  // Week: day header cells
  const dayHeaderCells: DayHeaderCell[] =
    currentView === "week"
      ? columns.map((col) => ({
          label: `${labels.weekdays[col.dayOfWeek]} ${col.date.getMonth() + 1}/${col.date.getDate()}`,
          isToday: col.isToday,
        }))
      : [];

  // Find today column index for Week view
  const todayColumnIndex = columns.findIndex((col) => col.isToday);
  const colWidthPct = columns.length > 0 ? 100 / columns.length : 100;

  const sidebar = (
    <TimeSidebar
      timeSlots={timeSlots}
      slotHeight={slotHeight}
      totalHeight={totalMainSize}
      offsetTop={contentOffset}
    />
  );

  const header =
    currentView === "week" ? (
      <CalendarDayHeader dates={dayHeaderCells} />
    ) : undefined;

  const body = (
    <>
      <CalendarGridLines
        slotCount={timeSlots.length}
        slotHeight={slotHeight}
        crossSize="100%"
        offsetTop={contentOffset}
      />

      {/* Content area top/bottom border lines (Google Calendar style) */}
      {contentOffset > 0 && (
        <>
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{ top: contentOffset, height: 1, background: "var(--cv-color-border)" }}
          />
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{ top: contentOffset + timeSlots.length * slotHeight, height: 1, background: "var(--cv-color-border)" }}
          />
        </>
      )}

      {/* Week: today column highlight */}
      {currentView === "week" && todayColumnIndex >= 0 && (
        <div
          className="absolute top-0 bottom-0 bg-[var(--cv-color-today-bg)] pointer-events-none"
          style={{
            left: `${todayColumnIndex * colWidthPct}%`,
            width: `${colWidthPct}%`,
          }}
        />
      )}

      {/* Week: column dividers */}
      {currentView === "week" &&
        columns.slice(1).map((col, i) => {
          const colIdx = i + 1;
          return (
            <div
              key={`col-divider-${col.date.getTime()}`}
              className="absolute top-0 bottom-0 w-px bg-[var(--cv-color-border)] pointer-events-none"
              style={{ left: `${colIdx * colWidthPct}%` }}
            />
          );
        })}

      {/* Event cards */}
      {columns.flatMap((col, colIdx) =>
        col.events.map((eventLayout) => {
          const event = eventLayout.event as TimelineEvent<TData>;
          const style = getEventStyle(eventLayout, colIdx, columns.length);
          const color = eventLayout.color;

          const overrides = eventProps?.(event);
          const hasCustomClick = !!overrides?.onClick;

          const handleClick = hasCustomClick
            ? overrides.onClick
            : (element: HTMLDivElement) => {
                onEventClick?.(event);
                detail.handleClick(event, element);
              };

          const handleMouseEnter = hasCustomClick
            ? overrides?.onMouseEnter
            : (element: HTMLDivElement) => {
                onEventHover?.(event);
                detail.handleMouseEnter(event, element);
              };

          const handleMouseLeave = hasCustomClick
            ? overrides?.onMouseLeave
            : () => {
                detail.handleMouseLeave();
              };

          if (overrides?.title || overrides?.subtitle || overrides?.children) {
            return (
              <EventCard
                key={event.id}
                title={overrides?.title ?? event.title}
                subtitle={overrides?.subtitle ?? formatTimeLabel(event.start, event.end)}
                color={overrides?.color ?? color}
                size={overrides?.size ?? eventSize}
                style={style}
                className={overrides?.className}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {overrides?.children}
              </EventCard>
            );
          }

          const durationMs = event.end.getTime() - event.start.getTime();
          const durationMin = durationMs / 60000;
          const timeLabel = formatTimeLabel(event.start, event.end);
          const isCompact = durationMin <= 45;

          return (
            <EventCard
              key={event.id}
              title={event.title}
              color={overrides?.color ?? color}
              style={style}
              className={overrides?.className}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="shrink-0" style={{ width: 3, background: overrides?.color ?? color }} />
              {/* Opaque tint background ensures text readability in both light and dark modes */}
              <div
                className="flex flex-col justify-start flex-1 min-w-0 overflow-hidden px-2 py-0.5"
                style={{
                  background: `linear-gradient(${overrides?.color ?? color}1f, ${overrides?.color ?? color}1f), var(--cv-color-bg)`,
                }}
              >
                {isCompact ? (
                  <span className="truncate text-[length:var(--cv-font-size-xs)] font-[var(--cv-font-weight-medium)]">
                    {event.title}
                    <span className="font-normal text-[var(--cv-color-text-secondary)]">
                      {`, ${timeLabel}`}
                    </span>
                  </span>
                ) : (
                  <>
                    <span className="truncate text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-medium)]">
                      {event.title}
                    </span>
                    <span className="truncate text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]">
                      {timeLabel}
                    </span>
                  </>
                )}
              </div>
            </EventCard>
          );
        }),
      )}

      {/* Now indicator */}
      {currentView === "day" && nowPosition != null && (
        <CalendarNowIndicator position={nowPosition} crossSize="100%" />
      )}
      {currentView === "week" && todayColumnIndex >= 0 && nowPosition != null && (
        <div
          className="absolute pointer-events-none overflow-visible"
          style={{
            left: `${todayColumnIndex * colWidthPct}%`,
            width: `${colWidthPct}%`,
            top: 0,
            bottom: 0,
          }}
        >
          <CalendarNowIndicator position={nowPosition} crossSize="100%" />
        </div>
      )}

      {/* Hover tooltip */}
      {detail.tooltipEvent && detail.tooltipReference && (
        <EventTooltip
          event={detail.tooltipEvent}
          resourceName={
            resourceNameMap.get(detail.tooltipEvent.resourceId) ?? ""
          }
          reference={detail.tooltipReference}
          themeClass={themeClass}
          boundary={containerRef.current ?? undefined}
          boundaryPadding={boundaryPadding}
        />
      )}

      {/* Click popover */}
      {renderEventDetail && detail.popoverEvent && detail.popoverReference && (
        <EventPopover
          reference={detail.popoverReference}
          onClose={detail.closePopover}
          themeClass={themeClass}
          boundary={containerRef.current ?? undefined}
          boundaryPadding={boundaryPadding}
        >
          {renderEventDetail(detail.popoverEvent, {
            close: detail.closePopover,
          })}
        </EventPopover>
      )}
    </>
  );

  return (
    <CalendarView
      sidebar={sidebar}
      body={body}
      totalMainSize={totalMainSize}
      header={header}
      headerHeight={
        currentView === "week"
          ? "var(--cv-size-time-header-height)"
          : undefined
      }
      toolbar={toolbar}
      filterPanel={filterPanel}
      containerRef={containerRef}
      theme={theme}
      className={className}
    />
  );
}

// ─── Helpers ───

/** Create a unique key for a date (for Map lookup) */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Filter events that overlap a specific date (end-exclusive, consistent with buildMonthCellLayouts) */
function eventsOnDate<TData>(
  events: TimelineEvent<TData>[],
  date: Date,
): TimelineEvent<TData>[] {
  const dayStart = startOfDay(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return events.filter((e) => e.end > dayStart && e.start < dayEnd);
}

/** Render bar overlay for a week (bar mode) */
function renderBarOverlay(
  bars: MonthBarLayout[],
  weekIndex: number,
): ReactNode {
  return (
    <div
      className="absolute inset-x-0 pointer-events-none"
      style={{ top: DATE_NUMBER_HEIGHT }}
    >
      {bars.map((bar) => {
        const left = bar.startColumn * COL_PCT;
        const width = (bar.endColumn - bar.startColumn + 1) * COL_PCT;
        const top = bar.row * (BAR_HEIGHT + BAR_GAP);

        return (
          <div
            key={`${bar.event.id}-w${weekIndex}`}
            className="absolute flex items-center overflow-hidden rounded-[var(--cv-radius-sm)] pointer-events-auto"
            style={{
              left: `calc(${left}% + 2px)`,
              width: `calc(${width}% - 4px)`,
              top,
              height: BAR_HEIGHT,
              background: `${bar.color}33`,
            }}
          >
            <span className="truncate px-[var(--cv-spacing-xs)] text-[length:var(--cv-font-size-sm)] text-[var(--cv-color-text)]">
              {bar.event.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

