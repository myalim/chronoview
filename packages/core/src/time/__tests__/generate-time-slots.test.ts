import { describe, expect, it } from "vitest";
import { generateTimeSlots } from "../generate-time-slots.js";

describe("generateTimeSlots", () => {
  it("generates 30-minute slots for a full day", () => {
    const slots = generateTimeSlots({
      startTime: new Date(2026, 2, 27, 0, 0),
      endTime: new Date(2026, 2, 27, 23, 59, 59, 999),
      intervalMinutes: 30,
    });

    expect(slots).toHaveLength(48); // 24h × 2
    expect(slots[0].label).toBe("00:00");
    expect(slots[1].label).toBe("00:30");
    expect(slots[47].label).toBe("23:30");
  });

  it("generates 60-minute slots", () => {
    const slots = generateTimeSlots({
      startTime: new Date(2026, 2, 27, 0, 0),
      endTime: new Date(2026, 2, 27, 23, 59, 59, 999),
      intervalMinutes: 60,
    });

    expect(slots).toHaveLength(24);
    expect(slots[0].label).toBe("00:00");
    expect(slots[9].label).toBe("09:00");
  });

  it("generates 15-minute slots", () => {
    const slots = generateTimeSlots({
      startTime: new Date(2026, 2, 27, 9, 0),
      endTime: new Date(2026, 2, 27, 10, 59, 59, 999),
      intervalMinutes: 15,
    });

    expect(slots).toHaveLength(8); // 2h × 4
    expect(slots[0].label).toBe("09:00");
    expect(slots[1].label).toBe("09:15");
    expect(slots[7].label).toBe("10:45");
  });

  it("generates 5-minute slots", () => {
    const slots = generateTimeSlots({
      startTime: new Date(2026, 2, 27, 9, 0),
      endTime: new Date(2026, 2, 27, 9, 59, 59, 999),
      intervalMinutes: 5,
    });

    expect(slots).toHaveLength(12); // 60min / 5
  });

  it("each slot has correct start and end times", () => {
    const slots = generateTimeSlots({
      startTime: new Date(2026, 2, 27, 9, 0),
      endTime: new Date(2026, 2, 27, 10, 59, 59, 999),
      intervalMinutes: 30,
    });

    expect(slots[0].start).toEqual(new Date(2026, 2, 27, 9, 0));
    expect(slots[0].end).toEqual(new Date(2026, 2, 27, 9, 30));
    expect(slots[1].start).toEqual(new Date(2026, 2, 27, 9, 30));
    expect(slots[1].end).toEqual(new Date(2026, 2, 27, 10, 0));
  });

  it("no overlapping slots", () => {
    const slots = generateTimeSlots({
      startTime: new Date(2026, 2, 27, 0, 0),
      endTime: new Date(2026, 2, 27, 23, 59, 59, 999),
      intervalMinutes: 30,
    });

    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].start.getTime()).toBe(slots[i - 1].end.getTime());
    }
  });

  it("clamps intervalMinutes below 5 to 5", () => {
    const slots = generateTimeSlots({
      startTime: new Date(2026, 2, 27, 9, 0),
      endTime: new Date(2026, 2, 27, 9, 59, 59, 999),
      intervalMinutes: 1,
    });

    // Clamped to 5min → 60min / 5 = 12 slots (same as 5-minute test)
    expect(slots).toHaveLength(12);
  });
});
