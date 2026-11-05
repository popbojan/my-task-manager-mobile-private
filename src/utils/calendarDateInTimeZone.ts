import { readLocalTimeParts } from '@/recurring/recurringResetPollingUtils';
import {
  formatCalendarDate,
  parseCalendarDate,
  shiftCalendarDate,
} from '@/utils/historyCalendar';

function resolveTimeZone(timeZone: string): string {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return timeZone;
  } catch {
    return 'UTC';
  }
}

/** Calendar date YYYY-MM-DD for an instant in the user's IANA timezone. */
export function calendarDateInTimeZone(date: Date, timeZone: string): string {
  const parts = readLocalTimeParts(date, resolveTimeZone(timeZone));
  return formatCalendarDate(parts.year, parts.month - 1, parts.day);
}

export function diffCalendarDays(later: string, earlier: string): number {
  const laterUtc = parseCalendarDate(later).getTime();
  const earlierUtc = parseCalendarDate(earlier).getTime();
  return Math.round((laterUtc - earlierUtc) / 86_400_000);
}

/** Monday … Sunday as calendar dates containing `todayCalendarDate`. */
export function weekCalendarDatesMondayStart(todayCalendarDate: string): string[] {
  const weekdayUtc = parseCalendarDate(todayCalendarDate).getUTCDay();
  const mondayOffset = weekdayUtc === 0 ? -6 : 1 - weekdayUtc;

  return Array.from({ length: 7 }, (_, index) =>
    shiftCalendarDate(todayCalendarDate, mondayOffset + index),
  );
}

/** Oldest → newest; ends with `todayCalendarDate`. */
export function rollingCalendarDatesEndingToday(
  todayCalendarDate: string,
  dayCount = 7,
): string[] {
  const startOffset = -(dayCount - 1);
  return Array.from({ length: dayCount }, (_, index) =>
    shiftCalendarDate(todayCalendarDate, startOffset + index),
  );
}

export function uniqueMonthKeysForCalendarDates(calendarDates: string[]): string[] {
  return [...new Set(calendarDates.map(date => date.slice(0, 7)))];
}
