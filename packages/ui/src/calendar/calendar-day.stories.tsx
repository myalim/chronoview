import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { calculateScrollToNow } from "@chronoview/core";
import { Button } from "../common/button.js";
import { FilterChips, type FilterChipResource } from "../common/filter-chips.js";
import { Toolbar } from "../common/toolbar.js";
import { EventCard } from "../schedule/event-card.js";
import { CalendarGridLines } from "./calendar-grid-lines.js";
import { CalendarNowIndicator } from "./calendar-now-indicator.js";
import { CalendarView } from "./calendar-view.js";
import { TimeSidebar } from "./time-sidebar.js";

/**
 * Calendar Day static UI story
 *
 * Layout: vertical=time, horizontal=single column
 * Key features: auto stack (column packing) + Now Indicator + scrollToNow
 * Reference: docs/design/calendar/calendar-day.md
 */

// ─── Constants ───

const SLOT_HEIGHT = 60;
// Add 1 empty slot before/after the event range (7–18h), following Google Calendar / Planby conventions
const HOUR_START = 6;
const HOUR_END = 20;
const TOTAL_SLOTS = HOUR_END - HOUR_START;
const TOTAL_MAIN_SIZE = TOTAL_SLOTS * SLOT_HEIGHT;
const EVENT_GAP = 4;

// Mock "now" position at 12:30
const NOW_HOUR = 12.5;
const NOW_POSITION = (NOW_HOUR - HOUR_START) * SLOT_HEIGHT;

// ─── Resources (color distinction only, no axis) ───

const RESOURCES: FilterChipResource[] = [
  { id: "a", title: "Resource A", color: "#3b82f6" },
  { id: "b", title: "Resource B", color: "#8b5cf6" },
  { id: "c", title: "Resource C", color: "#06b6d4" },
];

// ─── Mock Events ───
// Auto mode (column packing, Google Calendar style):
// depth=0 renders furthest back; higher depth renders in front
// indent is auto-calculated proportionally based on maxDepth (static UI approximation)

interface MockEvent {
  id: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  title: string;
  color: string;
  /** Overlap depth — 0=furthest back, higher=rendered in front */
  depth: number;
  /** Max depth within the overlap group (used for indent ratio calculation) */
  maxDepth: number;
}

const EVENTS: MockEvent[] = [
  // ─── Duration height tests (no overlap) ───
  { id: "e1", resourceId: "a", startHour: 7, endHour: 7 + 5 / 60, title: "Quick Ping", color: "#3b82f6", depth: 0, maxDepth: 0 },
  { id: "e2", resourceId: "b", startHour: 7.5, endHour: 7.5 + 10 / 60, title: "Standup Check", color: "#8b5cf6", depth: 0, maxDepth: 0 },
  { id: "e3", resourceId: "c", startHour: 8, endHour: 8.25, title: "Bio Break", color: "#06b6d4", depth: 0, maxDepth: 0 },
  { id: "e4", resourceId: "a", startHour: 8.5, endHour: 8.5 + 20 / 60, title: "Coffee Chat", color: "#3b82f6", depth: 0, maxDepth: 0 },
  { id: "e5", resourceId: "b", startHour: 9, endHour: 9.5, title: "Morning Standup", color: "#8b5cf6", depth: 0, maxDepth: 0 },
  { id: "e6", resourceId: "c", startHour: 9.75, endHour: 10.5, title: "Design Review", color: "#06b6d4", depth: 0, maxDepth: 0 },
  { id: "e7", resourceId: "a", startHour: 11, endHour: 12, title: "Sprint Planning", color: "#3b82f6", depth: 0, maxDepth: 0 },

  // ─── 2 overlapping (auto, maxDepth=1) ───
  { id: "e8", resourceId: "c", startHour: 12.25, endHour: 13.25, title: "Lunch Meeting", color: "#06b6d4", depth: 0, maxDepth: 1 },
  { id: "e9", resourceId: "a", startHour: 12.5, endHour: 13, title: "Quick Call", color: "#3b82f6", depth: 1, maxDepth: 1 },

  // ─── 3 overlapping (auto, maxDepth=2) ───
  { id: "e10", resourceId: "b", startHour: 13.5, endHour: 15, title: "Code Review", color: "#8b5cf6", depth: 0, maxDepth: 2 },
  { id: "e11", resourceId: "c", startHour: 14, endHour: 15.5, title: "API Design", color: "#06b6d4", depth: 1, maxDepth: 2 },
  { id: "e12", resourceId: "a", startHour: 14.5, endHour: 15.5, title: "1:1 Meeting", color: "#3b82f6", depth: 2, maxDepth: 2 },

  // ─── 2 simultaneous start (auto, maxDepth=1) ───
  { id: "e13", resourceId: "b", startHour: 16, endHour: 17.5, title: "Deep Work", color: "#8b5cf6", depth: 0, maxDepth: 1 },
  { id: "e14", resourceId: "a", startHour: 16, endHour: 17, title: "Design Sync", color: "#3b82f6", depth: 1, maxDepth: 1 },

  // ─── 3 short simultaneous start (auto, maxDepth=2) ───
  { id: "e15", resourceId: "c", startHour: 17.75, endHour: 18, title: "Wrap Up A", color: "#06b6d4", depth: 0, maxDepth: 2 },
  { id: "e16", resourceId: "a", startHour: 17.75, endHour: 17.75 + 10 / 60, title: "Wrap Up B", color: "#3b82f6", depth: 1, maxDepth: 2 },
  { id: "e17", resourceId: "b", startHour: 17 + 50 / 60, endHour: 18.25, title: "Wrap Up C", color: "#8b5cf6", depth: 2, maxDepth: 2 },
];

// ─── Helpers ───

function hourToY(hour: number): number {
  return (hour - HOUR_START) * SLOT_HEIGHT;
}

function formatTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const TIME_SLOTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
  label: `${String(HOUR_START + i).padStart(2, "0")}:00`,
}));

// ─── Story Component ───

function CalendarDayStory() {
  const [date, setDate] = useState(new Date(2026, 2, 27));
  const [selectedIds, setSelectedIds] = useState(RESOURCES.map((r) => r.id));
  const containerRef = useRef<HTMLDivElement>(null);

  // scrollToNow on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const mockDateRange = {
      start: new Date(2026, 2, 27, HOUR_START),
      end: new Date(2026, 2, 27, HOUR_END),
    };

    const scrollOffset = calculateScrollToNow({
      now: new Date(2026, 2, 27, 12, 30),
      rangeStart: mockDateRange.start,
      rangeEnd: mockDateRange.end,
      totalSize: TOTAL_MAIN_SIZE,
      viewportSize: el.clientHeight,
    });

    el.scrollTop = scrollOffset;
  }, []);

  // scrollToNow via manual button
  const handleScrollToNow = () => {
    const el = containerRef.current;
    if (!el) return;

    const mockDateRange = {
      start: new Date(2026, 2, 27, HOUR_START),
      end: new Date(2026, 2, 27, HOUR_END),
    };

    const scrollOffset = calculateScrollToNow({
      now: new Date(2026, 2, 27, 12, 30),
      rangeStart: mockDateRange.start,
      rangeEnd: mockDateRange.end,
      totalSize: TOTAL_MAIN_SIZE,
      viewportSize: el.clientHeight,
    });

    el.scrollTo({ top: scrollOffset, behavior: "smooth" });
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handlePrev = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  const handleNext = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  const handleToday = () => setDate(new Date());

  const selectedSet = new Set(selectedIds);
  const visibleEvents = EVENTS.filter((e) => selectedSet.has(e.resourceId));

  // ─── Sub-components ───

  const sidebar = (
    <TimeSidebar
      timeSlots={TIME_SLOTS}
      slotHeight={SLOT_HEIGHT}
      totalHeight={TOTAL_MAIN_SIZE}
    />
  );

  const toolbar = (
    <Toolbar
      currentDate={date}
      view="day"
      layout="calendar"
      onPrev={handlePrev}
      onNext={handleNext}
      onToday={handleToday}
      onViewChange={() => {}}
      availableViews={["day", "week", "month"]}
      leftSlot={
        <Button variant="outline" onClick={handleScrollToNow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Now
        </Button>
      }
    />
  );

  const filterPanel = (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--cv-color-border)]">
      <FilterChips
        resources={RESOURCES}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onSelectAll={() => setSelectedIds(RESOURCES.map((r) => r.id))}
        onDeselectAll={() => setSelectedIds([])}
      />
    </div>
  );

  const body = (
    <>
      <CalendarGridLines
        slotCount={TOTAL_SLOTS}
        slotHeight={SLOT_HEIGHT}
        crossSize="100%"
      />

      {/* Event cards — Auto mode column packing (Google Calendar style) */}
      {visibleEvents.map((event) => {
        const top = hourToY(event.startHour);
        // Spec: minimum event height 20px (calendar-day.md §3)
        const MIN_HEIGHT = 20;
        const height = Math.max(MIN_HEIGHT, hourToY(event.endHour) - top - 2);

        // Auto mode: indent-based overlap layout (Google Calendar style)
        // Higher depth indents further right and renders on top of earlier events
        const indentPct = event.maxDepth > 0 ? 100 / (event.maxDepth + 1.5) : 0;
        const leftPct = event.depth * indentPct;

        const cardStyle: CSSProperties = {
          top,
          left: `calc(${leftPct}% + ${EVENT_GAP / 2}px)`,
          width: `calc(${100 - leftPct}% - ${EVENT_GAP}px)`,
          height,
          zIndex: 20 + event.depth,
        };

        const durationMin = (event.endHour - event.startHour) * 60;
        const timeLabel = `${formatTime(event.startHour)} – ${formatTime(event.endHour)}`;
        const isCompact = durationMin <= 45;

        // Opaque background prevents text bleed-through from overlapped events behind
        return (
          <EventCard
            key={event.id}
            color={event.color}
            style={cardStyle}
          >
            <div className="shrink-0" style={{ width: 3, background: event.color }} />
            <div
              className="flex flex-col justify-start flex-1 min-w-0 overflow-hidden px-2 py-0.5"
              style={{
                // Opaque tint: event color at 12% composited over base background
                background: `linear-gradient(${event.color}1f, ${event.color}1f), var(--cv-color-bg)`,
              }}
            >
              {isCompact ? (
                // Compact: "Title, 10:00 – 11:00" in a single line
                <span className="truncate text-[length:var(--cv-font-size-xs)] font-[var(--cv-font-weight-medium)]">
                  {event.title}
                  <span className="font-normal text-[var(--cv-color-text-secondary)]">
                    {`, ${timeLabel}`}
                  </span>
                </span>
              ) : (
                // Long event: title + subtitle stacked vertically
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
      })}

      <CalendarNowIndicator position={NOW_POSITION} crossSize="100%" />
    </>
  );

  return (
    <div style={{ maxWidth: 640, height: "85vh", margin: "0 auto" }}>
      <CalendarView
        sidebar={sidebar}
        body={body}
        totalMainSize={TOTAL_MAIN_SIZE}
        toolbar={toolbar}
        filterPanel={filterPanel}
        containerRef={containerRef}
        className="h-full"
      />
    </div>
  );
}

// ─── Storybook Meta ───

const meta: Meta = {
  title: "Calendar/Day",
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <CalendarDayStory />,
};

export const DarkMode: Story = {
  render: () => <CalendarDayStory />,
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: 16, background: "#111827", height: "90vh" }}>
        <Story />
      </div>
    ),
  ],
};

// ─── Stacking style comparison story ───
// Compares 3 styles: indent overlap / equal distribution / span expansion
// Same event data rendered with each style for visual comparison

type StackStyle = "indent" | "equal" | "span-expand" | "span-overlap";

const CMP_SLOT_HEIGHT = 60;
const CMP_HOUR_START = 9;
const CMP_HOUR_END = 12;
const CMP_SLOTS = CMP_HOUR_END - CMP_HOUR_START;
const CMP_TOTAL = CMP_SLOTS * CMP_SLOT_HEIGHT;
const CMP_TIME_SLOTS = Array.from({ length: CMP_SLOTS }, (_, i) => ({
  label: `${String(CMP_HOUR_START + i).padStart(2, "0")}:00`,
}));

interface CompareEvent {
  id: string;
  title: string;
  color: string;
  startHour: number;
  endHour: number;
  /** For indent mode: overlap depth */
  depth: number;
  /** For indent mode: max depth within the group */
  maxDepth: number;
  /** For column-packing mode: assigned lane */
  lane: number;
  /** For column-packing mode: total lane count */
  totalLanes: number;
  /** For span-expand mode: extend into empty columns to the right (default 1) */
  spanColumns: number;
}

interface CompareScenario {
  title: string;
  events: CompareEvent[];
}

const COMPARE_SCENARIOS: CompareScenario[] = [
  {
    title: "2 Overlapping",
    events: [
      { id: "a1", title: "Sprint Planning", color: "#3b82f6", startHour: 9, endHour: 10.5, depth: 0, maxDepth: 1, lane: 0, totalLanes: 2, spanColumns: 1 },
      { id: "a2", title: "Design Sync", color: "#8b5cf6", startHour: 9.5, endHour: 11, depth: 1, maxDepth: 1, lane: 1, totalLanes: 2, spanColumns: 1 },
    ],
  },
  {
    title: "3 Staggered Overlap",
    events: [
      { id: "b1", title: "Code Review", color: "#3b82f6", startHour: 9, endHour: 11, depth: 0, maxDepth: 2, lane: 0, totalLanes: 3, spanColumns: 1 },
      { id: "b2", title: "API Design", color: "#8b5cf6", startHour: 9.5, endHour: 10.5, depth: 1, maxDepth: 2, lane: 1, totalLanes: 3, spanColumns: 1 },
      { id: "b3", title: "1:1 Meeting", color: "#06b6d4", startHour: 10, endHour: 11.5, depth: 2, maxDepth: 2, lane: 2, totalLanes: 3, spanColumns: 1 },
    ],
  },
  {
    // Scenario where span expansion matters: E expands into empty columns after B,C end
    title: "5 Events (Span Expand)",
    events: [
      // A: lane 0, overlaps with B → span=1
      { id: "c1", title: "Deep Work", color: "#3b82f6", startHour: 9, endHour: 10.5, depth: 0, maxDepth: 2, lane: 0, totalLanes: 3, spanColumns: 1 },
      // B: lane 1, overlaps with C → span=1
      { id: "c2", title: "Team Sync", color: "#8b5cf6", startHour: 9, endHour: 10, depth: 1, maxDepth: 2, lane: 1, totalLanes: 3, spanColumns: 1 },
      // C: lane 2 → span=1
      { id: "c3", title: "Quick Call", color: "#06b6d4", startHour: 9, endHour: 9.5, depth: 2, maxDepth: 2, lane: 2, totalLanes: 3, spanColumns: 1 },
      // D: reuses lane 2 after C ends → span=1
      { id: "c4", title: "Check-in", color: "#10b981", startHour: 9.5, endHour: 10, depth: 2, maxDepth: 2, lane: 2, totalLanes: 3, spanColumns: 1 },
      // E: reuses lane 1 after B,C,D end, lane 2 also empty → span=2
      { id: "c5", title: "Retro", color: "#f59e0b", startHour: 10, endHour: 11, depth: 1, maxDepth: 2, lane: 1, totalLanes: 3, spanColumns: 2 },
    ],
  },
];

function ComparePanel({ scenario, style, columnWidth }: { scenario: CompareScenario; style: StackStyle; columnWidth: number }) {
  const MIN_HEIGHT = (15 / 60) * CMP_SLOT_HEIGHT;

  return (
    <div className="flex flex-col" style={{ width: columnWidth }}>
      <div className="flex border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] overflow-hidden" style={{ height: CMP_TOTAL + 20 }}>
        <div className="shrink-0 relative border-r border-[var(--cv-color-border)]" style={{ width: 40 }}>
          {CMP_TIME_SLOTS.map((slot, i) => (
            <div
              key={slot.label}
              className="absolute right-0 pr-1 text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]"
              style={{ top: i * CMP_SLOT_HEIGHT + 10, transform: i === 0 ? undefined : "translateY(-7px)", lineHeight: "14px" }}
            >
              {slot.label}
            </div>
          ))}
        </div>
        <div className="relative flex-1" style={{ height: CMP_TOTAL, marginTop: 10 }}>
          {CMP_TIME_SLOTS.slice(1).map((slot) => {
            const slotIdx = CMP_TIME_SLOTS.indexOf(slot);
            return (
              <div
                key={`gl-${slot.label}`}
                className="absolute left-0 w-full pointer-events-none"
                style={{ top: slotIdx * CMP_SLOT_HEIGHT, height: 1, background: "var(--cv-color-border)" }}
              />
            );
          })}

          {scenario.events.map((event) => {
            const top = (event.startHour - CMP_HOUR_START) * CMP_SLOT_HEIGHT;
            const height = Math.max(MIN_HEIGHT, (event.endHour - event.startHour) * CMP_SLOT_HEIGHT - 2);
            const timeLabel = `${formatTime(event.startHour)} – ${formatTime(event.endHour)}`;

            let leftPct: number;
            let widthPct: number;
            let zIndex: number;

            if (style === "indent") {
              // Indent overlap: higher depth indents further right, maintaining wide width
              const indentPct = event.maxDepth > 0 ? 100 / (event.maxDepth + 1.5) : 0;
              leftPct = event.depth * indentPct;
              widthPct = 100 - leftPct;
              zIndex = 20 + event.depth;
            } else if (style === "equal") {
              // Equal distribution: no overlap, all events have identical width
              const lanePct = 100 / event.totalLanes;
              leftPct = event.lane * lanePct;
              widthPct = lanePct;
              zIndex = 20;
            } else if (style === "span-expand") {
              // Span expansion: equal placement + expand into empty columns (Apple Calendar style)
              const lanePct = 100 / event.totalLanes;
              leftPct = event.lane * lanePct;
              widthPct = event.spanColumns * lanePct;
              zIndex = 20;
            } else {
              // Span + overlap: column-packing based but with 30% overlap on adjacent events
              // Combines readability of indent with space efficiency of span expansion
              const lanePct = 100 / event.totalLanes;
              const overlap = 0.3;
              leftPct = event.lane * lanePct * (1 - overlap);
              widthPct = event.spanColumns * lanePct + overlap * lanePct;
              zIndex = 20 + event.lane;
            }

            return (
              <EventCard
                key={event.id}
                color={event.color}
                style={{
                  top,
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 4px)`,
                  height,
                  zIndex,
                }}
              >
                <div className="shrink-0" style={{ width: 3, background: event.color }} />
                <div
                  className="flex flex-col justify-start flex-1 min-w-0 overflow-hidden px-1.5 py-0.5"
                  style={{ background: `linear-gradient(${event.color}1f, ${event.color}1f), var(--cv-color-bg)` }}
                >
                  <span className="truncate text-[length:var(--cv-font-size-xs)] font-[var(--cv-font-weight-medium)]">
                    {event.title}
                  </span>
                  <span className="truncate text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]">
                    {timeLabel}
                  </span>
                </div>
              </EventCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StackStyleComparison() {
  const styles: { key: StackStyle; label: string; description: string }[] = [
    { key: "indent", label: "Indent Overlap", description: "Google Calendar — wide but hides events behind" },
    { key: "equal", label: "Equal Distribution", description: "No overlap, all events same width" },
    { key: "span-expand", label: "Span Expand", description: "Apple Calendar — expand into empty columns" },
    { key: "span-overlap", label: "Span + Overlap", description: "Span expand + 30% overlap (hybrid)" },
  ];

  return (
    <div
      className="font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]"
      style={{ maxWidth: 1400, margin: "0 auto" }}
    >
      {/* Day width comparison (wide columns) */}
      <div className="mb-8">
        <div className="text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-bold)] mb-3 px-1">
          Day View (Wide Column)
        </div>
        <div className="flex gap-4">
          {styles.map((s) => (
            <div key={s.key} style={{ flex: 1 }}>
              <div className="text-center mb-2">
                <div className="font-[var(--cv-font-weight-bold)] text-[length:var(--cv-font-size-sm)]">{s.label}</div>
                <div className="text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]">{s.description}</div>
              </div>
              <div className="flex gap-2">
                {COMPARE_SCENARIOS.map((scenario) => (
                  <ComparePanel key={scenario.title} scenario={scenario} style={s.key} columnWidth={140} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week width comparison (narrow columns) */}
      <div>
        <div className="text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-bold)] mb-3 px-1">
          Week View (Narrow Column — actual week view column width)
        </div>
        <div className="flex gap-4">
          {styles.map((s) => (
            <div key={s.key} style={{ flex: 1 }}>
              <div className="text-center mb-2">
                <div className="font-[var(--cv-font-weight-bold)] text-[length:var(--cv-font-size-sm)]">{s.label}</div>
              </div>
              <div className="flex gap-2">
                {COMPARE_SCENARIOS.map((scenario) => (
                  <ComparePanel key={scenario.title} scenario={scenario} style={s.key} columnWidth={100} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const StackStyleCompare: Story = {
  render: () => <StackStyleComparison />,
};
