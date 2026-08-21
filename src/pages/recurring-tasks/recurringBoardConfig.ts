import { RecurringTaskStatus } from '@/api/generated';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';

export function getNextStatus(
  status: RecurringTaskStatus,
): RecurringTaskStatus | null {
  if (status === RecurringTaskStatus.Todo) {
    return RecurringTaskStatus.Done;
  }

  if (status === RecurringTaskStatus.InProgress) {
    return RecurringTaskStatus.Done;
  }

  return null;
}

export function compareRecurringTasksByStreak(
  a: RecurringTask,
  b: RecurringTask,
): number {
  return b.streakCount - a.streakCount;
}
