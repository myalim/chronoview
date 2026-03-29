import { addMinutes, format } from "date-fns";
import type { TimeSlot } from "../types/index.js";

/**
 * Splits a time range into equal-sized slots for grid line rendering.
 * Each slot has a start, end, and formatted label (e.g., "09:00").
 * Note: event positioning uses 1-minute precision independent of cell interval.
 *
 * @param config.startTime - Start of the time range
 * @param config.endTime - End of the time range
 * @param config.intervalMinutes - Slot interval in minutes (clamped to 5–1440)
 */
export function generateTimeSlots(config: {
  startTime: Date;
  endTime: Date;
  intervalMinutes: number;
}): TimeSlot[] {
  const { startTime, endTime, intervalMinutes } = config;
  // Clamp to 5–1440 min to prevent infinite loops.
  const safeInterval = Math.max(5, Math.min(1440, intervalMinutes));
  const slots: TimeSlot[] = [];
  let current = startTime;

  while (current < endTime) {
    const next = addMinutes(current, safeInterval);
    slots.push({
      start: current,
      end: next,
      label: format(current, "HH:mm"),
    });
    current = next;
  }

  return slots;
}
