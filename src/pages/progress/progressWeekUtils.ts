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

function resolveWeekStreakAnchor(
  progress: RecurringTaskProgress,
  today: Date,
  todayComplete: boolean,
): { anchorDay: Date | null; streakDays: number } {
  const streakDays = progress.currentStreak;

  if (streakDays <= 0) {
    return { anchorDay: null, streakDays: 0 };
  }

  const lastSuccess = progress.lastSuccessfulDay
    ? startOfDay(progress.lastSuccessfulDay)
    : null;

  if (!lastSuccess) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { anchorDay: startOfDay(yesterday), streakDays };
  }

  if (lastSuccess.getTime() === today.getTime() && !todayComplete) {
    const adjustedStreak = Math.max(0, streakDays - 1);
    if (adjustedStreak <= 0) {
      return { anchorDay: null, streakDays: 0 };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { anchorDay: startOfDay(yesterday), streakDays: adjustedStreak };
  }

  return { anchorDay: lastSuccess, streakDays };
}

export function buildWeekDayStates(
  progress: RecurringTaskProgress,
  doneTasksToday: number,
  totalTasksToday: number,
  now = new Date(),
): WeekDayState[] {
  const today = startOfDay(now);
  const todayComplete =
    totalTasksToday > 0 && doneTasksToday >= totalTasksToday;
  const { anchorDay, streakDays } = resolveWeekStreakAnchor(
    progress,
    today,
    todayComplete,
  );

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

    if (!anchorDay || dayStart > anchorDay) {
      return { kind: 'empty' as const };
    }

    const daysFromAnchor = diffDays(anchorDay, dayStart);
    if (daysFromAnchor < streakDays) {
      return { kind: 'complete' as const };
    }

    return { kind: 'empty' as const };
  });
}
