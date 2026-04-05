import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import "./wireframe.css";

/**
 * Schedule Month wireframe
 *
 * Layout: rows = resources, columns = date columns
 * Key features: two-tier header (date + weekday), multi-day spanning bars,
 *   vertical stack with variable row height, today column highlight
 * Ref: docs/design/schedule/schedule-month.md
 */

const COLUMN_WIDTH = 60;
const SIDEBAR_WIDTH = 200;
const DATE_HEADER_HEIGHT = 32;
const WEEKDAY_HEADER_HEIGHT = 32;
const TOTAL_HEADER_HEIGHT = DATE_HEADER_HEIGHT + WEEKDAY_HEADER_HEIGHT;
const EVENT_HEIGHT = 24;
const EVENT_GAP = 4;
const ROW_PADDING = 4;

// 03/15 (Sun) - 03/28 (Sat), 14 days
const DATES = [
  { date: "03/15", weekday: "일" },
  { date: "03/16", weekday: "월" },
  { date: "03/17", weekday: "화" },
  { date: "03/18", weekday: "수" },
  { date: "03/19", weekday: "목" },
  { date: "03/20", weekday: "금" },
  { date: "03/21", weekday: "토" },
  { date: "03/22", weekday: "일" },
  { date: "03/23", weekday: "월" },
  { date: "03/24", weekday: "화" },
  { date: "03/25", weekday: "수" },
  { date: "03/26", weekday: "목" },
  { date: "03/27", weekday: "금" },
  { date: "03/28", weekday: "토" },
];

// Today = 03/27, index 12
const TODAY_COL = 12;

const RESOURCES = [
  { name: "Resource A", color: "#3b82f6", icon: "#3b82f6" },
  { name: "Resource B", color: "#8b5cf6", icon: "#8b5cf6" },
  { name: "Resource C", color: "#06b6d4", icon: "#06b6d4" },
];

// Events: [resourceIdx, startCol, endCol (exclusive), title, lane]
// endCol is exclusive — actual bar width = (endCol - startCol) * COLUMN_WIDTH
const EVENTS: [number, number, number, string, number][] = [
  // Resource A: 3 lanes (high density)
  [0, 0, 1, "Event 1", 0],
  [0, 2, 5, "Event 2", 0],
  [0, 6, 8, "Event 3", 0],
  [0, 9, 13, "Event 4", 0],
  [0, 1, 4, "Event 5", 1],
  [0, 5, 7, "Event 6", 1],
  [0, 12, 14, "Event 7", 1],
  [0, 3, 6, "Event 8", 2],
  // Resource B: 2 lanes (medium density)
  [1, 1, 6, "Event 9", 0],
  [1, 7, 11, "Event 10", 0],
  [1, 3, 8, "Event 11", 1],
  [1, 11, 14, "Event 12", 0],
  // Resource C: 1 lane (low density)
  [2, 0, 3, "Event 13", 0],
  [2, 5, 9, "Event 14", 0],
  [2, 10, 12, "Event 15", 0],
];

/** Calculate row height based on max stack count per resource */
function getRowHeight(maxStack: number): number {
  if (maxStack === 0) return 48;
  return Math.max(48, maxStack * EVENT_HEIGHT + (maxStack - 1) * EVENT_GAP + ROW_PADDING * 2);
}

// Max lane count per resource: A=3, B=2, C=1
const rowStacks = [3, 2, 1];

function ScheduleMonthWireframe() {
  const totalWidth = COLUMN_WIDTH * DATES.length;

  return (
    <div className="wf-container" style={{ maxWidth: 1100 }}>
      {/* Toolbar */}
      <div className="wf-toolbar">
        <div className="wf-toolbar-left">
          <button className="wf-nav-btn">◀</button>
          <span className="wf-date-label">2026년 3월</span>
          <button className="wf-nav-btn">▶</button>
          <button className="wf-today-btn">오늘</button>
        </div>
        <div className="wf-toolbar-right">
          <button className="wf-today-btn">필터 ▾</button>
          <div className="wf-view-toggle">
            <button>일간</button>
            <button>주간</button>
            <button className="active">월간</button>
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
          <div className="wf-corner" style={{ height: TOTAL_HEADER_HEIGHT }}>
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "var(--wf-text-secondary)",
              }}
            >
              리소스
            </div>
          </div>

          {/* Two-tier header: date (top) + weekday (bottom) */}
          <div style={{ position: "sticky", top: 0, zIndex: 30 }}>
            {/* Date header (top, 32px) */}
            <div className="wf-header" style={{ height: DATE_HEADER_HEIGHT }}>
              {DATES.map((d, i) => (
                <div
                  key={i}
                  className={`wf-header-cell ${i === TODAY_COL ? "wf-today-highlight" : ""}`}
                  style={{ width: COLUMN_WIDTH }}
                >
                  <span className={i === TODAY_COL ? "wf-today-number" : ""}>{d.date}</span>
                </div>
              ))}
            </div>

            {/* Weekday header (bottom, 32px) */}
            <div className="wf-header" style={{ height: WEEKDAY_HEADER_HEIGHT }}>
              {DATES.map((d, i) => (
                <div
                  key={i}
                  className={`wf-header-cell ${i === TODAY_COL ? "wf-today-highlight" : ""}`}
                  style={{ width: COLUMN_WIDTH }}
                >
                  {d.weekday}
                </div>
              ))}
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
                  {/* Today column highlight background */}
                  <div
                    style={{
                      position: "absolute",
                      left: TODAY_COL * COLUMN_WIDTH,
                      top: 0,
                      bottom: 0,
                      width: COLUMN_WIDTH,
                      background: "var(--wf-today-bg)",
                      zIndex: 0,
                      pointerEvents: "none",
                    }}
                  />

                  {/* Grid vertical lines */}
                  {DATES.map((_, ci) => (
                    <div
                      key={ci}
                      style={{
                        position: "absolute",
                        left: ci * COLUMN_WIDTH,
                        top: 0,
                        bottom: 0,
                        borderRight: "1px solid var(--wf-border)",
                        zIndex: 1,
                      }}
                    />
                  ))}

                  {/* Event bars — multi-day spanning */}
                  {EVENTS.filter(([eri]) => eri === ri).map(
                    ([, startCol, endCol, title, lane], ei) => {
                      const style: CSSProperties = {
                        position: "absolute",
                        left: startCol * COLUMN_WIDTH + 2,
                        width: (endCol - startCol) * COLUMN_WIDTH - 4,
                        top: ROW_PADDING + lane * (EVENT_HEIGHT + EVENT_GAP),
                        height: EVENT_HEIGHT,
                        zIndex: 20,
                      };
                      return (
                        <div
                          key={ei}
                          className="wf-month-bar"
                          style={{
                            ...style,
                            background: resource.color,
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 0,
                          }}
                        >
                          {title}
                        </div>
                      );
                    },
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
  title: "Wireframes/Schedule Month",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => <ScheduleMonthWireframe />,
  name: "Schedule Month — Date columns + Spanning bars",
};
