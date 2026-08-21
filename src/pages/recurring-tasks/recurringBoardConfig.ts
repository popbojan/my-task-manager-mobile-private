import { RecurringTaskStatus } from '@/api/generated';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import type { TranslationKey } from '@/i18n/locales';

export const DAILY_STATUS_COLUMNS: {
  status: RecurringTaskStatus;
  labelKey: TranslationKey;
}[] = [
  { status: RecurringTaskStatus.Todo, labelKey: 'recurring.status.todo' },
  {
    status: RecurringTaskStatus.InProgress,
    labelKey: 'recurring.status.inProgress',
  },
  { status: RecurringTaskStatus.Done, labelKey: 'recurring.status.done' },
];

/** Todo → In Bearbeitung → Erledigt (zwei Klicks bis done). */
export function getNextStatus(
  status: RecurringTaskStatus,
): RecurringTaskStatus | null {
  if (status === RecurringTaskStatus.Todo) {
    return RecurringTaskStatus.InProgress;
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

/** Feste Reihenfolge – Aufgaben springen nicht bei Status-Wechsel. */
export function sortTasksStable(tasks: RecurringTask[]): RecurringTask[] {
  return [...tasks].sort((a, b) => {
    const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return a.id.localeCompare(b.id);
  });
}
