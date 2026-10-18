import { RecurringTaskStatus } from '@/api/generated';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';
import { indexHistoryDaysByDate } from '@/utils/historyCalendar';

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

export const ONBOARDING_DEMO_MONTH_KEY = '2026-10';
export const ONBOARDING_DEMO_TODAY_DATE = '2026-10-23';

/** Full October 2026 demo days keyed by calendar date (Mon-start grid like Mein Weg). */
const ONBOARDING_DEMO_DAYS: HistoryDay[] = [
  demoHistoryDay(1, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 8, currentLevel: 2 }),
  demoHistoryDay(2, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 9, currentLevel: 2 }),
  demoHistoryDay(3, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 10, currentLevel: 2 }),
  demoHistoryDay(4, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 11, currentLevel: 2 }),
  demoHistoryDay(5, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 12, currentLevel: 2 }),
  demoHistoryDay(6, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 13, currentLevel: 2 }),
  demoHistoryDay(7, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 14, currentLevel: 2 }),
  demoHistoryDay(8, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 15, currentLevel: 2 }),
  demoHistoryDay(9, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 16, currentLevel: 2 }),
  demoHistoryDay(10, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 17, currentLevel: 2 }),
  demoHistoryDay(11, HistoryDayStatus.Missed, { completedTasks: 1, totalTasks: 2, currentStreak: 0, currentLevel: 2 }),
  demoHistoryDay(12, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 1, currentLevel: 2, note: 'demo' }),
  demoHistoryDay(13, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 2, currentLevel: 2 }),
  demoHistoryDay(14, HistoryDayStatus.Missed, { completedTasks: 1, totalTasks: 2, currentStreak: 0, currentLevel: 2 }),
  demoHistoryDay(15, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 1, currentLevel: 2 }),
  demoHistoryDay(16, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 2, currentLevel: 2 }),
  demoHistoryDay(17, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 3, currentLevel: 2 }),
  demoHistoryDay(18, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 4, currentLevel: 2 }),
  demoHistoryDay(19, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 5, currentLevel: 2 }),
  demoHistoryDay(20, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 6, currentLevel: 2 }),
  demoHistoryDay(21, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 7, currentLevel: 2 }),
  demoHistoryDay(22, HistoryDayStatus.Success, { completedTasks: 2, totalTasks: 2, currentStreak: 8, currentLevel: 2 }),
  demoHistoryDay(23, HistoryDayStatus.InProgress, {
    completedTasks: 1,
    totalTasks: 2,
    finalizedAt: null,
    currentStreak: 8,
    currentLevel: 2,
  }),
];

export function getOnboardingDemoDaysByDate(): Map<string, HistoryDay> {
  return indexHistoryDaysByDate(ONBOARDING_DEMO_DAYS);
}

export function isOnboardingDemoFutureDay(dayOfMonth: number): boolean {
  return dayOfMonth > Number(ONBOARDING_DEMO_TODAY_DATE.slice(-2));
}

export const ONBOARDING_DEMO_NOTE_DAY = demoHistoryDay(12, HistoryDayStatus.Success, {
  completedTasks: 2,
  totalTasks: 2,
  currentStreak: 45,
  currentLevel: 2,
  note: 'demo',
});
