import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import "./wireframe.css";

/**
 * Calendar Week 와이어프레임
 *
 * 레이아웃: 세로=시간, 가로=요일 7열
 * 핵심: horizontal stack + 오늘 열 하이라이트 + Now Indicator (오늘 열에만)
 * 참조: docs/design/calendar/calendar-week.md
 */

const SLOT_HEIGHT = 60;
const SIDEBAR_WIDTH = 60;
const TIME_SLOTS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

/* 리소스 (색상 구분용) */
const RESOURCES = [
  { name: "Resource A", color: "#3b82f6" },
  { name: "Resource B", color: "#8b5cf6" },
  { name: "Resource C", color: "#06b6d4" },
];

function CalendarWeekWireframe() {
  /* 일요일 시작 (weekStartsOn=0 기본값) */
  const DAYS = ["일 3/22", "월 3/23", "화 3/24", "수 3/25", "목 3/26", "금 3/27", "토 3/28"];
  const todayIndex = 5;
  const columnWidth = 100 / 7;

  // 이벤트: [요일idx, 시작슬롯, 끝슬롯, 제목, 색상, lane, totalLanes]
  const weekEvents: [number, number, number, string, string, number, number][] = [
    [1, 1, 2.5, "Standup", "#3b82f6", 0, 1],       // 월
    [2, 2, 4, "Design Review", "#8b5cf6", 0, 1],    // 화
    [4, 1, 2, "Event A", "#06b6d4", 0, 2],          // 목
    [4, 1.5, 2.5, "Event B", "#10b981", 1, 2],      // 목
    [5, 2, 4, "Sprint Plan", "#f59e0b", 0, 1],      // 금 (today)
    [6, 3, 5, "Workshop", "#ef4444", 0, 1],         // 토
  ];

  return (
    <div className="wf-container" style={{ maxWidth: 960 }}>
      <div className="wf-toolbar">
        <div className="wf-toolbar-left">
          <button className="wf-nav-btn">◀</button>
          <span className="wf-date-label">2026.03.22 - 03.28</span>
          <button className="wf-nav-btn">▶</button>
          <button className="wf-today-btn">오늘</button>
        </div>
        <div className="wf-toolbar-right">
          <div className="wf-view-toggle">
            <button>일간</button>
            <button className="active">주간</button>
            <button>월간</button>
          </div>
        </div>
      </div>

      {/* 필터 칩 (리소스 있을 때) */}
      <div className="wf-filter-chips">
        {RESOURCES.map((r, i) => (
          <span key={i} className="wf-chip active" style={{ background: r.color }}>
            ✓ {r.name}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", overflow: "auto", maxHeight: 420 }}>
        {/* 시간 사이드바 */}
        <div style={{ width: SIDEBAR_WIDTH, flexShrink: 0, background: "var(--wf-sidebar-bg)", borderRight: "1px solid var(--wf-border)" }}>
          <div style={{ height: 48, borderBottom: "1px solid var(--wf-border)" }} />
          {TIME_SLOTS.map((t, i) => (
            <div
              key={i}
              style={{
                height: SLOT_HEIGHT,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                paddingRight: 8,
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

        {/* 7열 */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* 요일 헤더 */}
          <div style={{ display: "flex", height: 48, borderBottom: "1px solid var(--wf-border)", position: "sticky", top: 0, zIndex: 30, background: "var(--wf-header-bg)" }}>
            {DAYS.map((d, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: i === todayIndex ? 700 : 400,
                  color: i === todayIndex ? "var(--wf-event-blue)" : "var(--wf-text-secondary)",
                  borderRight: "1px solid var(--wf-border)",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 시간 그리드 */}
          <div style={{ position: "relative" }}>
            {TIME_SLOTS.map((_, i) => (
              <div key={i} style={{ height: SLOT_HEIGHT, borderBottom: "1px solid var(--wf-border)", display: "flex" }}>
                {DAYS.map((_, di) => (
                  <div key={di} style={{ flex: 1, borderRight: "1px solid var(--wf-border)", background: di === todayIndex ? "var(--wf-today-bg)" : undefined }} />
                ))}
              </div>
            ))}

            {/* 이벤트 */}
            {weekEvents.map(([dayIdx, start, end, title, color, lane, totalLanes], i) => {
              const laneWidth = columnWidth / totalLanes;
              const style: CSSProperties = {
                position: "absolute",
                top: start * SLOT_HEIGHT,
                height: (end - start) * SLOT_HEIGHT - 2,
                left: `calc(${dayIdx * columnWidth + lane * laneWidth}% + 2px)`,
                width: `calc(${laneWidth}% - 4px)`,
                background: `${color}15`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 11,
                fontWeight: 500,
                overflow: "hidden",
              };
              return (
                <div key={i} className="wf-event" style={style}>
                  {title}
                </div>
              );
            })}

            {/* Now Indicator — 오늘 열에만 표시 (도트+선) */}
            <div
              className="wf-now-line horizontal"
              style={{
                top: 4.8 * SLOT_HEIGHT,
                left: `${todayIndex * columnWidth}%`,
                width: `${columnWidth}%`,
                right: "auto",
              }}
            />
            <div
              className="wf-now-dot left"
              style={{
                top: 4.8 * SLOT_HEIGHT,
                left: `${todayIndex * columnWidth}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Wireframes/Calendar Week",
  parameters: { layout: "padded" },
};

export default meta;

export const Default: StoryObj = {
  render: () => <CalendarWeekWireframe />,
  name: "Calendar Week — 7열 + 오늘 하이라이트",
};
