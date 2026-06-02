import { describe, expect, it } from "vitest";

import {
  MIN_GAP_HOURS,
  activeWindowHours,
  countDeliveriesInRollingWindow,
  getZonedParts,
  isHourInActiveWindow,
  isUnderWeeklyCap,
  localWallTimeToUtc,
  meetsMinGap,
  pickMissionId,
  pickRandomSlotTodayOrTomorrow,
  shouldSendImmediately,
  weeklyCapForFrequency,
} from "./scheduler.ts";

describe("weekly cap", () => {
  it("low allows under 2", () => {
    expect(isUnderWeeklyCap(0, "low")).toBe(true);
    expect(isUnderWeeklyCap(1, "low")).toBe(true);
    expect(isUnderWeeklyCap(2, "low")).toBe(false);
  });

  it("medium allows under 4", () => {
    expect(weeklyCapForFrequency("medium")).toBe(4);
    expect(isUnderWeeklyCap(3, "medium")).toBe(true);
    expect(isUnderWeeklyCap(4, "medium")).toBe(false);
  });
});

describe("rolling window count", () => {
  const now = new Date("2026-05-25T12:00:00.000Z");

  it("counts deliveries within 7 days", () => {
    const deliveries = [
      { created_at: "2026-05-20T10:00:00.000Z", scheduled_at: "", mission_id: "a" },
      { created_at: "2026-05-10T10:00:00.000Z", scheduled_at: "", mission_id: "b" },
    ];
    expect(countDeliveriesInRollingWindow(deliveries, now, 7)).toBe(1);
  });
});

describe("min gap", () => {
  const now = new Date("2026-05-25T12:00:00.000Z");

  it("passes when no prior delivery", () => {
    expect(meetsMinGap(null, now)).toBe(true);
  });

  it("fails within MIN_GAP_HOURS", () => {
    const last = new Date(now.getTime() - (MIN_GAP_HOURS - 1) * 3600 * 1000).toISOString();
    expect(meetsMinGap(last, now)).toBe(false);
  });

  it("passes after MIN_GAP_HOURS", () => {
    const last = new Date(now.getTime() - MIN_GAP_HOURS * 3600 * 1000).toISOString();
    expect(meetsMinGap(last, now)).toBe(true);
  });
});

describe("active window hours", () => {
  it("simple range 9-17", () => {
    expect(activeWindowHours(9, 17)).toEqual([9, 10, 11, 12, 13, 14, 15, 16]);
    expect(isHourInActiveWindow(9, 9, 17)).toBe(true);
    expect(isHourInActiveWindow(17, 9, 17)).toBe(false);
  });

  it("wrap midnight 22-6", () => {
    expect(isHourInActiveWindow(23, 22, 6)).toBe(true);
    expect(isHourInActiveWindow(3, 22, 6)).toBe(true);
    expect(isHourInActiveWindow(12, 22, 6)).toBe(false);
    expect(activeWindowHours(22, 6)).toContain(22);
    expect(activeWindowHours(22, 6)).toContain(0);
    expect(activeWindowHours(22, 6)).not.toContain(12);
  });
});

describe("timezone helpers", () => {
  it("parses Europe/Paris parts", () => {
    const parts = getZonedParts(new Date("2026-01-15T11:30:00.000Z"), "Europe/Paris");
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(1);
    expect(parts.day).toBe(15);
    expect(parts.hour).toBeGreaterThanOrEqual(11);
    expect(parts.hour).toBeLessThanOrEqual(13);
  });

  it("localWallTimeToUtc round-trips hour in UTC", () => {
    const utc = localWallTimeToUtc(
      { year: 2026, month: 6, day: 1, hour: 12, minute: 0 },
      "UTC",
    );
    const parts = getZonedParts(utc, "UTC");
    expect(parts.hour).toBe(12);
    expect(parts.minute).toBe(0);
  });
});

describe("pickRandomSlotTodayOrTomorrow", () => {
  it("returns a future slot when window includes later today", () => {
    const now = new Date("2026-05-25T10:00:00.000Z");
    const slot = pickRandomSlotTodayOrTomorrow({
      now,
      timeZone: "UTC",
      activeHourStart: 10,
      activeHourEnd: 18,
      random: () => 0,
    });
    expect(slot.getTime()).toBeGreaterThanOrEqual(now.getTime());
    const parts = getZonedParts(slot, "UTC");
    expect(parts.hour).toBeGreaterThanOrEqual(10);
    expect(parts.hour).toBeLessThan(18);
  });

  it("schedules tomorrow when today window has passed", () => {
    const now = new Date("2026-05-25T20:00:00.000Z");
    const slot = pickRandomSlotTodayOrTomorrow({
      now,
      timeZone: "UTC",
      activeHourStart: 9,
      activeHourEnd: 12,
      random: () => 0,
    });
    const parts = getZonedParts(slot, "UTC");
    expect(parts.day).toBe(26);
    expect(parts.hour).toBeGreaterThanOrEqual(9);
    expect(parts.hour).toBeLessThan(12);
  });
});

describe("pickMissionId", () => {
  it("excludes recent missions", () => {
    const id = pickMissionId(
      ["a", "b", "c"],
      ["a", "b"],
      30,
      () => 0,
    );
    expect(id).toBe("c");
  });

  it("returns null when all excluded", () => {
    expect(pickMissionId(["a"], ["a"], 30, () => 0)).toBeNull();
  });
});

describe("shouldSendImmediately", () => {
  const now = new Date("2026-05-25T12:00:00.000Z");

  it("true when scheduled in the past", () => {
    expect(shouldSendImmediately(new Date("2026-05-25T11:00:00.000Z"), now)).toBe(true);
  });

  it("false when scheduled in the future", () => {
    expect(shouldSendImmediately(new Date("2026-05-25T13:00:00.000Z"), now)).toBe(false);
  });
});
