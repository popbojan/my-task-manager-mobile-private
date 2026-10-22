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

export function recurringTaskToFormState(task: RecurringTask): RecurringTaskFormState {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    notificationEnabled: task.notificationEnabled,
    notificationTime: task.notificationTime,
  };
}

export function buildRecurringTaskNotificationFields(form: {
  notificationEnabled: boolean;
  notificationTime: string | null;
}): Pick<RecurringTask, 'notificationEnabled' | 'notificationTime'> {
  if (form.notificationEnabled) {
    const time =
      form.notificationTime && isValidNotificationTime(form.notificationTime)
        ? form.notificationTime
        : DEFAULT_RECURRING_NOTIFICATION_TIME;

    return {
      notificationEnabled: true,
      notificationTime: time,
    };
  }

  return {
    notificationEnabled: false,
    notificationTime: form.notificationTime,
  };
}
