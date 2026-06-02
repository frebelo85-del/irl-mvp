/** Pure scheduler helpers (PRD §5). No I/O — safe for vitest and Deno Edge. */

export const MIN_GAP_HOURS = 36;
export const LOW_WEEKLY_CAP = 2;
export const MEDIUM_WEEKLY_CAP = 4;
export const MISSION_COOLDOWN_DAYS = 30;

export type FrequencyTier = "low" | "medium";

export type DeliveryRow = {
  created_at: string;
  scheduled_at: string;
  mission_id: string;
};

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function weeklyCapForFrequency(frequency: FrequencyTier): number {
  return frequency === "medium" ? MEDIUM_WEEKLY_CAP : LOW_WEEKLY_CAP;
}

export function countDeliveriesInRollingWindow(
  deliveries: DeliveryRow[],
  now: Date,
  days = 7,
): number {
  const windowStart = now.getTime() - days * 24 * 60 * 60 * 1000;
  return deliveries.filter((d) => {
    const created = new Date(d.created_at).getTime();
    return created >= windowStart && created <= now.getTime();
  }).length;
}

export function isUnderWeeklyCap(count: number, frequency: FrequencyTier): boolean {
  return count < weeklyCapForFrequency(frequency);
}

export function hoursSinceLastDelivery(
  lastScheduledAt: string | null,
  now: Date,
): number | null {
  if (!lastScheduledAt) return null;
  const last = new Date(lastScheduledAt).getTime();
  return (now.getTime() - last) / (60 * 60 * 1000);
}

export function meetsMinGap(lastScheduledAt: string | null, now: Date): boolean {
  const hours = hoursSinceLastDelivery(lastScheduledAt, now);
  if (hours === null) return true;
  return hours >= MIN_GAP_HOURS;
}

/** Local hour 0–23; window may wrap midnight when start > end. */
export function isHourInActiveWindow(
  hour: number,
  activeHourStart: number,
  activeHourEnd: number,
): boolean {
  if (activeHourStart === activeHourEnd) return false;
  if (activeHourStart < activeHourEnd) {
    return hour >= activeHourStart && hour < activeHourEnd;
  }
  return hour >= activeHourStart || hour < activeHourEnd;
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** UTC instant for a local wall-clock time in an IANA zone (DST-aware via probe). */
export function localWallTimeToUtc(
  local: Omit<ZonedParts, "minute"> & { minute?: number },
  timeZone: string,
): Date {
  const minute = local.minute ?? 0;
  const desiredLocalMs = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    minute,
    0,
    0,
  );

  const probe = new Date(desiredLocalMs);
  const zoned = getZonedParts(probe, timeZone);
  const asUtcMs = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    0,
    0,
  );
  const offsetMs = asUtcMs - desiredLocalMs;
  return new Date(desiredLocalMs - offsetMs);
}

function addDays(parts: ZonedParts, days: number): ZonedParts {
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: parts.hour,
    minute: parts.minute,
  };
}

/** Hours in [start, end) for a calendar day (handles wrap). */
export function activeWindowHours(activeHourStart: number, activeHourEnd: number): number[] {
  if (activeHourStart === activeHourEnd) return [];
  if (activeHourStart < activeHourEnd) {
    const hours: number[] = [];
    for (let h = activeHourStart; h < activeHourEnd; h++) hours.push(h);
    return hours;
  }
  const hours: number[] = [];
  for (let h = activeHourStart; h <= 23; h++) hours.push(h);
  for (let h = 0; h < activeHourEnd; h++) hours.push(h);
  return hours;
}

export type PickSlotInput = {
  now: Date;
  timeZone: string;
  activeHourStart: number;
  activeHourEnd: number;
  random?: () => number;
};

/**
 * Random slot in remaining active window today (local), else tomorrow in window.
 * Returns UTC `Date` for `scheduled_at`.
 */
export function pickRandomSlotTodayOrTomorrow(input: PickSlotInput): Date {
  const rand = input.random ?? Math.random;
  const localNow = getZonedParts(input.now, input.timeZone);
  const windowHours = activeWindowHours(input.activeHourStart, input.activeHourEnd);

  const remainingToday = windowHours.filter((h) => {
    if (h > localNow.hour) return true;
    if (h === localNow.hour) return true;
    return false;
  });

  const pickFromHours = (hours: number[], dayParts: ZonedParts): Date => {
    const hour = hours[Math.floor(rand() * hours.length)]!;
    const minute =
      hour === localNow.hour && dayParts.day === localNow.day && dayParts.month === localNow.month
        ? Math.floor(rand() * (60 - localNow.minute)) + localNow.minute
        : Math.floor(rand() * 60);
    return localWallTimeToUtc(
      {
        year: dayParts.year,
        month: dayParts.month,
        day: dayParts.day,
        hour,
        minute: Math.min(minute, 59),
      },
      input.timeZone,
    );
  };

  if (remainingToday.length > 0) {
    const slot = pickFromHours(remainingToday, localNow);
    if (slot.getTime() > input.now.getTime()) {
      return slot;
    }
    const futureHours = remainingToday.filter((h) => h > localNow.hour);
    if (futureHours.length > 0) {
      return pickFromHours(futureHours, localNow);
    }
  }

  const tomorrow = addDays(localNow, 1);
  return pickFromHours(windowHours, tomorrow);
}

export function pickMissionId(
  eligibleIds: string[],
  recentMissionIds: string[],
  cooldownDays = MISSION_COOLDOWN_DAYS,
  random: () => number = Math.random,
): string | null {
  const recentSet = new Set(recentMissionIds);
  const pool = eligibleIds.filter((id) => !recentSet.has(id));
  if (pool.length === 0) return null;
  return pool[Math.floor(random() * pool.length)]!;
}

export function missionIdsWithinCooldown(
  deliveries: DeliveryRow[],
  now: Date,
  cooldownDays = MISSION_COOLDOWN_DAYS,
): string[] {
  const cutoff = now.getTime() - cooldownDays * 24 * 60 * 60 * 1000;
  return deliveries
    .filter((d) => new Date(d.created_at).getTime() >= cutoff)
    .map((d) => d.mission_id);
}

export function shouldSendImmediately(scheduledAt: Date, now: Date): boolean {
  return scheduledAt.getTime() <= now.getTime();
}

export function buildMissionDeepLink(missionId: string, deliveryId: string): string {
  return `irl://mission/${missionId}?deliveryId=${deliveryId}`;
}
