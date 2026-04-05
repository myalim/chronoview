import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import "./wireframe.css";

/**
 * Calendar Day wireframe
 *
 * Layout: vertical=time, horizontal=single column
 * Key elements: horizontal stack (overlap lane splitting) + Now indicator (horizontal line)
 * Ref: docs/design/calendar/calendar-day.md
 */

const SLOT_HEIGHT = 60;
const SIDEBAR_WIDTH = 60;
const TIME_SLOTS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

// Resources (for color differentiation)
const RESOURCES = [
  { name: "Resource A", color: "#3b82f6" },
  { name: "Resource B", color: "#8b5cf6" },
  { name: "Resource C", color: "#06b6d4" },
];

// Events: [startSlot, endSlot, title, color, lane, totalLanes]
const EVENTS: [number, number, string, string, number, number][] = [
  [1, 2.5, "Morning Standup", "#3b82f6", 0, 1],
  [3, 4.5, "Design Review", "#8b5cf6", 0, 2],
  [3.5, 5, "1:1 Meeting", "#06b6d4", 1, 2],
  [5.5, 7, "Sprint Planning", "#10b981", 0, 1],
];

function CalendarDayWireframe() {
  const _totalHeight = SLOT_HEIGHT * TIME_SLOTS.length;
  const _columnWidth = 500;
  const nowSlot = 4.8;

  return (
    <div className="wf-container" style={{ maxWidth: 640 }}>
      {/* Toolbar */}
      <div className="wf-toolbar">
        <div className="wf-toolbar-left">
          <button className="wf-nav-btn">◀</button>
          <span className="wf-date-label">2026년 03월 27일 금요일</span>
          <button className="wf-nav-btn">▶</button>
          <button className="wf-today-btn">오늘</button>
        </div>
        <div className="wf-toolbar-right">
          <div className="wf-view-toggle">
            <button className="active">일간</button>
            <button>주간</button>
            <button>월간</button>
          </div>
        </div>
      </div>

      {/* Filter chips (shown when resources exist) */}
      <div className="wf-filter-chips">
        {RESOURCES.map((r, i) => (
          <span key={i} className="wf-chip active" style={{ background: r.color }}>
            ✓ {r.name}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "flex", overflow: "auto", maxHeight: 460 }}>
        {/* Time sidebar */}
        <div
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            background: "var(--wf-sidebar-bg)",
            borderRight: "1px solid var(--wf-border)",
          }}
        >
          {TIME_SLOTS.map((t, i) => (
            <div
              key={i}
              style={{
                height: SLOT_HEIGHT,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                paddingRight: 8,
                paddingTop: 0,
                fontSize: 11,
                color: "var(--wf-text-secondary)",
                borderBottom: "1px solid var(--wf-border)",
                transform: "translateY(-7px)",
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Single column */}
        <div style={{ flex: 1, position: "relative", minWidth: 300 }}>
          {/* Horizontal grid lines */}
          {TIME_SLOTS.map((_, i) => (
            <div
              key={i}
              style={{
                height: SLOT_HEIGHT,
                borderBottom: "1px solid var(--wf-border)",
              }}
            />
          ))}

          {/* Event cards */}
          {EVENTS.map(([start, end, title, color, lane, totalLanes], i) => {
            const laneWidth = 100 / totalLanes;
            const style: CSSProperties = {
              top: start * SLOT_HEIGHT,
              height: (end - start) * SLOT_HEIGHT - 2,
              left: `${lane * laneWidth}%`,
              width: `calc(${laneWidth}% - 4px)`,
              background: `${color}15`,
              borderLeft: `3px solid ${color}`,
              marginLeft: 2,
            };
            return (
              <div key={i} className="wf-event" style={style}>
                <div>{title}</div>
                <div className="wf-event-time">
                  {TIME_SLOTS[Math.floor(start)]} - {TIME_SLOTS[Math.floor(end)]}
                </div>
              </div>
            );
          })}

          {/* Now indicator (horizontal line) */}
          <div className="wf-now-line horizontal" style={{ top: nowSlot * SLOT_HEIGHT }} />
          {/* Now dot */}
          <div className="wf-now-dot left" style={{ top: nowSlot * SLOT_HEIGHT, left: 0 }} />
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Wireframes/Calendar Day",
  parameters: { layout: "padded" },
};

export default meta;

export const Default: StoryObj = {
  render: () => <CalendarDayWireframe />,
  name: "Calendar Day — Default",
};
