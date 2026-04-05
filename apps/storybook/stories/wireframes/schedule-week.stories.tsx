import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import "./wireframe.css";

/**
 * Schedule Week wireframe
 *
 * Layout: rows = resources, columns = time (same axis mapping as Schedule Day)
 * Key features: two-tier header (date + time), cross-day event cards, continuous time axis
 * Ref: docs/design/schedule/schedule-week.md
 */

const SLOT_WIDTH = 80;
const DAYS = ["03/22 (월)", "03/23 (화)", "03/24 (수)"];
const TIME_SLOTS_PER_DAY = ["00:00", "06:00", "12:00", "18:00"];
const SLOTS_PER_DAY = TIME_SLOTS_PER_DAY.length;
const TOTAL_SLOTS = DAYS.length * SLOTS_PER_DAY;
const SIDEBAR_WIDTH = 200;
const DATE_HEADER_HEIGHT = 32;
const TIME_HEADER_HEIGHT = 48;
const TOTAL_HEADER_HEIGHT = DATE_HEADER_HEIGHT + TIME_HEADER_HEIGHT;
const EVENT_HEIGHT = 36;
const EVENT_GAP = 4;
const ROW_PADDING = 4;

const RESOURCES = [
  { name: "Resource A", color: "#3b82f6", icon: "#3b82f6" },
  { name: "Resource B", color: "#8b5cf6", icon: "#8b5cf6" },
  { name: "Resource C", color: "#06b6d4", icon: "#06b6d4" },
];

/**
 * Event data: [resourceIdx, startSlot, endSlot, title, lane]
 * Slot units: 0=Day1 00:00, 4=Day2 00:00, 8=Day3 00:00
 * Cross-day example: start in Day1 range, end in Day2 range
 */
const EVENTS: [number, number, number, string, number][] = [
  // Resource A: single-lane stack + cross-day event
  [0, 0.5, 2, "Event 1", 0],
  [0, 2.5, 4.5, "Event 2", 0], // Day1 evening → Day2 morning (cross-day)
  [0, 5, 6.5, "Event 3", 0],
  [0, 9, 10.5, "Event 4", 0],
  // Resource B: two-lane stack
  [1, 1, 3, "Event 5", 0],
  [1, 2, 4, "Event 6", 1],
  [1, 5.5, 7.5, "Event 7", 0],
  [1, 7, 9.5, "Event 8", 0], // Day2 evening → Day3 morning (cross-day)
  [1, 6, 8, "Event 9", 1],
  // Resource C: three-lane stack
  [2, 0, 2, "Event 10", 0],
  [2, 0.5, 2.5, "Event 11", 1],
  [2, 1, 3, "Event 12", 2],
  [2, 5, 7, "Event 13", 0],
  [2, 9.5, 11, "Event 14", 0],
];

/** Calculate row height based on stack count (same logic as Schedule Day) */
function getRowHeight(maxStack: number): number {
  if (maxStack === 0) return 48;
  return Math.max(48, maxStack * EVENT_HEIGHT + (maxStack - 1) * EVENT_GAP + ROW_PADDING * 2);
}

/** Max stack count per resource */
const rowStacks = [1, 2, 3];

/** Convert slot index to a time label string */
function slotToTimeLabel(slot: number): string {
  const dayIdx = Math.floor(slot / SLOTS_PER_DAY);
  const slotInDay = Math.floor(slot % SLOTS_PER_DAY);
  const dayLabel = DAYS[dayIdx]?.split(" ")[0] ?? "";
  const timeLabel = TIME_SLOTS_PER_DAY[slotInDay] ?? "";
  return `${dayLabel} ${timeLabel}`;
}

function ScheduleWeekWireframe() {
  const totalWidth = SLOT_WIDTH * TOTAL_SLOTS;
  // Now Indicator: Day2 (slots 4-7) around 12:00 = slot 6.3
  const nowSlot = 6.3;

  return (
    <div className="wf-container" style={{ maxWidth: 1080 }}>
      {/* Toolbar */}
      <div className="wf-toolbar">
        <div className="wf-toolbar-left">
          <button className="wf-nav-btn">◀</button>
          <span className="wf-date-label">2026년 03월 22일 — 03월 24일</span>
          <button className="wf-nav-btn">▶</button>
          <button className="wf-today-btn">오늘</button>
        </div>
        <div className="wf-toolbar-right">
          <button className="wf-today-btn">필터 ▾</button>
          <div className="wf-view-toggle">
            <button>일간</button>
            <button className="active">주간</button>
            <button>월간</button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="wf-filter-chips">
        {RESOURCES.map((r, i) => (
          <span key={i} className="wf-chip active" style={{ background: r.color }}>
            ✓ {r.name}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="wf-grid-wrapper" style={{ maxHeight: 480 }}>
        <div style={{ display: "grid", gridTemplateColumns: `${SIDEBAR_WIDTH}px ${totalWidth}px` }}>
          {/* Corner cell — matches two-tier header height */}
          <div className="wf-corner" style={{ height: TOTAL_HEADER_HEIGHT }} />

          {/* Two-tier header area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 0,
              zIndex: 30,
            }}
          >
            {/* Tier 1: Date header (32px) */}
            <div
              className="wf-header"
              style={{ height: DATE_HEADER_HEIGHT, borderBottom: "1px solid var(--wf-border)" }}
            >
              {DAYS.map((day, di) => (
                <div
                  key={di}
                  style={{
                    width: SLOT_WIDTH * SLOTS_PER_DAY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--wf-text)",
                    borderRight: "2px solid #9ca3af",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Tier 2: Time header (48px) */}
            <div className="wf-header" style={{ height: TIME_HEADER_HEIGHT }}>
              {DAYS.map((_, di) =>
                TIME_SLOTS_PER_DAY.map((t, si) => {
                  const globalIdx = di * SLOTS_PER_DAY + si;
                  // Bold vertical line at date boundary (first slot of each day)
                  const isDateBoundary = si === 0;
                  return (
                    <div
                      key={globalIdx}
                      className="wf-header-cell"
                      style={{
                        width: SLOT_WIDTH,
                        borderRight:
                          isDateBoundary && si === 0 && di < DAYS.length - 1
                            ? undefined
                            : "1px solid var(--wf-border)",
                        borderLeft: isDateBoundary && di > 0 ? "2px solid #9ca3af" : undefined,
                      }}
                    >
                      {t}
                    </div>
                  );
                }),
              )}
            </div>
          </div>

          {/* Resource rows */}
          {RESOURCES.map((resource, ri) => {
            const maxStack = rowStacks[ri];
            const rowHeight = getRowHeight(maxStack);

            return (
              <div key={ri} style={{ display: "contents" }}>
                {/* Sidebar */}
                <div className="wf-sidebar-item" style={{ height: rowHeight }}>
                  <div className="wf-sidebar-icon" style={{ background: resource.icon }} />
                  <span className="wf-sidebar-name">{resource.name}</span>
                </div>

                {/* Row content */}
                <div
                  style={{
                    position: "relative",
                    height: rowHeight,
                    borderBottom: "1px solid var(--wf-border)",
                  }}
                >
                  {/* Grid lines + date boundaries */}
                  {Array.from({ length: TOTAL_SLOTS }).map((_, si) => {
                    const isDateBoundary = si > 0 && si % SLOTS_PER_DAY === 0;
                    return (
                      <div
                        key={si}
                        className={isDateBoundary ? "wf-gridline-strong" : undefined}
                        style={{
                          position: "absolute",
                          left: si * SLOT_WIDTH,
                          top: 0,
                          bottom: 0,
                          borderRight: isDateBoundary
                            ? "2px solid #9ca3af"
                            : "1px solid var(--wf-border)",
                        }}
                      />
                    );
                  })}

                  {/* Event cards */}
                  {EVENTS.filter(([eri]) => eri === ri).map(([, start, end, title, lane], ei) => {
                    const style: CSSProperties = {
                      left: start * SLOT_WIDTH,
                      width: (end - start) * SLOT_WIDTH - 2,
                      top: ROW_PADDING + lane * (EVENT_HEIGHT + EVENT_GAP),
                      height: EVENT_HEIGHT,
                      background: `${resource.color}15`,
                      borderLeft: `3px solid ${resource.color}`,
                    };
                    return (
                      <div key={ei} className="wf-event" style={style}>
                        <div>{title}</div>
                        <div className="wf-event-time">
                          {slotToTimeLabel(start)} - {slotToTimeLabel(end)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Now Indicator — dot (first row) + line, behind event cards (z:10 < event:20) */}
                  <div className="wf-now-line vertical" style={{ left: nowSlot * SLOT_WIDTH }} />
                  {ri === 0 && (
                    <div
                      className="wf-now-dot top"
                      style={{ left: nowSlot * SLOT_WIDTH, top: -5 }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Wireframes/Schedule Week",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => <ScheduleWeekWireframe />,
  name: "Schedule Week — Two-tier header + Cross-day events",
};
