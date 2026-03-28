import type { TimelineEvent, TruncateResult } from "../types/index.js";

/**
 * Truncates an event list to a maximum visible count for Calendar Month cells.
 * Returns the first N events as visible, and the remaining count for "N more" link display.
 *
 * @param config.events - All events for a given date cell
 * @param config.maxVisible - Maximum number of events to show before truncating
 */
export function truncateEvents(config: {
  events: TimelineEvent[];
  maxVisible: number;
}): TruncateResult {
  const { events, maxVisible } = config;

  if (events.length <= maxVisible) {
    return { visible: events, hiddenCount: 0 };
  }

  return {
    visible: events.slice(0, maxVisible),
    hiddenCount: events.length - maxVisible,
  };
}
