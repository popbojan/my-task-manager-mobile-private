import {
  RecurringTaskStatus,
  type RecurringTask,
} from '@/api/generated';
import type { TranslationKey } from '@/i18n/locales';
import { getDeviceTimezone } from '@/user/deviceTimezone';

export const PREVIEW_SUBSCRIBE_TASK_ID = 'preview-subscribe';

function getNextDailyResetAt(from = new Date(), timezone: string): Date {
  const startMs = from.getTime();
  const resolvedTimezone = timezone.trim() || 'UTC';

  for (let minuteOffset = 1; minuteOffset <= 24 * 60; minuteOffset++) {
    const candidate = new Date(startMs + minuteOffset * 60_000);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: resolvedTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(candidate);

    const hour = parts.find(part => part.type === 'hour')?.value;
    const minute = parts.find(part => part.type === 'minute')?.value;

    if (hour === '00' && minute === '05') {
      return candidate;
    }
  }

  return new Date(startMs + 24 * 60 * 60_000);
}

export function createPremiumPreviewTasks(
  translate: (key: TranslationKey) => string,
  timezone: string = getDeviceTimezone(),
): RecurringTask[] {
  const now = new Date();

  return [
    {
      id: PREVIEW_SUBSCRIBE_TASK_ID,
      title: translate('recurring.preview.subscribeTaskTitle'),
      status: RecurringTaskStatus.Todo,
      streakCount: 0,
      nextResetAt: getNextDailyResetAt(now, timezone),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function isPremiumPreviewTask(taskId: string): boolean {
  return taskId === PREVIEW_SUBSCRIBE_TASK_ID;
}
