import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';

/** Valid demo constellation for onboarding slide 3 (level 3, 7-day streak). */
export const ONBOARDING_DEMO_PROGRESS: RecurringTaskProgress = {
  id: 'onboarding-demo',
  currentStreak: 7,
  highestStreakReached: 12,
  currentLevel: 3,
  highestLevelReached: 3,
  lastSuccessfulDay: new Date(),
  createdAt: new Date(0),
  updatedAt: new Date(),
};

export const ONBOARDING_DEMO_TASKS_TODAY = {
  done: 3,
  total: 3,
};
