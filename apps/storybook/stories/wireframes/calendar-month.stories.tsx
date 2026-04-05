import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "./wireframe.css";

/**
 * Calendar Month wireframe
 *
 * Two modes: bar (horizontal event bar stack) / list (in-cell list)
 * Ref: docs/design/calendar/calendar-month.md
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// March calendar dates (weeks x 7)
const WEEKS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 0, 0, 0, 0], // 0 = next month
];

const TODAY = 27;

const RESOURCES = [
  { name: "Resource A", color: "#3b82f6" },
  { name: "Resource B", color: "#8b5cf6" },
  { name: "Resource C", color: "#06b6d4" },
];

// Bar mode event data: [weekIdx, startCol, endCol, title, color, row]
const BARS: [number, number, number, string, string, number][] = [
  [0, 1, 5, "Event Alpha", "#3b82f6", 0], // Week 1: Mon-Fri
  [0, 2, 3, "Event Beta", "#8b5cf6", 1], // Week 1: Tue-Wed (row 1)
  [2, 0, 0, "Event Gamma", "#06b6d4", 0], // Week 3: Sun only
  [2, 3, 6, "Event Delta", "#10b981", 0], // Week 3: Wed-Sat
  [3, 0, 2, "Event Epsilon", "#f59e0b", 0], // Week 4: Sun-Tue
];

const BAR_HEIGHT = 22;
const BAR_GAP = 2;
// Bars start below the date number area
const BAR_TOP_OFFSET = 24;

function CalendarMonthBarWireframe() {
  return (
    <div className="wf-container" style={{ maxWidth: 800 }}>
      {/* Toolbar */}
      <div className="wf-toolbar">
        <div className="wf-toolbar-left">
          <button className="wf-nav-btn">◀</button>
          <span className="wf-date-label">2026년 3월</span>
          <button className="wf-nav-btn">▶</button>
          <button className="wf-today-btn">오늘</button>
        </div>
        <div className="wf-toolbar-right">
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

      {/* Month grid */}
      <div className="wf-month-grid">
        {/* Weekday headers */}
        {WEEKDAYS.map((d) => (
          <div key={d} className="wf-month-header-cell">
            {d}
          </div>
        ))}

        {/* Weekly rows — wrapper per week for absolute bar positioning */}
        {WEEKS.map((week, wi) => (
          <div
            key={wi}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gridColumn: "1 / -1",
              position: "relative",
            }}
          >
            {/* Date cells */}
            {week.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                className={`wf-month-cell ${day === TODAY ? "wf-today-highlight" : ""}`}
              >
                {day > 0 ? (
                  <div className={`wf-month-date ${day === TODAY ? "wf-today-number" : ""}`}>
                    {day}
                  </div>
                ) : (
                  <div className="wf-month-date muted">{wi === 4 ? [1, 2, 3, 4][di - 3] : ""}</div>
                )}
              </div>
            ))}

            {/* Bar events — absolutely positioned at week-row level to span across cell boundaries */}
            {BARS.filter(([weekIdx]) => weekIdx === wi).map(
              ([, startCol, endCol, title, color, row], i) => (
                <div
                  key={i}
                  className="wf-month-bar"
                  style={{
                    position: "absolute",
                    left: `${(startCol / 7) * 100}%`,
                    width: `${((endCol - startCol + 1) / 7) * 100}%`,
                    top: BAR_TOP_OFFSET + row * (BAR_HEIGHT + BAR_GAP),
                    height: BAR_HEIGHT,
                    background: color,
                    boxSizing: "border-box",
                    padding: "2px 6px",
                    zIndex: 20,
                  }}
                >
                  {title}
                </div>
              ),
            )}
          </div>
        ))}
      </div>

      {/* Bottom detail list (bar mode only) */}
      <div className="wf-detail-list">
        <div className="wf-detail-title">진행중인 이벤트</div>
        <div className="wf-detail-item">
          <div className="wf-month-dot" style={{ background: "#3b82f6" }} />
          <div>
            <strong>Event Alpha</strong>
            <span style={{ color: "#9ca3af", marginLeft: 8, fontSize: 12 }}>
              03.02(월) - 03.06(금)
            </span>
          </div>
        </div>
        <div className="wf-detail-item">
          <div className="wf-month-dot" style={{ background: "#10b981" }} />
          <div>
            <strong>Event Delta</strong>
            <span style={{ color: "#9ca3af", marginLeft: 8, fontSize: 12 }}>
              03.18(목) - 03.21(일)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarMonthListWireframe() {
  const [popupDay, setPopupDay] = useState<number | null>(null);

  // Per-cell event data (simplified)
  const cellEvents: Record<number, { time: string; title: string; color: string }[]> = {
    2: [
      { time: "09:00", title: "Event A", color: "#3b82f6" },
      { time: "11:00", title: "Event B", color: "#8b5cf6" },
      { time: "14:00", title: "Event C", color: "#06b6d4" },
    ],
    5: [{ time: "10:00", title: "Event D", color: "#10b981" }],
    10: [
      { time: "09:30", title: "Event E", color: "#f59e0b" },
      { time: "11:00", title: "Event F", color: "#3b82f6" },
      { time: "14:00", title: "Event G", color: "#8b5cf6" },
      { time: "15:00", title: "Event H", color: "#06b6d4" },
      { time: "16:00", title: "Event I", color: "#10b981" },
    ],
    15: [{ time: "10:00", title: "Event J", color: "#ef4444" }],
    27: [
      { time: "09:00", title: "Event K", color: "#3b82f6" },
      { time: "14:00", title: "Event L", color: "#10b981" },
    ],
  };

  return (
    <div className="wf-container" style={{ maxWidth: 800 }}>
      {/* Toolbar */}
      <div className="wf-toolbar">
        <div className="wf-toolbar-left">
          <button className="wf-nav-btn">◀</button>
          <span className="wf-date-label">2026년 3월</span>
          <button className="wf-nav-btn">▶</button>
          <button className="wf-today-btn">오늘</button>
        </div>
        <div className="wf-toolbar-right">
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

      <div className="wf-month-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="wf-month-header-cell">
            {d}
          </div>
        ))}

        {WEEKS.map((week, wi) =>
          week.map((day, di) => {
            const events = cellEvents[day];
            const maxShow = 2;
            const hidden = events && events.length > maxShow ? events.length - maxShow : 0;

            return (
              <div
                key={`${wi}-${di}`}
                className={`wf-month-cell ${day === TODAY ? "wf-today-highlight" : ""}`}
              >
                {day > 0 ? (
                  <>
                    <div className={`wf-month-date ${day === TODAY ? "wf-today-number" : ""}`}>
                      {day}
                    </div>
                    {events?.slice(0, maxShow).map((e, i) => (
                      <div key={i} className="wf-month-list-item">
                        <div className="wf-month-dot" style={{ background: e.color }} />
                        <span style={{ color: "#9ca3af" }}>{e.time}</span>
                        <span>{e.title}</span>
                      </div>
                    ))}
                    {hidden > 0 && (
                      <div className="wf-more-link" onClick={() => setPopupDay(day)}>
                        {hidden}개 더보기
                      </div>
                    )}

                    {/* Date detail popup — shown adjacent to the clicked cell */}
                    {popupDay === day && events && (
                      <div className="wf-popup" style={{ top: 0, left: "100%", marginLeft: 4 }}>
                        <div className="wf-popup-header">
                          <span>3월 {day}일</span>
                          <button className="wf-popup-close" onClick={() => setPopupDay(null)}>
                            ✕
                          </button>
                        </div>
                        {events.map((e, i) => (
                          <div key={i} className="wf-month-list-item">
                            <div className="wf-month-dot" style={{ background: e.color }} />
                            <span style={{ color: "#9ca3af" }}>{e.time}</span>
                            <span>{e.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="wf-month-date muted">{wi === 4 ? [1, 2, 3, 4][di - 3] : ""}</div>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Wireframes/Calendar Month",
  parameters: { layout: "padded" },
};

export default meta;

export const BarMode: StoryObj = {
  render: () => <CalendarMonthBarWireframe />,
  name: "Calendar Month -- Bar Mode",
};

export const ListMode: StoryObj = {
  render: () => <CalendarMonthListWireframe />,
  name: "Calendar Month -- List Mode",
};
