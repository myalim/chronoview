import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { getCellConfig, type DateRange } from "@chronoview/core";
import { EventCard } from "./event-card.js";
import { GridLines } from "./grid-lines.js";
import { ResourceSidebar } from "./resource-sidebar.js";
import { ScheduleView } from "./schedule-view.js";
import { TimeHeader } from "./time-header.js";
import { Toolbar } from "../common/toolbar.js";
import { FilterChips } from "../common/filter-chips.js";

/**
 * Schedule Month — Interactive story
 *
 * Verifies: 2-tier header (date + weekday), cell stacking, cross-date bars,
 *           today highlight, color coding, variable row heights
 * Interactions: date navigation, filter toggle
 */

const meta: Meta = {
  title: "Schedule/Month",
};
export default meta;

type Story = StoryObj;

// ─── Constants ───
const { cellWidthPx: COL_WIDTH } = getCellConfig("month");
const DAYS_IN_MONTH = 31;
const BAR_HEIGHT = 24;
const BAR_GAP = 4;
const ROW_PADDING = 4;
const TODAY_INDEX = 26; // March 27

const RESOURCES = [
  { id: "a", title: "Resource A", color: "#3b82f6" },
  { id: "b", title: "Resource B", color: "#8b5cf6" },
  { id: "c", title: "Resource C", color: "#06b6d4" },
  { id: "d", title: "Resource D", color: "#10b981" },
];

const ROW_STACKS = [2, 1, 2, 0];

function getRowHeight(maxStack: number): number {
  if (maxStack === 0) return 48;
  return Math.max(
    48,
    maxStack * BAR_HEIGHT + (maxStack - 1) * BAR_GAP + ROW_PADDING * 2
  );
}

function getRowOffset(heights: number[], rowIndex: number): number {
  return heights.slice(0, rowIndex).reduce((sum, h) => sum + h, 0);
}

/** Build a month DateRange (March 1 ~ March 31) */
function makeMonthRange(date: Date): DateRange {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

// [resourceIdx, startDay (0-based), endDay (exclusive), title, lane]
const EVENTS: [number, number, number, string, number][] = [
  [0, 5, 10, "Sprint 3", 0],
  [0, 7, 15, "Feature Dev", 1],
  [0, 18, 22, "QA Phase", 0],
  [0, 25, 30, "Release Prep", 0],
  [1, 2, 8, "Design Sprint", 0],
  [1, 14, 20, "User Testing", 0],
  [2, 0, 6, "Planning", 0],
  [2, 3, 9, "API Development", 1],
  [2, 22, 28, "Integration", 0],
];

function ScheduleMonthStory() {
  const [date, setDate] = useState(new Date(2026, 2, 1));
  const [selectedIds, setSelectedIds] = useState(RESOURCES.map((r) => r.id));

  const dateRange = makeMonthRange(date);
  const totalMainSize = COL_WIDTH * DAYS_IN_MONTH;

  const visibleResources = RESOURCES.filter((r) => selectedIds.includes(r.id));
  const visibleEvents = EVENTS.filter(([resIdx]) =>
    selectedIds.includes(RESOURCES[resIdx].id)
  );

  const visibleRowStacks = visibleResources.map((r) => {
    const idx = RESOURCES.findIndex((orig) => orig.id === r.id);
    return ROW_STACKS[idx];
  });
  const rowHeights = visibleRowStacks.map(getRowHeight);
  const totalCrossSize = rowHeights.reduce((sum, h) => sum + h, 0);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePrev = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const handleNext = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const handleToday = () => setDate(new Date());

  const sidebar = (
    <ResourceSidebar resources={visibleResources} rowHeights={rowHeights} />
  );
  const header = <TimeHeader view="month" dateRange={dateRange} />;

  const body = (
    <>
      <GridLines
        view="month"
        dateRange={dateRange}
        crossSize={totalCrossSize}
        topOffset={-64}
      />

      {/* Today column highlight */}
      <div
        style={{
          position: "absolute",
          left: TODAY_INDEX * COL_WIDTH,
          top: 0,
          width: COL_WIDTH,
          height: totalCrossSize,
          background: "var(--cv-color-today-bg)",
          zIndex: "var(--cv-z-base)",
          pointerEvents: "none",
        }}
      />

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

      {visibleEvents.map(([resIdx, startDay, endDay, title, lane]) => {
        const visibleRowIdx = visibleResources.findIndex(
          (r) => r.id === RESOURCES[resIdx].id
        );
        if (visibleRowIdx === -1) return null;

        const rowOffset = getRowOffset(rowHeights, visibleRowIdx);
        const left = startDay * COL_WIDTH;
        const width = (endDay - startDay) * COL_WIDTH;
        const top = rowOffset + ROW_PADDING + lane * (BAR_HEIGHT + BAR_GAP);

        return (
          <EventCard
            key={`event-${title}`}
            title={title}
            color={RESOURCES[resIdx].color}
            variant="month"
            style={{ left, top, width }}
          />
        );
      })}
    </>
  );

  const toolbar = (
    <Toolbar
      currentDate={date}
      view="month"
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
    <div style={{ maxWidth: 1300 }}>
      <ScheduleView
        sidebar={sidebar}
        header={header}
        body={body}
        totalMainSize={totalMainSize}
        totalCrossSize={totalCrossSize}
        headerHeight={64}
        toolbar={toolbar}
        filterPanel={filterPanel}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ScheduleMonthStory />,
};
