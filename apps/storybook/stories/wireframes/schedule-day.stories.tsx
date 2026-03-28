import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import "./wireframe.css";

/**
 * Schedule Day 와이어프레임
 *
 * 레이아웃: 세로=리소스, 가로=시간
 * 핵심: vertical stack + 가변 행 높이 + sticky header/sidebar
 * 참조: docs/design/schedule/schedule-day.md
 */

const SLOT_WIDTH = 120;
const TIME_SLOTS = ["5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00"];
const SIDEBAR_WIDTH = 200;
const HEADER_HEIGHT = 48;
const EVENT_HEIGHT = 36;
const EVENT_GAP = 4;
const ROW_PADDING = 4;

const RESOURCES = [
  { name: "Resource A", color: "#3b82f6", icon: "#3b82f6" },
  { name: "Resource B", color: "#8b5cf6", icon: "#8b5cf6" },
  { name: "Resource C", color: "#06b6d4", icon: "#06b6d4" },
  { name: "Resource D", color: "#10b981", icon: "#10b981" },
];

// 이벤트: [리소스idx, 시작슬롯, 끝슬롯, 제목, lane]
const EVENTS: [number, number, number, string, number][] = [
  [0, 0, 1.5, "Meeting A", 0],
  [0, 2, 3.5, "Task B", 0],
  [0, 4, 5.5, "Review C", 0],
  [0, 5.5, 7, "Deploy D", 0],
  // Resource B: 2줄 스택 (가변 행 높이)
  [1, 0.5, 2.5, "Sprint Planning", 0],
  [1, 1.5, 4, "Design Review", 1],
  [1, 4.5, 6, "Code Review", 0],
  [1, 5, 7, "QA Session", 1],
  // Resource C: 3줄 스택 (최대 가변 행 높이)
  [2, 1, 3, "Project Alpha", 0],
  [2, 1.5, 4, "Backend API", 1],
  [2, 2, 3.5, "Database Migration", 2],
  [2, 5, 7, "Deployment", 0],
  // Resource D: 빈 리소스 (최소 높이)
];

function getRowHeight(maxStack: number): number {
  if (maxStack === 0) return 48;
  return Math.max(48, maxStack * EVENT_HEIGHT + (maxStack - 1) * EVENT_GAP + ROW_PADDING * 2);
}

const rowStacks = [1, 2, 3, 0];

function ScheduleDayWireframe() {
  const totalWidth = SLOT_WIDTH * TIME_SLOTS.length;
  const nowSlot = 4.3; // 9:18am 부근

  return (
    <div className="wf-container" style={{ maxWidth: 960 }}>
      {/* 툴바 */}
      <div className="wf-toolbar">
        <div className="wf-toolbar-left">
          <button className="wf-nav-btn">◀</button>
          <span className="wf-date-label">2026년 03월 27일 금요일</span>
          <button className="wf-nav-btn">▶</button>
          <button className="wf-today-btn">오늘</button>
        </div>
        <div className="wf-toolbar-right">
          <button className="wf-today-btn">필터 ▾</button>
          <div className="wf-view-toggle">
            <button className="active">일간</button>
            <button>주간</button>
            <button>월간</button>
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

      {/* 그리드 */}
      <div className="wf-grid-wrapper" style={{ maxHeight: 420 }}>
        <div style={{ display: "grid", gridTemplateColumns: `${SIDEBAR_WIDTH}px ${totalWidth}px` }}>
          {/* 코너셀 */}
          <div className="wf-corner" style={{ height: HEADER_HEIGHT }} />

          {/* 시간 헤더 */}
          <div className="wf-header" style={{ height: HEADER_HEIGHT }}>
            {TIME_SLOTS.map((t, i) => (
              <div key={i} className="wf-header-cell" style={{ width: SLOT_WIDTH }}>
                {t}
              </div>
            ))}
          </div>

          {/* 리소스 행 */}
          {RESOURCES.map((resource, ri) => {
            const maxStack = rowStacks[ri];
            const rowHeight = getRowHeight(maxStack);

            return (
              <div key={ri} style={{ display: "contents" }}>
                {/* 사이드바 */}
                <div className="wf-sidebar-item" style={{ height: rowHeight }}>
                  <div className="wf-sidebar-icon" style={{ background: resource.icon }} />
                  <span className="wf-sidebar-name">{resource.name}</span>
                </div>

                {/* 행 내용 */}
                <div style={{ position: "relative", height: rowHeight, borderBottom: "1px solid var(--wf-border)" }}>
                  {/* 그리드 세로선 */}
                  {TIME_SLOTS.map((_, si) => (
                    <div
                      key={si}
                      style={{
                        position: "absolute",
                        left: si * SLOT_WIDTH,
                        top: 0,
                        bottom: 0,
                        borderRight: "1px solid var(--wf-border)",
                      }}
                    />
                  ))}

                  {/* 이벤트 카드 */}
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
                          {TIME_SLOTS[Math.floor(start)]} - {TIME_SLOTS[Math.floor(end)]}
                        </div>
                      </div>
                    );
                  })}

                  {/* Now Indicator — 도트(첫 행)+선, 이벤트 카드 뒤 (z:10 < event:20) */}
                  <div
                    className="wf-now-line vertical"
                    style={{ left: nowSlot * SLOT_WIDTH }}
                  />
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
  title: "Wireframes/Schedule Day",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => <ScheduleDayWireframe />,
  name: "Schedule Day — 기본",
};

/** 가변 행 높이 강조: 스택 수에 따라 행 높이가 달라짐 */
export const VariableRowHeight: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 14, color: "#6b7280" }}>
        <strong>가변 행 높이 비교</strong> — 스택 수에 따라 행 높이가 자동 확장
      </div>
      <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Resource A (1 lane)</div>
          <div style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 4, height: getRowHeight(1), display: "flex", alignItems: "flex-start", gap: 4 }}>
            <div style={{ background: "#3b82f615", borderLeft: "3px solid #3b82f6", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>Event</div>
            <div style={{ background: "#3b82f615", borderLeft: "3px solid #3b82f6", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>Event</div>
          </div>
          <div style={{ color: "#9ca3af", marginTop: 4 }}>높이: {getRowHeight(1)}px</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Resource B (2 lanes)</div>
          <div style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 4, height: getRowHeight(2), display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ background: "#8b5cf615", borderLeft: "3px solid #8b5cf6", borderRadius: 4, padding: "4px 8px", fontSize: 12, flex: 1 }}>Event (lane 0)</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ background: "#8b5cf615", borderLeft: "3px solid #8b5cf6", borderRadius: 4, padding: "4px 8px", fontSize: 12, flex: 1 }}>Event (lane 1)</div>
            </div>
          </div>
          <div style={{ color: "#9ca3af", marginTop: 4 }}>높이: {getRowHeight(2)}px</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Resource C (3 lanes)</div>
          <div style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 4, height: getRowHeight(3), display: "flex", flexDirection: "column", gap: 4 }}>
            {[0, 1, 2].map((lane) => (
              <div key={lane} style={{ background: "#06b6d415", borderLeft: "3px solid #06b6d4", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>
                Event (lane {lane})
              </div>
            ))}
          </div>
          <div style={{ color: "#9ca3af", marginTop: 4 }}>높이: {getRowHeight(3)}px</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Resource D (빈 리소스)</div>
          <div style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 4, height: getRowHeight(0), display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db" }}>
            이벤트 없음
          </div>
          <div style={{ color: "#9ca3af", marginTop: 4 }}>높이: {getRowHeight(0)}px (최소)</div>
        </div>
      </div>
    </div>
  ),
  name: "가변 행 높이",
};
