import { DateTime } from 'luxon';

/**
 * Format a UTC Date object or ISO string into a local timezone ISO string.
 */
export function formatToLocal(date: Date | string, timezone: string, format = "yyyy-MM-dd HH:mm:ss ZZZZ"): string {
  const dt = typeof date === 'string' ? DateTime.fromISO(date, { zone: 'utc' }) : DateTime.fromJSDate(date, { zone: 'utc' });
  return dt.setZone(timezone).toFormat(format);
}

/**
 * Get current time in a given timezone
 */
export function nowInZone(timezone: string): DateTime {
  return DateTime.now().setZone(timezone);
}

/**
 * Check if a UTC shift start date falls on a local calendar day
 */
export function isShiftOnLocalDay(shiftStartUtc: Date, targetDayIso: string, timezone: string): boolean {
  const localDt = DateTime.fromJSDate(shiftStartUtc, { zone: 'utc' }).setZone(timezone);
  return localDt.toISODate() === targetDayIso;
}

/**
 * Calculate duration in hours between two UTC dates, handling DST transitions cleanly
 */
export function calculateShiftHours(startUtc: Date, endUtc: Date, breakMinutes = 0): number {
  const start = DateTime.fromJSDate(startUtc);
  const end = DateTime.fromJSDate(endUtc);
  const diffMinutes = end.diff(start, 'minutes').minutes - breakMinutes;
  return Math.max(0, Math.round((diffMinutes / 60) * 100) / 100);
}

/**
 * Parse a local date and time string in a business timezone and return UTC Date
 */
export function parseLocalToUtc(dateStr: string, timeStr: string, timezone: string): Date {
  const combined = `${dateStr}T${timeStr}`;
  const localDt = DateTime.fromISO(combined, { zone: timezone });
  if (!localDt.isValid) {
    throw new Error(`Invalid local date/time: ${combined} in zone ${timezone}`);
  }
  return localDt.toUTC().toJSDate();
}
