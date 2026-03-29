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

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useDateNavigation, useTimelineFilter, useScheduleView } from "@chronoview/react";
import type {
  View,
  TimelineEvent,
  Resource,
  EventLayout,
  TimeSlot,
  CellDurationConfig,
} from "@chronoview/core";
import { getDefaultAvailableViews } from "@chronoview/core";

import { ScheduleView } from "./schedule-view.js";
import { TimeHeader } from "./time-header.js";
import { ResourceSidebar } from "./resource-sidebar.js";
import { EventCard } from "./event-card.js";
import { NowIndicator } from "./now-indicator.js";
import { GridLines } from "./grid-lines.js";
import { Toolbar } from "../common/toolbar.js";
import { FilterChips } from "../common/filter-chips.js";

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
  /** Override event card rendering */
  renderEvent?: (event: TimelineEvent<TData>, layout: EventLayout) => ReactNode;
  /** Override resource sidebar row rendering */
  renderResource?: (resource: Resource) => ReactNode;
  /** Override time header slot rendering (reserved for future use) */
  renderTimeHeader?: (slot: TimeSlot, view: View) => ReactNode;

  // ─── Event Handlers ───
  onEventClick?: (event: TimelineEvent<TData>) => void;
  onEventHover?: (event: TimelineEvent<TData>) => void;
  onViewChange?: (view: View) => void;
  onDateChange?: (date: Date) => void;

  // ─── Style ───
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
  renderEvent,
  renderResource,
  onEventClick,
  onEventHover,
  onViewChange,
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
    [onViewChange],
  );

  // ─── Date Navigation ───
  const { currentDate, goToPrev, goToNext, goToToday } = useDateNavigation({
    initialDate: startDate,
    view: currentView,
  });

  const handlePrev = useCallback(() => {
    goToPrev();
  }, [goToPrev]);

  const handleNext = useCallback(() => {
    goToNext();
  }, [goToNext]);

  const handleToday = useCallback(() => {
    goToToday();
  }, [goToToday]);

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
  const { rows, dateRange, totalCrossSize, getEventStyle, nowPosition } = useScheduleView({
    events: filteredEvents as TimelineEvent[],
    resources: filteredResources,
    view: currentView,
    layout: "schedule",
    cellDuration,
    startDate: currentDate,
    showNowIndicator,
    weekStartsOn,
  });

  // Derive data for sub-components
  const sidebarResources = rows.map((r) => r.resource);
  const rowHeights = rows.map((r) => r.height);

  // Compute selected resource IDs for FilterChips
  const selectedResourceIds = filter.resourceIds ?? resources.map((r) => r.id);

  const resolvedAvailableViews = availableViews ?? getDefaultAvailableViews("schedule");

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
          const style = getEventStyle(eventLayout);
          const variant = currentView === "month" ? "month" : "default";

          if (renderEvent) {
            return (
              <div key={eventLayout.event.id} style={style}>
                {renderEvent(eventLayout.event as TimelineEvent<TData>, eventLayout)}
              </div>
            );
          }

          // Format time label for day/week views
          const timeLabel =
            variant === "default"
              ? formatTimeLabel(eventLayout.event.start, eventLayout.event.end)
              : undefined;

          return (
            <EventCard
              key={eventLayout.event.id}
              title={eventLayout.event.title}
              timeLabel={timeLabel}
              color={eventLayout.color}
              variant={variant}
              style={style}
              onClick={
                onEventClick
                  ? () => onEventClick(eventLayout.event as TimelineEvent<TData>)
                  : undefined
              }
              onMouseEnter={
                onEventHover
                  ? () => onEventHover(eventLayout.event as TimelineEvent<TData>)
                  : undefined
              }
            />
          );
        }),
      )}

      {/* Now indicator */}
      {nowPosition != null && <NowIndicator position={nowPosition} crossSize={totalCrossSize} />}
    </>
  );

  const toolbar = showToolbar ? (
    <Toolbar
      currentDate={currentDate}
      view={currentView}
      layout="schedule"
      onPrev={handlePrev}
      onNext={handleNext}
      onToday={handleToday}
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
      view={currentView}
      dateRange={dateRange}
      cellDuration={cellDuration}
      sidebar={sidebar}
      header={header}
      body={body}
      totalCrossSize={totalCrossSize}
      toolbar={toolbar}
      filterPanel={filterPanel}
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
