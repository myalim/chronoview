import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import "./wireframe.css";

/**
 * Grid Day 와이어프레임
 *
 * 레이아웃: 세로=시간, 가로=리소스 (Schedule의 축 반전)
 * 핵심: 리소스 헤더(아이콘+뱃지) + 리치 카드 + 날짜 스크롤 피커
 * 참조: docs/design/grid/grid-day.md
 */

const SLOT_HEIGHT = 60;
const SIDEBAR_WIDTH = 60;
const COLUMN_WIDTH = 180;
const TIME_SLOTS = ["04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00"];

const RESOURCES = [
  { name: "Resource A", badge: 25, color: "#3b82f6" },
  { name: "Resource B", badge: 48, color: "#8b5cf6" },
  { name: "Resource C", badge: 24, color: "#06b6d4" },
  { name: "Resource D", badge: 23, color: "#10b981" },
];

// 이벤트: [리소스idx, 시작슬롯, 끝슬롯, 제목, 부제, lane, totalLanes]
const EVENTS: [number, number, number, string, string, number, number][] = [
  [0, 0, 2, "Project Meeting", "Room 301", 0, 1],
  [0, 4, 6, "Code Review", "Frontend", 0, 1],
  [1, 1, 3, "Design Sprint", "Phase 2", 0, 1],
  [2, 0, 1.5, "Standup", "Daily", 0, 1],
  [2, 3, 5, "QA Testing", "Release v2.1", 0, 2],
  [2, 3.5, 4.5, "Bug Triage", "Critical", 1, 2],
  [3, 2, 4, "Workshop", "Architecture", 0, 1],
  [3, 5, 7, "Documentation", "API Docs", 0, 1],
];

function GridDayWireframe() {
  const nowSlot = 3.3;
  const totalWidth = COLUMN_WIDTH * RESOURCES.length;

  return (
    <div className="wf-container" style={{ maxWidth: 860 }}>
      {/* 툴바 */}
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
          </div>
        </div>
      </div>

      {/* 날짜 스크롤 피커 */}
      <div className="wf-date-picker">
        <button className="wf-nav-btn" style={{ width: 28, height: 28 }}>◀</button>
        {Array.from({ length: 7 }, (_, i) => {
          const day = 24 + i;
          const isToday = day === 27;
          const isSelected = day === 27;
          return (
            <div
              key={i}
              className={`wf-date-chip ${isSelected ? "selected" : ""} ${isToday && !isSelected ? "today" : ""}`}
            >
              {day > 31 ? day - 31 : day}
            </div>
          );
        })}
        <button className="wf-nav-btn" style={{ width: 28, height: 28 }}>▶</button>
      </div>

      {/* 필터 칩 (리소스 필수이므로 항상 표시) */}
      <div className="wf-filter-chips">
        {RESOURCES.map((r, i) => (
          <span key={i} className="wf-chip active" style={{ background: r.color }}>
            ✓ {r.name}
          </span>
        ))}
      </div>

      {/* 그리드 */}
      <div style={{ overflow: "auto", maxHeight: 420 }}>
        <div style={{ display: "grid", gridTemplateColumns: `${SIDEBAR_WIDTH}px ${totalWidth}px` }}>
          {/* 코너셀 */}
          <div className="wf-corner" style={{ height: 64 }} />

          {/* 리소스 헤더 */}
          <div style={{
            display: "flex",
            height: 64,
            borderBottom: "1px solid var(--wf-border)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: "var(--wf-header-bg)",
          }}>
            {RESOURCES.map((r, i) => (
              <div
                key={i}
                style={{
                  width: COLUMN_WIDTH,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRight: "1px solid var(--wf-border)",
                  gap: 2,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: r.color }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--wf-text-secondary)" }}>{r.badge}건</span>
              </div>
            ))}
          </div>

          {/* 시간 사이드바 */}
          <div style={{ background: "var(--wf-sidebar-bg)", borderRight: "1px solid var(--wf-border)", position: "sticky", left: 0, zIndex: 30 }}>
            {TIME_SLOTS.map((t, i) => (
              <div
                key={i}
                style={{
                  height: SLOT_HEIGHT,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                  paddingRight: 6,
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

          {/* 그리드 본체 */}
          <div style={{ position: "relative" }}>
            {/* 가로 + 세로선 */}
            {TIME_SLOTS.map((_, ti) => (
              <div key={ti} style={{ height: SLOT_HEIGHT, borderBottom: "1px solid var(--wf-border)", display: "flex" }}>
                {RESOURCES.map((_, ri) => (
                  <div key={ri} style={{ width: COLUMN_WIDTH, borderRight: "1px solid var(--wf-border)" }} />
                ))}
              </div>
            ))}

            {/* 이벤트 카드 (리치 카드) */}
            {EVENTS.map(([resIdx, start, end, title, subtitle, lane, totalLanes], i) => {
              const laneWidth = COLUMN_WIDTH / totalLanes;
              const style: CSSProperties = {
                position: "absolute",
                top: start * SLOT_HEIGHT + 1,
                height: (end - start) * SLOT_HEIGHT - 3,
                left: resIdx * COLUMN_WIDTH + lane * laneWidth + 2,
                width: laneWidth - 4,
                background: "var(--wf-bg)",
                borderLeft: `3px solid ${RESOURCES[resIdx].color}`,
                borderRadius: 4,
                padding: "6px 8px",
                fontSize: 12,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                overflow: "hidden",
                zIndex: 20,
              };
              return (
                <div key={i} style={style}>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 11, color: "var(--wf-text-secondary)" }}>{subtitle}</div>
                  <div style={{ fontSize: 11, color: "var(--wf-text-secondary)", marginTop: 2 }}>
                    {TIME_SLOTS[Math.floor(start)]} - {TIME_SLOTS[Math.floor(end)]}
                  </div>
                </div>
              );
            })}

            {/* Now Indicator — 도트+선, 이벤트 카드 뒤 (z:10 < event:20) */}
            <div className="wf-now-line horizontal" style={{ top: nowSlot * SLOT_HEIGHT }} />
            <div
              className="wf-now-dot left"
              style={{ top: nowSlot * SLOT_HEIGHT, left: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Wireframes/Grid Day",
  parameters: { layout: "padded" },
};

export default meta;

export const Default: StoryObj = {
  render: () => <GridDayWireframe />,
  name: "Grid Day — 리치 카드 + 날짜 피커",
};
