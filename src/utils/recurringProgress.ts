import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';

export const DEFAULT_RECURRING_PROGRESS: RecurringTaskProgress = {
  id: 'local-default',
  currentStreak: 0,
  highestStreakReached: 0,
  currentLevel: 1,
  highestLevelReached: 1,
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

export function normalizeRecurringProgress(
  progress: RecurringTaskProgress | undefined,
): RecurringTaskProgress {
  if (!progress) {
    return DEFAULT_RECURRING_PROGRESS;
  }

  return {
    ...DEFAULT_RECURRING_PROGRESS,
    ...progress,
    currentStreak: progress.currentStreak ?? 0,
    highestStreakReached: progress.highestStreakReached ?? 0,
    currentLevel: Math.max(1, progress.currentLevel ?? 1),
    highestLevelReached: Math.max(1, progress.highestLevelReached ?? 1),
  };
}
