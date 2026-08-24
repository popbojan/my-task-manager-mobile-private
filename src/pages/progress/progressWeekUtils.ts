import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';

export type WeekDayState =
  | { kind: 'future' }
  | { kind: 'empty' }
  | { kind: 'complete' }
  | { kind: 'today'; done: number; total: number };

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function diffDays(later: Date, earlier: Date): number {
  return Math.round(
    (startOfDay(later).getTime() - startOfDay(earlier).getTime()) / 86_400_000,
  );
}

export function getWeekDaysMondayStart(now = new Date()): Date[] {
  const start = startOfDay(now);
  const weekday = start.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  start.setDate(start.getDate() + diff);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function buildWeekDayStates(
  progress: RecurringTaskProgress,
  doneTasksToday: number,
  totalTasksToday: number,
  now = new Date(),
): WeekDayState[] {
  const today = startOfDay(now);
  const lastSuccess = progress.lastSuccessfulDay
    ? startOfDay(progress.lastSuccessfulDay)
    : null;

  return getWeekDaysMondayStart(now).map(day => {
    const dayStart = startOfDay(day);

    if (dayStart > today) {
      return { kind: 'future' as const };
    }

    if (dayStart.getTime() === today.getTime()) {
      return {
        kind: 'today' as const,
        done: doneTasksToday,
        total: totalTasksToday,
      };
    }

    if (!lastSuccess || dayStart > lastSuccess) {
      return { kind: 'empty' as const };
    }

    const daysFromLastSuccess = diffDays(lastSuccess, dayStart);
    if (daysFromLastSuccess < progress.currentStreak) {
      return { kind: 'complete' as const };
    }

    return { kind: 'empty' as const };
  });
}
