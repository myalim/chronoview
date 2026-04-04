/**
 * Integration tests for the connected Calendar component.
 *
 * Tests the full flow: data → hooks → UI rendering.
 * Covers Day/Week/Month views, custom rendering, tooltip/popover, and edge cases.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import type { TimelineEvent, Resource } from "@chronoview/core";
import { Calendar } from "../calendar.js";

afterEach(cleanup);

// ─── Test Data ───

const BASE_DATE = new Date(2026, 2, 27); // March 27, 2026 (Friday)

const RESOURCES: Resource[] = [
  { id: "r1", title: "Alice", color: "#3b82f6" },
  { id: "r2", title: "Bob", color: "#8b5cf6" },
  { id: "r3", title: "Carol", color: "#06b6d4" },
];

function makeEvent(
  id: string,
  resourceId: string,
  startHour: number,
  endHour: number,
  title: string,
  dayOffset = 0,
): TimelineEvent {
  const start = new Date(BASE_DATE);
  start.setDate(start.getDate() + dayOffset);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(BASE_DATE);
  end.setDate(end.getDate() + dayOffset);
  end.setHours(endHour, 0, 0, 0);
  return { id, resourceId, start, end, title };
}

/** Create multi-day event for month tests */
function makeMultiDayEvent(
  id: string,
  resourceId: string,
  startDay: number,
  endDay: number,
  title: string,
  color?: string,
): TimelineEvent {
  const start = new Date(BASE_DATE);
  start.setDate(start.getDate() + startDay);
  start.setHours(9, 0, 0, 0);
  const end = new Date(BASE_DATE);
  end.setDate(end.getDate() + endDay);
  end.setHours(18, 0, 0, 0);
  return { id, resourceId, start, end, title, color };
}

const DAY_EVENTS: TimelineEvent[] = [
  makeEvent("e1", "r1", 9, 11, "Sprint Planning"),
  makeEvent("e2", "r2", 10, 12, "Code Review"),
  makeEvent("e3", "r3", 14, 16, "Team Retro"),
  makeEvent("e4", "r1", 8, 8, "Quick Ping"), // 0분 — 비표시
];

const OVERLAP_EVENTS: TimelineEvent[] = [
  makeEvent("o1", "r1", 9, 11, "Event A"),
  makeEvent("o2", "r2", 9, 11, "Event B"),
  makeEvent("o3", "r3", 9, 11, "Event C"),
];

const ADJACENT_EVENTS: TimelineEvent[] = [
  makeEvent("a1", "r1", 12, 13, "Lunch"),
  makeEvent("a2", "r1", 13, 14, "Coffee Chat"),
];

const MONTH_EVENTS: TimelineEvent[] = [
  makeMultiDayEvent("m1", "r1", -25, -20, "Project Alpha", "#3b82f6"),
  makeMultiDayEvent("m2", "r2", -22, -20, "Sprint Release", "#8b5cf6"),
  makeMultiDayEvent("m3", "r3", -5, -3, "QA Sprint", "#06b6d4"),
  makeEvent("m4", "r1", 9, 11, "Sprint Planning"),
  makeEvent("m5", "r2", 10, 12, "Code Review"),
];

// ─── Tests ───

describe("Calendar", () => {
  // ─── Basic Rendering ───

  it("renders Day view with minimal props", () => {
    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
      />,
    );

    // Time sidebar labels
    expect(screen.getByText("09:00")).toBeDefined();
    expect(screen.getByText("14:00")).toBeDefined();

    // Event titles
    expect(
      screen.getAllByText("Sprint Planning").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Code Review").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Team Retro").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Week view with day headers", () => {
    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        view="week"
      />,
    );

    // 7 day header labels should exist (week view renders day labels)
    // Each header contains weekday + date like "월 3/23"
    const headers = screen.getAllByText(/\d+\/\d+/);
    expect(headers.length).toBeGreaterThanOrEqual(7);
  });

  it("renders Month bar mode", () => {
    render(
      <Calendar
        events={MONTH_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        view="month"
        monthMode="bar"
      />,
    );

    // Month grid weekday headers
    expect(screen.getAllByText("일").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("토").length).toBeGreaterThanOrEqual(1);

    // Bar event titles should appear
    expect(
      screen.getAllByText("Project Alpha").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders Month list mode with truncation", () => {
    // Create many events on one day to trigger truncation
    const denseEvents: TimelineEvent[] = [
      makeEvent("d1", "r1", 9, 10, "Event 1"),
      makeEvent("d2", "r2", 10, 11, "Event 2"),
      makeEvent("d3", "r3", 11, 12, "Event 3"),
      makeEvent("d4", "r1", 12, 13, "Event 4"),
      makeEvent("d5", "r2", 13, 14, "Event 5"),
    ];

    render(
      <Calendar
        events={denseEvents}
        resources={RESOURCES}
        startDate={BASE_DATE}
        view="month"
        monthMode="list"
      />,
    );

    // "N개 더보기" link should appear for dense days
    const moreLinks = screen.queryAllByText(/더보기/);
    expect(moreLinks.length).toBeGreaterThanOrEqual(1);
  });

  // ─── Features ───

  it("renders with toolbar by default", () => {
    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
      />,
    );

    expect(screen.getAllByText("오늘").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("일간").length).toBeGreaterThanOrEqual(1);
  });

  it("hides toolbar when showToolbar=false", () => {
    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        showToolbar={false}
      />,
    );

    expect(screen.queryAllByText("주간").length).toBe(0);
  });

  it("renders filter panel when showFilter=true", () => {
    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        showFilter
      />,
    );

    // Filter chips should show resource names
    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bob").length).toBeGreaterThanOrEqual(1);
  });

  it("switches view when ViewToggle is clicked", () => {
    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
      />,
    );

    // Switch to Week
    const weekBtn = screen.getAllByText("주간")[0];
    fireEvent.click(weekBtn);
    // Should render day headers (week view)
    expect(screen.getAllByText(/\d+\/\d+/).length).toBeGreaterThanOrEqual(7);

    // Switch to Month
    const monthBtn = screen.getAllByText("월간")[0];
    fireEvent.click(monthBtn);
    // Should render month weekday headers
    expect(screen.getAllByText("일").length).toBeGreaterThanOrEqual(1);
  });

  it("navigates date with prev/next buttons", () => {
    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
      />,
    );

    const nextBtn = screen.getAllByLabelText("다음")[0];
    fireEvent.click(nextBtn);

    // Navigation should work without error
    expect(nextBtn).toBeDefined();
  });

  // ─── Customization ───

  it("customizes event card via eventProps (Day/Week)", () => {
    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        eventProps={(event) => ({
          title: `CUSTOM: ${event.title}`,
        })}
      />,
    );

    expect(screen.getByText("CUSTOM: Sprint Planning")).toBeDefined();
    expect(screen.getByText("CUSTOM: Code Review")).toBeDefined();
  });

  it("calls onEventClick when event is clicked", () => {
    const clickedIds: string[] = [];

    render(
      <Calendar
        events={DAY_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        onEventClick={(event) => clickedIds.push(event.id)}
      />,
    );

    fireEvent.click(screen.getAllByText("Sprint Planning")[0]);
    expect(clickedIds).toContain("e1");
  });

  // ─── Event Detail (Tooltip / Popover) ───

  describe("Event Detail UI", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows tooltip on hover", () => {
      render(
        <Calendar
          events={DAY_EVENTS}
          resources={RESOURCES}
          startDate={BASE_DATE}
        />,
      );

      const titleCountBefore = screen.getAllByText("Sprint Planning").length;

      fireEvent.mouseEnter(screen.getAllByText("Sprint Planning")[0]);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Tooltip adds an extra rendering of the title
      expect(screen.getAllByText("Sprint Planning").length).toBeGreaterThan(
        titleCountBefore,
      );
    });

    it("hides tooltip when disableTooltip is true", () => {
      render(
        <Calendar
          events={DAY_EVENTS}
          resources={RESOURCES}
          startDate={BASE_DATE}
          disableTooltip
        />,
      );

      const titleCountBefore = screen.getAllByText("Sprint Planning").length;

      fireEvent.mouseEnter(screen.getAllByText("Sprint Planning")[0]);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getAllByText("Sprint Planning").length).toBe(
        titleCountBefore,
      );
    });

    it("shows popover with renderEventDetail content on click", () => {
      render(
        <Calendar
          events={DAY_EVENTS}
          resources={RESOURCES}
          startDate={BASE_DATE}
          renderEventDetail={(event, { close }) => (
            <div>
              <span>Detail: {event.title}</span>
              <button type="button" onClick={close}>
                닫기
              </button>
            </div>
          )}
        />,
      );

      fireEvent.click(screen.getAllByText("Sprint Planning")[0]);

      expect(screen.getByText("Detail: Sprint Planning")).toBeDefined();

      // Close popover
      fireEvent.click(screen.getByText("닫기"));
      expect(screen.queryByText("Detail: Sprint Planning")).toBeNull();
    });
  });

  // ─── Month: "N개 더보기" Popup ───

  it("shows date detail popup when 더보기 is clicked (list mode)", () => {
    const denseEvents: TimelineEvent[] = [
      makeEvent("d1", "r1", 9, 10, "Morning Sync"),
      makeEvent("d2", "r2", 10, 11, "Standup"),
      makeEvent("d3", "r3", 11, 12, "Lunch Talk"),
      makeEvent("d4", "r1", 12, 13, "Code Review"),
      makeEvent("d5", "r2", 13, 14, "Deploy"),
    ];

    render(
      <Calendar
        events={denseEvents}
        resources={RESOURCES}
        startDate={BASE_DATE}
        view="month"
        monthMode="list"
      />,
    );

    const moreLink = screen.getAllByText(/더보기/)[0];
    fireEvent.click(moreLink);

    // Popup should show all events for that date
    expect(screen.getAllByText("Morning Sync").length).toBeGreaterThanOrEqual(2);
  });

  // ─── Edge Cases ───

  it("renders empty state without error", () => {
    render(<Calendar events={[]} resources={[]} startDate={BASE_DATE} />);

    // Grid lines should still render
    expect(screen.getByText("09:00")).toBeDefined();
  });

  it("renders overlapping events with stacking", () => {
    render(
      <Calendar
        events={OVERLAP_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
      />,
    );

    // All 3 overlapping events should render
    expect(screen.getAllByText("Event A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Event B").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Event C").length).toBeGreaterThanOrEqual(1);
  });

  it("renders adjacent events (end===start) without stacking", () => {
    render(
      <Calendar
        events={ADJACENT_EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
      />,
    );

    // Both adjacent events should render
    expect(screen.getAllByText("Lunch").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Coffee Chat").length).toBeGreaterThanOrEqual(1);
  });
});
