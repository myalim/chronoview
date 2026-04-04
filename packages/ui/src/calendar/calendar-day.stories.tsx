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
 * Calendar Day 정적 UI 스토리
 *
 * 레이아웃: 세로=시간, 가로=단일 열
 * 핵심: auto stack (컬럼 패킹) + Now Indicator (가로선) + scrollToNow
 * 참조: docs/design/calendar/calendar-day.md
 */

// ─── Constants ───

const SLOT_HEIGHT = 60;
// 이벤트 범위(7~18시) 앞뒤로 1칸씩 빈 슬롯 추가 (Google Calendar, Planby 레퍼런스)
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
// Auto mode (컬럼 패킹, Google Calendar 스타일):
// depth=0이 가장 뒤, depth가 높을수록 앞(위)에 렌더링
// indent는 겹침 개수(maxDepth)에 따라 비율로 자동 계산 (정적 UI 임시 구현)

interface MockEvent {
  id: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  title: string;
  color: string;
  /** 겹침 깊이 — 0=가장 뒤, 높을수록 앞(위)에 렌더링 */
  depth: number;
  /** overlap group 내 최대 depth (indent 비율 계산용) */
  maxDepth: number;
}

const EVENTS: MockEvent[] = [
  // ─── 시간별 높이 테스트 (단독) ───
  { id: "e1", resourceId: "a", startHour: 7, endHour: 7 + 5 / 60, title: "Quick Ping", color: "#3b82f6", depth: 0, maxDepth: 0 },
  { id: "e2", resourceId: "b", startHour: 7.5, endHour: 7.5 + 10 / 60, title: "Standup Check", color: "#8b5cf6", depth: 0, maxDepth: 0 },
  { id: "e3", resourceId: "c", startHour: 8, endHour: 8.25, title: "Bio Break", color: "#06b6d4", depth: 0, maxDepth: 0 },
  { id: "e4", resourceId: "a", startHour: 8.5, endHour: 8.5 + 20 / 60, title: "Coffee Chat", color: "#3b82f6", depth: 0, maxDepth: 0 },
  { id: "e5", resourceId: "b", startHour: 9, endHour: 9.5, title: "Morning Standup", color: "#8b5cf6", depth: 0, maxDepth: 0 },
  { id: "e6", resourceId: "c", startHour: 9.75, endHour: 10.5, title: "Design Review", color: "#06b6d4", depth: 0, maxDepth: 0 },
  { id: "e7", resourceId: "a", startHour: 11, endHour: 12, title: "Sprint Planning", color: "#3b82f6", depth: 0, maxDepth: 0 },

  // ─── 2개 겹침 (auto, maxDepth=1) ───
  { id: "e8", resourceId: "c", startHour: 12.25, endHour: 13.25, title: "Lunch Meeting", color: "#06b6d4", depth: 0, maxDepth: 1 },
  { id: "e9", resourceId: "a", startHour: 12.5, endHour: 13, title: "Quick Call", color: "#3b82f6", depth: 1, maxDepth: 1 },

  // ─── 3개 겹침 (auto, maxDepth=2) ───
  { id: "e10", resourceId: "b", startHour: 13.5, endHour: 15, title: "Code Review", color: "#8b5cf6", depth: 0, maxDepth: 2 },
  { id: "e11", resourceId: "c", startHour: 14, endHour: 15.5, title: "API Design", color: "#06b6d4", depth: 1, maxDepth: 2 },
  { id: "e12", resourceId: "a", startHour: 14.5, endHour: 15.5, title: "1:1 Meeting", color: "#3b82f6", depth: 2, maxDepth: 2 },

  // ─── 동시 시작 2개 (auto, maxDepth=1) ───
  { id: "e13", resourceId: "b", startHour: 16, endHour: 17.5, title: "Deep Work", color: "#8b5cf6", depth: 0, maxDepth: 1 },
  { id: "e14", resourceId: "a", startHour: 16, endHour: 17, title: "Design Sync", color: "#3b82f6", depth: 1, maxDepth: 1 },

  // ─── 동시 시작 짧은 3개 (auto, maxDepth=2) ───
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

  // scrollToNow: 마운트 시 자동 스크롤
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

  // scrollToNow: 수동 버튼
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

  // Filter
  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Navigation
  const handlePrev = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  const handleNext = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  const handleToday = () => setDate(new Date());

  // Filter events by resource ID
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

      {/* 이벤트 카드 — Auto mode 컬럼 패킹 (Google Calendar 스타일) */}
      {visibleEvents.map((event) => {
        const top = hourToY(event.startHour);
        // 스펙: 이벤트 최소 높이 20px (calendar-day.md §3)
        const MIN_HEIGHT = 20;
        const height = Math.max(MIN_HEIGHT, hourToY(event.endHour) - top - 2);

        // auto mode: indent 기반 겹침 배치 (Google Calendar 스타일)
        // depth가 높을수록 오른쪽으로 들여쓰기, 뒤 이벤트 위에 렌더링
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

        // 불투명 배경: 겹침 시 뒤 이벤트 텍스트가 비치지 않도록
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
                // 불투명 색상 tint: 흰 바탕 위에 이벤트 색상 12% 합성
                background: `linear-gradient(${event.color}1f, ${event.color}1f), var(--cv-color-bg)`,
              }}
            >
              {isCompact ? (
                // compact: "Title, 10:00 – 11:00" 한 줄
                <span className="truncate text-[length:var(--cv-font-size-xs)] font-[var(--cv-font-weight-medium)]">
                  {event.title}
                  <span className="font-normal text-[var(--cv-color-text-secondary)]">
                    {`, ${timeLabel}`}
                  </span>
                </span>
              ) : (
                // 긴 이벤트: title + subtitle 세로 배치
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

// ─── 스태킹 방식 비교 스토리 ───
// 3가지 방식 비교: indent 겹침 / 균등 분배 / span 확장
// 동일 이벤트 데이터로 차이를 시각적으로 비교

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
  /** indent 모드용: 겹침 깊이 */
  depth: number;
  /** indent 모드용: 그룹 내 최대 depth */
  maxDepth: number;
  /** column-packing 모드용: 배정 레인 */
  lane: number;
  /** column-packing 모드용: 총 레인 수 */
  totalLanes: number;
  /** span 확장 모드용: 오른쪽 빈 컬럼으로 확장 (기본 1) */
  spanColumns: number;
}

interface CompareScenario {
  title: string;
  events: CompareEvent[];
}

const COMPARE_SCENARIOS: CompareScenario[] = [
  {
    title: "2개 겹침",
    events: [
      { id: "a1", title: "Sprint Planning", color: "#3b82f6", startHour: 9, endHour: 10.5, depth: 0, maxDepth: 1, lane: 0, totalLanes: 2, spanColumns: 1 },
      { id: "a2", title: "Design Sync", color: "#8b5cf6", startHour: 9.5, endHour: 11, depth: 1, maxDepth: 1, lane: 1, totalLanes: 2, spanColumns: 1 },
    ],
  },
  {
    title: "3개 시차 겹침",
    events: [
      { id: "b1", title: "Code Review", color: "#3b82f6", startHour: 9, endHour: 11, depth: 0, maxDepth: 2, lane: 0, totalLanes: 3, spanColumns: 1 },
      { id: "b2", title: "API Design", color: "#8b5cf6", startHour: 9.5, endHour: 10.5, depth: 1, maxDepth: 2, lane: 1, totalLanes: 3, spanColumns: 1 },
      { id: "b3", title: "1:1 Meeting", color: "#06b6d4", startHour: 10, endHour: 11.5, depth: 2, maxDepth: 2, lane: 2, totalLanes: 3, spanColumns: 1 },
    ],
  },
  {
    // span 확장이 의미있는 시나리오: B,C가 끝난 뒤 E가 빈 컬럼으로 확장
    title: "5개 (span 확장)",
    events: [
      // A: lane 0, 옆에 B 겹침 → span=1
      { id: "c1", title: "Deep Work", color: "#3b82f6", startHour: 9, endHour: 10.5, depth: 0, maxDepth: 2, lane: 0, totalLanes: 3, spanColumns: 1 },
      // B: lane 1, 옆에 C 겹침 → span=1
      { id: "c2", title: "Team Sync", color: "#8b5cf6", startHour: 9, endHour: 10, depth: 1, maxDepth: 2, lane: 1, totalLanes: 3, spanColumns: 1 },
      // C: lane 2 → span=1
      { id: "c3", title: "Quick Call", color: "#06b6d4", startHour: 9, endHour: 9.5, depth: 2, maxDepth: 2, lane: 2, totalLanes: 3, spanColumns: 1 },
      // D: C 끝난 뒤 lane 2 재사용 → span=1
      { id: "c4", title: "Check-in", color: "#10b981", startHour: 9.5, endHour: 10, depth: 2, maxDepth: 2, lane: 2, totalLanes: 3, spanColumns: 1 },
      // E: B,C,D 끝난 뒤 lane 1 재사용, lane 2도 비어서 → span=2
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
              // indent 겹침: depth가 높을수록 오른쪽으로 들여쓰기, 넓은 너비 유지
              const indentPct = event.maxDepth > 0 ? 100 / (event.maxDepth + 1.5) : 0;
              leftPct = event.depth * indentPct;
              widthPct = 100 - leftPct;
              zIndex = 20 + event.depth;
            } else if (style === "equal") {
              // 균등 분배: 겹침 없음, 모든 이벤트 동일 너비
              const lanePct = 100 / event.totalLanes;
              leftPct = event.lane * lanePct;
              widthPct = lanePct;
              zIndex = 20;
            } else if (style === "span-expand") {
              // span 확장: 균등 배치 + 빈 컬럼으로 너비 확장 (Apple Calendar 스타일)
              const lanePct = 100 / event.totalLanes;
              leftPct = event.lane * lanePct;
              widthPct = event.spanColumns * lanePct;
              zIndex = 20;
            } else {
              // span + overlap: 컬럼 패킹 기반이지만 인접 이벤트와 30% 겹침
              // indent의 가독성 + span 확장의 공간 활용을 결합
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
    { key: "indent", label: "Indent 겹침", description: "Google Calendar — 넓지만 뒤 이벤트 가림" },
    { key: "equal", label: "균등 분배", description: "겹침 없음, 모두 동일 너비" },
    { key: "span-expand", label: "Span 확장", description: "Apple Calendar — 빈 컬럼으로 확장" },
    { key: "span-overlap", label: "Span + Overlap", description: "span 확장 + 30% 겹침 (하이브리드)" },
  ];

  return (
    <div
      className="font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]"
      style={{ maxWidth: 1400, margin: "0 auto" }}
    >
      {/* Day 너비 비교 (넓은 열) */}
      <div className="mb-8">
        <div className="text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-bold)] mb-3 px-1">
          Day 뷰 (넓은 열)
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

      {/* Week 너비 비교 (좁은 열) */}
      <div>
        <div className="text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-bold)] mb-3 px-1">
          Week 뷰 (좁은 열 — 실제 week 뷰 1열 너비)
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
