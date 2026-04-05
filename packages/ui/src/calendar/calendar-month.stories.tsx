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
import { WEEKDAY_LABELS } from "../utils/weekdays.js";

/**
 * Calendar Month static UI stories.
 *
 * Layout: rows = weeks, columns = 7 weekdays (no time axis).
 * Two modes: bar (horizontal stacked bars) / list (event list per cell).
 * See: docs/design/calendar/calendar-month.md
 */

// ─── Constants ───

const BAR_HEIGHT = 24;
const BAR_GAP = 4;
/** Date number area height (24px digit + 4px gap) */
const DATE_NUMBER_HEIGHT = 28;
const COL_COUNT = 7;
const COL_PCT = 100 / COL_COUNT;
const MAX_VISIBLE_LIST = 3;

// ─── Mock Data ───

const MOCK_TODAY = new Date(2026, 2, 27);
const DISPLAY_MONTH = new Date(2026, 2, 1);

const RESOURCES: FilterChipResource[] = [
  { id: "a", title: "Resource A", color: "#3b82f6" },
  { id: "b", title: "Resource B", color: "#8b5cf6" },
  { id: "c", title: "Resource C", color: "#06b6d4" },
];

/** Events covering various patterns: multi-day, cross-week, single-day, dense dates */
const EVENTS: TimelineEvent[] = [
  // ── Multi-day events (bar mode) ──

  // Week 1: spans 6 days
  { id: "e1", resourceId: "a", start: new Date(2026, 2, 2, 9), end: new Date(2026, 2, 7, 18), title: "Project Alpha", color: "#3b82f6" },
  // Week 1: spans 3 days, overlaps e1 -> row 1
  { id: "e2", resourceId: "b", start: new Date(2026, 2, 4, 10), end: new Date(2026, 2, 6, 17), title: "Sprint Release", color: "#8b5cf6" },

  // Week 2: spans 5 days
  { id: "e3", resourceId: "c", start: new Date(2026, 2, 10, 9), end: new Date(2026, 2, 14, 18), title: "Marketing Campaign", color: "#06b6d4" },
  // Week 2->3: crosses week boundary
  { id: "e4", resourceId: "a", start: new Date(2026, 2, 13, 9), end: new Date(2026, 2, 17, 18), title: "Server Migration", color: "#10b981" },

  // Week 3->4: crosses week boundary
  { id: "e5", resourceId: "a", start: new Date(2026, 2, 20, 9), end: new Date(2026, 2, 25, 18), title: "Code Freeze", color: "#10b981" },
  // Week 4: overlaps e5
  { id: "e6", resourceId: "c", start: new Date(2026, 2, 22, 9), end: new Date(2026, 2, 24, 18), title: "QA Sprint", color: "#06b6d4" },

  // Week 4: includes today
  { id: "e7", resourceId: "a", start: new Date(2026, 2, 27, 9), end: new Date(2026, 2, 28, 18), title: "Bug Bash", color: "#3b82f6" },

  // Week 5: crosses month boundary
  { id: "e8", resourceId: "c", start: new Date(2026, 2, 30, 9), end: new Date(2026, 3, 3, 18), title: "Planning Week", color: "#06b6d4" },

  // ── Single-day events (list mode) ──

  { id: "e9", resourceId: "b", start: new Date(2026, 2, 5, 14), end: new Date(2026, 2, 5, 16), title: "Design Review", color: "#8b5cf6" },
  { id: "e10", resourceId: "b", start: new Date(2026, 2, 12, 10), end: new Date(2026, 2, 12, 11), title: "Team Sync", color: "#8b5cf6" },
  { id: "e11", resourceId: "c", start: new Date(2026, 2, 19, 14), end: new Date(2026, 2, 19, 16), title: "Workshop", color: "#06b6d4" },
  { id: "e12", resourceId: "b", start: new Date(2026, 2, 26, 10), end: new Date(2026, 2, 26, 11), title: "Product Demo", color: "#8b5cf6" },

  // 3/25: 5 dense events -> truncation test
  { id: "e13", resourceId: "a", start: new Date(2026, 2, 25, 9), end: new Date(2026, 2, 25, 9, 30), title: "Standup", color: "#3b82f6" },
  { id: "e14", resourceId: "b", start: new Date(2026, 2, 25, 10), end: new Date(2026, 2, 25, 10, 30), title: "1:1 Meeting", color: "#8b5cf6" },
  { id: "e15", resourceId: "c", start: new Date(2026, 2, 25, 12), end: new Date(2026, 2, 25, 13), title: "Lunch Talk", color: "#06b6d4" },
  { id: "e16", resourceId: "a", start: new Date(2026, 2, 25, 14), end: new Date(2026, 2, 25, 15), title: "Code Review", color: "#3b82f6" },
  { id: "e17", resourceId: "b", start: new Date(2026, 2, 25, 16), end: new Date(2026, 2, 25, 17), title: "Retro", color: "#8b5cf6" },

  // Single event on today
  { id: "e18", resourceId: "b", start: new Date(2026, 2, 27, 10), end: new Date(2026, 2, 27, 11), title: "Interview", color: "#8b5cf6" },
];

// ─── Helpers ───

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Filter events that overlap the given week */
function eventsInWeek(events: TimelineEvent[], weekDates: Date[]): TimelineEvent[] {
  const wkStart = weekDates[0].getTime();
  const wkEnd = weekDates[6].getTime();
  return events.filter((e) => {
    const eStart = startOfDay(e.start).getTime();
    const eEnd = startOfDay(e.end).getTime();
    return eStart <= wkEnd && eEnd >= wkStart;
  });
}

/** Filter events overlapping a specific date (inclusive of multi-day spans) */
function eventsOnDate(events: TimelineEvent[], date: Date): TimelineEvent[] {
  const dayTime = startOfDay(date).getTime();
  return events.filter((e) => {
    const eStart = startOfDay(e.start).getTime();
    const eEnd = startOfDay(e.end).getTime();
    return eStart <= dayTime && eEnd >= dayTime;
  });
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Format date as "MM.DD(weekday)" (e.g. "03.25(수)") */
function formatDateLabel(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}.${day}(${WEEKDAY_LABELS[d.getDay()]})`;
}

/** Max bar row count per week, used to set cell minimum height */
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

  const selectedSet = new Set(selectedIds);
  const visibleEvents = EVENTS.filter((e) => selectedSet.has(e.resourceId));

  // Calculate bar stacks per week
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

  // ─── All events visible in the current month grid (for the detail list below) ───
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
          // Reserve vertical space in each cell for the bar overlay above
          const weekIndex = weeks.findIndex((wk) =>
            wk.some((d) => isSameDay(d, _date)),
          );
          const maxRows = weekIndex >= 0 ? getMaxBarRow(weekBars[weekIndex]) : 0;
          const spacerHeight = maxRows > 0 ? maxRows * (BAR_HEIGHT + BAR_GAP) : 0;

          if (!isCurrentMonth || spacerHeight === 0) return null;
          return <div style={{ height: spacerHeight }} />;
        }}
      />

      {/* ── Detail event list below the grid (bar mode only) ── */}
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

        {/* ── Date detail popup ── */}
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

/** Date detail popup -- shows all events when "N more" is clicked */
function DateDetailPopup({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: TimelineEvent[];
  onClose: () => void;
}) {
  const label = `${WEEKDAY_LABELS[date.getDay()]} ${date.getDate()}`;

  return (
    <div
      className="absolute z-[var(--cv-z-popup)] bg-[var(--cv-color-bg)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-md)] shadow-[var(--cv-shadow-md)] overflow-hidden"
      style={{ width: 240, maxHeight: 320, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    >
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
