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
 * Schedule Week — Interactive story
 *
 * Verifies: 2-tier header, date boundary lines, cross-date cards, variable row heights
 * Interactions: date navigation, filter toggle
 */

const meta: Meta = {
  title: "Schedule/Week",
};
export default meta;

type Story = StoryObj;

// ─── Constants ───
const CELL_DURATION = 6 as const;
const { cellWidthPx: SLOT_WIDTH } = getCellConfig("week", {
  week: CELL_DURATION,
});
const SLOTS_PER_DAY = 4; // 24h / 6h = 4 slots per day
const EVENT_HEIGHT = 36;
const EVENT_GAP = 4;
const ROW_PADDING = 4;

const RESOURCES = [
  { id: "a", title: "Resource A", color: "#3b82f6" },
  { id: "b", title: "Resource B", color: "#8b5cf6" },
  { id: "c", title: "Resource C", color: "#06b6d4" },
];

const ROW_STACKS = [2, 1, 1];

function getRowHeight(maxStack: number): number {
  if (maxStack === 0) return 48;
  return Math.max(48, maxStack * EVENT_HEIGHT + (maxStack - 1) * EVENT_GAP + ROW_PADDING * 2);
}

function getRowOffset(heights: number[], rowIndex: number): number {
  return heights.slice(0, rowIndex).reduce((sum, h) => sum + h, 0);
}

/** Build a week DateRange (7 days starting from Sunday of the given date's week) */
function makeWeekRange(date: Date): DateRange {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - dayOfWeek); // go to Sunday
  const start = new Date(d);
  const end = new Date(d);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

// [resourceIdx, startSlot, endSlot, title, lane]
const EVENTS: [number, number, number, string, number][] = [
  [0, 6, 10, "Sprint Planning (cross-date)", 0],
  [0, 8, 14, "Design Review", 1],
  [0, 16, 20, "Code Review", 0],
  [0, 22, 26, "Deploy to Prod (cross-date)", 0],
  [1, 2, 6, "Team Sync", 0],
  [1, 12, 16, "Workshop", 0],
  [2, 0, 4, "Kickoff Meeting", 0],
  [2, 18, 24, "Sprint Retro (cross-date)", 0],
];

function ScheduleWeekStory() {
  const [date, setDate] = useState(new Date(2026, 2, 22));
  const [selectedIds, setSelectedIds] = useState(RESOURCES.map((r) => r.id));

  const dateRange = makeWeekRange(date);
  const totalMainSize = SLOTS_PER_DAY * 7 * SLOT_WIDTH;

  const visibleResources = RESOURCES.filter((r) => selectedIds.includes(r.id));
  const visibleEvents = EVENTS.filter(([resIdx]) => selectedIds.includes(RESOURCES[resIdx].id));

  const visibleRowStacks = visibleResources.map((r) => {
    const idx = RESOURCES.findIndex((orig) => orig.id === r.id);
    return ROW_STACKS[idx];
  });
  const rowHeights = visibleRowStacks.map(getRowHeight);
  const totalCrossSize = rowHeights.reduce((sum, h) => sum + h, 0);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handlePrev = () => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
  const handleNext = () => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
  const handleToday = () => setDate(new Date());

  const nowPosition = (5 * SLOTS_PER_DAY + 2.3) * SLOT_WIDTH;

  const sidebar = <ResourceSidebar resources={visibleResources} rowHeights={rowHeights} />;
  const header = (
    <TimeHeader view="week" dateRange={dateRange} cellDuration={{ week: CELL_DURATION }} />
  );

  const body = (
    <>
      <GridLines
        view="week"
        dateRange={dateRange}
        crossSize={totalCrossSize}
        cellDuration={{ week: CELL_DURATION }}
        topOffset={-80}
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
      view="week"
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
        sidebar={sidebar}
        header={header}
        body={body}
        totalMainSize={totalMainSize}
        totalCrossSize={totalCrossSize}
        headerHeight={80}
        toolbar={toolbar}
        filterPanel={filterPanel}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ScheduleWeekStory />,
};
