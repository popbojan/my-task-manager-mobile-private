import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';

export type HistoryDayCellTone = 'success' | 'missed' | 'in_progress' | 'neutral';

const MONTH_KEY_PATTERN = /^[0-9]{4}-(0[1-9]|1[0-2])$/;

export function isValidMonthKey(month: string): boolean {
  return MONTH_KEY_PATTERN.test(month);
}

export function parseMonthKey(monthKey: string): { year: number; monthIndex: number } {
  if (!isValidMonthKey(monthKey)) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }

  const [yearPart, monthPart] = monthKey.split('-');
  return {
    year: Number(yearPart),
    monthIndex: Number(monthPart) - 1,
  };
}

export function formatMonthKey(year: number, monthIndex: number): string {
  const month = String(monthIndex + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatCalendarDate(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, '0');
  const dayPart = String(day).padStart(2, '0');
  return `${year}-${month}-${dayPart}`;
}

export function parseCalendarDate(date: string): Date {
  const [yearPart, monthPart, dayPart] = date.split('-');
  return new Date(Number(yearPart), Number(monthPart) - 1, Number(dayPart));
}

export function getMondayBasedWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function addMonths(monthKey: string, delta: number): string {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const date = new Date(year, monthIndex + delta, 1);
  return formatMonthKey(date.getFullYear(), date.getMonth());
}

export function getDaysInMonth(monthKey: string): number {
  const { year, monthIndex } = parseMonthKey(monthKey);
  return new Date(year, monthIndex + 1, 0).getDate();
}

export type MonthCalendarCell = {
  kind: 'day';
  date: string;
  dayOfMonth: number;
  /** Trailing/leading days from the previous or next month (full weeks only). */
  isAdjacentMonth: boolean;
};

export function buildMonthCalendarGrid(monthKey: string): MonthCalendarCell[] {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const daysInMonth = getDaysInMonth(monthKey);
  const firstWeekday = getMondayBasedWeekday(new Date(year, monthIndex, 1));
  const cells: MonthCalendarCell[] = [];

  const lastDayOfPreviousMonth = new Date(year, monthIndex, 0);
  const daysInPreviousMonth = lastDayOfPreviousMonth.getDate();
  const previousMonthStartDay = daysInPreviousMonth - firstWeekday + 1;
  const previousYear = lastDayOfPreviousMonth.getFullYear();
  const previousMonthIndex = lastDayOfPreviousMonth.getMonth();

  for (let day = previousMonthStartDay; day <= daysInPreviousMonth; day++) {
    cells.push({
      kind: 'day',
      date: formatCalendarDate(previousYear, previousMonthIndex, day),
      dayOfMonth: day,
      isAdjacentMonth: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      kind: 'day',
      date: formatCalendarDate(year, monthIndex, day),
      dayOfMonth: day,
      isAdjacentMonth: false,
    });
  }

  const nextMonthAnchor = new Date(year, monthIndex + 1, 1);
  const nextYear = nextMonthAnchor.getFullYear();
  const nextMonthIndex = nextMonthAnchor.getMonth();
  let nextMonthDay = 1;

  while (cells.length % 7 !== 0) {
    cells.push({
      kind: 'day',
      date: formatCalendarDate(nextYear, nextMonthIndex, nextMonthDay),
      dayOfMonth: nextMonthDay,
      isAdjacentMonth: true,
    });
    nextMonthDay += 1;
  }

  return cells;
}

export function formatApiCalendarDate(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

export function indexHistoryDaysByDate(days: HistoryDay[]): Map<string, HistoryDay> {
  const map = new Map<string, HistoryDay>();
  for (const day of days) {
    map.set(formatApiCalendarDate(day.date), day);
  }
  return map;
}

export function resolveHistoryDayCellTone(
  day: HistoryDay | undefined,
): HistoryDayCellTone {
  if (!day) {
    return 'neutral';
  }

  switch (day.status) {
    case HistoryDayStatus.Success:
      return 'success';
    case HistoryDayStatus.Missed:
      return 'missed';
    case HistoryDayStatus.InProgress:
      return 'in_progress';
    default:
      return 'neutral';
  }
}

export function formatHistoryTaskRatio(day: HistoryDay | undefined): string | null {
  if (!day || day.completedTasks === null || day.totalTasks === null) {
    return null;
  }

  return `${day.completedTasks}/${day.totalTasks}`;
}

/** Task ratio for calendar cells; shows a placeholder when counts are unknown. */
export function formatHistoryTaskRatioDisplay(day: HistoryDay | undefined): string {
  const ratio = formatHistoryTaskRatio(day);
  return ratio ?? '—';
}

export function formatHistoryStreakDisplay(day: HistoryDay | undefined): string {
  if (!day || day.currentStreak === null) {
    return '—';
  }

  return String(day.currentStreak);
}

export function formatHistoryLevelDisplay(day: HistoryDay | undefined): string {
  if (!day || day.currentLevel === null) {
    return '—';
  }

  return String(day.currentLevel);
}

export function shouldShowHistoryDayDetails(day: HistoryDay | undefined): boolean {
  return day !== undefined;
}

export function shouldShowHistorySuccessCrown(day: HistoryDay | undefined): boolean {
  if (!day || day.status !== HistoryDayStatus.Success) {
    return false;
  }

  if (day.completedTasks === null || day.totalTasks === null) {
    return false;
  }

  return day.totalTasks > 0 && day.completedTasks >= day.totalTasks;
}

export function monthKeyFromCalendarDate(date: string): string {
  return date.slice(0, 7);
}

export function defaultVisibleMonthKey(today = new Date()): string {
  return formatMonthKey(today.getFullYear(), today.getMonth());
}
