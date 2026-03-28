import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import "./wireframe.css";

/**
 * Calendar Month 와이어프레임
 *
 * 두 가지 모드: bar (이벤트 바 가로 스택) / list (셀 내 리스트형)
 * 참조: docs/design/calendar/calendar-month.md
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 3월 달력 날짜 (주차x7)
const WEEKS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 0, 0, 0, 0], // 0 = 다음 달
];

const TODAY = 27;

const RESOURCES = [
  { name: "Resource A", color: "#3b82f6" },
  { name: "Resource B", color: "#8b5cf6" },
  { name: "Resource C", color: "#06b6d4" },
];

// Bar 모드 이벤트 데이터: [weekIdx, startCol, endCol, title, color, row]
const BARS: [number, number, number, string, string, number][] = [
  [0, 1, 5, "Event Alpha", "#3b82f6", 0],    // Week 1: Mon-Fri
  [0, 2, 3, "Event Beta", "#8b5cf6", 1],      // Week 1: Tue-Wed (row 1)
  [2, 0, 0, "Event Gamma", "#06b6d4", 0],     // Week 3: Sun only
  [2, 3, 6, "Event Delta", "#10b981", 0],      // Week 3: Wed-Sat
  [3, 0, 2, "Event Epsilon", "#f59e0b", 0],   // Week 4: Sun-Tue
];

const BAR_HEIGHT = 22;
const BAR_GAP = 2;
// 날짜 숫자 영역 아래부터 바 시작
const BAR_TOP_OFFSET = 24;

function CalendarMonthBarWireframe() {
  return (
    <div className="wf-container" style={{ maxWidth: 800 }}>
      {/* 툴바 */}
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

      {/* 필터 칩 */}
      <div className="wf-filter-chips">
        {RESOURCES.map((r, i) => (
          <span key={i} className="wf-chip active" style={{ background: r.color }}>
            ✓ {r.name}
          </span>
        ))}
      </div>

      {/* 월간 그리드 */}
      <div className="wf-month-grid">
        {/* 요일 헤더 */}
        {WEEKDAYS.map((d) => (
          <div key={d} className="wf-month-header-cell">{d}</div>
        ))}

        {/* 주차별 행 — 각 주차를 감싸는 wrapper로 바를 절대 배치 */}
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
            {/* 날짜 셀 */}
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

            {/* 바 이벤트 — 주차 행 레벨에서 절대 배치로 셀 경계를 넘어 연속 렌더링 */}
            {BARS.filter(([weekIdx]) => weekIdx === wi).map(([, startCol, endCol, title, color, row], i) => (
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
            ))}
          </div>
        ))}
      </div>

      {/* 하단 상세 리스트 (bar 모드 전용) */}
      <div className="wf-detail-list">
        <div className="wf-detail-title">진행중인 이벤트</div>
        <div className="wf-detail-item">
          <div className="wf-month-dot" style={{ background: "#3b82f6" }} />
          <div>
            <strong>Event Alpha</strong>
            <span style={{ color: "#9ca3af", marginLeft: 8, fontSize: 12 }}>03.02(월) - 03.06(금)</span>
          </div>
        </div>
        <div className="wf-detail-item">
          <div className="wf-month-dot" style={{ background: "#10b981" }} />
          <div>
            <strong>Event Delta</strong>
            <span style={{ color: "#9ca3af", marginLeft: 8, fontSize: 12 }}>03.18(목) - 03.21(일)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarMonthListWireframe() {
  const [popupDay, setPopupDay] = useState<number | null>(null);

  // 셀별 이벤트 데이터 (간소화)
  const cellEvents: Record<number, { time: string; title: string; color: string }[]> = {
    2: [
      { time: "09:00", title: "Event A", color: "#3b82f6" },
      { time: "11:00", title: "Event B", color: "#8b5cf6" },
      { time: "14:00", title: "Event C", color: "#06b6d4" },
    ],
    5: [
      { time: "10:00", title: "Event D", color: "#10b981" },
    ],
    10: [
      { time: "09:30", title: "Event E", color: "#f59e0b" },
      { time: "11:00", title: "Event F", color: "#3b82f6" },
      { time: "14:00", title: "Event G", color: "#8b5cf6" },
      { time: "15:00", title: "Event H", color: "#06b6d4" },
      { time: "16:00", title: "Event I", color: "#10b981" },
    ],
    15: [
      { time: "10:00", title: "Event J", color: "#ef4444" },
    ],
    27: [
      { time: "09:00", title: "Event K", color: "#3b82f6" },
      { time: "14:00", title: "Event L", color: "#10b981" },
    ],
  };

  return (
    <div className="wf-container" style={{ maxWidth: 800 }}>
      {/* 툴바 */}
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

      {/* 필터 칩 */}
      <div className="wf-filter-chips">
        {RESOURCES.map((r, i) => (
          <span key={i} className="wf-chip active" style={{ background: r.color }}>
            ✓ {r.name}
          </span>
        ))}
      </div>

      <div className="wf-month-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="wf-month-header-cell">{d}</div>
        ))}

        {WEEKS.map((week, wi) => (
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
                      <div
                        className="wf-more-link"
                        onClick={() => setPopupDay(day)}
                      >
                        {hidden}개 더보기
                      </div>
                    )}

                    {/* 날짜 상세 팝업 — 클릭한 셀 위에 표시 */}
                    {popupDay === day && events && (
                      <div className="wf-popup" style={{ top: 0, left: "100%", marginLeft: 4 }}>
                        <div className="wf-popup-header">
                          <span>3월 {day}일</span>
                          <button
                            className="wf-popup-close"
                            onClick={() => setPopupDay(null)}
                          >
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
          })
        ))}
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
  name: "Calendar Month -- bar 모드",
};

export const ListMode: StoryObj = {
  render: () => <CalendarMonthListWireframe />,
  name: "Calendar Month -- list 모드",
};
