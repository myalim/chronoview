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
 * 핵심: horizontal stack (겹침 가로 분할) + Now Indicator (가로선) + scrollToNow
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
// Overlapping cascade (Google Calendar 스타일):
// depth=0이 가장 뒤, depth가 높을수록 앞(위)에 렌더링
// indent는 겹침 개수(maxDepth)에 따라 비율로 자동 계산

interface MockEvent {
  id: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  title: string;
  color: string;
  /** cascade depth — 0=backmost, higher=frontmost */
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

  // ─── 2개 겹침 (cascade, maxDepth=1) ───
  { id: "e8", resourceId: "c", startHour: 12.25, endHour: 13.25, title: "Lunch Meeting", color: "#06b6d4", depth: 0, maxDepth: 1 },
  { id: "e9", resourceId: "a", startHour: 12.5, endHour: 13, title: "Quick Call", color: "#3b82f6", depth: 1, maxDepth: 1 },

  // ─── 3개 겹침 (cascade, maxDepth=2) ───
  { id: "e10", resourceId: "b", startHour: 13.5, endHour: 15, title: "Code Review", color: "#8b5cf6", depth: 0, maxDepth: 2 },
  { id: "e11", resourceId: "c", startHour: 14, endHour: 15.5, title: "API Design", color: "#06b6d4", depth: 1, maxDepth: 2 },
  { id: "e12", resourceId: "a", startHour: 14.5, endHour: 15.5, title: "1:1 Meeting", color: "#3b82f6", depth: 2, maxDepth: 2 },

  // ─── 동시 시작 2개 (cascade, maxDepth=1) ───
  { id: "e13", resourceId: "b", startHour: 16, endHour: 17.5, title: "Deep Work", color: "#8b5cf6", depth: 0, maxDepth: 1 },
  { id: "e14", resourceId: "a", startHour: 16, endHour: 17, title: "Design Sync", color: "#3b82f6", depth: 1, maxDepth: 1 },

  // ─── 동시 시작 짧은 3개 (cascade, maxDepth=2) ───
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

      {/* 이벤트 카드 — Overlapping cascade (Google Calendar 스타일) */}
      {visibleEvents.map((event) => {
        const top = hourToY(event.startHour);
        // 스펙: 이벤트 최소 높이 20px (calendar-day.md §3)
        const MIN_HEIGHT = 20;
        const height = Math.max(MIN_HEIGHT, hourToY(event.endHour) - top - 2);

        // 비율 기반 indent: 겹침 개수에 따라 자동 조절
        // 2개 겹침 → indent=40%, 3개 겹침 → indent=28%
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

        // 불투명 배경: cascade 시 뒤 이벤트 텍스트가 비치지 않도록
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

// ─── StackMode 비교 스토리 ───

type StackMode = "cascade" | "horizontal" | "none";

const STACK_EVENTS = [
  { id: "s1", title: "Code Review", color: "#8b5cf6", startHour: 9, endHour: 10.5 },
  { id: "s2", title: "API Design", color: "#06b6d4", startHour: 9.5, endHour: 11 },
  { id: "s3", title: "Quick Sync", color: "#10b981", startHour: 9.5, endHour: 10.5 },
  { id: "s4", title: "1:1 Meeting", color: "#3b82f6", startHour: 10, endHour: 11 },
];

const STACK_SLOT_HEIGHT = 60;
const STACK_HOUR_START = 8;
const STACK_HOUR_END = 12;
const STACK_SLOTS = STACK_HOUR_END - STACK_HOUR_START;
const STACK_TOTAL = STACK_SLOTS * STACK_SLOT_HEIGHT;
const STACK_TIME_SLOTS = Array.from({ length: STACK_SLOTS }, (_, i) => ({
  label: `${String(STACK_HOUR_START + i).padStart(2, "0")}:00`,
}));

function StackModePanel({ mode }: { mode: StackMode }) {
  const MIN_HEIGHT = (15 / 60) * STACK_SLOT_HEIGHT;

  return (
    <div className="flex flex-col" style={{ flex: 1, minWidth: 200 }}>
      <div className="text-center py-2 font-[var(--cv-font-weight-bold)] text-[length:var(--cv-font-size-sm)] border-b border-[var(--cv-color-border)]">
        {mode}
      </div>
      <div className="flex border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] overflow-hidden" style={{ height: STACK_TOTAL + 20 }}>
        <div className="shrink-0 relative border-r border-[var(--cv-color-border)]" style={{ width: 45 }}>
          {STACK_TIME_SLOTS.map((slot, i) => (
            <div
              key={slot.label}
              className="absolute right-0 pr-1 text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]"
              style={{ top: i * STACK_SLOT_HEIGHT + 10, transform: i === 0 ? undefined : "translateY(-7px)", lineHeight: "14px" }}
            >
              {slot.label}
            </div>
          ))}
        </div>
        <div className="relative flex-1" style={{ height: STACK_TOTAL, marginTop: 10 }}>
          {/* Grid lines */}
          {STACK_TIME_SLOTS.slice(1).map((slot) => {
            const slotIdx = STACK_TIME_SLOTS.indexOf(slot);
            return (
              <div
                key={`gl-${slot.label}`}
                className="absolute left-0 w-full pointer-events-none"
                style={{ top: slotIdx * STACK_SLOT_HEIGHT, height: 1, background: "var(--cv-color-border)" }}
              />
            );
          })}

          {/* Events */}
          {STACK_EVENTS.map((event, idx) => {
            const top = (event.startHour - STACK_HOUR_START) * STACK_SLOT_HEIGHT;
            const height = Math.max(MIN_HEIGHT, (event.endHour - event.startHour) * STACK_SLOT_HEIGHT - 2);
            const timeLabel = `${formatTime(event.startHour)} – ${formatTime(event.endHour)}`;

            let left: string;
            let width: string;
            let zIndex: number;

            if (mode === "cascade") {
              const maxDepth = STACK_EVENTS.length - 1;
              const indentPct = 100 / (maxDepth + 1.5);
              const leftPct = idx * indentPct;
              left = `calc(${leftPct}% + 2px)`;
              width = `calc(${100 - leftPct}% - 4px)`;
              zIndex = 20 + idx;
            } else if (mode === "horizontal") {
              const lanePct = 100 / STACK_EVENTS.length;
              left = `calc(${idx * lanePct}% + 2px)`;
              width = `calc(${lanePct}% - 4px)`;
              zIndex = 20;
            } else {
              // none: 전체 너비, 겹쳐서 표시
              left = "2px";
              width = "calc(100% - 4px)";
              zIndex = 20 + idx;
            }

            return (
              <EventCard key={event.id} color={event.color} style={{ top, left, width, height, zIndex }}>
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

function StackModeComparison() {
  const modes: StackMode[] = ["cascade", "horizontal", "none"];
  return (
    <div
      className="font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]"
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      <div className="flex gap-4">
        {modes.map((mode) => (
          <StackModePanel key={mode} mode={mode} />
        ))}
      </div>
    </div>
  );
}

export const StackModes: Story = {
  render: () => <StackModeComparison />,
};
