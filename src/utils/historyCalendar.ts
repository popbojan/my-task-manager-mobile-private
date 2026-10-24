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

/** Calendar date YYYY-MM-DD as UTC midnight (matches OpenAPI `date` JSON parsing). */
export function parseCalendarDate(date: string): Date {
  const [yearPart, monthPart, dayPart] = date.split('-');
  return new Date(Date.UTC(Number(yearPart), Number(monthPart) - 1, Number(dayPart)));
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

export const HISTORY_CALENDAR_COLUMN_GAP = 4;
export const HISTORY_CALENDAR_HORIZONTAL_INSET = 12;

export type MonthCalendarCell =
  | { kind: 'blank' }
  | { kind: 'day'; date: string; dayOfMonth: number };

export function computeHistoryCalendarCellWidth(windowWidth: number): number {
  return Math.floor(
    (windowWidth -
      HISTORY_CALENDAR_HORIZONTAL_INSET * 2 -
      HISTORY_CALENDAR_COLUMN_GAP * 6) /
      7,
  );
}

export function buildMonthCalendarGrid(monthKey: string): MonthCalendarCell[] {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const daysInMonth = getDaysInMonth(monthKey);
  const firstWeekday = getMondayBasedWeekday(new Date(year, monthIndex, 1));
  const cells: MonthCalendarCell[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ kind: 'blank' });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      kind: 'day',
      date: formatCalendarDate(year, monthIndex, day),
      dayOfMonth: day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ kind: 'blank' });
  }

  return cells;
}

export function formatApiCalendarDate(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return formatCalendarDate(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
}

/** Calendar date YYYY-MM-DD shifted by whole days (UTC-safe for API calendar dates). */
export function shiftCalendarDate(calendarDate: string, dayDelta: number): string {
  const [yearPart, monthPart, dayPart] = calendarDate.split('-');
  const shifted = new Date(
    Date.UTC(Number(yearPart), Number(monthPart) - 1, Number(dayPart) + dayDelta),
  );

  return formatCalendarDate(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
}

export function resolveYesterdayCalendarDate(todayCalendarDate: string): string {
  return shiftCalendarDate(todayCalendarDate, -1);
}

export function isRepairableMissedHistoryDay(
  entry: HistoryDay | undefined,
  calendarDate: string,
  todayCalendarDate: string | null | undefined,
): boolean {
  if (!entry || !todayCalendarDate) {
    return false;
  }

  if (calendarDate !== resolveYesterdayCalendarDate(todayCalendarDate)) {
    return false;
  }

  if (entry.status !== HistoryDayStatus.Missed) {
    return false;
  }

  if (entry.finalizedAt === null) {
    return false;
  }

  if (entry.totalTasks === null || entry.totalTasks <= 0) {
    return false;
  }

  return true;
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
    case HistoryDayStatus.NoTasks:
      return 'neutral';
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
  if (!day) {
    return false;
  }

  if (day.status === HistoryDayStatus.NoTasks) {
    return false;
  }

  return true;
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

export function resolveHistoryDayProgressPercent(day: HistoryDay | undefined): number | null {
  if (!day || day.completedTasks === null || day.totalTasks === null || day.totalTasks <= 0) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round((day.completedTasks / day.totalTasks) * 100)));
}

export function shouldShowHistoryMissedMark(day: HistoryDay | undefined): boolean {
  return day?.status === HistoryDayStatus.Missed;
}

export function shouldShowHistoryInProgressMark(day: HistoryDay | undefined): boolean {
  if (!day || day.status !== HistoryDayStatus.InProgress) {
    return false;
  }

  const percent = resolveHistoryDayProgressPercent(day);
  return percent !== null && percent < 100;
}

export function shouldShowHistoryNoteMark(day: HistoryDay | undefined): boolean {
  if (!day?.note) {
    return false;
  }

  return day.note.trim().length > 0;
}

export function monthKeyFromCalendarDate(date: string): string {
  return date.slice(0, 7);
}

export function historyMonthsToRefreshAfterRepair(options: {
  repairedCalendarDate: string;
  todayCalendarDate: string | null;
  visibleMonth: string | null;
}): string[] {
  const months = new Set<string>([
    monthKeyFromCalendarDate(options.repairedCalendarDate),
  ]);

  if (options.todayCalendarDate) {
    months.add(monthKeyFromCalendarDate(options.todayCalendarDate));
  }

  if (options.visibleMonth) {
    months.add(options.visibleMonth);
  }

  return [...months];
}

export function defaultVisibleMonthKey(today = new Date()): string {
  return formatMonthKey(today.getFullYear(), today.getMonth());
}
