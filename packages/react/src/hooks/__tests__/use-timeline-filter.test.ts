import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimelineFilter } from "../use-timeline-filter.js";
import type { Resource, TimelineEvent } from "@chronoview/core";

// Shared test fixtures
const resources: Resource[] = [
  { id: "r1", title: "Room A" },
  { id: "r2", title: "Room B" },
  { id: "r3", title: "Room C" },
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
    start: new Date(2026, 2, 28, 10, 0),
    end: new Date(2026, 2, 28, 11, 0),
    title: "Lunch",
    category: "personal",
  },
  {
    id: "e3",
    resourceId: "r3",
    start: new Date(2026, 2, 28, 11, 0),
    end: new Date(2026, 2, 28, 12, 0),
    title: "Workshop",
    category: "work",
  },
];

describe("useTimelineFilter", () => {
  it("returns all events and resources when no filter is set", () => {
    const { result } = renderHook(() =>
      useTimelineFilter({ events, resources }),
    );

    expect(result.current.filteredResources).toHaveLength(3);
    expect(result.current.filteredEvents).toHaveLength(3);
    expect(result.current.filter).toEqual({});
  });

  it("toggleResource removes a resource and filters its events", () => {
    const { result } = renderHook(() =>
      useTimelineFilter({ events, resources }),
    );

    // First toggle on "r1" — when no resourceIds filter exists,
    // toggleResource selects all EXCEPT the toggled one
    act(() => {
      result.current.toggleResource("r1");
    });

    const filteredResourceIds = result.current.filteredResources.map((r) => r.id);
    expect(filteredResourceIds).not.toContain("r1");
    expect(filteredResourceIds).toContain("r2");
    expect(filteredResourceIds).toContain("r3");

    // Events for r1 should be excluded
    const filteredEventResourceIds = result.current.filteredEvents.map((e) => e.resourceId);
    expect(filteredEventResourceIds).not.toContain("r1");
  });

  it("toggleResource re-adds a previously removed resource", () => {
    const { result } = renderHook(() =>
      useTimelineFilter({ events, resources }),
    );

    // Remove r1
    act(() => {
      result.current.toggleResource("r1");
    });

    // Re-add r1
    act(() => {
      result.current.toggleResource("r1");
    });

    const filteredResourceIds = result.current.filteredResources.map((r) => r.id);
    expect(filteredResourceIds).toContain("r1");
    expect(filteredResourceIds).toContain("r2");
    expect(filteredResourceIds).toContain("r3");
  });

  it("toggleCategory filters events by category", () => {
    const { result } = renderHook(() =>
      useTimelineFilter({ events, resources }),
    );

    // Toggle "work" category — first toggle creates filter with ["work"]
    act(() => {
      result.current.toggleCategory("work");
    });

    // Only "work" events should pass
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents.every((e) => e.category === "work")).toBe(true);
  });

  it("toggleCategory removes an already-active category", () => {
    const { result } = renderHook(() =>
      useTimelineFilter({ events, resources }),
    );

    act(() => {
      result.current.toggleCategory("work");
    });
    act(() => {
      result.current.toggleCategory("work");
    });

    // categories filter is now empty array [], which means "no category filter"
    // filterEvents only applies category filter when categories.length > 0
    expect(result.current.filteredEvents).toHaveLength(3);
  });

  it("selectAllResources clears the resource filter", () => {
    const { result } = renderHook(() =>
      useTimelineFilter({ events, resources }),
    );

    // First remove a resource
    act(() => {
      result.current.toggleResource("r1");
    });
    expect(result.current.filteredResources).toHaveLength(2);

    // Select all — sets resourceIds to undefined
    act(() => {
      result.current.selectAllResources();
    });

    expect(result.current.filteredResources).toHaveLength(3);
    expect(result.current.filter.resourceIds).toBeUndefined();
  });

  it("deselectAllResources sets empty resource list in filter state", () => {
    const { result } = renderHook(() =>
      useTimelineFilter({ events, resources }),
    );

    act(() => {
      result.current.deselectAllResources();
    });

    // Filter state is set to empty array
    expect(result.current.filter.resourceIds).toEqual([]);

    // Note: core filterResources treats empty array as "no filter" (returns all).
    // The hook faithfully passes the filter to core — UI should interpret
    // resourceIds=[] as "nothing selected" for checkbox state.
    expect(result.current.filteredResources).toHaveLength(3);
  });

  it("setFilter merges partial filter state", () => {
    const { result } = renderHook(() =>
      useTimelineFilter({ events, resources }),
    );

    act(() => {
      result.current.setFilter({ categories: ["work"] });
    });

    expect(result.current.filter.categories).toEqual(["work"]);
    expect(result.current.filteredEvents).toHaveLength(2);
  });
});
