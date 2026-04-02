/**
 * Schedule — Connected component that wires hooks to presentational UI.
 *
 * Composes useDateNavigation + useTimelineFilter + useScheduleView from @chronoview/react
 * with ScheduleView, TimeHeader, ResourceSidebar, EventCard, GridLines, NowIndicator.
 *
 * Usage:
 *   <Schedule events={events} resources={resources} />
 *   <Schedule events={events} resources={resources} view="week" cellDuration={6} />
 */

import { useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  useDateNavigation,
  useTimelineFilter,
  useScheduleView,
  useNowIndicator,
} from "@chronoview/react";
import type {
  View,
  TimelineEvent,
  Resource,
  CellDurationConfig,
} from "@chronoview/core";
import { getDefaultAvailableViews } from "@chronoview/core";

import { ScheduleView } from "./schedule-view.js";
import { TimeHeader } from "./time-header.js";
import { ResourceSidebar } from "./resource-sidebar.js";
import {
  EventCard,
  type EventCardProps,
  type EventCardSize,
} from "./event-card.js";
import { NowIndicator } from "./now-indicator.js";
import { GridLines } from "./grid-lines.js";
import { cn } from "../utils/cn.js";
import { Toolbar } from "../common/toolbar.js";
import { FilterChips } from "../common/filter-chips.js";
import { useEventDetail } from "./use-event-detail.js";
import { EventTooltip } from "./event-tooltip.js";
import { EventPopover } from "./event-popover.js";

/** Maps EventCardSize presets to pixel values (synced with tokens.css) */
const SIZE_TO_PX: Record<EventCardSize, number> = {
  xs: 20,
  sm: 24,
  md: 36,
  lg: 48,
};

/**
 * CSS expression for grid header height per view (source of truth: tokens.css).
 * View → header composition mapping is mirrored in boundaryPadding pixel calculation below.
 */
const HEADER_HEIGHT_CSS: Record<View, string> = {
  day: "var(--cv-size-time-header-height)",
  week: "calc(var(--cv-size-date-header-height) + var(--cv-size-time-header-height))",
  month: "calc(var(--cv-size-date-header-height) * 2)",
};

/** Boundary gap between sticky areas and floating elements (= --cv-spacing-md) */
const BOUNDARY_GAP = 12;

export interface ScheduleProps<TData = unknown> {
  /** Event data */
  events: TimelineEvent<TData>[];
  /** Resource data */
  resources: Resource[];

  // ─── View Configuration ───
  /** Initial view (default: "day") */
  view?: View;
  /** Initial start date (default: today) */
  startDate?: Date;
  /** Per-view cell duration (day: minutes, week: hours) */
  cellDuration?: CellDurationConfig;
  /** Week start day (0=Sun, 1=Mon) */
  weekStartsOn?: 0 | 1;
  /** Available views for ViewToggle (default: layout-specific) */
  availableViews?: View[];

  // ─── Features ───
  /** Show now indicator (default: true) */
  showNowIndicator?: boolean;
  /** Show toolbar with date nav + view toggle (default: true) */
  showToolbar?: boolean;
  /** Show filter chips panel (default: false) */
  showFilter?: boolean;

  // ─── Custom Rendering ───
  /** Per-event EventCard props override. Merges with computed defaults. */
  eventProps?: (
    event: TimelineEvent<TData>
  ) => Partial<Omit<EventCardProps, "style">>;
  /** Override resource sidebar row rendering */
  renderResource?: (resource: Resource) => ReactNode;

  // ─── Event Detail ───
  /**
   * Render custom content inside the click popover.
   * When provided, clicking an event opens a popover with this content.
   */
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
  /** Event card size preset. Affects card height and row height. Default: "md". */
  eventSize?: EventCardSize;
  /** Theme override. Default: follows system preference. */
  theme?: "light" | "dark";
  className?: string;
}

export function Schedule<TData = unknown>({
  events,
  resources,
  view: initialView = "day",
  startDate,
  cellDuration,
  weekStartsOn = 0,
  availableViews,
  showNowIndicator = true,
  showToolbar = true,
  showFilter = false,
  eventProps,
  renderResource,
  renderEventDetail,
  disableTooltip = false,
  onEventClick,
  onEventHover,
  onViewChange,
  eventSize,
  theme,
  className,
}: ScheduleProps<TData>) {
  // ─── View State ───
  const [currentView, setCurrentView] = useState<View>(initialView);

  // Sync with external view prop changes
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  const handleViewChange = useCallback(
    (v: View) => {
      setCurrentView(v);
      onViewChange?.(v);
    },
    [onViewChange]
  );

  // ─── Date Navigation ───
  const { currentDate, goToPrev, goToNext, goToToday } = useDateNavigation({
    initialDate: startDate,
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

  // ─── Schedule Layout ───
  const eventHeight = eventSize ? SIZE_TO_PX[eventSize] : undefined;

  const { rows, dateRange, totalMainSize, totalCrossSize, getEventStyle } =
    useScheduleView({
      events: filteredEvents as TimelineEvent[],
      resources: filteredResources,
      view: currentView,
      layout: "schedule",
      cellDuration,
      startDate: currentDate,
      weekStartsOn,
      eventHeight,
    });

  // Real-time now indicator (updates every 60s via setInterval)
  const { position: nowPosition } = useNowIndicator({
    rangeStart: dateRange.start,
    rangeEnd: dateRange.end,
    totalSize: totalMainSize,
    enabled: showNowIndicator,
  });

  // ─── Container Ref (popover boundary) ───
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Layout Insets (floating-ui boundaryPadding) ───
  // CSS variables don't change at runtime — read once on mount.
  // Tooltip/popover only render after user interaction, so ref is always populated by then.
  const layoutInsetsRef = useRef({ sidebarWidth: 0, timeHeaderHeight: 0, dateHeaderHeight: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const styles = getComputedStyle(el);
    layoutInsetsRef.current = {
      sidebarWidth: parseFloat(styles.getPropertyValue("--cv-size-sidebar-width")) || 0,
      timeHeaderHeight: parseFloat(styles.getPropertyValue("--cv-size-time-header-height")) || 0,
      dateHeaderHeight: parseFloat(styles.getPropertyValue("--cv-size-date-header-height")) || 0,
    };
  }, []);

  // ─── Event Detail (tooltip/popover) ───
  const detail = useEventDetail<TData>({
    tooltipEnabled: !disableTooltip,
    popoverEnabled: !!renderEventDetail,
  });

  // Resource name lookup for tooltip display
  const resourceNameMap = useMemo(
    () => new Map(resources.map((r) => [r.id, r.title])),
    [resources],
  );

  // Theme class for portal-rendered tooltip/popover (dark mode support)
  const themeClass = theme ?? undefined;

  // Derive data for sub-components
  const sidebarResources = rows.map((r) => r.resource);
  const rowHeights = rows.map((r) => r.height);

  // Compute selected resource IDs for FilterChips
  const selectedResourceIds = filter.resourceIds ?? resources.map((r) => r.id);

  const resolvedAvailableViews =
    availableViews ?? getDefaultAvailableViews("schedule");

  // ─── Boundary Padding (floating-ui: exclude sticky sidebar/header) ───
  // View → header composition mapping mirrors HEADER_HEIGHT_CSS above.
  const { sidebarWidth, timeHeaderHeight, dateHeaderHeight } = layoutInsetsRef.current;
  const headerHeightPx = currentView === "day" ? timeHeaderHeight
    : currentView === "week" ? dateHeaderHeight + timeHeaderHeight
    : dateHeaderHeight * 2;

  const boundaryPadding = {
    left: sidebarWidth + BOUNDARY_GAP,
    top: headerHeightPx + BOUNDARY_GAP,
    right: BOUNDARY_GAP,
    bottom: BOUNDARY_GAP,
  };

  // ─── Render ───
  const sidebar = (
    <ResourceSidebar
      resources={sidebarResources}
      rowHeights={rowHeights}
      renderResource={renderResource}
    />
  );

  const header = (
    <TimeHeader
      view={currentView}
      dateRange={dateRange}
      cellDuration={cellDuration}
      weekStartsOn={weekStartsOn}
    />
  );

  // Helper to get row offset for row dividers
  const getRowOffset = (rowIndex: number): number => {
    let offset = 0;
    for (let i = 0; i < rowIndex; i++) {
      offset += rowHeights[i];
    }
    return offset;
  };

  const body = (
    <>
      <GridLines
        view={currentView}
        dateRange={dateRange}
        crossSize={totalCrossSize}
        cellDuration={cellDuration}
      />

      {/* Resource row dividers */}
      {rows.map((row, i) => {
        if (i === 0) return null;
        const y = getRowOffset(i);
        return (
          <div
            key={`row-divider-${row.resource.id}`}
            className="absolute left-0 h-px bg-[var(--cv-color-border)] pointer-events-none"
            style={{ top: y, width: "100%" }}
          />
        );
      })}

      {/* Event cards */}
      {rows.flatMap((row) =>
        row.events.map((eventLayout) => {
          const event = eventLayout.event as TimelineEvent<TData>;
          const style = getEventStyle(eventLayout);
          const variant = currentView === "month" ? "month" : "default";
          const defaultSubtitle =
            variant === "default"
              ? formatTimeLabel(event.start, event.end)
              : undefined;

          // Merge user overrides with computed defaults
          const overrides = eventProps?.(event);

          // When eventProps provides a custom onClick, the consumer controls click behavior —
          // skip popover and use the consumer's handler instead of onEventClick
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

          return (
            <EventCard
              key={event.id}
              title={overrides?.title ?? event.title}
              subtitle={overrides?.subtitle ?? defaultSubtitle}
              color={overrides?.color ?? eventLayout.color}
              variant={overrides?.variant ?? variant}
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
        })
      )}

      {/* Now indicator */}
      {nowPosition != null && (
        <NowIndicator position={nowPosition} crossSize={totalCrossSize} />
      )}

      {/* Hover tooltip */}
      {detail.tooltipEvent && detail.tooltipReference && (
        <EventTooltip
          event={detail.tooltipEvent}
          resourceName={resourceNameMap.get(detail.tooltipEvent.resourceId) ?? ""}
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
          {renderEventDetail(detail.popoverEvent, { close: detail.closePopover })}
        </EventPopover>
      )}
    </>
  );

  const toolbar = showToolbar ? (
    <Toolbar
      currentDate={currentDate}
      view={currentView}
      layout="schedule"
      onPrev={goToPrev}
      onNext={goToNext}
      onToday={goToToday}
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

  return (
    <ScheduleView
      sidebar={sidebar}
      header={header}
      body={body}
      totalMainSize={totalMainSize}
      totalCrossSize={totalCrossSize}
      headerHeight={HEADER_HEIGHT_CSS[currentView]}
      toolbar={toolbar}
      filterPanel={filterPanel}
      containerRef={containerRef}
      theme={theme}
      className={className}
    />
  );
}

/** Format event start/end as "HH:MM - HH:MM" */
function formatTimeLabel(start: Date, end: Date): string {
  const fmt = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    return `${h}:${m.toString().padStart(2, "0")}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}
