import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';
import {
  calendarDateInTimeZone,
  diffCalendarDays,
  rollingCalendarDatesEndingToday,
} from '@/utils/calendarDateInTimeZone';
import {
  shiftCalendarDate,
  shouldShowHistorySuccessCrown,
} from '@/utils/historyCalendar';

export type WeekDayState =
  | { kind: 'future' }
  | { kind: 'empty' }
  | { kind: 'complete' }
  | { kind: 'today'; done: number; total: number };

export type BuildWeekDayStatesOptions = {
  timeZone: string;
  now?: Date;
  /** Same source as Mein Weg — repaired/success days show as complete. */
  historyDaysByDate?: Map<string, HistoryDay>;
};

function resolveWeekStreakAnchorCalendar(
  progress: RecurringTaskProgress,
  todayCalendarDate: string,
  todayComplete: boolean,
  timeZone: string,
): { anchorCalendarDate: string | null; streakDays: number } {
  const streakDays = progress.currentStreak;

  if (streakDays <= 0) {
    return { anchorCalendarDate: null, streakDays: 0 };
  }

  const lastSuccessCalendar = progress.lastSuccessfulDay
    ? calendarDateInTimeZone(progress.lastSuccessfulDay, timeZone)
    : null;

  if (!lastSuccessCalendar) {
    return {
      anchorCalendarDate: shiftCalendarDate(todayCalendarDate, -1),
      streakDays,
    };
  }

  if (lastSuccessCalendar === todayCalendarDate && !todayComplete) {
    const adjustedStreak = Math.max(0, streakDays - 1);
    if (adjustedStreak <= 0) {
      return { anchorCalendarDate: null, streakDays: 0 };
    }

    return {
      anchorCalendarDate: shiftCalendarDate(todayCalendarDate, -1),
      streakDays: adjustedStreak,
    };
  }

  return { anchorCalendarDate: lastSuccessCalendar, streakDays };
}

function stateFromStreakFallback(
  dayCalendar: string,
  todayCalendarDate: string,
  anchorCalendarDate: string | null,
  streakDays: number,
): WeekDayState {
  if (!anchorCalendarDate || dayCalendar > anchorCalendarDate) {
    return { kind: 'empty' };
  }

  const daysFromAnchor = diffCalendarDays(anchorCalendarDate, dayCalendar);
  if (daysFromAnchor < streakDays) {
    return { kind: 'complete' };
  }

  return { kind: 'empty' };
}

export function getProgressStripCalendarDates(
  timeZone: string,
  now = new Date(),
): string[] {
  const todayCalendarDate = calendarDateInTimeZone(now, timeZone);
  return rollingCalendarDatesEndingToday(todayCalendarDate, 7);
}

export function buildWeekDayStates(
  progress: RecurringTaskProgress,
  doneTasksToday: number,
  totalTasksToday: number,
  {
    timeZone,
    now = new Date(),
    historyDaysByDate,
  }: BuildWeekDayStatesOptions,
): WeekDayState[] {
  const todayCalendarDate = calendarDateInTimeZone(now, timeZone);
  const todayComplete =
    totalTasksToday > 0 && doneTasksToday >= totalTasksToday;
  const { anchorCalendarDate, streakDays } = resolveWeekStreakAnchorCalendar(
    progress,
    todayCalendarDate,
    todayComplete,
    timeZone,
  );

  return getProgressStripCalendarDates(timeZone, now).map(dayCalendar => {
    if (dayCalendar > todayCalendarDate) {
      return { kind: 'future' as const };
    }

    if (dayCalendar === todayCalendarDate) {
      return {
        kind: 'today' as const,
        done: doneTasksToday,
        total: totalTasksToday,
      };
    }

    const historyDay = historyDaysByDate?.get(dayCalendar);
    if (historyDay) {
      if (shouldShowHistorySuccessCrown(historyDay)) {
        return { kind: 'complete' as const };
      }
      return { kind: 'empty' as const };
    }

    return stateFromStreakFallback(
      dayCalendar,
      todayCalendarDate,
      anchorCalendarDate,
      streakDays,
    );
  });
}
