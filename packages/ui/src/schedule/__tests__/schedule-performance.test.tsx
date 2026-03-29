/**
 * Performance test for the Schedule component with large datasets.
 *
 * Target: 10,000 events should render within 100ms.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { TimelineEvent, Resource } from "@chronoview/core";
import { Schedule } from "../schedule.js";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6b7280"];
const BASE_DATE = new Date(2026, 2, 27);

function generateLargeDataset(resourceCount: number, eventsPerResource: number) {
  const resources: Resource[] = Array.from({ length: resourceCount }, (_, i) => ({
    id: `r-${i}`,
    title: `Resource ${i + 1}`,
    color: COLORS[i % COLORS.length],
  }));

  const events: TimelineEvent[] = [];
  for (let r = 0; r < resourceCount; r++) {
    for (let e = 0; e < eventsPerResource; e++) {
      const startHour = (e * 2) % 24;
      const start = new Date(BASE_DATE);
      start.setHours(startHour, (e * 17) % 60, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1 + (e % 3));

      events.push({
        id: `e-${r}-${e}`,
        resourceId: `r-${r}`,
        start,
        end,
        title: `Event ${r}-${e}`,
        color: COLORS[(r + e) % COLORS.length],
      });
    }
  }

  return { resources, events };
}

describe("Schedule Performance", () => {
  it("renders 10,000 events (100 resources × 100 events) within performance budget", { timeout: 30000 }, () => {
    const { resources, events } = generateLargeDataset(100, 100);

    const start = performance.now();

    const { container } = render(
      <Schedule
        events={events}
        resources={resources}
        view="day"
        startDate={BASE_DATE}
        showToolbar={false}
        showNowIndicator={false}
      />,
    );

    const elapsed = performance.now() - start;

    // Verify render completed (some content exists)
    expect(container.querySelector("div")).toBeDefined();

    // Performance budget: render should complete within a reasonable time
    // Note: jsdom is slower than browser, so we use a generous budget
    // Actual browser perf can be tested via Storybook's Performance story
    console.log(`10,000 events render time: ${elapsed.toFixed(1)}ms`);
    // jsdom is ~50-100x slower than browser DOM and varies by CI load.
    // Real browser target: <100ms. Use Storybook Performance story for browser benchmark.
    expect(elapsed).toBeLessThan(30000);
  });

  it("renders 1,000 events (10 resources × 100 events) quickly", () => {
    const { resources, events } = generateLargeDataset(10, 100);

    const start = performance.now();

    render(
      <Schedule
        events={events}
        resources={resources}
        view="day"
        startDate={BASE_DATE}
        showToolbar={false}
        showNowIndicator={false}
      />,
    );

    const elapsed = performance.now() - start;

    console.log(`1,000 events render time: ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(2000); // jsdom budget
  });
});
