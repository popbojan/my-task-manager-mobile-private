import type { TranslationKey } from '@/i18n/locales';
import { parseCalendarDate } from '@/utils/historyCalendar';

export const HISTORY_MONTH_KEYS = [
  'history.month.jan',
  'history.month.feb',
  'history.month.mar',
  'history.month.apr',
  'history.month.may',
  'history.month.jun',
  'history.month.jul',
  'history.month.aug',
  'history.month.sep',
  'history.month.oct',
  'history.month.nov',
  'history.month.dec',
] as const satisfies readonly TranslationKey[];

/** UTC weekday: 0 = Sunday … 6 = Saturday */
const HISTORY_WEEKDAY_LONG_KEYS = [
  'history.weekdayLong.sun',
  'history.weekdayLong.mon',
  'history.weekdayLong.tue',
  'history.weekdayLong.wed',
  'history.weekdayLong.thu',
  'history.weekdayLong.fri',
  'history.weekdayLong.sat',
] as const satisfies readonly TranslationKey[];

type Translate = (
  key: TranslationKey,
  params?: Record<string, string>,
) => string;

export function historyMonthName(monthIndex: number, t: Translate): string {
  const key = HISTORY_MONTH_KEYS[monthIndex];
  if (!key) {
    return String(monthIndex + 1);
  }
  return t(key);
}

export function formatHistoryMonthYear(
  monthIndex: number,
  year: number,
  t: Translate,
): string {
  return t('history.monthYearTitle', {
    month: historyMonthName(monthIndex, t),
    year: String(year),
  });
}

export function formatHistoryDayDetailTitle(calendarDate: string, t: Translate): string {
  const date = parseCalendarDate(calendarDate);
  const weekdayKey = HISTORY_WEEKDAY_LONG_KEYS[date.getUTCDay()];
  return t('history.dayDetailDate', {
    weekday: t(weekdayKey),
    day: String(date.getUTCDate()),
    month: historyMonthName(date.getUTCMonth(), t),
    year: String(date.getUTCFullYear()),
  });
}

export function formatLocalizedDateLong(date: Date, t: Translate): string {
  return t('history.dateLong', {
    day: String(date.getDate()),
    month: historyMonthName(date.getMonth(), t),
    year: String(date.getFullYear()),
  });
}
