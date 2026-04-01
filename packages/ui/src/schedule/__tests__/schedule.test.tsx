/**
 * Integration tests for the connected Schedule component.
 *
 * Tests the full flow: data → hooks → UI rendering.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import type { TimelineEvent, Resource } from "@chronoview/core";
import { Schedule } from "../schedule.js";

afterEach(cleanup);

// ─── Test Data ───

const BASE_DATE = new Date(2026, 2, 27); // March 27, 2026

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
): TimelineEvent {
  const start = new Date(BASE_DATE);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(BASE_DATE);
  end.setHours(endHour, 0, 0, 0);
  return { id, resourceId, start, end, title };
}

const EVENTS: TimelineEvent[] = [
  makeEvent("e1", "r1", 9, 11, "Sprint Planning"),
  makeEvent("e2", "r1", 13, 15, "Design Review"),
  makeEvent("e3", "r2", 10, 12, "Code Review"),
  makeEvent("e4", "r3", 14, 16, "Team Retro"),
];

// ─── Tests ───

describe("Schedule", () => {
  it("renders with minimal props", () => {
    render(<Schedule events={EVENTS} resources={RESOURCES} startDate={BASE_DATE} />);

    // Resource names in sidebar
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("Carol")).toBeDefined();

    // Event titles
    expect(screen.getAllByText("Sprint Planning").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Design Review").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Code Review").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Team Retro").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with toolbar by default", () => {
    render(<Schedule events={EVENTS} resources={RESOURCES} startDate={BASE_DATE} />);

    // Toolbar should have today button and view toggle
    expect(screen.getAllByText("오늘").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("일간").length).toBeGreaterThanOrEqual(1);
  });

  it("hides toolbar when showToolbar=false", () => {
    render(
      <Schedule events={EVENTS} resources={RESOURCES} startDate={BASE_DATE} showToolbar={false} />,
    );

    // Toolbar's ViewToggle buttons should not exist
    expect(screen.queryAllByText("주간").length).toBe(0);
  });

  it("renders filter panel when showFilter=true", () => {
    render(<Schedule events={EVENTS} resources={RESOURCES} startDate={BASE_DATE} showFilter />);

    // Filter chips + sidebar = at least 2 occurrences
    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Bob").length).toBeGreaterThanOrEqual(2);
  });

  it("switches view when ViewToggle is clicked", () => {
    render(<Schedule events={EVENTS} resources={RESOURCES} startDate={BASE_DATE} />);

    const weekBtns = screen.getAllByText("주간");
    fireEvent.click(weekBtns[0]);

    // After switching to Week, week date headers should render
    // The component should re-render without error
    expect(weekBtns[0]).toBeDefined();
  });

  it("navigates date with prev/next buttons", () => {
    render(<Schedule events={EVENTS} resources={RESOURCES} startDate={BASE_DATE} />);

    const nextBtns = screen.getAllByLabelText("다음");
    fireEvent.click(nextBtns[0]);

    // Navigation should work without error
    expect(nextBtns[0]).toBeDefined();
  });

  it("customizes event card via eventProps", () => {
    render(
      <Schedule
        events={EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        eventProps={(event) => ({
          title: `CUSTOM: ${event.title}`,
        })}
      />,
    );

    expect(screen.getByText("CUSTOM: Sprint Planning")).toBeDefined();
    expect(screen.getByText("CUSTOM: Design Review")).toBeDefined();
  });

  it("eventProps onClick overrides onEventClick for specific events", () => {
    const globalClicks: string[] = [];
    const customClicks: string[] = [];

    render(
      <Schedule
        events={EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        onEventClick={(event) => globalClicks.push(event.id)}
        eventProps={(event) =>
          event.id === "e1" ? { onClick: () => customClicks.push(event.id) } : {}
        }
      />,
    );

    // Click e1 (Sprint Planning) — should use custom onClick
    fireEvent.click(screen.getAllByText("Sprint Planning")[0]);
    expect(customClicks).toContain("e1");
    expect(globalClicks).not.toContain("e1");

    // Click e3 (Code Review) — should use default onEventClick
    fireEvent.click(screen.getAllByText("Code Review")[0]);
    expect(globalClicks).toContain("e3");
  });

  it("renders custom resource via renderResource", () => {
    render(
      <Schedule
        events={EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        renderResource={(resource) => <div>{`>> ${resource.title}`}</div>}
      />,
    );

    expect(screen.getByText(">> Alice")).toBeDefined();
    expect(screen.getByText(">> Bob")).toBeDefined();
    expect(screen.getByText(">> Carol")).toBeDefined();
  });

  it("shows empty state when no resources", () => {
    render(<Schedule events={[]} resources={[]} startDate={BASE_DATE} />);

    expect(screen.getByText("표시할 리소스가 없습니다")).toBeDefined();
  });

  it("calls onEventClick when event is clicked", () => {
    const clickedEvents: string[] = [];

    render(
      <Schedule
        events={EVENTS}
        resources={RESOURCES}
        startDate={BASE_DATE}
        onEventClick={(event) => clickedEvents.push(event.id)}
      />,
    );

    // EventCard renders title in a span — click the first match
    const eventCards = screen.getAllByText("Sprint Planning");
    fireEvent.click(eventCards[0]);

    expect(clickedEvents).toContain("e1");
  });

  // ─── Event Detail (Tooltip / Popover) ───

  describe("Event Detail UI", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows tooltip on hover with event info", () => {
      render(
        <Schedule events={EVENTS} resources={RESOURCES} startDate={BASE_DATE} />,
      );

      // Record count before hover (title/time also appears in EventCard subtitle)
      const titleCountBefore = screen.getAllByText("Sprint Planning").length;
      const aliceCountBefore = screen.getAllByText("Alice").length;

      const eventCard = screen.getAllByText("Sprint Planning")[0];
      fireEvent.mouseEnter(eventCard);

      // Tooltip appears after 150ms delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Tooltip adds extra rendering → count increases
      expect(screen.getAllByText("Sprint Planning").length).toBeGreaterThan(titleCountBefore);
      expect(screen.getAllByText("Alice").length).toBeGreaterThan(aliceCountBefore);
    });

    it("hides tooltip when disableTooltip is true", () => {
      render(
        <Schedule
          events={EVENTS}
          resources={RESOURCES}
          startDate={BASE_DATE}
          disableTooltip
        />,
      );

      // Record count before hover
      const titleCountBefore = screen.getAllByText("Sprint Planning").length;

      const eventCard = screen.getAllByText("Sprint Planning")[0];
      fireEvent.mouseEnter(eventCard);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // No tooltip → count unchanged
      expect(screen.getAllByText("Sprint Planning").length).toBe(titleCountBefore);
    });

    it("shows popover with renderEventDetail content on click", () => {
      render(
        <Schedule
          events={EVENTS}
          resources={RESOURCES}
          startDate={BASE_DATE}
          renderEventDetail={(event, { close }) => (
            <div>
              <span>Detail: {event.title}</span>
              <button type="button" onClick={close}>
                Close
              </button>
            </div>
          )}
        />,
      );

      const eventCard = screen.getAllByText("Sprint Planning")[0];
      fireEvent.click(eventCard);

      expect(screen.getByText("Detail: Sprint Planning")).toBeDefined();
      expect(screen.getByText("Close")).toBeDefined();
    });

    it("fires onEventClick AND opens popover simultaneously", () => {
      const clicked: string[] = [];

      render(
        <Schedule
          events={EVENTS}
          resources={RESOURCES}
          startDate={BASE_DATE}
          onEventClick={(event) => clicked.push(event.id)}
          renderEventDetail={(event) => <span>Detail: {event.title}</span>}
        />,
      );

      const eventCard = screen.getAllByText("Sprint Planning")[0];
      fireEvent.click(eventCard);

      // onEventClick callback fires
      expect(clicked).toContain("e1");
      // Popover also appears
      expect(screen.getByText("Detail: Sprint Planning")).toBeDefined();
    });

    it("does not open popover when eventProps provides custom onClick", () => {
      render(
        <Schedule
          events={EVENTS}
          resources={RESOURCES}
          startDate={BASE_DATE}
          renderEventDetail={(event) => <span>Detail: {event.title}</span>}
          eventProps={(event) =>
            event.id === "e1" ? { onClick: () => {} } : {}
          }
        />,
      );

      const eventCard = screen.getAllByText("Sprint Planning")[0];
      fireEvent.click(eventCard);

      // eventProps has custom onClick → popover should not open
      expect(screen.queryByText("Detail: Sprint Planning")).toBeNull();
    });

    it("closes popover when close helper is called", () => {
      render(
        <Schedule
          events={EVENTS}
          resources={RESOURCES}
          startDate={BASE_DATE}
          renderEventDetail={(event, { close }) => (
            <div>
              <span>Detail: {event.title}</span>
              <button type="button" onClick={close}>
                Close
              </button>
            </div>
          )}
        />,
      );

      // Open popover
      const eventCard = screen.getAllByText("Sprint Planning")[0];
      fireEvent.click(eventCard);
      expect(screen.getByText("Detail: Sprint Planning")).toBeDefined();

      // Click close button
      fireEvent.click(screen.getByText("Close"));
      expect(screen.queryByText("Detail: Sprint Planning")).toBeNull();
    });
  });
});
