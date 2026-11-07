import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import {
  DEFAULT_RECURRING_NOTIFICATION_TIME,
  isValidNotificationTime,
} from '@/notifications/recurringNotificationTimeUtils';

export type RecurringTaskFormState = {
  title: string;
  description: string;
  status: RecurringTask['status'];
  notificationEnabled: boolean;
  notificationTime: string | null;
};

export function resolveStoredNotificationTime(
  notificationTime: string | null,
): string {
  if (notificationTime && isValidNotificationTime(notificationTime)) {
    return notificationTime;
  }

  return DEFAULT_RECURRING_NOTIFICATION_TIME;
}

export function selectRecurringTaskForForm(
  fetched: RecurringTask | undefined,
  listed: RecurringTask | undefined,
): RecurringTask | undefined {
  if (!fetched) {
    return listed;
  }

  if (!listed) {
    return fetched;
  }

  const fetchedAt = new Date(fetched.updatedAt).getTime();
  const listedAt = new Date(listed.updatedAt).getTime();
  return listedAt >= fetchedAt ? listed : fetched;
}

export function recurringTaskToFormState(task: RecurringTask): RecurringTaskFormState {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    notificationEnabled: task.notificationEnabled,
    notificationTime: resolveStoredNotificationTime(task.notificationTime),
  };
}

export function buildRecurringTaskNotificationFields(form: {
  notificationEnabled: boolean;
  notificationTime: string | null;
}): Pick<RecurringTask, 'notificationEnabled' | 'notificationTime'> {
  return {
    notificationEnabled: form.notificationEnabled,
    notificationTime: resolveStoredNotificationTime(form.notificationTime),
  };
}
