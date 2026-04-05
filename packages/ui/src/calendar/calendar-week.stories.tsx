import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { calculateScrollToNow } from "@chronoview/core";
import { Button } from "../common/button.js";
import { FilterChips, type FilterChipResource } from "../common/filter-chips.js";
import { Toolbar } from "../common/toolbar.js";
import { EventCard } from "../schedule/event-card.js";
import { CalendarDayHeader } from "./calendar-day-header.js";
import { CalendarGridLines } from "./calendar-grid-lines.js";
import { CalendarNowIndicator } from "./calendar-now-indicator.js";
import { CalendarView } from "./calendar-view.js";
import { TimeSidebar } from "./time-sidebar.js";
import { WEEKDAY_LABELS } from "../utils/weekdays.js";

/**
 * Calendar Week 정적 UI 스토리
 *
 * 레이아웃: 세로=시간, 가로=요일 7열
 * 핵심: 열별 독립 auto (컬럼 패킹) + 오늘 열 하이라이트 + Now Indicator (오늘 열만)
 * 참조: docs/design/calendar/calendar-week.md
 */

// ─── Constants ───

const SLOT_HEIGHT = 60;
const HOUR_START = 6;
const HOUR_END = 20;
const TOTAL_SLOTS = HOUR_END - HOUR_START;
const TOTAL_MAIN_SIZE = TOTAL_SLOTS * SLOT_HEIGHT;
const EVENT_GAP = 4;
const DAY_COUNT = 7;
const COL_WIDTH_PCT = 100 / DAY_COUNT;
const HEADER_HEIGHT = 48;

// Mock "now" — 금요일 12:30
const NOW_HOUR = 12.5;
const NOW_POSITION = (NOW_HOUR - HOUR_START) * SLOT_HEIGHT;

// ─── Resources ───

const RESOURCES: FilterChipResource[] = [
  { id: "a", title: "Resource A", color: "#3b82f6" },
  { id: "b", title: "Resource B", color: "#8b5cf6" },
  { id: "c", title: "Resource C", color: "#06b6d4" },
];

// ─── Mock Events ───

interface WeekMockEvent {
  id: string;
  dayIndex: number;
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

const EVENTS: WeekMockEvent[] = [
  // ─── 월(1): 단일 이벤트 ───
  { id: "w1", dayIndex: 1, resourceId: "a", startHour: 9, endHour: 10, title: "Standup", color: "#3b82f6", depth: 0, maxDepth: 0 },

  // ─── 화(2): 비겹침 2개 ───
  { id: "w2", dayIndex: 2, resourceId: "b", startHour: 8, endHour: 9.5, title: "Design Review", color: "#8b5cf6", depth: 0, maxDepth: 0 },
  { id: "w3", dayIndex: 2, resourceId: "c", startHour: 14, endHour: 15.5, title: "Tech Sync", color: "#06b6d4", depth: 0, maxDepth: 0 },

  // ─── 수(3): 겹침 2개 (auto, maxDepth=1) ───
  { id: "w4", dayIndex: 3, resourceId: "a", startHour: 10, endHour: 12, title: "Sprint Plan", color: "#3b82f6", depth: 0, maxDepth: 1 },
  { id: "w5", dayIndex: 3, resourceId: "b", startHour: 10.5, endHour: 11.5, title: "1:1 Meeting", color: "#8b5cf6", depth: 1, maxDepth: 1 },

  // ─── 목(4): 겹침 3개 (auto, maxDepth=2) ───
  { id: "w6", dayIndex: 4, resourceId: "c", startHour: 13, endHour: 15, title: "Code Review", color: "#06b6d4", depth: 0, maxDepth: 2 },
  { id: "w7", dayIndex: 4, resourceId: "a", startHour: 13.5, endHour: 14.5, title: "API Design", color: "#3b82f6", depth: 1, maxDepth: 2 },
  { id: "w8", dayIndex: 4, resourceId: "b", startHour: 14, endHour: 15, title: "Quick Call", color: "#8b5cf6", depth: 2, maxDepth: 2 },

  // ─── 금(5, today): 2개 (Now 근처) ───
  { id: "w9", dayIndex: 5, resourceId: "a", startHour: 11, endHour: 12.5, title: "Deep Work", color: "#3b82f6", depth: 0, maxDepth: 0 },
  { id: "w10", dayIndex: 5, resourceId: "c", startHour: 14, endHour: 15.5, title: "Retro", color: "#06b6d4", depth: 0, maxDepth: 0 },

  // ─── 토(6): 짧은 이벤트 1개 (compact 카드) ───
  { id: "w11", dayIndex: 6, resourceId: "b", startHour: 10, endHour: 10.25, title: "Quick Ping", color: "#8b5cf6", depth: 0, maxDepth: 0 },
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

/** 주 시작 날짜로부터 7일 생성 */
function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: DAY_COUNT }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** 요일 헤더 라벨 생성 (e.g., "월 3/23") */
function formatDayLabel(date: Date): string {
  const dayOfWeek = date.getDay();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${WEEKDAY_LABELS[dayOfWeek]} ${month}/${day}`;
}

/** 주 시작 날짜 계산 (일요일 시작, weekStartsOn=0) */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

const TIME_SLOTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
  label: `${String(HOUR_START + i).padStart(2, "0")}:00`,
}));

// ─── Story Component ───

function CalendarWeekStory() {
  // 2026-03-22(일) ~ 03-28(토), Day 스토리와 같은 주
  const [date, setDate] = useState(new Date(2026, 2, 22));
  const [selectedIds, setSelectedIds] = useState(RESOURCES.map((r) => r.id));
  const containerRef = useRef<HTMLDivElement>(null);

  const weekStart = getWeekStart(date);
  const weekDates = getWeekDates(weekStart);

  // 오늘 인덱스 계산 (mock: 금요일 3/27)
  const mockToday = new Date(2026, 2, 27);
  const todayIndex = weekDates.findIndex(
    (d) =>
      d.getFullYear() === mockToday.getFullYear() &&
      d.getMonth() === mockToday.getMonth() &&
      d.getDate() === mockToday.getDate(),
  );

  // scrollToNow: 마운트 시 자동 스크롤
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scrollOffset = calculateScrollToNow({
      now: new Date(2026, 2, 27, 12, 30),
      rangeStart: new Date(2026, 2, 27, HOUR_START),
      rangeEnd: new Date(2026, 2, 27, HOUR_END),
      totalSize: TOTAL_MAIN_SIZE,
      viewportSize: el.clientHeight,
    });

    el.scrollTop = scrollOffset;
  }, []);

  // scrollToNow: 수동 버튼
  const handleScrollToNow = () => {
    const el = containerRef.current;
    if (!el) return;

    const scrollOffset = calculateScrollToNow({
      now: new Date(2026, 2, 27, 12, 30),
      rangeStart: new Date(2026, 2, 27, HOUR_START),
      rangeEnd: new Date(2026, 2, 27, HOUR_END),
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

  // Navigation (±7일)
  const handlePrev = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
  const handleNext = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
  const handleToday = () => setDate(new Date());

  // Filter events by resource
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

  const dayHeaderCells = weekDates.map((d, i) => ({
    label: formatDayLabel(d),
    isToday: i === todayIndex,
  }));

  const header = <CalendarDayHeader dates={dayHeaderCells} />;

  const toolbar = (
    <Toolbar
      currentDate={weekStart}
      view="week"
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

  // 스펙: 이벤트 최소 높이 20px (calendar-day.md §3)
  // 15분 미만 이벤트도 텍스트(descender 포함) + padding이 들어갈 최소 크기 보장
  const MIN_HEIGHT = 20;

  const body = (
    <>
      {/* 1. Today highlight — 오늘 열 배경 */}
      {todayIndex >= 0 && (
        <div
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${todayIndex * COL_WIDTH_PCT}%`,
            width: `${COL_WIDTH_PCT}%`,
            height: TOTAL_MAIN_SIZE,
            background: "var(--cv-color-today-bg)",
          }}
        />
      )}

      {/* 2. Grid lines — 가로선 전체 너비 */}
      <CalendarGridLines
        slotCount={TOTAL_SLOTS}
        slotHeight={SLOT_HEIGHT}
        crossSize="100%"
      />

      {/* 3. Column dividers — 요일 경계 세로선 */}
      {WEEKDAY_LABELS.slice(1).map((day, i) => {
        const pct = (i + 1) * COL_WIDTH_PCT;
        return (
          <div
            key={`col-div-${day}`}
            className="absolute top-0 pointer-events-none"
            style={{
              left: `${pct}%`,
              width: 1,
              height: TOTAL_MAIN_SIZE,
              background: "var(--cv-color-border)",
            }}
          />
        );
      })}

      {/* 4. Event cards — 열별 auto 배치 */}
      {visibleEvents.map((event) => {
        const top = hourToY(event.startHour);
        const height = Math.max(MIN_HEIGHT, hourToY(event.endHour) - top - 2);

        // 열 내 auto: indent 기반 겹침 배치 (Google Calendar 스타일)
        const colLeft = event.dayIndex * COL_WIDTH_PCT;
        const indentPct =
          event.maxDepth > 0 ? COL_WIDTH_PCT / (event.maxDepth + 1.5) : 0;
        const leftPct = colLeft + event.depth * indentPct;
        const widthPct = colLeft + COL_WIDTH_PCT - leftPct;

        const cardStyle: CSSProperties = {
          top,
          left: `calc(${leftPct}% + ${EVENT_GAP / 2}px)`,
          width: `calc(${widthPct}% - ${EVENT_GAP}px)`,
          height,
          zIndex: 20 + event.depth,
        };

        const durationMin = (event.endHour - event.startHour) * 60;
        const timeLabel = `${formatTime(event.startHour)} – ${formatTime(event.endHour)}`;
        // 좁은 열에서는 항상 compact 레이아웃 사용
        const isCompact = durationMin <= 45 || true;

        return (
          <EventCard key={event.id} color={event.color} style={cardStyle}>
            <div
              className="shrink-0"
              style={{ width: 3, background: event.color }}
            />
            <div
              className="flex flex-col justify-start flex-1 min-w-0 overflow-hidden px-1 py-0.5"
              style={{
                background: `linear-gradient(${event.color}1f, ${event.color}1f), var(--cv-color-bg)`,
              }}
            >
              {isCompact ? (
                <span className="truncate text-[length:var(--cv-font-size-xs)] font-[var(--cv-font-weight-medium)]">
                  {event.title}
                </span>
              ) : (
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

      {/* 5. Now Indicator — 오늘 열에만 표시 */}
      {todayIndex >= 0 && (
        <div
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${todayIndex * COL_WIDTH_PCT}%`,
            width: `${COL_WIDTH_PCT}%`,
            height: TOTAL_MAIN_SIZE,
          }}
        >
          <CalendarNowIndicator
            position={NOW_POSITION}
            crossSize="100%"
          />
        </div>
      )}
    </>
  );

  return (
    <div style={{ maxWidth: 960, height: "85vh", margin: "0 auto" }}>
      <CalendarView
        sidebar={sidebar}
        body={body}
        totalMainSize={TOTAL_MAIN_SIZE}
        header={header}
        headerHeight={HEADER_HEIGHT}
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
  title: "Calendar/Week",
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <CalendarWeekStory />,
};

export const DarkMode: Story = {
  render: () => <CalendarWeekStory />,
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: 16, background: "#111827", height: "90vh" }}>
        <Story />
      </div>
    ),
  ],
};
