import { addMinutes, format } from "date-fns";
import type { TimeSlot } from "../types/index.js";

/**
 * Splits a time range into equal-sized slots for grid line rendering.
 * Each slot has a start, end, and formatted label (e.g., "09:00").
 * Note: event positioning uses 1-minute precision independent of timeStep.
 *
 * @param config.startTime - Start of the time range
 * @param config.endTime - End of the time range
 * @param config.timeStep - Slot interval in minutes (min: 5, default: 30)
 */
export function generateTimeSlots(config: {
  startTime: Date;
  endTime: Date;
  timeStep: number;
}): TimeSlot[] {
  const { startTime, endTime, timeStep } = config;
  const slots: TimeSlot[] = [];
  let current = startTime;

  while (current < endTime) {
    const next = addMinutes(current, timeStep);
    slots.push({
      start: current,
      end: next,
      label: format(current, "HH:mm"),
    });
    current = next;
  }

  return slots;
}
