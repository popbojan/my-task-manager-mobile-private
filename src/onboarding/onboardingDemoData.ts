import { RecurringTaskStatus } from '@/api/generated';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';

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

export const ONBOARDING_DEMO_PROGRESS: RecurringTaskProgress = {
  id: 'onboarding-demo-progress',
  currentStreak: 18,
  highestStreakReached: 71,
  currentLevel: 1,
  highestLevelReached: 3,
  lastSuccessfulDay: demoDate,
  lastCheckedAt: demoDate,
  createdAt: demoDate,
  updatedAt: demoDate,
};

export function createOnboardingDemoTask(
  id: string,
  title: string,
  status: RecurringTaskStatus,
  streakCount = status === RecurringTaskStatus.Done ? 3 : 0,
): RecurringTask {
  return {
    id,
    title,
    description: null,
    status,
    streakCount,
    lastCompletedAt: status === RecurringTaskStatus.Done ? demoDate : null,
    lastResetAt: demoDate,
    nextResetAt: demoDate,
    createdAt: demoDate,
    updatedAt: demoDate,
  };
}

/** Three-week slice for onboarding calendar preview (Oct 2026, days 6–26). */
export const ONBOARDING_DEMO_CALENDAR: {
  dayOfMonth: number;
  entry?: HistoryDay;
  isToday?: boolean;
  isFutureEmpty?: boolean;
}[] = [
  { dayOfMonth: 6, entry: demoHistoryDay(6, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 13, currentLevel: 2 }) },
  { dayOfMonth: 7, entry: demoHistoryDay(7, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 14, currentLevel: 2 }) },
  { dayOfMonth: 8, entry: demoHistoryDay(8, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 15, currentLevel: 2 }) },
  { dayOfMonth: 9, entry: demoHistoryDay(9, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 16, currentLevel: 2 }) },
  { dayOfMonth: 10, entry: demoHistoryDay(10, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 17, currentLevel: 2 }) },
  { dayOfMonth: 11, entry: demoHistoryDay(11, HistoryDayStatus.Missed, { completedTasks: 1, totalTasks: 2, currentStreak: 0, currentLevel: 2 }) },
  { dayOfMonth: 12, entry: demoHistoryDay(12, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 1, currentLevel: 2, note: 'demo' }) },
  { dayOfMonth: 13, entry: demoHistoryDay(13, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 2, currentLevel: 2 }) },
  { dayOfMonth: 14, entry: demoHistoryDay(14, HistoryDayStatus.Missed, { completedTasks: 1, totalTasks: 2, currentStreak: 0, currentLevel: 2 }) },
  { dayOfMonth: 15, entry: demoHistoryDay(15, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 1, currentLevel: 2 }) },
  { dayOfMonth: 16, entry: demoHistoryDay(16, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 2, currentLevel: 2 }) },
  { dayOfMonth: 17, entry: demoHistoryDay(17, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 3, currentLevel: 2 }) },
  { dayOfMonth: 18, entry: demoHistoryDay(18, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 4, currentLevel: 2 }) },
  { dayOfMonth: 19, entry: demoHistoryDay(19, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 5, currentLevel: 2 }) },
  { dayOfMonth: 20, entry: demoHistoryDay(20, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 6, currentLevel: 2 }) },
  { dayOfMonth: 21, entry: demoHistoryDay(21, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 7, currentLevel: 2 }) },
  { dayOfMonth: 22, entry: demoHistoryDay(22, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 8, currentLevel: 2 }) },
  {
    dayOfMonth: 23,
    entry: demoHistoryDay(23, HistoryDayStatus.InProgress, {
      completedTasks: 1,
      totalTasks: 2,
      finalizedAt: null,
      currentStreak: 8,
      currentLevel: 2,
    }),
    isToday: true,
  },
  { dayOfMonth: 24, isFutureEmpty: true },
  { dayOfMonth: 25, isFutureEmpty: true },
  { dayOfMonth: 26, isFutureEmpty: true },
];

export const ONBOARDING_DEMO_NOTE_DAY = demoHistoryDay(12, HistoryDayStatus.Success, {
  completedTasks: 2,
  totalTasks: 2,
  currentStreak: 1,
  currentLevel: 2,
  note: 'demo',
});
