import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { getCellConfig, type DateRange } from "@chronoview/core";
import { EventCard } from "./event-card.js";
import { GridLines } from "./grid-lines.js";
import { NowIndicator } from "./now-indicator.js";
import { ResourceSidebar } from "./resource-sidebar.js";
import { ScheduleView } from "./schedule-view.js";
import { TimeHeader } from "./time-header.js";
import { Toolbar } from "../common/toolbar.js";
import { FilterChips } from "../common/filter-chips.js";

/**
 * Schedule Day — Interactive story
 *
 * Verifies: sidebar, time header, event cards, variable row heights, NowIndicator
 * Interactions: date navigation, filter toggle
 */

const meta: Meta = {
  title: "Schedule/Day",
};
export default meta;

type Story = StoryObj;

// ─── Constants ───
const { cellWidthPx: SLOT_WIDTH } = getCellConfig("day", { day: 60 });
const EVENT_HEIGHT = 36;
const EVENT_GAP = 4;
const ROW_PADDING = 4;
const NOW_SLOT = 4.3;

const RESOURCES = [
  { id: "a", title: "Resource A", color: "#3b82f6" },
  { id: "b", title: "Resource B", color: "#8b5cf6" },
  { id: "c", title: "Resource C", color: "#06b6d4" },
  { id: "d", title: "Resource D", color: "#10b981" },
];

// [resourceIdx, startSlot, endSlot, title, lane]
const EVENTS: [number, number, number, string, number][] = [
  // Resource A: 1 lane
  [0, 0, 1.5, "Meeting A", 0],
  [0, 2, 3.5, "Task B", 0],
  [0, 4, 5.5, "Review C", 0],
  [0, 5.5, 7, "Deploy D", 0],
  // Resource B: 2-lane stack
  [1, 0.5, 2.5, "Sprint Planning", 0],
  [1, 1.5, 4, "Design Review", 1],
  [1, 4.5, 6, "Code Review", 0],
  [1, 5, 7, "QA Session", 1],
  // Resource C: 3-lane stack
  [2, 1, 3, "Project Alpha", 0],
  [2, 1.5, 4, "Backend API", 1],
  [2, 2, 3.5, "DB Migration", 2],
  [2, 5, 7, "Deployment", 0],
  // Resource D: empty resource
];

const ROW_STACKS = [1, 2, 3, 0];

function getRowHeight(maxStack: number): number {
  if (maxStack === 0) return 48;
  return Math.max(48, maxStack * EVENT_HEIGHT + (maxStack - 1) * EVENT_GAP + ROW_PADDING * 2);
}

function getRowOffset(heights: number[], rowIndex: number): number {
  return heights.slice(0, rowIndex).reduce((sum, h) => sum + h, 0);
}

/** Build a DateRange for a single day (mock: 5:00~12:00 = 8 hours subset) */
function makeDayRange(date: Date): DateRange {
  const start = new Date(date);
  start.setHours(5, 0, 0, 0);
  const end = new Date(date);
  end.setHours(13, 0, 0, 0);
  return { start, end };
}

function ScheduleDayStory() {
  const [date, setDate] = useState(new Date(2026, 2, 27));
  const [selectedIds, setSelectedIds] = useState(RESOURCES.map((r) => r.id));

  const dateRange = makeDayRange(date);

  // Filtered resources/events
  const visibleResources = RESOURCES.filter((r) => selectedIds.includes(r.id));
  const visibleEvents = EVENTS.filter(([resIdx]) => selectedIds.includes(RESOURCES[resIdx].id));

  // Recalculate row heights based on filter
  const visibleRowStacks = visibleResources.map((r) => {
    const originalIdx = RESOURCES.findIndex((orig) => orig.id === r.id);
    return ROW_STACKS[originalIdx];
  });
  const rowHeights = visibleRowStacks.map(getRowHeight);
  const totalCrossSize = rowHeights.reduce((sum, h) => sum + h, 0);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handlePrev = () => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  const handleNext = () => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  const handleToday = () => setDate(new Date());

  const nowPosition = NOW_SLOT * SLOT_WIDTH;
  const totalMainSize = 8 * SLOT_WIDTH; // 8 slots for mock

  const sidebar = <ResourceSidebar resources={visibleResources} rowHeights={rowHeights} />;

  const header = <TimeHeader view="day" dateRange={dateRange} cellDuration={{ day: 60 }} />;

  const body = (
    <>
      <GridLines
        view="day"
        dateRange={dateRange}
        crossSize={totalCrossSize}
        cellDuration={{ day: 60 }}
        topOffset={-48}
      />

      {/* Resource row dividers */}
      {rowHeights.map((_, i) => {
        if (i === 0) return null;
        const y = getRowOffset(rowHeights, i);
        return (
          <div
            key={`row-line-${y}`}
            style={{
              position: "absolute",
              left: 0,
              top: y,
              width: totalMainSize,
              height: 1,
              background: "var(--cv-color-border)",
            }}
          />
        );
      })}

      {/* Event cards — with filter applied */}
      {visibleEvents.map(([resIdx, startSlot, endSlot, title, lane]) => {
        const visibleRowIdx = visibleResources.findIndex((r) => r.id === RESOURCES[resIdx].id);
        if (visibleRowIdx === -1) return null;

        const rowOffset = getRowOffset(rowHeights, visibleRowIdx);
        const left = startSlot * SLOT_WIDTH;
        const width = (endSlot - startSlot) * SLOT_WIDTH;
        const top = rowOffset + ROW_PADDING + lane * (EVENT_HEIGHT + EVENT_GAP);

        return (
          <EventCard
            key={`event-${title}`}
            title={title}
            timeLabel={`${Math.floor(startSlot + 5)}:00 - ${Math.floor(endSlot + 5)}:00`}
            color={RESOURCES[resIdx].color}
            style={{ left, top, width }}
          />
        );
      })}

      <NowIndicator position={nowPosition} crossSize={totalCrossSize} />
    </>
  );

  const toolbar = (
    <Toolbar
      currentDate={date}
      view="day"
      layout="schedule"
      onPrev={handlePrev}
      onNext={handleNext}
      onToday={handleToday}
      onViewChange={() => {}}
    />
  );

  const filterPanel = (
    <FilterChips
      resources={RESOURCES}
      selectedIds={selectedIds}
      onToggle={handleToggle}
      onSelectAll={() => setSelectedIds(RESOURCES.map((r) => r.id))}
      onDeselectAll={() => setSelectedIds([])}
    />
  );

  return (
    <div style={{ maxWidth: 1100 }}>
      <ScheduleView
        view="day"
        dateRange={dateRange}
        cellDuration={{ day: 60 }}
        sidebar={sidebar}
        header={header}
        body={body}
        totalCrossSize={totalCrossSize}
        toolbar={toolbar}
        filterPanel={filterPanel}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ScheduleDayStory />,
};
