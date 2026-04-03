import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  calculateBarStacks,
  calculateMonthGrid,
  truncateEvents,
  type MonthBarLayout,
  type TimelineEvent,
} from "@chronoview/core";
import { type FilterChipResource, FilterChips } from "../common/filter-chips.js";
import { Toolbar } from "../common/toolbar.js";
import { CalendarMonthGrid } from "./calendar-month-grid.js";

/**
 * Calendar Month 정적 UI 스토리
 *
 * 레이아웃: 세로=주차, 가로=요일 7열 (시간축 없음)
 * 두 가지 모드: bar (가로 바 스택) / list (셀 내 리스트)
 * 참조: docs/design/calendar/calendar-month.md
 */

// ─── Constants ───

const BAR_HEIGHT = 24;
const BAR_GAP = 4;
/** 날짜 숫자 영역 높이 (24px 숫자 + 4px 여백) */
const DATE_NUMBER_HEIGHT = 28;
const COL_COUNT = 7;
const COL_PCT = 100 / COL_COUNT;
const MAX_VISIBLE_LIST = 3;

// ─── Mock Data ───

const MOCK_TODAY = new Date(2026, 2, 27);
const DISPLAY_MONTH = new Date(2026, 2, 1); // 2026년 3월

const RESOURCES: FilterChipResource[] = [
  { id: "a", title: "Resource A", color: "#3b82f6" },
  { id: "b", title: "Resource B", color: "#8b5cf6" },
  { id: "c", title: "Resource C", color: "#06b6d4" },
];

/** 다양한 패턴의 이벤트: 다중 일, 주 경계 걸침, 단일 일, 밀집 날짜 */
const EVENTS: TimelineEvent[] = [
  // ── 다중 일 이벤트 (bar 모드 핵심 테스트) ──

  // Week 1: 6일 걸침
  { id: "e1", resourceId: "a", start: new Date(2026, 2, 2, 9), end: new Date(2026, 2, 7, 18), title: "Project Alpha", color: "#3b82f6" },
  // Week 1: 3일 걸침, e1과 겹침 → row 1
  { id: "e2", resourceId: "b", start: new Date(2026, 2, 4, 10), end: new Date(2026, 2, 6, 17), title: "Sprint Release", color: "#8b5cf6" },

  // Week 2: 5일
  { id: "e3", resourceId: "c", start: new Date(2026, 2, 10, 9), end: new Date(2026, 2, 14, 18), title: "Marketing Campaign", color: "#06b6d4" },
  // Week 2→3: 주 경계 걸침
  { id: "e4", resourceId: "a", start: new Date(2026, 2, 13, 9), end: new Date(2026, 2, 17, 18), title: "Server Migration", color: "#10b981" },

  // Week 3→4: 주 경계 걸침
  { id: "e5", resourceId: "a", start: new Date(2026, 2, 20, 9), end: new Date(2026, 2, 25, 18), title: "Code Freeze", color: "#10b981" },
  // Week 4: e5와 겹침
  { id: "e6", resourceId: "c", start: new Date(2026, 2, 22, 9), end: new Date(2026, 2, 24, 18), title: "QA Sprint", color: "#06b6d4" },

  // Week 4: 오늘 포함
  { id: "e7", resourceId: "a", start: new Date(2026, 2, 27, 9), end: new Date(2026, 2, 28, 18), title: "Bug Bash", color: "#3b82f6" },

  // Week 5: 월 경계 걸침
  { id: "e8", resourceId: "c", start: new Date(2026, 2, 30, 9), end: new Date(2026, 3, 3, 18), title: "Planning Week", color: "#06b6d4" },

  // ── 단일 일 이벤트 (list 모드 핵심 테스트) ──

  { id: "e9", resourceId: "b", start: new Date(2026, 2, 5, 14), end: new Date(2026, 2, 5, 16), title: "Design Review", color: "#8b5cf6" },
  { id: "e10", resourceId: "b", start: new Date(2026, 2, 12, 10), end: new Date(2026, 2, 12, 11), title: "Team Sync", color: "#8b5cf6" },
  { id: "e11", resourceId: "c", start: new Date(2026, 2, 19, 14), end: new Date(2026, 2, 19, 16), title: "Workshop", color: "#06b6d4" },
  { id: "e12", resourceId: "b", start: new Date(2026, 2, 26, 10), end: new Date(2026, 2, 26, 11), title: "Product Demo", color: "#8b5cf6" },

  // 3/25: 5개 이벤트 밀집 → truncation 테스트
  { id: "e13", resourceId: "a", start: new Date(2026, 2, 25, 9), end: new Date(2026, 2, 25, 9, 30), title: "Standup", color: "#3b82f6" },
  { id: "e14", resourceId: "b", start: new Date(2026, 2, 25, 10), end: new Date(2026, 2, 25, 10, 30), title: "1:1 Meeting", color: "#8b5cf6" },
  { id: "e15", resourceId: "c", start: new Date(2026, 2, 25, 12), end: new Date(2026, 2, 25, 13), title: "Lunch Talk", color: "#06b6d4" },
  { id: "e16", resourceId: "a", start: new Date(2026, 2, 25, 14), end: new Date(2026, 2, 25, 15), title: "Code Review", color: "#3b82f6" },
  { id: "e17", resourceId: "b", start: new Date(2026, 2, 25, 16), end: new Date(2026, 2, 25, 17), title: "Retro", color: "#8b5cf6" },

  // 오늘 단일 이벤트
  { id: "e18", resourceId: "b", start: new Date(2026, 2, 27, 10), end: new Date(2026, 2, 27, 11), title: "Interview", color: "#8b5cf6" },
];

// ─── Helpers ───

/** 날짜를 자정(00:00)으로 정규화 */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 두 Date가 같은 날짜인지 비교 */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 주(weekDates)와 겹치는 이벤트만 필터 */
function eventsInWeek(events: TimelineEvent[], weekDates: Date[]): TimelineEvent[] {
  const wkStart = weekDates[0].getTime();
  const wkEnd = weekDates[6].getTime();
  return events.filter((e) => {
    const eStart = startOfDay(e.start).getTime();
    const eEnd = startOfDay(e.end).getTime();
    return eStart <= wkEnd && eEnd >= wkStart;
  });
}

/** 특정 날짜에 해당하는 이벤트 필터 (시작일 기준 + 걸침 포함) */
function eventsOnDate(events: TimelineEvent[], date: Date): TimelineEvent[] {
  const dayTime = startOfDay(date).getTime();
  return events.filter((e) => {
    const eStart = startOfDay(e.start).getTime();
    const eEnd = startOfDay(e.end).getTime();
    return eStart <= dayTime && eEnd >= dayTime;
  });
}

/** 시간을 HH:MM 형식으로 포맷 */
function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 날짜 포맷 (예: "03.25(수)") */
function formatDateLabel(d: Date): string {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}.${day}(${weekdays[d.getDay()]})`;
}

/** 주별 최대 bar row 수 계산 → 셀 최소 높이에 반영 */
function getMaxBarRow(bars: MonthBarLayout[]): number {
  if (bars.length === 0) return 0;
  return Math.max(...bars.map((b) => b.row)) + 1;
}

// ─────────────────────────────────────────────
// Bar Mode Story
// ─────────────────────────────────────────────

function CalendarMonthBarStory() {
  const [date, setDate] = useState(DISPLAY_MONTH);
  const [selectedIds, setSelectedIds] = useState(RESOURCES.map((r) => r.id));

  const month = date.getMonth();
  const weeks = calculateMonthGrid(date);

  // 필터링
  const selectedSet = new Set(selectedIds);
  const visibleEvents = EVENTS.filter((e) => selectedSet.has(e.resourceId));

  // 주별 bar 계산 (캐시)
  const weekBars: MonthBarLayout[][] = weeks.map((weekDates) => {
    const weekEvents = eventsInWeek(visibleEvents, weekDates);
    return calculateBarStacks(weekEvents, weekDates);
  });

  // ─── Navigation ───
  const handlePrev = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const handleNext = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const handleToday = () => setDate(new Date(MOCK_TODAY.getFullYear(), MOCK_TODAY.getMonth(), 1));

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // ─── 하단 상세 리스트: 현재 월 그리드에 표시되는 모든 이벤트 ───
  const gridStart = weeks[0][0];
  const gridEnd = weeks[weeks.length - 1][6];
  const gridEvents = visibleEvents.filter((e) => {
    const eStart = startOfDay(e.start).getTime();
    const eEnd = startOfDay(e.end).getTime();
    return eStart <= gridEnd.getTime() && eEnd >= gridStart.getTime();
  });

  const toolbar = (
    <Toolbar
      currentDate={date}
      view="month"
      layout="calendar"
      onPrev={handlePrev}
      onNext={handleNext}
      onToday={handleToday}
      onViewChange={() => {}}
      availableViews={["day", "week", "month"]}
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

  return (
    <div
      style={{ maxWidth: 960, margin: "0 auto" }}
      className="font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]"
    >
      {toolbar}
      {filterPanel}

      <CalendarMonthGrid
        weeks={weeks}
        currentMonth={month}
        today={MOCK_TODAY}
        renderWeekOverlay={(_weekDates, weekIndex) => {
          const bars = weekBars[weekIndex];
          if (bars.length === 0) return null;

          return (
            <div
              className="absolute inset-x-0 pointer-events-none"
              style={{ top: DATE_NUMBER_HEIGHT }}
            >
              {bars.map((bar) => {
                const left = (bar.startColumn * COL_PCT);
                const width = (bar.endColumn - bar.startColumn + 1) * COL_PCT;
                const top = bar.row * (BAR_HEIGHT + BAR_GAP);

                return (
                  <div
                    key={`${bar.event.id}-w${weekIndex}`}
                    className="absolute flex items-center overflow-hidden rounded-[var(--cv-radius-sm)] pointer-events-auto"
                    style={{
                      left: `calc(${left}% + 2px)`,
                      width: `calc(${width}% - 4px)`,
                      top,
                      height: BAR_HEIGHT,
                      background: `${bar.color}33`,
                    }}
                  >
                    <span className="truncate px-[var(--cv-spacing-xs)] text-[length:var(--cv-font-size-sm)] text-[var(--cv-color-text)]">
                      {bar.event.title}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }}
        renderCellContent={(_date, { isCurrentMonth }) => {
          // bar 모드에서 셀 콘텐츠는 바가 들어갈 빈 공간 확보용
          // 해당 주의 weekIndex를 찾아 max bar row로 min-height 설정
          const weekIndex = weeks.findIndex((wk) =>
            wk.some((d) => isSameDay(d, _date)),
          );
          const maxRows = weekIndex >= 0 ? getMaxBarRow(weekBars[weekIndex]) : 0;
          const spacerHeight = maxRows > 0 ? maxRows * (BAR_HEIGHT + BAR_GAP) : 0;

          if (!isCurrentMonth || spacerHeight === 0) return null;
          return <div style={{ height: spacerHeight }} />;
        }}
      />

      {/* ── 하단 상세 리스트 (bar 모드 전용) ── */}
      {gridEvents.length > 0 && (
        <div className="mt-[var(--cv-spacing-lg)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] p-[var(--cv-spacing-lg)]">
          <h3 className="text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-bold)] text-[var(--cv-color-text-secondary)] mb-[var(--cv-spacing-sm)]">
            진행중인 이벤트
          </h3>
          <div className="flex flex-col gap-[var(--cv-spacing-sm)]">
            {gridEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-[var(--cv-spacing-sm)]">
                <span
                  className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                  style={{ background: e.color }}
                />
                <div className="min-w-0">
                  <div className="truncate text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-medium)]">
                    {e.title}
                  </div>
                  <div className="text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]">
                    {formatDateLabel(e.start)} {formatTime(e.start)} – {formatDateLabel(e.end)} {formatTime(e.end)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// List Mode Story
// ─────────────────────────────────────────────

function CalendarMonthListStory() {
  const [date, setDate] = useState(DISPLAY_MONTH);
  const [selectedIds, setSelectedIds] = useState(RESOURCES.map((r) => r.id));
  // 팝업 상태: 클릭된 날짜
  const [popupDate, setPopupDate] = useState<Date | null>(null);

  const month = date.getMonth();
  const weeks = calculateMonthGrid(date);

  const selectedSet = new Set(selectedIds);
  const visibleEvents = EVENTS.filter((e) => selectedSet.has(e.resourceId));

  const handlePrev = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const handleNext = () =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const handleToday = () => setDate(new Date(MOCK_TODAY.getFullYear(), MOCK_TODAY.getMonth(), 1));

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toolbar = (
    <Toolbar
      currentDate={date}
      view="month"
      layout="calendar"
      onPrev={handlePrev}
      onNext={handleNext}
      onToday={handleToday}
      onViewChange={() => {}}
      availableViews={["day", "week", "month"]}
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

  return (
    <div
      style={{ maxWidth: 960, margin: "0 auto" }}
      className="font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]"
    >
      {toolbar}
      {filterPanel}

      <div className="relative">
        <CalendarMonthGrid
          weeks={weeks}
          currentMonth={month}
          today={MOCK_TODAY}
          showEmptyLabel
          emptyLabel="데이터 없음"
          hasEvents={(d) => eventsOnDate(visibleEvents, d).length > 0}
          renderCellContent={(cellDate, { isCurrentMonth }) => {
            if (!isCurrentMonth) return null;

            const dayEvents = eventsOnDate(visibleEvents, cellDate);
            if (dayEvents.length === 0) return null;

            const { visible, hiddenCount } = truncateEvents({
              events: dayEvents,
              maxVisible: MAX_VISIBLE_LIST,
            });

            return (
              <div className="flex flex-col gap-0.5">
                {visible.map((e) => (
                  <div key={e.id} className="flex items-center gap-1 min-w-0">
                    <span
                      className="shrink-0 w-2 h-2 rounded-full"
                      style={{ background: e.color }}
                    />
                    <span className="truncate text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]">
                      {formatTime(e.start)}
                    </span>
                    <span className="truncate text-[length:var(--cv-font-size-sm)] text-[var(--cv-color-text)]">
                      {e.title}
                    </span>
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    className="text-left text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-today-border)] hover:underline cursor-pointer"
                    onClick={() => setPopupDate(cellDate)}
                  >
                    {hiddenCount}개 더보기
                  </button>
                )}
              </div>
            );
          }}
        />

        {/* ── 날짜 상세 팝업 ── */}
        {popupDate && (
          <DateDetailPopup
            date={popupDate}
            events={eventsOnDate(visibleEvents, popupDate)}
            onClose={() => setPopupDate(null)}
          />
        )}
      </div>
    </div>
  );
}

/** 날짜 상세 팝업 — "N개 더보기" 클릭 시 전체 이벤트 표시 */
function DateDetailPopup({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: TimelineEvent[];
  onClose: () => void;
}) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const label = `${weekdays[date.getDay()]} ${date.getDate()}`;

  return (
    <div
      className="absolute z-[var(--cv-z-popup)] bg-[var(--cv-color-bg)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-md)] shadow-[var(--cv-shadow-md)] overflow-hidden"
      style={{ width: 240, maxHeight: 320, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--cv-color-border)] bg-[var(--cv-color-surface)]">
        <span className="text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-bold)]">
          {label}
        </span>
        <button
          type="button"
          className="text-[var(--cv-color-text-secondary)] hover:text-[var(--cv-color-text)] cursor-pointer"
          onClick={onClose}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 이벤트 리스트 */}
      <div className="overflow-y-auto p-2 flex flex-col gap-1" style={{ maxHeight: 270 }}>
        {events.map((e) => (
          <div key={e.id} className="flex items-center gap-2 px-1 py-0.5">
            <span
              className="shrink-0 w-2 h-2 rounded-full"
              style={{ background: e.color }}
            />
            <span className="text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)] shrink-0">
              {formatTime(e.start)}
            </span>
            <span className="truncate text-[length:var(--cv-font-size-sm)] text-[var(--cv-color-text)]">
              {e.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Storybook Meta ───

const meta: Meta = {
  title: "Calendar/Month",
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <CalendarMonthBarStory />,
};

export const ListMode: Story = {
  render: () => <CalendarMonthListStory />,
};

export const DarkMode: Story = {
  render: () => <CalendarMonthBarStory />,
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: 16, background: "#111827" }}>
        <Story />
      </div>
    ),
  ],
};
