import { RecurringTaskStatus } from '@/api/generated';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';

const demoDate = new Date('2026-10-15T12:00:00Z');

function demoHistoryDay(
  day: number,
  status: HistoryDayStatus,
  overrides: Partial<HistoryDay> = {},
): HistoryDay {
  const date = new Date(Date.UTC(2026, 9, day));

  return {
    date,
    status,
    completedTasks: overrides.completedTasks ?? null,
    totalTasks: overrides.totalTasks ?? null,
    note: overrides.note ?? null,
    finalizedAt: overrides.finalizedAt ?? demoDate,
    currentStreak: overrides.currentStreak ?? null,
    currentLevel: overrides.currentLevel ?? null,
  };
}

export const ONBOARDING_DEMO_TASK_TITLE_KEY = 'onboarding.demo.taskTitle' as const;

export function createOnboardingDemoTask(
  id: string,
  title: string,
  status: RecurringTaskStatus,
): RecurringTask {
  return {
    id,
    title,
    description: null,
    status,
    streakCount: status === RecurringTaskStatus.Done ? 3 : 0,
    lastCompletedAt: status === RecurringTaskStatus.Done ? demoDate : null,
    lastResetAt: demoDate,
    nextResetAt: demoDate,
    createdAt: demoDate,
    updatedAt: demoDate,
  };
}

/** Two-week slice for onboarding calendar preview (Oct 2026). */
export const ONBOARDING_DEMO_CALENDAR: {
  dayOfMonth: number;
  entry?: HistoryDay;
  isToday?: boolean;
}[] = [
  { dayOfMonth: 6, entry: demoHistoryDay(6, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 4, currentLevel: 2 }) },
  { dayOfMonth: 7, entry: demoHistoryDay(7, HistoryDayStatus.Success, { completedTasks: 1, totalTasks: 1, currentStreak: 5, currentLevel: 2 }) },
  { dayOfMonth: 8, entry: demoHistoryDay(8, HistoryDayStatus.Missed, { completedTasks: 0, totalTasks: 2, currentStreak: 0, currentLevel: 2 }) },
  { dayOfMonth: 9, entry: demoHistoryDay(9, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 1, currentLevel: 2 }) },
  { dayOfMonth: 10, entry: demoHistoryDay(10, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 2, currentLevel: 2 }) },
  { dayOfMonth: 11, entry: demoHistoryDay(11, HistoryDayStatus.InProgress, { completedTasks: 1, totalTasks: 2, finalizedAt: null, currentStreak: 2, currentLevel: 2 }) },
  { dayOfMonth: 12, entry: demoHistoryDay(12, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 3, currentLevel: 2, note: 'demo' }) },
  { dayOfMonth: 13, entry: demoHistoryDay(13, HistoryDayStatus.Success, { completedTasks: 1, totalTasks: 1, currentStreak: 4, currentLevel: 2 }) },
  { dayOfMonth: 14, entry: demoHistoryDay(14, HistoryDayStatus.Missed, { completedTasks: 1, totalTasks: 2, currentStreak: 0, currentLevel: 2 }) },
  { dayOfMonth: 15, entry: demoHistoryDay(15, HistoryDayStatus.InProgress, { completedTasks: 1, totalTasks: 2, finalizedAt: null, currentStreak: 0, currentLevel: 2 }), isToday: true },
  { dayOfMonth: 16 },
  { dayOfMonth: 17, entry: demoHistoryDay(17, HistoryDayStatus.NoTasks, { completedTasks: 0, totalTasks: 0, currentStreak: 0, currentLevel: 2 }) },
  { dayOfMonth: 18, entry: demoHistoryDay(18, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 1, currentLevel: 2 }) },
  { dayOfMonth: 19, entry: demoHistoryDay(19, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 2, currentLevel: 2 }) },
];

export const ONBOARDING_DEMO_NOTE_DAY = demoHistoryDay(12, HistoryDayStatus.Success, {
  completedTasks: 2,
  totalTasks: 2,
  currentStreak: 3,
  currentLevel: 2,
  note: 'demo',
});
