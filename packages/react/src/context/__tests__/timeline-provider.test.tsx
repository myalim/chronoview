import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TimelineProvider, useTimelineContext } from "../timeline-provider.js";
import type { TimelineConfig, Resource, TimelineEvent } from "@chronoview/core";
import type { ReactNode } from "react";

const resources: Resource[] = [
  { id: "r1", title: "Room A" },
  { id: "r2", title: "Room B" },
];

const events: TimelineEvent[] = [
  {
    id: "e1",
    resourceId: "r1",
    start: new Date(2026, 2, 28, 9, 0),
    end: new Date(2026, 2, 28, 10, 0),
    title: "Meeting",
    category: "work",
  },
  {
    id: "e2",
    resourceId: "r2",
    start: new Date(2026, 2, 28, 11, 0),
    end: new Date(2026, 2, 28, 12, 0),
    title: "Lunch",
    category: "personal",
  },
];

const baseConfig: TimelineConfig = {
  events,
  resources,
  view: "day",
  layout: "schedule",
  startDate: new Date(2026, 2, 28, 0, 0, 0, 0),
};

function createWrapper(config: TimelineConfig = baseConfig) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TimelineProvider config={config}>{children}</TimelineProvider>;
  };
}

describe("TimelineProvider", () => {
  it("provides context values to children", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.config).toBe(baseConfig);
    expect(result.current.view).toBe("day");
    expect(result.current.currentDate).toEqual(new Date(2026, 2, 28, 0, 0, 0, 0));
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredResources).toHaveLength(2);
  });

  it("throws when useTimelineContext is used outside provider", () => {
    expect(() => {
      renderHook(() => useTimelineContext());
    }).toThrow("useTimelineContext must be used within a TimelineProvider");
  });

  it("setView updates the view", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.view).toBe("day");

    act(() => {
      result.current.setView("week");
    });

    expect(result.current.view).toBe("week");
  });

  it("goToPrev updates currentDate backward", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.goToPrev();
    });

    // Day view: -1 day from 2026-03-28 = 2026-03-27
    expect(result.current.currentDate).toEqual(new Date(2026, 2, 27, 0, 0, 0, 0));
  });

  it("goToNext updates currentDate forward", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.goToNext();
    });

    // Day view: +1 day from 2026-03-28 = 2026-03-29
    expect(result.current.currentDate).toEqual(new Date(2026, 2, 29, 0, 0, 0, 0));
  });

  it("goToDate sets specific date", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.goToDate(new Date(2026, 5, 15, 14, 30));
    });

    expect(result.current.currentDate).toEqual(new Date(2026, 5, 15, 0, 0, 0, 0));
  });

  it("toggleResource filters resources and their events", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    // Toggle r1 off — when no resourceIds filter, excludes r1
    act(() => {
      result.current.toggleResource("r1");
    });

    const resourceIds = result.current.filteredResources.map((r) => r.id);
    expect(resourceIds).not.toContain("r1");
    expect(resourceIds).toContain("r2");

    // Events for r1 should be excluded
    expect(result.current.filteredEvents.every((e) => e.resourceId !== "r1")).toBe(true);
  });

  it("toggleCategory filters events by category", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggleCategory("work");
    });

    // Only "work" category events
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].category).toBe("work");
  });

  it("selectAllResources restores all resources after toggling one off", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    // First toggle off r1
    act(() => {
      result.current.toggleResource("r1");
    });
    expect(result.current.filteredResources).toHaveLength(1);

    // Then select all — sets resourceIds to undefined
    act(() => {
      result.current.selectAllResources();
    });
    expect(result.current.filteredResources).toHaveLength(2);
    expect(result.current.filter.resourceIds).toBeUndefined();
  });

  it("view change affects navigation direction", () => {
    const { result } = renderHook(() => useTimelineContext(), {
      wrapper: createWrapper(),
    });

    // Switch to week view
    act(() => {
      result.current.setView("week");
    });

    // Navigate next in week view should move 7 days
    act(() => {
      result.current.goToNext();
    });

    expect(result.current.currentDate).toEqual(new Date(2026, 3, 4, 0, 0, 0, 0));
  });
});
